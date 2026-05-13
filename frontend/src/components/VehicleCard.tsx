import { useState } from 'react'
import type { ScoredVehicle } from '../types/vehicle'
import { calcMonthlyCost, DEFAULT_PROFILE } from '../lib/finance'
import { distanceKm } from '../lib/geo'

interface Props {
  vehicle: ScoredVehicle
  userPos?: { lat: number; lng: number }
  isNew?: boolean
  onClick: () => void
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div style={{ flex: 1, padding: '8px 10px', borderRight: '1px solid var(--border)' }}
         className="last:border-r-0">
      <div style={{
        fontFamily: 'DM Mono', fontSize: 12, fontWeight: 500,
        color: accent ? 'var(--accent)' : 'var(--text-1)',
        letterSpacing: '0.04em',
      }}>
        {value}
      </div>
      <div style={{ fontFamily: 'DM Mono', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.04em', marginTop: 2 }}>
        {label}
      </div>
    </div>
  )
}

export function VehicleCard({ vehicle, userPos, isNew, onClick }: Props) {
  const [hovered, setHovered] = useState(false)
  const img = vehicle.image_urls?.[0]

  const costs = calcMonthlyCost(
    vehicle.price,
    vehicle.curb_weight_kg,
    vehicle.fuel_type,
    vehicle.power_hp,
    vehicle.engine_cc,
    DEFAULT_PROFILE,
  )

  const km = userPos ? distanceKm(vehicle.location, userPos.lat, userPos.lng) : null
  const ccLabel = vehicle.engine_cc ? `${(vehicle.engine_cc / 1000).toFixed(1)}L` : null

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--border-mid)' : 'var(--border)'}`,
        borderRadius: 18, overflow: 'hidden', cursor: 'pointer', position: 'relative',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 0.25s ease, border-color 0.25s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Header */}
      <div style={{ padding: '1rem 1rem 0.6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: 'var(--text-1)', lineHeight: 1.2 }}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </div>
            <div style={{ fontFamily: 'DM Sans', fontSize: 11.5, color: 'var(--text-2)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
              <span>{vehicle.fuel_type || '—'}</span>
              <span style={{ color: 'var(--border-mid)' }}>·</span>
              <span>{vehicle.transmission || '—'}</span>
              {ccLabel && <>
                <span style={{ color: 'var(--border-mid)' }}>·</span>
                <span style={{ color: 'var(--text-1)', fontFamily: 'DM Mono', fontSize: 11 }}>{ccLabel}</span>
              </>}
              <span style={{ color: 'var(--border-mid)' }}>·</span>
              <span>{vehicle.location?.split(',')[0] || '—'}</span>
              {km !== null && (
                <span style={{
                  fontFamily: 'DM Mono', fontSize: 10, color: 'var(--accent)',
                  background: 'var(--accent-dim)', borderRadius: 4, padding: '1px 5px',
                }}>
                  ~{km} km
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, color: 'var(--text-1)' }}>
              {vehicle.price.toLocaleString()} €
            </div>
            <div style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--text-3)' }}>
              ~€{costs.totalLow}–{costs.totalHigh}/mo
            </div>
          </div>
        </div>
      </div>

      {/* Image */}
      <div style={{ position: 'relative', margin: '0 12px', borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3' }}>
        {img ? (
          <img src={img} alt="" style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.04) translateY(-4px)' : 'scale(1)',
            transition: 'transform 0.35s ease',
          }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, opacity: 0.15 }}>🚗</div>
        )}
        {isNew && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: 'var(--accent)', color: '#0e0e0e',
            fontFamily: 'Syne', fontWeight: 800, fontSize: 9,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: 5,
          }}>NEW</div>
        )}
      </div>

      {/* AI Flags */}
      {vehicle.ai_flags && vehicle.ai_flags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px 12px 4px' }}>
          {vehicle.ai_flags.slice(0, 4).map((flag, i) => {
            const positive = flag.startsWith('+')
            const negative = flag.startsWith('-')
            const text = flag.replace(/^[+-]/, '').trim()
            const color = positive ? 'var(--accent)' : negative ? '#ff9966' : 'var(--text-3)'
            const bg = positive ? 'var(--accent-dim)' : negative ? 'rgba(255,150,80,0.10)' : 'var(--bg-card-2)'
            return (
              <span key={i} style={{
                fontFamily: 'DM Mono', fontSize: 9, color, background: bg,
                borderRadius: 4, padding: '2px 6px', letterSpacing: '0.04em',
              }}>
                {text}
              </span>
            )
          })}
        </div>
      )}

      {/* Stat Row */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--border)', marginTop: 6 }}>
        <Stat value={vehicle.mileage ? `${Math.round(vehicle.mileage / 1000)}k` : '—'} label="KM" />
        <Stat value={vehicle.power_hp ? `${vehicle.power_hp}` : '—'} label="HP" />
        <Stat value={vehicle.engine_cc ? `${vehicle.engine_cc}` : '—'} label="CC" />
        <Stat value={vehicle.curb_weight_kg ? `${vehicle.curb_weight_kg}` : '—'} label="KG" />
        <Stat value={vehicle.score.toFixed(0)} label="SCORE" accent />
      </div>
    </div>
  )
}
