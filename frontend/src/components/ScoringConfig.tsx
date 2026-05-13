import { useState, useEffect } from 'react'
import { getScoringWeights, updateScoringWeights, rescoreAll } from '../lib/api'
import type { ScoringWeights } from '../types/vehicle'

interface Props { onRescore: () => void }

const LABELS: Record<keyof ScoringWeights, string> = {
  price:       'Price',
  mileage:     'Mileage',
  km_per_year: 'km/yr Ratio',
  power:       'Power',
  curb_weight: 'Weight',
  engine:      'Engine (small)',
  maintenance: 'Maintenance (AI)',
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.12em',
  color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 14, display: 'block',
}

export function ScoringConfig({ onRescore }: Props) {
  const [weights, setWeights] = useState<ScoringWeights>({
    price: 25, mileage: 15, km_per_year: 15, power: 10, curb_weight: 15, engine: 10, maintenance: 10,
  })
  const [saving, setSaving] = useState(false)
  const [rescoring, setRescoring] = useState(false)

  useEffect(() => { getScoringWeights().then(setWeights).catch(() => {}) }, [])

  const total = Object.values(weights).reduce((a, b) => a + b, 0)

  async function handleSave() {
    setSaving(true)
    try { await updateScoringWeights(weights) } finally { setSaving(false) }
  }

  async function handleRescore() {
    setRescoring(true)
    try { await rescoreAll(); onRescore() } finally { setRescoring(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <span style={sectionLabel}>Scoring Weights</span>

      {(Object.keys(weights) as Array<keyof ScoringWeights>).map(key => (
        <div key={key}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-2)' }}>
              {LABELS[key]}
            </span>
            <span style={{ fontFamily: 'DM Mono', fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>
              {weights[key]}%
            </span>
          </div>
          <input
            type="range" min={0} max={100} value={weights[key]}
            onChange={e => setWeights(w => ({ ...w, [key]: Number(e.target.value) }))}
            style={{ width: '100%', accentColor: 'var(--accent)', height: 3 }}
          />
        </div>
      ))}

      <div style={{
        fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.08em',
        color: Math.abs(total - 100) > 1 ? '#ff6e6e' : 'var(--text-3)',
      }}>
        TOTAL: {total}% {Math.abs(total - 100) > 1 ? '— should be 100' : ''}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleSave} disabled={saving}
          style={{
            flex: 1, padding: '9px 0', borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--accent)', color: '#0e0e0e',
            fontFamily: 'Syne', fontWeight: 700, fontSize: 11, letterSpacing: '0.08em',
            cursor: saving ? 'not-allowed' : 'pointer', textTransform: 'uppercase',
            opacity: saving ? 0.5 : 1,
          }}
        >
          {saving ? '...' : 'Save'}
        </button>
        <button
          onClick={handleRescore} disabled={rescoring}
          style={{
            flex: 1, padding: '9px 0', borderRadius: 10,
            border: '1px solid var(--border-mid)', background: 'var(--bg-card-2)', color: 'var(--text-2)',
            fontFamily: 'Syne', fontWeight: 700, fontSize: 11, letterSpacing: '0.08em',
            cursor: rescoring ? 'not-allowed' : 'pointer', textTransform: 'uppercase',
            opacity: rescoring ? 0.5 : 1,
          }}
        >
          {rescoring ? '...' : 'Rescore'}
        </button>
      </div>
    </div>
  )
}
