import { useState } from 'react'
import type { SearchParams, ScrapeJob } from '../types/vehicle'
import { startScrape, getScrapeJob } from '../lib/api'
import { MAKES } from '../lib/makes'

interface Props { onComplete: () => void }

const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid']
const BODY_TYPES = [
  { label: 'Compact',     value: 'compact' },
  { label: 'Convertible', value: 'convertible' },
  { label: 'Coupe',       value: 'coupe' },
  { label: 'SUV',         value: 'suv' },
  { label: 'Sedan',       value: 'sedan' },
]
const COUNTRIES = [
  { code: 'NL', label: 'NL' }, { code: 'D',  label: 'DE' },
  { code: 'A',  label: 'AT' }, { code: 'CH', label: 'CH' },
  { code: 'B',  label: 'BE' }, { code: 'F',  label: 'FR' },
]

const lbl: React.CSSProperties = {
  fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.12em',
  color: 'var(--text-3)', textTransform: 'uppercase', display: 'block', marginBottom: 6,
}
const inp: React.CSSProperties = {
  width: '100%', background: 'var(--bg-card-2)', border: '1px solid var(--border)',
  borderRadius: 10, padding: '8px 12px', fontSize: 13, fontFamily: 'DM Sans',
  color: 'var(--text-1)', outline: 'none',
}

function RangeInputs({
  label, low, high, placeholder, onChange,
}: {
  label: string
  low: number | ''
  high: number | ''
  placeholder: [string, string]
  onChange: (low: number | '', high: number | '') => void
}) {
  const numInp: React.CSSProperties = {
    ...inp, width: '100%', MozAppearance: 'textfield',
  }
  return (
    <div>
      <span style={lbl}>{label}</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          type="number" placeholder={placeholder[0]} value={low}
          onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value), high)}
          style={numInp}
        />
        <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--text-3)', flexShrink: 0 }}>–</span>
        <input
          type="number" placeholder={placeholder[1]} value={high}
          onChange={e => onChange(low, e.target.value === '' ? '' : Number(e.target.value))}
          style={numInp}
        />
      </div>
    </div>
  )
}

function SliderField({
  label, value, min, max, step, format, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number
  format: (v: number) => string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={lbl}>{label}</span>
        <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.04em' }}>
          {format(value)}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent)', height: 3, cursor: 'pointer' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontFamily: 'DM Mono', fontSize: 9, color: 'var(--text-3)' }}>{format(min)}</span>
        <span style={{ fontFamily: 'DM Mono', fontSize: 9, color: 'var(--text-3)' }}>{format(max)}</span>
      </div>
    </div>
  )
}

