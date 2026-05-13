"""
AI-powered listing description analyzer using Claude Haiku.
Extracts maintenance/condition signals and returns a 0-100 score.
"""
import asyncio
import json
import os
import re
from typing import Optional

try:
    import anthropic
    _client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))
    _AVAILABLE = bool(os.environ.get("ANTHROPIC_API_KEY"))
except Exception:
    _client = None
    _AVAILABLE = False

MODEL = "claude-haiku-4-5-20251001"

_SYSTEM = """\
You analyze used car listing descriptions (may be in any language: Dutch, German, French, etc.).
Extract maintenance and condition signals, then return ONLY valid JSON.
"""

_PROMPT = """\
Car: {year} {make} {model}, {mileage} km

Listing description:
{description}

Return ONLY this JSON (no markdown, no extra text):
{{"score": <0-100>, "summary": "<1 sentence in English>", "flags": ["<tag1>", "<tag2>"]}}

Score guide:
90-100: APK/TÜV/CT valid, recent full service, documented history, one owner, no issues
70-89: Some positives (recent APK, partial service, minor items only)
50-69: Neutral — limited info, no red flags but nothing notable
30-49: Concerns — vague history, unknown APK status, high-km mentions
0-29: Red flags — accident damage, engine/gearbox issues, fraud signals

Focus on: APK/TÜV/CT validity, last service date, timing belt/chain, known issues, owner count, garage storage.

Flags: 2-5 short tags (2-4 words each). Use + prefix for positives, - prefix for negatives.
Examples: "+APK 2027", "+dealer service", "+1 owner", "+timing belt done", "+garage kept", "-no APK info", "-accident history", "-engine noise"
Only include flags that are clearly supported by the description.
"""


async def analyze_description(
    description: str,
    make: str,
    model: str,
    year: int,
    mileage: int,
) -> tuple[Optional[float], Optional[str], list[str]]:
    """Returns (score 0-100, summary string) or (None, None) if unavailable."""
    if not _AVAILABLE or not description or len(description.strip()) < 30:
        return None, None, []

    prompt = _PROMPT.format(
        year=year, make=make, model=model,
        mileage=f"{mileage:,}", description=description[:2000],
    )

    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: _client.messages.create(
                model=MODEL,
                max_tokens=150,
                system=_SYSTEM,
                messages=[{"role": "user", "content": prompt}],
            )
        )
        text = response.content[0].text.strip()
        # Strip any accidental markdown fences
        text = re.sub(r"^```[a-z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
        data = json.loads(text)
        score = max(0.0, min(100.0, float(data["score"])))
        summary = str(data.get("summary", "")).strip()
        flags = [str(f).strip() for f in data.get("flags", []) if f]
        return score, summary or None, flags
    except Exception as e:
        print(f"[ai_analyzer] error: {e}")
        return None, None, []


async def analyze_vehicles(vehicles: list, top_n: int = 50) -> list:
    """
    Runs AI analysis only on the top_n vehicles by preliminary score.
    Vehicles are pre-sorted by score (descending) before this is called.
    """
    if not _AVAILABLE:
        print("[ai_analyzer] ANTHROPIC_API_KEY not set — skipping AI analysis")
        return vehicles

    candidates = [v for v in vehicles[:top_n] if v.description and len(v.description.strip()) >= 30]
    print(f"[ai_analyzer] analyzing top {len(candidates)} vehicles (of {len(vehicles)} total)")

    sem = asyncio.Semaphore(3)

    async def _analyze_one(v):
        async with sem:
            score, summary, flags = await analyze_description(
                v.description, v.make, v.model, v.year, v.mileage
            )
            v.ai_score = score
            v.ai_analysis = summary
            v.ai_flags = flags or []

    await asyncio.gather(*[_analyze_one(v) for v in candidates])
    analyzed = sum(1 for v in vehicles if v.ai_score is not None)
    print(f"[ai_analyzer] done — {analyzed} vehicles enriched")
    return vehicles
