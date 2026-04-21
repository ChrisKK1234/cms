'use client'

import React, { useEffect, useState } from 'react'
import { useField } from '@payloadcms/ui'

type MuxAsset = {
  id: string
  playbackId: string | null
  thumbnailUrl: string | null
  passthrough: string | null
  duration: number | null
}

export function MuxVideoSelect({ path }: { path: string }) {
  const { value, setValue } = useField<string>({ path })
  const [assets, setAssets] = useState<MuxAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/mux-assets')
      .then((r) => r.json())
      .then((data) => {
        setAssets(data.assets ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const selected = assets.find((a) => a.playbackId === value)

  function formatDuration(seconds: number | null) {
    if (!seconds) return ''
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div style={styles.wrapper}>
      <label style={styles.label}>Video</label>

      {/* ── Selected preview ── */}
      {selected && (
        <div style={styles.selectedWrapper}>
          {selected.thumbnailUrl && (
            <img src={selected.thumbnailUrl} alt="" style={styles.selectedThumb} />
          )}
          <div style={styles.selectedInfo}>
            <p style={styles.selectedTitle}>{selected.passthrough || 'Ingen titel'}</p>
            <p style={styles.selectedMeta}>
              {formatDuration(selected.duration)} · {selected.playbackId}
            </p>
          </div>
          <button type="button" style={styles.clearBtn} onClick={() => setValue('')}>
            ✕
          </button>
        </div>
      )}

      {/* ── Pick / change button ── */}
      <button type="button" style={styles.button} onClick={() => setOpen(true)}>
        {selected ? '🔄 Skift video' : '🎬 Vælg video'}
      </button>

      {/* ── Dropdown modal ── */}
      {open && (
        <div style={styles.overlay} onClick={() => setOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Vælg en video</h2>
              <button style={styles.closeBtn} onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>

            {loading && <p style={styles.info}>Henter videoer…</p>}

            <div style={styles.grid}>
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  style={{
                    ...styles.card,
                    borderColor:
                      value === asset.playbackId
                        ? 'var(--theme-success-500, #22c55e)'
                        : 'var(--theme-elevation-150)',
                  }}
                  onClick={() => {
                    setValue(asset.playbackId ?? '')
                    setOpen(false)
                  }}
                >
                  <div style={styles.thumbWrapper}>
                    {asset.thumbnailUrl ? (
                      <img src={asset.thumbnailUrl} alt="" style={styles.thumb} />
                    ) : (
                      <div style={styles.thumbPlaceholder}>⏳</div>
                    )}
                    {asset.duration && (
                      <span style={styles.duration}>{formatDuration(asset.duration)}</span>
                    )}
                  </div>
                  <p style={styles.cardTitle}>
                    {asset.passthrough || <em style={styles.muted}>Ingen titel</em>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0' },
  label: { fontWeight: 600, fontSize: '13px', color: 'var(--theme-text)' },
  selectedWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '6px',
    background: 'var(--theme-elevation-50)',
  },
  selectedThumb: { width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px' },
  selectedInfo: { flex: 1, minWidth: 0 },
  selectedTitle: { fontSize: '13px', fontWeight: 600, margin: 0, color: 'var(--theme-text)' },
  selectedMeta: { fontSize: '11px', color: 'var(--theme-elevation-500)', margin: 0 },
  clearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--theme-elevation-500)',
    fontSize: '14px',
    padding: '4px',
  },
  button: {
    alignSelf: 'flex-start',
    padding: '8px 16px',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    background: 'var(--theme-elevation-50)',
    color: 'var(--theme-text)',
    cursor: 'pointer',
    fontSize: '13px',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    background: 'var(--theme-bg)',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '760px',
    maxHeight: '80vh',
    overflow: 'auto',
    padding: '20px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  modalTitle: { fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--theme-text)' },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--theme-text)',
    fontSize: '18px',
  },
  info: { fontSize: '14px', color: 'var(--theme-elevation-500)' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px',
  },
  card: {
    border: '2px solid',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    background: 'var(--theme-elevation-50)',
  },
  thumbWrapper: { position: 'relative', aspectRatio: '16/9', background: '#000' },
  thumb: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  duration: {
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    background: 'rgba(0,0,0,0.7)',
    color: '#fff',
    fontSize: '10px',
    padding: '1px 5px',
    borderRadius: '3px',
  },
  cardTitle: {
    fontSize: '12px',
    fontWeight: 500,
    margin: '6px 8px 8px',
    color: 'var(--theme-text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  muted: { color: 'var(--theme-elevation-400)', fontStyle: 'italic' },
}
