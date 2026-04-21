'use client'

import React, { useEffect, useState } from 'react'

type Stats = {
  mux: {
    totalVideos: number
    readyVideos: number
    totalDurationSeconds: number
    totalDurationMinutes: number
    limits: { storageGB: number }
  } | null
  cloudinary: {
    creditsUsed: number
    creditsLimit: number
    storageBytes: number
    bandwidthBytes: number
    totalResources: number
    plan: string
  } | null
  mongodb: {
    storageBytesUsed: number
    storageMBUsed: number
    storageMBLimit: number
    error?: string
  } | null
  railway: {
    creditCap: number
    current: {
      memoryGB: number
      cpu: number
      memoryCost: number
      cpuCost: number
      networkCost: number
      totalCost: number
    }
    estimated: { memoryCost: number; cpuCost: number; networkCost: number; totalCost: number }
  } | null
}

const RAILWAY_CREDIT_CAP = 5

export function DashboardView() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/dashboard-stats')
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Kunne ikke hente statistik')
        setLoading(false)
      })
  }, [])

  function formatDuration(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}t ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  function formatBytes(bytes: number) {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${bytes} B`
  }

  function ProgressBar({ used, limit, label }: { used: number; limit: number; label?: string }) {
    const pct = Math.min(100, Math.round((used / limit) * 100))
    const color = pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#22c55e'
    return (
      <div style={s.progressGroup}>
        {label && (
          <div style={s.progressHeader}>
            <span style={s.statLabel}>{label}</span>
            <span style={s.statSmall}>{pct}%</span>
          </div>
        )}
        <div style={s.progressTrack}>
          <div style={{ ...s.progressFill, width: `${pct}%`, background: color }} />
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Dashboard</h1>
        <p style={s.subtitle}>Overblik over services og forbrug</p>
      </div>

      {loading && <p style={s.muted}>Henter statistik…</p>}
      {error && <p style={s.errorText}>{error}</p>}

      {!loading && stats && (
        <div style={s.grid}>
          {/* ── MongoDB ── */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <img src="/logos/MongoDB.svg" alt="MongoDB" style={s.logo} />
              <div>
                <h2 style={s.cardTitle}>MongoDB Atlas</h2>
                <p style={s.cardPlan}>Database · Free tier · 512 MB</p>
              </div>
            </div>
            <div style={s.cardBody}>
              {stats.mongodb && !stats.mongodb.error ? (
                <>
                  <div style={s.bigStat}>
                    <span style={s.bigValue}>{stats.mongodb.storageMBUsed} MB</span>
                    <span style={s.bigLabel}>brugt af {stats.mongodb.storageMBLimit} MB</span>
                  </div>
                  <ProgressBar
                    used={stats.mongodb.storageMBUsed}
                    limit={stats.mongodb.storageMBLimit}
                    label="Storage"
                  />
                  <div style={s.statRow}>
                    <span style={s.statLabel}>Ledig</span>
                    <span style={s.statValue}>
                      {stats.mongodb.storageMBLimit - stats.mongodb.storageMBUsed} MB
                    </span>
                  </div>
                </>
              ) : (
                <p style={s.errorText}>{stats.mongodb?.error ?? 'Kunne ikke hente data'}</p>
              )}
            </div>
          </div>

          {/* ── Cloudinary ── */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <img src="/logos/Cloudinary.svg" alt="Cloudinary" style={s.logo} />
              <div>
                <h2 style={s.cardTitle}>Cloudinary</h2>
                <p style={s.cardPlan}>
                  Cloud storage · {stats.cloudinary?.plan ?? 'Free'} ·{' '}
                  {stats.cloudinary?.creditsLimit ?? 25} credits/md
                </p>
              </div>
            </div>
            <div style={s.cardBody}>
              {stats.cloudinary ? (
                <>
                  <div style={s.bigStat}>
                    <span style={s.bigValue}>{stats.cloudinary.creditsUsed.toFixed(2)}</span>
                    <span style={s.bigLabel}>credits brugt af {stats.cloudinary.creditsLimit}</span>
                  </div>
                  <ProgressBar
                    used={stats.cloudinary.creditsUsed}
                    limit={stats.cloudinary.creditsLimit}
                    label="Credits (storage + båndbredde)"
                  />
                  <div style={s.divider} />
                  <div style={s.statRow}>
                    <span style={s.statLabel}>Filer i alt</span>
                    <span style={s.statValue}>{stats.cloudinary.totalResources}</span>
                  </div>
                  <div style={s.statRow}>
                    <span style={s.statLabel}>Storage brugt</span>
                    <span style={s.statValue}>{formatBytes(stats.cloudinary.storageBytes)}</span>
                  </div>
                  <div style={s.statRow}>
                    <span style={s.statLabel}>Båndbredde brugt</span>
                    <span style={s.statValue}>{formatBytes(stats.cloudinary.bandwidthBytes)}</span>
                  </div>
                </>
              ) : (
                <p style={s.errorText}>Kunne ikke hente Cloudinary data</p>
              )}
            </div>
          </div>

          {/* ── Mux ── */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <img src="/logos/MUX.svg" alt="MUX" style={s.logo} />
              <div>
                <h2 style={s.cardTitle}>Mux Video</h2>
                <p style={s.cardPlan}>Video service · Free tier · 10 videoer</p>
              </div>
            </div>
            <div style={s.cardBody}>
              {stats.mux ? (
                <>
                  <div style={s.bigStat}>
                    <span style={s.bigValue}>{stats.mux.totalVideos}</span>
                    <span style={s.bigLabel}>videoer brugt af 10</span>
                  </div>
                  <ProgressBar used={stats.mux.totalVideos} limit={10} label="Videoer" />
                  <div style={s.divider} />
                  {/* <div style={s.statRow}>
                    <span style={s.statLabel}>Klar til afspilning</span>
                    <span style={s.statValue}>{stats.mux.readyVideos}</span>
                  </div>
                  <div style={s.statRow}>
                    <span style={s.statLabel}>Samlet varighed</span>
                    <span style={s.statValue}>
                      {formatDuration(stats.mux.totalDurationSeconds)}
                    </span>
                  </div> */}
                  {/* <p style={s.note}>💡 Delivery minutes spores ikke på gratis plan</p> */}
                </>
              ) : (
                <p style={s.errorText}>Kunne ikke hente Mux data</p>
              )}
            </div>
          </div>

          {/* ── Railway ── */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <img src="/logos/Railway.svg" alt="Railway" style={s.logo} />
              <div>
                <h2 style={s.cardTitle}>Railway</h2>
                <p style={s.cardPlan}>CMS hosting · Hobby plan · ${RAILWAY_CREDIT_CAP}</p>
              </div>
            </div>
            <div style={s.cardBody}>
              {stats.railway ? (
                <>
                  <p style={s.sectionLabel}>Current Usage</p>
                  <div style={s.statRow}>
                    <span style={s.statLabel}>Memory Usage</span>
                    <span style={s.statValue}>${stats.railway.current.memoryCost.toFixed(2)}</span>
                  </div>
                  <div style={s.statRow}>
                    <span style={s.statLabel}>CPU Usage</span>
                    <span style={s.statValue}>${stats.railway.current.cpuCost.toFixed(2)}</span>
                  </div>
                  <div style={s.statRow}>
                    <span style={s.statLabel}>Network Usage</span>
                    <span style={s.statValue}>${stats.railway.current.networkCost.toFixed(2)}</span>
                  </div>
                  <div style={{ ...s.statRow, marginTop: '4px' }}>
                    <span style={{ ...s.statLabel, fontWeight: 600, color: 'var(--theme-text)' }}>
                      Total
                    </span>
                    <span style={{ ...s.bigValue, fontSize: '22px' }}>
                      ${stats.railway.current.totalCost.toFixed(2)}
                    </span>
                  </div>
                  <ProgressBar
                    used={stats.railway.current.totalCost}
                    limit={stats.railway.creditCap}
                    label={`af $${stats.railway.creditCap}`}
                  />
                  <div style={s.divider} />
                  <p style={s.sectionLabel}>Estimated Usage</p>
                  <div style={s.statRow}>
                    <span style={s.statLabel}>Memory Usage</span>
                    <span style={s.statValue}>
                      ${stats.railway.estimated.memoryCost.toFixed(2)}
                    </span>
                  </div>
                  <div style={s.statRow}>
                    <span style={s.statLabel}>CPU Usage</span>
                    <span style={s.statValue}>${stats.railway.estimated.cpuCost.toFixed(2)}</span>
                  </div>
                  <div style={s.statRow}>
                    <span style={s.statLabel}>Network Usage</span>
                    <span style={s.statValue}>
                      ${stats.railway.estimated.networkCost.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ ...s.statRow, marginTop: '4px' }}>
                    <span style={{ ...s.statLabel, fontWeight: 600, color: 'var(--theme-text)' }}>
                      Total
                    </span>
                    <span style={{ ...s.bigValue, fontSize: '22px' }}>
                      ${stats.railway.estimated.totalCost.toFixed(2)}
                    </span>
                  </div>
                  <ProgressBar
                    used={stats.railway.estimated.totalCost}
                    limit={RAILWAY_CREDIT_CAP}
                    label={`af $${RAILWAY_CREDIT_CAP}`}
                  />
                </>
              ) : (
                <p style={s.errorText}>Kunne ikke hente Railway data</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '32px', maxWidth: '1100px' },
  header: { marginBottom: '28px' },
  title: { fontSize: '26px', fontWeight: 700, margin: '0 0 4px', color: 'var(--theme-text)' },
  subtitle: { fontSize: '13px', color: 'var(--theme-elevation-500)', margin: 0 },
  muted: { fontSize: '14px', color: 'var(--theme-elevation-500)' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '10px',
    background: 'var(--theme-elevation-50)',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    borderBottom: '1px solid var(--theme-elevation-100)',
  },
  icon: { fontSize: '22px', flexShrink: 0 },
  cardTitle: {
    fontSize: '15px',
    fontWeight: 600,
    margin: '0 0 4px',
    color: 'var(--theme-text)',
    lineHeight: 1,
  },
  cardPlan: { fontSize: '11px', color: 'var(--theme-elevation-500)', margin: 0, lineHeight: 1 },
  cardBody: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  bigStat: { display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '4px' },
  bigValue: { fontSize: '28px', fontWeight: 700, color: 'var(--theme-text)', lineHeight: 1 },
  bigLabel: { fontSize: '12px', color: 'var(--theme-elevation-500)' },
  statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { fontSize: '13px', color: 'var(--theme-elevation-500)' },
  statValue: { fontSize: '13px', fontWeight: 600, color: 'var(--theme-text)' },
  statSmall: { fontSize: '12px', color: 'var(--theme-elevation-500)' },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--theme-text)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    margin: 0,
  },
  progressGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  progressHeader: { display: 'flex', justifyContent: 'space-between' },
  progressTrack: {
    height: '8px',
    background: 'var(--theme-elevation-100)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: '4px', transition: 'width 0.6s ease' },
  divider: { height: '1px', background: 'var(--theme-elevation-100)', margin: '2px 0' },
  note: { fontSize: '11px', color: 'var(--theme-elevation-400)', margin: 0, fontStyle: 'italic' },
  errorText: { fontSize: '13px', color: '#ef4444', margin: 0 },
  logo: { width: '32px', height: '32px', objectFit: 'contain' as const, flexShrink: 0 },
}
