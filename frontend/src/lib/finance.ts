// ---------------------------------------------------------------------------
// Financial calculations for NL car ownership
// ---------------------------------------------------------------------------

export interface FinanceProfile {
  age: number           // buyer age (for insurance)
  claimFreeYears: number
  annualKm: number      // km/year driven
  cityRisk: number      // 0.8 rural … 1.0 suburb … 1.4 city … 1.8 Amsterdam
  loanRateLow: number   // e.g. 0.069
  loanRateHigh: number  // e.g. 0.103
  loanTermMonths: number // 36
  maxLoanAmount: number  // 16000
}

export const DEFAULT_PROFILE: FinanceProfile = {
  age: 28,
  claimFreeYears: 3,
  annualKm: 8000,
  cityRisk: 1.1,
  loanRateLow: 0.069,
  loanRateHigh: 0.103,
  loanTermMonths: 36,
  maxLoanAmount: 16000,
}

// NL MRB base table (annual, petrol, average province) — kg upper bound → €/year
const MRB_TABLE: [number, number][] = [
  [700, 232], [750, 280], [800, 330], [850, 380], [900, 430],
  [950, 484], [1000, 538], [1050, 592], [1100, 648], [1150, 704],
  [1200, 762], [1300, 876], [1400, 992], [1500, 1110], [Infinity, 1240],
]

const FUEL_MULT: Record<string, number> = {
  gasoline: 1.0, petrol: 1.0, benzin: 1.0,
  diesel: 1.7,   dizel: 1.7,
  lpg: 1.3,
  electric: 0.25, elektrik: 0.25,
  hybrid: 0.6,   hibrit: 0.6,
}

export function calcMrbAnnual(weightKg: number | null, fuelType: string | null): number | null {
  if (!weightKg) return null
  const base = MRB_TABLE.find(([max]) => weightKg <= max)?.[1] ?? 1240
  const mult = FUEL_MULT[(fuelType ?? '').toLowerCase()] ?? 1.0
  return Math.round(base * mult)
}

// Monthly loan payment (standard annuity formula)
function annuityPayment(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return principal / months
  const r = annualRate / 12
  return principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1)
}

export interface LoanResult {
  borrowed: number
  downPayment: number
  monthlyLow: number
  monthlyHigh: number
  totalLow: number
  totalHigh: number
  canAfford: boolean   // true if down payment is manageable (≤ price * 0.5)
}

export function calcLoan(price: number, profile: FinanceProfile): LoanResult {
  const borrowed = Math.min(price, profile.maxLoanAmount)
  const downPayment = Math.max(0, price - profile.maxLoanAmount)
  const monthlyLow  = annuityPayment(borrowed, profile.loanRateLow,  profile.loanTermMonths)
  const monthlyHigh = annuityPayment(borrowed, profile.loanRateHigh, profile.loanTermMonths)
  return {
    borrowed,
    downPayment,
    monthlyLow:  Math.round(monthlyLow),
    monthlyHigh: Math.round(monthlyHigh),
    totalLow:  Math.round(monthlyLow  * profile.loanTermMonths),
    totalHigh: Math.round(monthlyHigh * profile.loanTermMonths),
    canAfford: downPayment <= price * 0.6,
  }
}

export interface InsuranceResult {
  monthlyLow: number
  monthlyHigh: number
}

export function calcInsurance(
  profile: FinanceProfile,
  horsePower: number | null,
  carValue: number,
): InsuranceResult {
  // NL WA+ gemiddeld €53/mo (Pricewise 2026); sporty car + young driver pushes higher
  const BASE = 42

  const ageMult   = profile.age < 25 ? 2.2 : profile.age < 30 ? 1.5 : profile.age < 40 ? 1.1 : 1.0
  const claimMult = Math.max(0.45, 1 - profile.claimFreeYears * 0.08)
  const powerMult = (horsePower ?? 100) > 200 ? 1.6 : (horsePower ?? 100) > 130 ? 1.25 : 1.0
  const valueMult = Math.sqrt(carValue / 15000)  // sqrt dampens extremes
  const cityMult  = profile.cityRisk

  const monthly = BASE * ageMult * claimMult * powerMult * valueMult * cityMult
  return {
    monthlyLow:  Math.round(monthly * 0.82),
    monthlyHigh: Math.round(monthly * 1.18),
  }
}

// Estimate tank size (liters) from engine displacement
function estimateTankLiters(engineCC: number | null): number {
  if (!engineCC) return 45
  if (engineCC <= 1400) return 40
  if (engineCC <= 2000) return 45
  return 55
}

// One full tank per month — realistic for a weekend/fun car
// NL benzine (euro 95) ~€2.14/L in 2026 (ANWB/brandstofdata.nl)
export function calcFuelMonthly(
  _profile: FinanceProfile,
  engineCC: number | null,
  fuelType: string | null,
  fuelPricePerLiter = 2.14,
): number {
  const ft = (fuelType ?? '').toLowerCase()
  if (ft.includes('electric') || ft.includes('elektrik')) return 0
  if (ft.includes('diesel') || ft.includes('dizel')) fuelPricePerLiter = 1.72
  const tank = estimateTankLiters(engineCC)
  return Math.round(tank * fuelPricePerLiter)
}

export interface MonthlyCost {
  loan:       { low: number; high: number }
  mrb:        number | null
  insurance:  { low: number; high: number }
  fuel:       number
  totalLow:   number
  totalHigh:  number
  downPayment: number
}

export function calcMonthlyCost(
  price: number,
  weightKg: number | null,
  fuelType: string | null,
  powerHp: number | null,
  engineCC: number | null,
  profile: FinanceProfile,
): MonthlyCost {
  const loan = calcLoan(price, profile)
  const mrbAnnual = calcMrbAnnual(weightKg, fuelType)
  const mrbMonthly = mrbAnnual ? Math.round(mrbAnnual / 12) : null
  const insurance = calcInsurance(profile, powerHp, price)
  const fuel = calcFuelMonthly(profile, engineCC, fuelType)

  const totalLow  = loan.monthlyLow  + (mrbMonthly ?? 45) + insurance.monthlyLow  + fuel
  const totalHigh = loan.monthlyHigh + (mrbMonthly ?? 55) + insurance.monthlyHigh + fuel

  return {
    loan:      { low: loan.monthlyLow, high: loan.monthlyHigh },
    mrb:       mrbMonthly,
    insurance: { low: insurance.monthlyLow, high: insurance.monthlyHigh },
    fuel,
    totalLow,
    totalHigh,
    downPayment: loan.downPayment,
  }
}
