import { useState, useEffect, useCallback } from 'react'
import { getVehicles } from '../lib/api'
import type { ScoredVehicle } from '../types/vehicle'
import { VehicleCard } from '../components/VehicleCard'
import { VehicleModal } from '../components/VehicleModal'
import { SearchPanel } from '../components/SearchPanel'
import { ScoringConfig } from '../components/ScoringConfig'
import { useIsMobile } from '../lib/useIsMobile'

type SortKey = 'score' | 'price' | 'mileage' | 'year'

const SORT_LABELS: Record<SortKey, string> = {
  score: 'Score', price: 'Price', mileage: 'Mileage', year: 'Year',
}

function isToday(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate()
}

function SearchModal({ onClose, onComplete, isMobile }: {
  onClose: () => void; onComplete: () => void; isMobile: boolean
}) {
  const [tab, setTab] = useState<'search' | 'scoring'>('search')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
        padding: isMobile ? 0 : '60px 24px 24px',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-mid)',
          borderRadius: isMobile ? '20px 20px 0 0' : 20,
          width: '100%', maxWidth: isMobile ? '100%' : 480,
          maxHeight: isMobile ? '92dvh' : undefined,
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            {(['search', 'scoring'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '6px 16px', fontFamily: 'DM Mono', fontSize: 10,
                letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none',
                background: tab === t ? 'var(--bg-card-2)' : 'transparent',
                color: tab === t ? 'var(--text-1)' : 'var(--text-3)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {t === 'search' ? 'Filters' : 'Scoring'}
              </button>
            ))}
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border-mid)',
            background: 'var(--bg-card-2)', color: 'var(--text-2)', cursor: 'pointer',
            fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto' }}>
          {tab === 'search'
            ? <SearchPanel onComplete={() => { onComplete(); onClose() }} />
            : <ScoringConfig onRescore={() => { onComplete(); onClose() }} />
          }
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ label, count }: { label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: 'var(--text-1)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--text-3)' }}>{count}</span>
    </div>
  )
}

export function Home() {
  const [vehicles, setVehicles] = useState<ScoredVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<SortKey>('score')
  const [searchOpen, setSearchOpen] = useState(false)
  const [selected, setSelected] = useState<ScoredVehicle | null>(null)
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
    )
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try { setVehicles(await getVehicles({ sort_by: sort })) }
    finally { setLoading(false) }
  }, [sort])

  useEffect(() => { load() }, [load])

  const newToday = vehicles.filter(v => isToday(v.scraped_at))
  const rest     = vehicles.filter(v => !isToday(v.scraped_at))

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100, height: 56,
        background: 'rgba(14,14,14,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 8,
      }}>
        <span style={{
          fontFamily: 'Syne', fontWeight: 800, fontSize: 15,
          color: 'var(--text-1)', letterSpacing: '0.25em', textTransform: 'uppercase',
          flex: 1, whiteSpace: 'nowrap',
        }}>
          CARZONE
        </span>

        {!isMobile && (
          <div style={{ display: 'flex', gap: 4 }}>
            {(Object.keys(SORT_LABELS) as SortKey[]).map(k => (
              <button key={k} onClick={() => setSort(k)} style={{
                padding: '5px 10px', borderRadius: 8, fontSize: 11, fontFamily: 'DM Sans',
                cursor: 'pointer', transition: 'all 0.15s',
                background: sort === k ? 'var(--bg-card-2)' : 'transparent',
                border: `1px solid ${sort === k ? 'var(--border-mid)' : 'transparent'}`,
                color: sort === k ? 'var(--text-1)' : 'var(--text-3)',
              }}>
                {SORT_LABELS[k]}
              </button>
            ))}
          </div>
        )}

        {isMobile && (
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            style={{
              background: 'var(--bg-card-2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '5px 8px', fontSize: 11,
              fontFamily: 'DM Mono', color: 'var(--text-1)', cursor: 'pointer',
            }}
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map(k => (
              <option key={k} value={k}>{SORT_LABELS[k]}</option>
            ))}
          </select>
        )}

        <button onClick={() => setSearchOpen(true)} style={{
          padding: '7px 16px', borderRadius: 9, border: 'none',
          background: 'var(--accent)', color: '#0e0e0e',
          fontFamily: 'Syne', fontWeight: 700, fontSize: 12,
          letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}>
          {isMobile ? '⌕' : 'Search'}
        </button>
      </nav>

      {/* MAIN */}
      <main style={{ padding: isMobile ? '16px' : '28px 32px' }}>
        {loading ? (
          <div style={gridStyle}>
            {[...Array(isMobile ? 3 : 6)].map((_, i) => (
              <div key={i} style={{
                height: 320, background: 'var(--bg-card)',
                border: '1px solid var(--border)', borderRadius: 18,
                animation: 'pulse-accent 1.8s ease infinite', opacity: 0.4,
              }} />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '60vh', gap: 16,
          }}>
            <div style={{ fontSize: 48, opacity: 0.15 }}>◎</div>
            <p style={{ fontFamily: 'DM Mono', fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              No vehicles — press Search to start
            </p>
            <button onClick={() => setSearchOpen(true)} style={{
              padding: '9px 24px', borderRadius: 10, border: 'none',
              background: 'var(--accent)', color: '#0e0e0e',
              fontFamily: 'Syne', fontWeight: 700, fontSize: 13,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
            }}>
              Search
            </button>
          </div>
        ) : (
          <>
            {newToday.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <SectionLabel label="New Today" count={newToday.length} />
                <div style={gridStyle}>
                  {newToday.map(v => (
                    <VehicleCard key={v.id} vehicle={v} userPos={userPos ?? undefined} isNew onClick={() => setSelected(v)} />
                  ))}
                </div>
              </section>
            )}

            <section>
              {newToday.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <SectionLabel label="All Listings" count={rest.length} />
                </div>
              )}
              {!newToday.length && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 22, color: 'var(--text-1)' }}>In Stock</span>
                  <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 22, color: 'var(--text-2)' }}>({vehicles.length})</span>
                </div>
              )}
              <div style={gridStyle}>
                {(newToday.length > 0 ? rest : vehicles).map(v => (
                  <VehicleCard key={v.id} vehicle={v} userPos={userPos ?? undefined} onClick={() => setSelected(v)} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {searchOpen && (
        <SearchModal onClose={() => setSearchOpen(false)} onComplete={load} isMobile={isMobile} />
      )}

      {selected && <VehicleModal vehicle={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