function ChipGroup<T extends string>({
  options, active, onToggle, single,
}: {
  options: { label: string; value: T }[]
  active: T | T[] | undefined
  onToggle: (v: T) => void
  single?: boolean
}) {
  const activeSet = Array.isArray(active) ? active : active ? [active] : []
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      {options.map(o => {
        const on = activeSet.includes(o.value)
        return (
          <button key={o.value} onClick={() => onToggle(o.value)} style={{
            padding: '5px 10px', borderRadius: 8, fontSize: 11,
            fontFamily: single ? 'DM Sans' : 'DM Mono',
            cursor: 'pointer', transition: 'all 0.15s',
            background: on ? '#f0f0f0' : '#1f1f1f',
            border: `1px solid ${on ? '#f0f0f0' : 'var(--border)'}`,
            color: on ? '#0e0e0e' : 'var(--text-2)',
            letterSpacing: single ? undefined : '0.04em',
          }}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function SearchPanel({ onComplete }: Props) {
  const [makeSlug,   setMakeSlug]   = useState('')
  const [modelSlug,  setModelSlug]  = useState('')
  const currentMake = MAKES.find(m => m.slug === makeSlug)

  const [priceMin,   setPriceMin]   = useState<number | ''>(0)
  const [priceMax,   setPriceMax]   = useState<number | ''>(25000)
  const [kmMax,      setKmMax]      = useState(120000)
  const [yearMin,    setYearMin]    = useState<number | ''>(2015)
  const [yearMax,    setYearMax]    = useState<number | ''>('')
  const [powerMin,   setPowerMin]   = useState(0)
  const [fuel,       setFuel]       = useState<string | undefined>(undefined)
  const [bodyTypes,  setBodyTypes]  = useState<string[]>([])
  const [countries,  setCountries]  = useState<string[]>(['NL'])
  const [job,        setJob]        = useState<ScrapeJob | null>(null)
  const [polling,    setPolling]    = useState(false)

  function toggleCountry(code: string) {
    setCountries(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code])
  }

  function handleMakeChange(slug: string) {
    setMakeSlug(slug)
    const entry = MAKES.find(m => m.slug === slug)
    setModelSlug(entry?.models[0]?.slug ?? '')
  }

  function buildParams(): SearchParams {
    return {
      make:        makeSlug || undefined,
      model:       (makeSlug && modelSlug) ? modelSlug : undefined,
      price_min:   priceMin ? Number(priceMin) : undefined,
      price_max:   priceMax ? Number(priceMax) : undefined,
      mileage_max: kmMax,
      year_min:    yearMin ? Number(yearMin) : undefined,
      year_max:    yearMax ? Number(yearMax) : undefined,
      power_min:   powerMin > 0 ? powerMin : undefined,
      fuel_type:   fuel,
      body_type:   bodyTypes.length > 0 ? bodyTypes.join(',') : undefined,
      country:     countries.join(',') || 'NL',
    }
  }

  async function handleSearch() {
    const j = await startScrape(buildParams())
    setJob(j)
    setPolling(true)
    poll(j.job_id)
  }

  async function poll(jobId: string) {
    const check = async () => {
      const j = await getScrapeJob(jobId)
      setJob(j)
      if (j.status === 'done') { setPolling(false); onComplete() }
      else if (j.status === 'error') { setPolling(false) }
      else setTimeout(check, 2000)
    }
    setTimeout(check, 1000)
  }

  const running = polling && job?.status === 'running'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Make */}
      <div>
        <span style={lbl}>Make</span>
        <select value={makeSlug} onChange={e => handleMakeChange(e.target.value)}
          style={{ ...inp, cursor: 'pointer' }}>
          <option value="">Any Make</option>
          {MAKES.map(m => <option key={m.slug} value={m.slug}>{m.label}</option>)}
        </select>
      </div>

      {/* Model — only when make is selected */}
      {makeSlug && currentMake && currentMake.models.length > 0 && (
        <div>
          <span style={lbl}>Model</span>
          <select value={modelSlug} onChange={e => setModelSlug(e.target.value)}
            style={{ ...inp, cursor: 'pointer' }}>
            <option value="">Any Model</option>
            {currentMake.models.map(m => <option key={m.slug} value={m.slug}>{m.label}</option>)}
          </select>
        </div>
      )}

      {/* Price range */}
      <RangeInputs
        label="Price (€)" low={priceMin} high={priceMax}
        placeholder={['Min', 'Max']}
        onChange={(lo, hi) => { setPriceMin(lo); setPriceMax(hi) }}
      />

      {/* KM */}
      <SliderField
        label="Max Mileage" value={kmMax} min={10000} max={300000} step={5000}
        format={v => `${(v/1000).toFixed(0)}k km`}
        onChange={setKmMax}
      />

      {/* Year range */}
      <RangeInputs
        label="Year" low={yearMin} high={yearMax}
        placeholder={['From', 'To']}
        onChange={(lo, hi) => { setYearMin(lo); setYearMax(hi) }}
      />

      {/* Power */}
      <SliderField
        label="Min Power" value={powerMin} min={0} max={300} step={10}
        format={v => v === 0 ? 'Any' : `${v} HP`}
        onChange={setPowerMin}
      />

      {/* Body type */}
      <div>
        <span style={lbl}>Body Type</span>
        <ChipGroup
          options={BODY_TYPES}
          active={bodyTypes}
          onToggle={v => setBodyTypes(prev => prev.includes(v) ? prev.filter(b => b !== v) : [...prev, v])}
        />
      </div>

      {/* Fuel */}
      <div>
        <span style={lbl}>Fuel</span>
        <ChipGroup
          options={FUEL_TYPES.map(f => ({ label: f, value: f }))}
          active={fuel}
          onToggle={v => setFuel(fuel === v ? undefined : v)}
          single
        />
      </div>

      {/* Countries */}
      <div>
        <span style={lbl}>Countries</span>
        <ChipGroup
          options={COUNTRIES.map(c => ({ label: c.label, value: c.code }))}
          active={countries}
          onToggle={toggleCountry}
        />
      </div>

      {/* Progress */}
      {job && (
        <div style={{ background: 'var(--bg-card-2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, fontFamily: 'DM Mono' }}>
          {running && (
            <>
              <div style={{ color: 'var(--accent)', marginBottom: 6 }}>
                Scanning... {job.scraped}/{job.total || '?'}
              </div>
              <div style={{ height: 3, background: 'var(--border-mid)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', background: 'var(--accent)', borderRadius: 99,
                  width: job.total ? `${Math.min(100, (job.scraped / job.total) * 100)}%` : '40%',
                  transition: 'width 0.4s',
                }} />
              </div>
            </>
          )}
          {job.status === 'done' && <span style={{ color: 'var(--accent)' }}>{job.scraped} vehicles found</span>}
          {job.status === 'error' && <span style={{ color: '#ff6e6e' }}>Error: {job.error}</span>}
        </div>
      )}

      <button onClick={handleSearch} disabled={running} style={{
        width: '100%', padding: '11px 0', borderRadius: 10, border: 'none',
        background: running ? 'var(--bg-card-2)' : 'var(--accent)',
        color: running ? 'var(--text-3)' : '#0e0e0e',
        fontFamily: 'Syne', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em',
        cursor: running ? 'not-allowed' : 'pointer', textTransform: 'uppercase',
      }}>
        {running ? 'Scanning...' : 'Search & Scan'}
      </button>
    </div>
  )
}
