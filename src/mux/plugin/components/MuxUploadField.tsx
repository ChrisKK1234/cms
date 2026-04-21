'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useField, useFormFields, useForm } from '@payloadcms/ui'
import * as UpChunk from '@mux/upchunk'
import MuxPlayer from '@mux/mux-player-react'

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export function MuxUploadField() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const { value: existingAssetId, setValue: setAssetId } = useField<string>({ path: 'muxAssetId' })
  const { value: existingPlaybackId, setValue: setPlaybackId } = useField<string>({ path: 'playbackId' })
  const { value: existingThumbnail, setValue: setThumbnailUrl } = useField<string>({ path: 'thumbnailUrl' })
  const { setValue: setDocStatus } = useField<string>({ path: 'status' })
  const { submit } = useForm()

  const titleField = useFormFields(([fields]) => fields['title'])
  const currentTitle = (titleField?.value as string) ?? ''

  const [previewPlaybackId, setPreviewPlaybackId] = useState('')

  useEffect(() => {
    if (existingPlaybackId && !previewPlaybackId) {
      setPreviewPlaybackId(existingPlaybackId as string)
      setStatus('done')
    }
  }, [existingPlaybackId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (fileInputRef.current) fileInputRef.current.value = ''

      setStatus('uploading')
      setProgress(0)
      setErrorMsg('')

      try {
        const res = await fetch('/api/mux-upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: currentTitle }),
        })
        if (!res.ok) throw new Error('Kunne ikke hente upload URL')
        const { uploadId, url } = await res.json()

        const upload = UpChunk.createUpload({ endpoint: url, file, chunkSize: 5120 })

        upload.on('progress', ({ detail }: { detail: number }) => {
          setProgress(Math.round(detail))
        })

        upload.on('error', ({ detail }: { detail: Error }) => {
          setErrorMsg(detail.message ?? 'Upload fejlede')
          setStatus('error')
        })

        upload.on('success', async () => {
          setStatus('processing')

          const assetData = await pollForAsset(uploadId)
          if (!assetData) {
            setErrorMsg('Timeout — Mux tog for lang tid.')
            setStatus('error')
            return
          }

          type PlaybackId = { id: string; policy: string }
          const pubPlayback = (assetData.playback_ids as PlaybackId[])?.find(
            (p) => p.policy === 'public',
          )

          setAssetId(assetData.id as string)
          setDocStatus(assetData.status as string)

          if (pubPlayback) {
            setPlaybackId(pubPlayback.id)
            setPreviewPlaybackId(pubPlayback.id)
            setThumbnailUrl(`https://image.mux.com/${pubPlayback.id}/thumbnail.jpg?width=400&time=2`)
          }

          setStatus('done')

          // Auto-gem dokumentet efter at form state er opdateret
          setTimeout(() => submit(), 500)
        })
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Ukendt fejl')
        setStatus('error')
      }
    },
    [currentTitle, existingAssetId, setAssetId, setPlaybackId, setDocStatus, setThumbnailUrl, submit],
  )

  const hasVideo = status === 'done' && previewPlaybackId

  return (
    <div style={s.wrapper}>
      <label style={s.label}>Video</label>

      {hasVideo && (
        <div style={s.playerWrapper}>
          <MuxPlayer
            playbackId={previewPlaybackId}
            style={{ width: '100%', maxWidth: '480px', borderRadius: '6px' }}
          />
        </div>
      )}

      {status !== 'uploading' && status !== 'processing' && !existingAssetId && (
        <>
          <button type="button" style={s.button} onClick={() => fileInputRef.current?.click()}>
            ⬆️ Upload video
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          {errorMsg && <p style={s.error}>⚠️ {errorMsg}</p>}
        </>
      )}

      {status === 'uploading' && (
        <div style={s.progressWrapper}>
          <p style={s.progressLabel}>Uploader… {progress}%</p>
          <div style={s.progressTrack}>
            <div style={{ ...s.progressBar, width: `${progress}%` }} />
          </div>
        </div>
      )}

      {status === 'processing' && (
        <p style={s.info}>⏳ Mux behandler videoen — gemmer automatisk når den er klar.</p>
      )}
    </div>
  )
}

async function pollForAsset(
  uploadId: string,
  maxAttempts = 24,
  intervalMs = 5000,
): Promise<Record<string, unknown> | null> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, intervalMs))
    try {
      const res = await fetch(`/api/mux-asset-status?uploadId=${uploadId}`)
      if (!res.ok) continue
      const data = await res.json()
      if (data?.status === 'ready') return data
    } catch {
      /* keep trying */
    }
  }
  return null
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 0' },
  label: { fontWeight: 600, fontSize: '13px', color: 'var(--theme-text)' },
  playerWrapper: { maxWidth: '480px' },
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
  progressWrapper: { display: 'flex', flexDirection: 'column', gap: '4px' },
  progressLabel: { fontSize: '13px', margin: 0 },
  progressTrack: {
    height: '6px',
    background: 'var(--theme-elevation-100)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: 'var(--theme-success-500, #22c55e)',
    transition: 'width 0.3s ease',
  },
  info: { fontSize: '13px', color: 'var(--theme-text)', margin: 0 },
  error: { fontSize: '13px', color: '#ef4444', margin: 0 },
}
