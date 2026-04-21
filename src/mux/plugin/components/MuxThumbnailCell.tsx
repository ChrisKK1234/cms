'use client'

import React from 'react'

export function MuxThumbnailCell({ rowData }: { rowData?: Record<string, unknown> }) {
  const thumbnailUrl = rowData?.thumbnailUrl as string | undefined
  if (!thumbnailUrl)
    return <span style={{ color: 'var(--theme-elevation-400)', fontSize: '12px' }}>—</span>
  return (
    <img
      src={thumbnailUrl}
      alt="thumbnail"
      style={{
        height: '36px',
        width: '64px',
        objectFit: 'cover',
        borderRadius: '4px',
        display: 'block',
      }}
    />
  )
}
