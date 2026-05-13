#!/usr/bin/env python3
"""
Standalone scrape script for GitHub Actions (or CLI use).
Usage: python run_scrape.py '{"make":"mazda","model":"mx-5","price_max":25000}'
Results saved to data/store.json
"""
import asyncio
import json
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv()

from app.models import SearchParams, ScoringWeights
from app.scraper import scrape_vehicles
from app.scorer import score_all, estimate_road_tax_nl
from app.ai_analyzer import analyze_vehicles


async def main():
    raw = os.environ.get("SCRAPE_PARAMS") or (sys.argv[1] if len(sys.argv) > 1 else "{}")
    params = SearchParams(**json.loads(raw))
    print(f"[scrape] params: {params.model_dump(exclude_none=True)}")

    vehicles = await scrape_vehicles(params)
    if not vehicles:
        print("[scrape] no vehicles found")
        return

    weights = ScoringWeights()
    pre_scored = score_all(vehicles, weights)
    vehicles = [v for v, *_ in pre_scored]

    top_n = int(os.environ.get("ANALYZE_TOP_N", "50"))
    vehicles = await analyze_vehicles(vehicles, top_n=top_n)
    scored = score_all(vehicles, weights)

    store: dict[str, dict] = {}
    seen: set[str] = set()
    for vehicle, score, breakdown, explanations in scored:
        if vehicle.listing_url in seen:
            continue
        seen.add(vehicle.listing_url)
        doc_id = str(uuid.uuid4())
        data = vehicle.model_dump()
        data.update({
            "id": doc_id,
            "score": score,
            "score_breakdown": breakdown,
            "score_explanations": explanations,
            "road_tax_estimate": estimate_road_tax_nl(vehicle.curb_weight_kg, vehicle.fuel_type),
            "scraped_at": datetime.now(timezone.utc).isoformat(),
        })
        store[doc_id] = data

    out = Path(__file__).parent / "data" / "store.json"
    out.parent.mkdir(exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump({"vehicles": store, "weights": {}}, f, ensure_ascii=False)

    print(f"[scrape] saved {len(store)} vehicles → {out}")


if __name__ == "__main__":
    asyncio.run(main())
