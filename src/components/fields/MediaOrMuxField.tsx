'use client'

import React from 'react'
import { useField, UploadField, RelationshipField } from '@payloadcms/ui'

type Props = {
  path: string
  label?: string
  required?: boolean
  // Payload passer admin.custom felter direkte som props
  custom?: {
    label?: string
    required?: boolean
  }
}

export function MediaOrMuxField({ path, label: labelProp, required: requiredProp, custom }: Props) {
  const label = labelProp ?? custom?.label
  const required = requiredProp ?? custom?.required ?? false

  const basePath = path.includes('.')
    ? path.substring(0, path.lastIndexOf('.') + 1)
    : ''

  const typePath = `${basePath}${getBaseName(path)}Type`
  const mediaPath = `${basePath}${getBaseName(path)}Media`
  const muxPath = `${basePath}${getBaseName(path)}Mux`

  const { value: type, setValue: setType } = useField<string>({ path: typePath })
  const activeType = type ?? 'media'

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
        {label && (
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--theme-text)' }}>
            {label}
          </label>
        )}
        {required && (
          <span style={{ color: '#ef4444', fontSize: 13, lineHeight: 1 }}>*</span>
        )}
      </div>

      {/* Toggle */}
      <div style={{
        display: 'inline-flex',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 14,
      }}>
        {(['media', 'mux'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: '6px 16px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
              background: activeType === t ? 'var(--theme-text)' : 'var(--theme-elevation-50)',
              color: activeType === t ? 'var(--theme-bg)' : 'var(--theme-elevation-500)',
            }}
          >
            {t === 'media' ? 'Billede' : 'Video'}
          </button>
        ))}
      </div>

      {activeType === 'media' && (
        <UploadField
          field={{ name: mediaPath, type: 'upload', relationTo: 'media', label: ' ' } as any}
          path={mediaPath}
        />
      )}
      {activeType === 'mux' && (
        <RelationshipField
          field={{ name: muxPath, type: 'relationship', relationTo: 'mux-videos', label: ' ' } as any}
          path={muxPath}
        />
      )}
    </div>
  )
}

function getBaseName(path: string): string {
  const last = path.includes('.') ? path.split('.').pop()! : path
  return last.endsWith('Field') ? last.slice(0, -5) : last
}