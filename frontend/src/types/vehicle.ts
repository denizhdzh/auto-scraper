export interface VehicleSpec {
  make: string
  model: string
  year: number
  price: number
  mileage: number
  fuel_type: string
  transmission: string
  power_hp: number | null
  engine_cc: number | null
  doors: number | null
  seats: number | null
  color: string | null
  curb_weight_kg: number | null
  seller_type: 'dealer' | 'private' | null
  location: string | null
  listing_url: string
  image_urls: string[]
  first_registration: string | null
}

export interface ScoredVehicle extends VehicleSpec {
  id: string
  score: number
  score_breakdown: Record<string, number>
  score_explanations: Record<string, string>
  road_tax_estimate: number | null
  ai_score: number | null
  ai_analysis: string | null
  ai_flags: string[]
  description: string | null
  scraped_at: string
}

export interface SearchParams {
  make?: string
  model?: string
  year_min?: number
  year_max?: number
  price_min?: number
  price_max?: number
  mileage_max?: number
  fuel_type?: string
  power_min?: number
  body_type?: string
  country?: string
}

export interface ScoringWeights {
  price: number
  mileage: number
  km_per_year: number
  power: number
  curb_weight: number
  engine: number
  maintenance: number
}

export interface ScrapeJob {
  job_id: string
  status: 'pending' | 'running' | 'done' | 'error'
  total: number
  scraped: number
  error?: string
}
