'use client'

import React, { useState } from 'react'

export function SaveButton() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    const form = document.querySelector<HTMLFormElement>('form.document-fields')
      ?? document.querySelector<HTMLFormElement>('form[method]')
      ?? document.querySelector<HTMLFormElement>('form')

    if (!form) return

    setSaving(true)

    const handleComplete = () => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      form.removeEventListener('submit', handleComplete)
    }

    form.addEventListener('submit', handleComplete, { once: true })
    form.requestSubmit()

    // Fallback: reset state after 3s if submit event never fires
    setTimeout(() => {
      setSaving(false)
    }, 3000)
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={saving}
      style={{
        fontSize: 13,
        fontWeight: 500,
        color: saved ? '#22c55e' : 'var(--theme-text)',
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 4,
        padding: '6px 14px',
        cursor: saving ? 'not-allowed' : 'pointer',
        opacity: saving ? 0.6 : 1,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {saving ? 'Gemmer...' : saved ? 'Gemt ✓' : 'Gem'}
    </button>
  )
}