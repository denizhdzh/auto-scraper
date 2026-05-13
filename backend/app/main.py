import uuid
from datetime import datetime, timezone

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware

from .models import SearchParams, ScoredVehicle, ScoringWeights, ScrapeJob, VehicleSpec
from .scraper import scrape_vehicles
from .scorer import score_all, estimate_road_tax_nl
from .ai_analyzer import analyze_vehicles
from . import store

app = FastAPI(title="AutoScout24 Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_WEIGHTS = ScoringWeights()


def _get_weights() -> ScoringWeights:
    data = store.weights_get()
    return ScoringWeights(**data) if data else DEFAULT_WEIGHTS


async def _run_scrape_job(job_id: str, params: SearchParams):
    store.jobs_update(job_id, {"status": "running"})

    async def on_progress(scraped: int, total: int):
        current = store.jobs_get(job_id) or {}
        update: dict = {"scraped": scraped}
        if total > (current.get("total") or 0):
            update["total"] = total
        store.jobs_update(job_id, update)

    try:
        store.vehicles_clear()

        vehicles = await scrape_vehicles(params, on_progress=on_progress)

        weights = _get_weights()
        # Preliminary score (maintenance defaults to 50) to find top candidates
        pre_scored = score_all(vehicles, weights)
        vehicles = [v for v, *_ in pre_scored]  # sorted best-first

        # AI analysis on top 50 only
        vehicles = await analyze_vehicles(vehicles, top_n=50)

        # Final rescore with real maintenance scores
        scored = score_all(vehicles, weights)

        seen_urls: set[str] = set()
        for vehicle, score, breakdown, explanations in scored:
            if vehicle.listing_url in seen_urls:
                continue
            seen_urls.add(vehicle.listing_url)
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
            store.vehicles_put(doc_id, data)

        store.jobs_update(job_id, {"status": "done", "scraped": len(scored), "total": len(scored)})

    except Exception as e:
        import traceback
        traceback.print_exc()
        store.jobs_update(job_id, {"status": "error", "error": str(e)})


@app.post("/scrape", response_model=ScrapeJob)
async def start_scrape(params: SearchParams, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    store.jobs_put(job_id, {"job_id": job_id, "status": "pending", "total": 0, "scraped": 0})
    background_tasks.add_task(_run_scrape_job, job_id, params)
    return ScrapeJob(job_id=job_id, status="pending")


@app.get("/scrape/{job_id}", response_model=ScrapeJob)
def get_scrape_job(job_id: str):
    data = store.jobs_get(job_id)
    if not data:
        raise HTTPException(404, "Job not found")
    return ScrapeJob(**data)


@app.get("/vehicles", response_model=list[ScoredVehicle])
def get_vehicles(sort_by: str = Query("score")):
    vehicles = [ScoredVehicle(**d) for d in store.vehicles_all()]
    sort_map = {
        "score":   lambda v: -v.score,
        "price":   lambda v: v.price,
        "mileage": lambda v: v.mileage,
        "year":    lambda v: -v.year,
    }
    vehicles.sort(key=sort_map.get(sort_by, sort_map["score"]))
    return vehicles


@app.get("/vehicles/{vehicle_id}", response_model=ScoredVehicle)
def get_vehicle(vehicle_id: str):
    data = store.vehicles_get(vehicle_id)
    if not data:
        raise HTTPException(404, "Vehicle not found")
    return ScoredVehicle(**data)


@app.delete("/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: str):
    store.vehicles_delete(vehicle_id)
    return {"ok": True}


@app.get("/scoring/weights", response_model=ScoringWeights)
def get_weights():
    return _get_weights()


@app.put("/scoring/weights")
def update_weights(weights: ScoringWeights):
    store.weights_set(weights.model_dump())
    return {"ok": True}


@app.post("/scoring/rescore")
def rescore_all():
    all_docs = store.vehicles_all()
    if not all_docs:
        return {"ok": True, "rescored": 0}

    pairs: list[tuple[str, VehicleSpec]] = []
    for d in all_docs:
        try:
            v = VehicleSpec(**{k: d[k] for k in VehicleSpec.model_fields if k in d})
            pairs.append((d["id"], v))
        except Exception:
            pass

    weights = _get_weights()
    scored = score_all([v for _, v in pairs], weights)
    url_to_id = {v.listing_url: doc_id for doc_id, v in pairs}

    for vehicle, score, breakdown, explanations in scored:
        doc_id = url_to_id.get(vehicle.listing_url)
        if not doc_id:
            continue
        store.vehicles_update(doc_id, {
            "score": score,
            "score_breakdown": breakdown,
            "score_explanations": explanations,
            "road_tax_estimate": estimate_road_tax_nl(vehicle.curb_weight_kg, vehicle.fuel_type),
        })

    return {"ok": True, "rescored": len(scored)}
