from pydantic import BaseModel
from typing import Optional


class SearchParams(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year_min: Optional[int] = None
    year_max: Optional[int] = None
    price_min: Optional[int] = None
    price_max: Optional[int] = None
    mileage_max: Optional[int] = None
    fuel_type: Optional[str] = None
    power_min: Optional[int] = None
    body_type: Optional[str] = None
    country: Optional[str] = "NL"


class VehicleSpec(BaseModel):
    make: str
    model: str
    year: int
    price: float
    mileage: int
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    power_hp: Optional[int] = None
    engine_cc: Optional[int] = None
    doors: Optional[int] = None
    seats: Optional[int] = None
    color: Optional[str] = None
    curb_weight_kg: Optional[int] = None
    seller_type: Optional[str] = None
    location: Optional[str] = None
    listing_url: str
    image_urls: list[str] = []
    first_registration: Optional[str] = None
    description: Optional[str] = None
    ai_score: Optional[float] = None
    ai_analysis: Optional[str] = None
    ai_flags: list[str] = []


class ScoredVehicle(VehicleSpec):
    id: str
    score: float
    score_breakdown: dict[str, float] = {}
    score_explanations: dict[str, str] = {}
    road_tax_estimate: Optional[int] = None
    ai_score: Optional[float] = None
    ai_analysis: Optional[str] = None
    scraped_at: str


class ScoringWeights(BaseModel):
    price: float = 25.0
    mileage: float = 15.0
    km_per_year: float = 15.0
    power: float = 10.0
    curb_weight: float = 15.0
    engine: float = 10.0
    maintenance: float = 10.0


class ScrapeJob(BaseModel):
    job_id: str
    status: str = "pending"
    total: int = 0
    scraped: int = 0
    error: Optional[str] = None
