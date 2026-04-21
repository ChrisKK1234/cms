'use client'

import React, { useState } from 'react'
import { useField, useDocumentInfo } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

export function MuxDeleteField() {
  const { id } = useDocumentInfo()
  const { value: muxAssetId } = useField<string>({ path: 'muxAssetId' })
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  if (!muxAssetId) return null

  const handleDelete = async () => {
    setDeleting(true)
    try {
      // Slet i Mux
      await fetch('/api/mux-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: muxAssetId }),
      })
      // Slet Payload doc
      await fetch(`/api/mux-videos/${id}`, { method: 'DELETE' })
      router.push('/admin/collections/mux-videos')
    } catch (err) {
      console.error('Sletning fejlede:', err)
      setDeleting(false)
    }
  }

  return (
    <div style={s.wrapper}>
      <label style={s.label}>Slet video</label>
      {!confirming ? (
        <button type="button" style={s.deleteBtn} onClick={() => setConfirming(true)}>
          Slet video
        </button>
      ) : (
        <div style={s.confirmRow}>
          <p style={s.confirmText}>Er du sikker? Dette sletter videoen permanent.</p>
          <div style={s.btnRow}>
            <button type="button" style={s.confirmBtn} onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Sletter…' : 'Ja, slet permanent'}
            </button>
            <button type="button" style={s.cancelBtn} onClick={() => setConfirming(false)}>
              Annuller
            </button>
          </div>
        </div>
      )}
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
    marginTop: '8px',
  },
  label: { fontWeight: 600, fontSize: '13px', color: 'var(--theme-text)' },
  deleteBtn: {
    alignSelf: 'flex-start',
    padding: '8px 16px',
    border: '1px solid #ef4444',
    borderRadius: '4px',
    background: 'transparent',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '13px',
  },
  confirmRow: { display: 'flex', flexDirection: 'column', gap: '8px' },
  confirmText: { fontSize: '13px', color: 'var(--theme-text)', margin: 0 },
  btnRow: { display: 'flex', gap: '8px' },
  confirmBtn: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    background: '#ef4444',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
  },
  cancelBtn: {
    padding: '8px 16px',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '4px',
    background: 'transparent',
    color: 'var(--theme-text)',
    cursor: 'pointer',
    fontSize: '13px',
  },
}
