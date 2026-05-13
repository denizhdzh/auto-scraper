import axios from 'axios'
import type { ScoredVehicle, SearchParams, ScoringWeights, ScrapeJob } from '../types/vehicle'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

export async function startScrape(params: SearchParams): Promise<ScrapeJob> {
  const { data } = await api.post('/scrape', params)
  return data
}

export async function getScrapeJob(jobId: string): Promise<ScrapeJob> {
  const { data } = await api.get(`/scrape/${jobId}`)
  return data
}

export async function getVehicles(params?: Partial<SearchParams & { sort_by?: string }>): Promise<ScoredVehicle[]> {
  // GitHub Pages mode: read from committed store.json directly
  const staticUrl = import.meta.env.VITE_RESULTS_URL
  if (staticUrl) {
    const res = await fetch(`${staticUrl}?_=${Date.now()}`)
    const store = await res.json()
    const vehicles: ScoredVehicle[] = Object.values(store.vehicles || {}) as ScoredVehicle[]
    const sortBy = params?.sort_by ?? 'score'
    const sortMap: Record<string, (a: ScoredVehicle, b: ScoredVehicle) => number> = {
      score:   (a, b) => b.score - a.score,
      price:   (a, b) => a.price - b.price,
      mileage: (a, b) => a.mileage - b.mileage,
      year:    (a, b) => b.year - a.year,
    }
    return vehicles.sort(sortMap[sortBy] ?? sortMap.score)
  }
  const { data } = await api.get('/vehicles', { params })
  return data
}

export async function getVehicle(id: string): Promise<ScoredVehicle> {
  const { data } = await api.get(`/vehicles/${id}`)
  return data
}

export async function getScoringWeights(): Promise<ScoringWeights> {
  const { data } = await api.get('/scoring/weights')
  return data
}

export async function updateScoringWeights(weights: ScoringWeights): Promise<void> {
  await api.put('/scoring/weights', weights)
}

export async function rescoreAll(): Promise<void> {
  await api.post('/scoring/rescore')
}

export async function deleteVehicle(id: string): Promise<void> {
  await api.delete(`/vehicles/${id}`)
}
