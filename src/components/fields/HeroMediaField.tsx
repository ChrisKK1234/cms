'use client'

import React, { useEffect, useState } from 'react'
import { useField } from '@payloadcms/ui'

type MediaDoc = {
  id: string
  alt?: string
  url?: string
  cloudinary?: { secure_url?: string }
  filename?: string
}

type MuxDoc = {
  id: string
  title?: string
  playbackId?: string
}

type Props = { path: string }

export function HeroMediaField({ path }: Props) {
  const { value: type, setValue: setType } = useField<string>({ path })
  const base = path.replace('heroType', '')
  const mediaPath = `${base}heroMedia`
  const muxPath = `${base}heroMux`
  const mutedPath = `${base}heroMuted`

  const { value: mediaValue, setValue: setMediaValue } = useField<string>({ path: mediaPath })
  const { value: muxValue, setValue: setMuxValue } = useField<string>({ path: muxPath })
  const { value: mutedValue, setValue: setMutedValue } = useField<boolean>({ path: mutedPath })

  const activeType = type ?? 'media'
  const isMuted = mutedValue ?? true

  const [mediaList, setMediaList] = useState<MediaDoc[]>([])
  const [muxList, setMuxList] = useState<MuxDoc[]>([])
  const [selectedMedia, setSelectedMedia] = useState<MediaDoc | null>(null)
  const [selectedMux, setSelectedMux] = useState<MuxDoc | null>(null)
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [loadingMux, setLoadingMux] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)
  const [muxOpen, setMuxOpen] = useState(false)

  useEffect(() => {
    if (!mediaValue) return
    fetch(`/api/media/${mediaValue}`).then(r => r.json()).then(doc => { if (doc?.id) setSelectedMedia(doc) }).catch(() => {})
  }, [mediaValue])

  useEffect(() => {
    if (!muxValue) return
    fetch(`/api/mux-videos/${muxValue}`).then(r => r.json()).then(doc => { if (doc?.id) setSelectedMux(doc) }).catch(() => {})
  }, [muxValue])

  function fetchMediaList() {
    if (mediaList.length > 0) { setMediaOpen(true); return }
    setLoadingMedia(true)
    fetch('/api/media?limit=100&sort=-createdAt').then(r => r.json()).then(d => { setMediaList(d.docs ?? []); setMediaOpen(true) }).finally(() => setLoadingMedia(false))
  }

  function fetchMuxList() {
    if (muxList.length > 0) { setMuxOpen(true); return }
    setLoadingMux(true)
    fetch('/api/mux-videos?limit=100').then(r => r.json()).then(d => { setMuxList(d.docs ?? []); setMuxOpen(true) }).finally(() => setLoadingMux(false))
  }

  function getMediaUrl(doc: MediaDoc) {
    return doc.cloudinary?.secure_url ?? doc.url ?? null
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--theme-text)' }}>Hero media</label>
        
      </div>

      <div style={{ display: 'inline-flex', border: '1px solid var(--theme-elevation-150)', borderRadius: 6, overflow: 'hidden', marginBottom: 14 }}>
        {(['media', 'mux'] as const).map(t => (
          <button key={t} type="button" onClick={() => setType(t)} style={{ fontSize: 12, fontWeight: 500, padding: '6px 16px', border: 'none', cursor: 'pointer', background: activeType === t ? 'var(--theme-text)' : 'var(--theme-elevation-50)', color: activeType === t ? 'var(--theme-bg)' : 'var(--theme-elevation-500)', transition: 'background 0.15s' }}>
            {t === 'media' ? 'Billede' : 'Video'}
          </button>
        ))}
      </div>

      <div style={{ display: activeType === 'media' ? 'block' : 'none' }}>
        {selectedMedia ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--theme-elevation-150)', borderRadius: 6, background: 'var(--theme-elevation-50)' }}>
            {getMediaUrl(selectedMedia) && <img src={getMediaUrl(selectedMedia)!} style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />}
            <span style={{ fontSize: 13, color: 'var(--theme-text)', flex: 1 }}>{selectedMedia.alt ?? selectedMedia.filename ?? selectedMedia.id}</span>
            <button type="button" onClick={() => { setSelectedMedia(null); setMediaValue('') }} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Fjern</button>
            <button type="button" onClick={fetchMediaList} style={{ fontSize: 11, color: 'var(--theme-elevation-500)', background: 'none', border: 'none', cursor: 'pointer' }}>Skift</button>
          </div>
        ) : (
          <button type="button" onClick={fetchMediaList} disabled={loadingMedia} style={{ fontSize: 13, padding: '8px 16px', border: '1px dashed var(--theme-elevation-150)', borderRadius: 6, background: 'none', color: 'var(--theme-elevation-500)', cursor: 'pointer', width: '100%' }}>
            {loadingMedia ? 'Henter...' : '+ Vælg billede'}
          </button>
        )}
        {mediaOpen && (
          <div style={{ marginTop: 8, border: '1px solid var(--theme-elevation-150)', borderRadius: 6, background: 'var(--theme-elevation-100)', maxHeight: 280, overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: 10 }}>
              {mediaList.map(doc => {
                const url = getMediaUrl(doc)
                return (
                  <button key={doc.id} type="button" onClick={() => { setSelectedMedia(doc); setMediaValue(doc.id); setMediaOpen(false) }} style={{ border: mediaValue === doc.id ? '2px solid var(--theme-text)' : '1px solid var(--theme-elevation-150)', borderRadius: 4, background: 'none', cursor: 'pointer', padding: 0, overflow: 'hidden', aspectRatio: '1' }}>
                    {url ? <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <div style={{ width: '100%', height: '100%', background: 'var(--theme-elevation-150)' }} />}
                  </button>
                )
              })}
            </div>
            <div style={{ padding: '8px 10px', borderTop: '1px solid var(--theme-elevation-150)' }}>
              <button type="button" onClick={() => setMediaOpen(false)} style={{ fontSize: 12, color: 'var(--theme-elevation-500)', background: 'none', border: 'none', cursor: 'pointer' }}>Luk</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: activeType === 'mux' ? 'block' : 'none' }}>
        {selectedMux ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--theme-elevation-150)', borderRadius: 6, background: 'var(--theme-elevation-50)' }}>
            {selectedMux.playbackId && <img src={`https://image.mux.com/${selectedMux.playbackId}/thumbnail.jpg?width=80&time=2`} style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />}
            <span style={{ fontSize: 13, color: 'var(--theme-text)', flex: 1 }}>{selectedMux.title ?? selectedMux.id}</span>
            <button type="button" onClick={() => { setSelectedMux(null); setMuxValue('') }} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Fjern</button>
            <button type="button" onClick={fetchMuxList} style={{ fontSize: 11, color: 'var(--theme-elevation-500)', background: 'none', border: 'none', cursor: 'pointer' }}>Skift</button>
          </div>
        ) : (
          <button type="button" onClick={fetchMuxList} disabled={loadingMux} style={{ fontSize: 13, padding: '8px 16px', border: '1px dashed var(--theme-elevation-150)', borderRadius: 6, background: 'none', color: 'var(--theme-elevation-500)', cursor: 'pointer', width: '100%' }}>
            {loadingMux ? 'Henter...' : '+ Vælg video'}
          </button>
        )}
        {muxOpen && (
          <div style={{ marginTop: 8, border: '1px solid var(--theme-elevation-150)', borderRadius: 6, background: 'var(--theme-elevation-100)', maxHeight: 280, overflowY: 'auto' }}>
            {muxList.map(doc => (
              <button key={doc.id} type="button" onClick={() => { setSelectedMux(doc); setMuxValue(doc.id); setMuxOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', border: 'none', borderBottom: '1px solid var(--theme-elevation-100)', background: muxValue === doc.id ? 'var(--theme-elevation-150)' : 'none', cursor: 'pointer', textAlign: 'left' }}>
                {doc.playbackId && <img src={`https://image.mux.com/${doc.playbackId}/thumbnail.jpg?width=80&time=2`} style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />}
                <span style={{ fontSize: 13, color: 'var(--theme-text)' }}>{doc.title ?? doc.id}</span>
              </button>
            ))}
            <div style={{ padding: '8px 10px' }}>
              <button type="button" onClick={() => setMuxOpen(false)} style={{ fontSize: 12, color: 'var(--theme-elevation-500)', background: 'none', border: 'none', cursor: 'pointer' }}>Luk</button>
            </div>
          </div>
        )}

        {/* Mute toggle – kun synlig når video er valgt */}
        {selectedMux && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <input
              type="checkbox"
              id={`${path}-muted`}
              checked={!isMuted}
              onChange={e => setMutedValue(!e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor={`${path}-muted`} style={{ fontSize: 13, color: 'var(--theme-text)', cursor: 'pointer' }}>
              Videoen har lyd
            </label>
          </div>
        )}
      </div>
    </div>
  )
}