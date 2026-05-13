"""
Scoring engine with normalized criteria, score explanations, and NL road tax estimate.
Most scores are relative to the current pool (min/max normalization).
km_per_year uses an absolute bell curve — ideal ~8k km/yr, penalizes both extremes.
maintenance uses the AI-extracted score (0-100) from the listing description.
"""
import math
from typing import Optional
from .models import VehicleSpec, ScoringWeights

CURRENT_YEAR = 2026


# ---------------------------------------------------------------------------
# Dutch road tax estimate (motorrijtuigenbelasting, gasoline, average province)
# ---------------------------------------------------------------------------
_TAX_TABLE = [
    (700,  232), (750,  280), (800,  330), (850,  380), (900,  430),
    (950,  484), (1000, 538), (1050, 592), (1100, 648), (1150, 704),
    (1200, 762), (1300, 876), (1400, 992), (1500, 1110),
]

def estimate_road_tax_nl(curb_weight_kg: Optional[int], fuel_type: Optional[str] = None) -> Optional[int]:
    if not curb_weight_kg:
        return None
    fuel = (fuel_type or "").lower()
    if "electric" in fuel or "elektrik" in fuel:
        return 0
    if "hybrid" in fuel or "hibrit" in fuel:
        multiplier = 0.5
    elif "diesel" in fuel or "dizel" in fuel:
        multiplier = 1.25
    else:
        multiplier = 1.0

    annual = _TAX_TABLE[-1][1]
    for (max_kg, cost) in _TAX_TABLE:
        if curb_weight_kg <= max_kg:
            annual = cost
            break

    return round(annual * multiplier)


# ---------------------------------------------------------------------------
# Normalization helpers
# ---------------------------------------------------------------------------

def _norm(value: Optional[float], low: float, high: float, invert: bool = False) -> float:
    if value is None:
        return 50.0
    if high == low:
        return 100.0
    ratio = max(0.0, min(1.0, (value - low) / (high - low)))
    return (1.0 - ratio) * 100.0 if invert else ratio * 100.0


def _bounds(lst: list) -> tuple[float, float]:
    valid = [x for x in lst if x is not None]
    return (min(valid), max(valid)) if valid else (0.0, 1.0)


# ---------------------------------------------------------------------------
# km/year bell curve — absolute, not pool-relative
# Ideal: ~8,000 km/yr. Penalizes over-driven AND suspiciously low.
# ---------------------------------------------------------------------------

def _score_km_per_year(mileage: int, year: int) -> float:
    age_years = max(1, CURRENT_YEAR - year)
    km_per_year = mileage / age_years
    IDEAL = 8_000
    # Asymmetric: wide left tail (low km is mildly suspicious),
    # tighter right tail (high km is wear)
    sigma = 6_000 if km_per_year <= IDEAL else 5_000
    return 100.0 * math.exp(-0.5 * ((km_per_year - IDEAL) / sigma) ** 2)


# ---------------------------------------------------------------------------
# Explanation generators
# ---------------------------------------------------------------------------

def _explain_price(score: float, price: float, pool_min: float, pool_max: float) -> str:
    if score >= 80:
        return f"Near the cheapest in this pool (€{price:,.0f}). Lowest found: €{pool_min:,.0f}."
    if score >= 50:
        return f"Mid-range price (€{price:,.0f})."
    return f"On the expensive side (€{price:,.0f}). Compare with the lowest at €{pool_min:,.0f}."


def _explain_mileage(score: float, km: int) -> str:
    if score >= 80:
        return f"{km:,} km — low mileage, mechanically advantageous."
    if score >= 50:
        return f"{km:,} km — average usage."
    return f"{km:,} km — high mileage. Service history matters here."


def _explain_km_per_year(score: float, mileage: int, year: int) -> str:
    age = max(1, CURRENT_YEAR - year)
    kpy = mileage / age
    if score >= 85:
        return f"{kpy:,.0f} km/yr — ideal usage rate. {mileage:,} km over {age} years."
    if score >= 65:
        return f"{kpy:,.0f} km/yr — reasonable usage."
    if kpy < 3_000:
        return f"{kpy:,.0f} km/yr — very low. Check for odometer issues or storage damage."
    return f"{kpy:,.0f} km/yr — heavy use. {mileage:,} km over {age} years."


def _explain_power(score: float, hp: Optional[int]) -> str:
    if hp is None:
        return "Power output unknown."
    if score >= 80:
        return f"{hp} HP — strong. Likely the 2.0L generation (160 HP)."
    if score >= 50:
        return f"{hp} HP — standard. Probably the 1.5L (131 HP) or older 1.8."
    return f"{hp} HP — on the weaker side."


