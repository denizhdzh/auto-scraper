import { useState, useEffect } from 'react'
import type { ScoredVehicle } from '../types/vehicle'
import { calcMonthlyCost, calcLoan, DEFAULT_PROFILE } from '../lib/finance'

interface Props {
  vehicle: ScoredVehicle
  onClose: () => void
}

const SCORE_LABELS: Record<string, string> = {
  price:       'Price',
  mileage:     'Mileage',
  km_per_year: 'km/yr Ratio',
  power:       'Power',
  curb_weight: 'Curb Weight',
  engine:      'Engine Size',
  maintenance: 'Maintenance',
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ').replace(/&#x27;/g, "'").replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function ScoreCriterion({ label, score, explanation }: { label: string; score: number; explanation?: string }) {
  const color = score >= 75 ? 'var(--accent)' : score >= 50 ? '#f0f0f0' : '#ff9966'
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-2)' }}>{label}</span>
        <span style={{ fontFamily: 'DM Mono', fontSize: 12, fontWeight: 500, color }}>{score.toFixed(0)}</span>
      </div>
      <div style={{ height: 3, background: 'var(--border-mid)', borderRadius: 99, overflow: 'hidden', marginBottom: 5 }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 99, transition: 'width 0.5s ease' }} />
      </div>
      {explanation && (
        <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5, margin: 0 }}>
          {explanation}
        </p>
      )}
    </div>
  )
}

function SpecRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: 'DM Mono', fontSize: 12, color: 'var(--text-1)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

export function VehicleModal({ vehicle: v, onClose }: Props) {
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const scoreKeys = Object.keys(v.score_breakdown)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-mid)',
          borderRadius: 20, width: '100%', maxWidth: 1000, maxHeight: '90vh',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid var(--border)',
        }}>
          <div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: 'var(--text-1)', margin: 0 }}>
              {v.year} {v.make} {v.model}
            </h2>
            <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-2)' }}>
              {v.location} · {v.seller_type === 'private' ? 'Private' : 'Dealer'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 22, color: 'var(--accent)' }}>
              {v.price.toLocaleString()} €
            </span>
            <a
              href={v.listing_url} target="_blank" rel="noopener noreferrer"
              style={{
                padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border-mid)',
                fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-2)', textDecoration: 'none',
              }}
            >
              AutoScout24 ↗
            </a>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-mid)',
                background: 'var(--bg-card-2)', color: 'var(--text-2)', cursor: 'pointer',
                fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, overflow: 'hidden' }}>
          {/* LEFT — images + specs */}
          <div style={{ borderRight: '1px solid var(--border)', overflow: 'auto', padding: 24 }}>
            {/* Main image */}
            <div style={{
              borderRadius: 14, overflow: 'hidden', background: 'var(--bg-base)',
              aspectRatio: '4/3', width: '100%', marginBottom: 10,
            }}>
              {v.image_urls.length > 0 ? (
                <img
                  src={v.image_urls[imgIdx]}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, opacity: 0.15 }}>🚗</div>
              )}
            </div>

            {/* Thumbnails */}
            {v.image_urls.length > 1 && (
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 20 }}>
                {v.image_urls.slice(0, 8).map((url, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} style={{
                    flexShrink: 0, width: 60, height: 44, borderRadius: 8, overflow: 'hidden',
                    border: `2px solid ${i === imgIdx ? 'var(--accent)' : 'transparent'}`,
                    padding: 0, cursor: 'pointer', background: 'var(--bg-base)',
                  }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Quick stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
              {[
                { v: v.mileage ? `${Math.round(v.mileage/1000)}k km` : '—', l: 'KM' },
                { v: v.power_hp ? `${v.power_hp} HP` : '—', l: 'POWER' },
                { v: v.curb_weight_kg ? `${v.curb_weight_kg} kg` : '—', l: 'WEIGHT' },
              ].map(s => (
                <div key={s.l} style={{
                  background: 'var(--bg-card-2)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '10px 12px', textAlign: 'center',
                }}>
                  <div style={{ fontFamily: 'DM Mono', fontWeight: 500, fontSize: 15, color: 'var(--text-1)' }}>{s.v}</div>
                  <div style={{ fontFamily: 'DM Mono', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginTop: 3 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Monthly Cost Breakdown */}
            {(() => {
              const costs = calcMonthlyCost(v.price, v.curb_weight_kg, v.fuel_type, v.power_hp, v.engine_cc, DEFAULT_PROFILE)
              const loan = calcLoan(v.price, DEFAULT_PROFILE)
              const rows = [
                { label: 'Loan (36mo, max €16k)', low: costs.loan.low, high: costs.loan.high, note: loan.downPayment > 0 ? `+€${loan.downPayment.toLocaleString()} down` : 'No down payment' },
                { label: 'MRB (road tax)', low: costs.mrb ?? 45, high: costs.mrb ?? 55, note: v.curb_weight_kg ? `${v.curb_weight_kg} kg` : 'est.' },
                { label: 'Insurance (WA+)', low: costs.insurance.low, high: costs.insurance.high, note: 'est.' },
                { label: 'Fuel (~1 tank/mo)', low: costs.fuel, high: costs.fuel, note: '' },
              ]
              return (
                <div style={{ marginBottom: 20, background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Monthly Cost</span>
                    <span style={{ fontFamily: 'DM Mono', fontWeight: 500, fontSize: 15, color: 'var(--accent)' }}>€{costs.totalLow}–{costs.totalHigh}/mo</span>
                  </div>
                  {rows.map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-2)' }}>{r.label}</div>
                        {r.note && <div style={{ fontFamily: 'DM Mono', fontSize: 9, color: 'var(--text-3)', marginTop: 1 }}>{r.note}</div>}
                      </div>
                      <span style={{ fontFamily: 'DM Mono', fontSize: 12, color: 'var(--text-1)', fontWeight: 500 }}>
                        {r.low === r.high ? `€${r.low}` : `€${r.low}–${r.high}`}
                      </span>
                    </div>
                  ))}
                  {loan.downPayment > 0 && (
                    <div style={{ padding: '8px 14px', background: 'rgba(255,150,80,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#ff9966' }}>Down payment due</span>
                      <span style={{ fontFamily: 'DM Mono', fontSize: 12, color: '#ff9966', fontWeight: 500 }}>€{loan.downPayment.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Specs */}
            <SpecRow label="Fuel"         value={v.fuel_type} />
            <SpecRow label="Transmission" value={v.transmission} />
            <SpecRow label="Engine"       value={v.engine_cc ? `${v.engine_cc} cc` : null} />
            <SpecRow label="Color"        value={v.color} />
            <SpecRow label="First Reg"    value={v.first_registration} />
            <SpecRow label="Doors"        value={v.doors} />
            <SpecRow label="Seats"        value={v.seats} />

            {/* Description */}
            {v.description && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Listing Description
                </div>
                <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
                  {stripHtml(v.description)}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT — score breakdown */}
          <div style={{ overflow: 'auto', padding: 24 }}>
            {/* Overall score */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Overall Score
                </span>
                <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 36, color: 'var(--accent)' }}>
                  {v.score.toFixed(0)}
                </span>
              </div>
              <div style={{ height: 4, background: 'var(--border-mid)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${v.score}%`, background: 'var(--accent)', borderRadius: 99 }} />
              </div>
              <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
                Score is relative to the other vehicles in this search pool.
              </p>
            </div>

            {/* Criteria */}
            {scoreKeys.length > 0 && (
              <div>
                <div style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
                  Score Breakdown
                </div>
                {scoreKeys.map(k => (
                  <ScoreCriterion
                    key={k}
                    label={SCORE_LABELS[k] || k}
                    score={v.score_breakdown[k]}
                    explanation={v.score_explanations?.[k]}
                  />
                ))}
              </div>
            )}

            {/* AI Analysis */}
            {v.ai_analysis && (
              <div style={{
                marginTop: 20, background: 'var(--bg-card-2)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    AI Analysis
                  </span>
                  {v.ai_score != null && (
                    <span style={{ fontFamily: 'DM Mono', fontSize: 13, fontWeight: 500, color: 'var(--accent)' }}>
                      {v.ai_score.toFixed(0)} / 100
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
                  {v.ai_analysis}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
