import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getVehicle } from '../lib/api'
import type { ScoredVehicle } from '../types/vehicle'
import { ScoreBar } from '../components/ScoreBar'

function Row({ label, value }: { label: string; value: string | number | null }) {
  if (value == null) return null
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'DM Mono', fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>
        {value}
      </span>
    </div>
  )
}

export function VehicleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [vehicle, setVehicle] = useState<ScoredVehicle | null>(null)
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    if (id) getVehicle(id).then(setVehicle).catch(() => navigate('/'))
  }, [id, navigate])

  if (!vehicle) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100, height: 60,
        background: 'rgba(14,14,14,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 32px', gap: 24,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: '1px solid var(--border-mid)', borderRadius: 8,
            color: 'var(--text-2)', padding: '6px 14px', cursor: 'pointer',
            fontFamily: 'DM Sans', fontSize: 13,
          }}
        >
          ← Back
        </button>
        <span style={{
          fontFamily: 'Syne', fontWeight: 800, fontSize: 15,
          color: 'var(--text-1)', letterSpacing: '0.25em', textTransform: 'uppercase',
          flex: 1, textAlign: 'center',
        }}>
          CARZONE
        </span>
        <a
          href={vehicle.listing_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            border: '1px solid var(--border-mid)', borderRadius: 8,
            color: 'var(--text-2)', padding: '6px 14px', cursor: 'pointer',
            fontFamily: 'DM Sans', fontSize: 13, textDecoration: 'none',
          }}
        >
          AutoScout24 ↗
        </a>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>
        {/* Hero */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }}>
          {/* Image */}
          <div>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 18, height: 320, display: 'flex', alignItems: 'center',
              justifyContent: 'center', overflow: 'hidden', padding: '0 20px',
            }}>
              {vehicle.image_urls.length > 0 ? (
                <img
                  src={vehicle.image_urls[imgIdx]}
                  alt=""
                  style={{
                    maxHeight: '100%', maxWidth: '100%', objectFit: 'contain',
                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))',
                  }}
                />
              ) : (
                <div style={{ fontSize: 64, opacity: 0.15 }}>🚗</div>
              )}
            </div>
            {vehicle.image_urls.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto', paddingBottom: 4 }}>
                {vehicle.image_urls.slice(0, 8).map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    style={{
                      flexShrink: 0, width: 64, height: 48, borderRadius: 8,
                      overflow: 'hidden', padding: 0, cursor: 'pointer',
                      border: `2px solid ${i === imgIdx ? 'var(--accent)' : 'var(--border)'}`,
                      background: 'var(--bg-card)',
                    }}
                  >
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                {vehicle.seller_type === 'private' ? 'Private Seller' : 'Dealer'} · {vehicle.location || '—'}
              </div>
              <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, color: 'var(--text-1)', lineHeight: 1.1, margin: 0 }}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 30, color: 'var(--accent)', marginTop: 8 }}>
                {vehicle.price.toLocaleString()} €
              </div>
            </div>

            {/* Score */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Overall Score
                </span>
                <span style={{ fontFamily: 'DM Mono', fontWeight: 500, fontSize: 18, color: 'var(--accent)' }}>
                  {vehicle.score.toFixed(1)}
                </span>
              </div>
              <ScoreBar score={vehicle.score} />

              {Object.keys(vehicle.score_breakdown).length > 0 && (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.entries(vehicle.score_breakdown).map(([k, v]) => (
                    <div key={k}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {k.replace('_', ' ')}
                        </span>
                      </div>
                      <ScoreBar score={v} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { v: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : '—', l: 'Mileage' },
                { v: vehicle.power_hp ? `${vehicle.power_hp} HP` : '—', l: 'Power' },
                { v: vehicle.curb_weight_kg ? `${vehicle.curb_weight_kg} kg` : '—', l: 'Weight' },
              ].map(s => (
                <div key={s.l} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'DM Mono', fontWeight: 500, fontSize: 14, color: 'var(--text-1)' }}>{s.v}</div>
                  <div style={{ fontFamily: 'DM Mono', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {[
            [
              { label: 'Fuel', value: vehicle.fuel_type },
              { label: 'Transmission', value: vehicle.transmission },
              { label: 'Engine CC', value: vehicle.engine_cc ? `${vehicle.engine_cc} cc` : null },
              { label: 'Doors', value: vehicle.doors },
              { label: 'Seats', value: vehicle.seats },
            ],
            [
              { label: 'Color', value: vehicle.color },
              { label: 'First Reg.', value: vehicle.first_registration },
              { label: 'Seller', value: vehicle.seller_type },
              { label: 'Location', value: vehicle.location },
              { label: 'Scraped', value: vehicle.scraped_at ? new Date(vehicle.scraped_at).toLocaleDateString() : null },
            ],
          ].map((col, ci) => (
            <div key={ci} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
              {col.map(r => <Row key={r.label} label={r.label} value={r.value ?? null} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