def _explain_weight(score: float, kg: Optional[int], fuel: Optional[str]) -> str:
    tax = estimate_road_tax_nl(kg, fuel)
    if kg is None:
        return "Curb weight not found on detail page."
    tax_str = f"~€{tax}/yr MRB" if tax is not None else ""
    if score >= 80:
        return f"{kg} kg — light. Good driving dynamics, {tax_str}."
    if score >= 50:
        return f"{kg} kg — average weight. {tax_str}."
    return f"{kg} kg — heavy. Less agile, {tax_str}."


def _explain_engine(score: float, cc: Optional[int]) -> str:
    if cc is None:
        return "Engine displacement unknown."
    if score >= 80:
        return f"{cc} cc — small engine. Light, efficient, lower insurance."
    if score >= 50:
        return f"{cc} cc — mid-size displacement."
    return f"{cc} cc — large engine. Higher insurance and fuel costs."


def _explain_maintenance(score: float, ai_analysis: Optional[str]) -> str:
    if ai_analysis:
        return ai_analysis
    if score >= 70:
        return "Good maintenance signals found in listing."
    if score < 40:
        return "Limited maintenance info or red flags detected."
    return "Average maintenance information."


# ---------------------------------------------------------------------------
# Core scoring
# ---------------------------------------------------------------------------

def score_vehicle(
    v: VehicleSpec,
    weights: ScoringWeights,
    pool: list[VehicleSpec],
) -> tuple[float, dict[str, float], dict[str, str]]:
    """Returns (overall_score, breakdown, explanations)."""

    prices   = [x.price    for x in pool if x.price   > 0]
    miles    = [x.mileage  for x in pool if x.mileage > 0]
    powers   = [x.power_hp for x in pool if x.power_hp]
    wts      = [x.curb_weight_kg for x in pool if x.curb_weight_kg]
    ccs      = [x.engine_cc for x in pool if x.engine_cc]

    p_lo, p_hi   = _bounds(prices)
    m_lo, m_hi   = _bounds(miles)
    pw_lo, pw_hi = _bounds(powers)
    wt_lo, wt_hi = _bounds(wts)
    cc_lo, cc_hi = _bounds(ccs)

    maintenance_score = v.ai_score if v.ai_score is not None else 50.0

    bd: dict[str, float] = {
        "price":        _norm(v.price,         p_lo,  p_hi,  invert=True),
        "mileage":      _norm(v.mileage,        m_lo,  m_hi,  invert=True),
        "km_per_year":  _score_km_per_year(v.mileage, v.year),
        "power":        _norm(v.power_hp,       pw_lo, pw_hi, invert=False),
        "curb_weight":  _norm(v.curb_weight_kg, wt_lo, wt_hi, invert=True),
        "engine":       _norm(v.engine_cc,      cc_lo, cc_hi, invert=True),
        "maintenance":  maintenance_score,
    }

    wmap = {
        "price":       weights.price,
        "mileage":     weights.mileage,
        "km_per_year": weights.km_per_year,
        "power":       weights.power,
        "curb_weight": weights.curb_weight,
        "engine":      weights.engine,
        "maintenance": weights.maintenance,
    }
    total_w = sum(wmap.values()) or 1.0
    overall = sum(bd[k] * wmap[k] for k in bd) / total_w

    explanations: dict[str, str] = {
        "price":       _explain_price(bd["price"], v.price, p_lo, p_hi),
        "mileage":     _explain_mileage(bd["mileage"], v.mileage),
        "km_per_year": _explain_km_per_year(bd["km_per_year"], v.mileage, v.year),
        "power":       _explain_power(bd["power"], v.power_hp),
        "curb_weight": _explain_weight(bd["curb_weight"], v.curb_weight_kg, v.fuel_type),
        "engine":      _explain_engine(bd["engine"], v.engine_cc),
        "maintenance": _explain_maintenance(bd["maintenance"], v.ai_analysis),
    }

    return (
        round(overall, 2),
        {k: round(s, 2) for k, s in bd.items()},
        explanations,
    )


def score_all(
    vehicles: list[VehicleSpec],
    weights: ScoringWeights,
) -> list[tuple[VehicleSpec, float, dict[str, float], dict[str, str]]]:
    scored = []
    for v in vehicles:
        s, bd, expl = score_vehicle(v, weights, vehicles)
        scored.append((v, s, bd, expl))
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored
