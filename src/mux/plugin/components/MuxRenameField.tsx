'use client'

import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export function MuxRenameField() {
  const { initialData } = useDocumentInfo()
  const muxAssetId = initialData?.muxAssetId as string | undefined
  const currentTitle = initialData?.title as string | undefined

  const [newTitle, setNewTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  if (!muxAssetId) return null

  const handleRename = async () => {
    if (!newTitle.trim()) return
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await fetch('/api/mux-rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: muxAssetId, title: newTitle.trim() }),
      })
      if (!res.ok) throw new Error('Rename fejlede')
      setSaved(true)
      setNewTitle('')
      setTimeout(() => {
        setSaved(false)
        window.location.reload()
      }, 1000)
    } catch {
      setError('Kunne ikke omdøbe videoen')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={s.wrapper}>
      <label style={s.label}>Omdøb video</label>
      <div style={s.row}>
        <input
          type="text"
          placeholder="Nyt titel…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          style={s.input}
        />
        <button
          type="button"
          style={s.btn}
          onClick={handleRename}
          disabled={saving || !newTitle.trim()}
        >
          {saving ? 'Gemmer…' : saved ? '✓ Gemt' : 'Gem'}
        </button>
      </div>
      {error && <p style={s.error}>{error}</p>}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px 0',
    borderTop: '1px solid var(--theme-elevation-150)',
  },
  label: { fontWeight: 600, fontSize: '13px', color: 'var(--theme-text)' },
  current: { fontSize: '13px', color: 'var(--theme-elevation-500)', margin: 0 },
  row: { display: 'flex', gap: '8px', alignItems: 'center' },
  input: {
    flex: 1,
    maxWidth: '280px',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid var(--theme-elevation-150)',
    background: 'var(--theme-bg)',
    color: 'var(--theme-text)',
    fontSize: '13px',
  },
  btn: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    background: 'var(--theme-text)',
    color: 'var(--theme-bg)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
  },
  error: { fontSize: '13px', color: '#ef4444', margin: 0 },
}
