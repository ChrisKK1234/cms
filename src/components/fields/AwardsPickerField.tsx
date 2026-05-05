'use client'

import React, { useEffect, useState } from 'react'
import { useField } from '@payloadcms/ui'

type AwardType = {
  id: string
  name: string
  image: {
    cloudinary?: { secure_url?: string }
    url?: string
  }
}

export const AwardsPickerField: React.FC = () => {
  const { value, setValue } = useField<string[]>({ path: 'awards' })
  const [awardTypes, setAwardTypes] = useState<AwardType[]>([])
  const selected: string[] = Array.isArray(value) ? value : []

  useEffect(() => {
    fetch('/api/globals/awards?depth=1')
      .then(r => r.json())
      .then(data => setAwardTypes(data?.types ?? []))
      .catch(() => {})
  }, [])

  function toggle(id: string) {
    if (selected.includes(id)) {
      setValue(selected.filter(s => s !== id))
    } else {
      setValue([...selected, id])
    }
  }

  function getImageUrl(award: AwardType) {
    return award.image?.cloudinary?.secure_url ?? award.image?.url ?? ''
  }

  if (!awardTypes.length) return (
    <div style={{ padding: '12px 0', color: '#888' }}>
      Ingen award typer endnu – tilføj dem i Awards globalen.
    </div>
  )

  return (
    <div>
      <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
        Awards
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {awardTypes.map(award => {
          const isSelected = selected.includes(award.id)
          return (
            <button
              key={award.id}
              type="button"
              onClick={() => toggle(award.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                border: isSelected ? '2px solid #fff' : '2px solid #444',
                borderRadius: 8,
                background: isSelected ? '#333' : '#1a1a1a',
                cursor: 'pointer',
                opacity: isSelected ? 1 : 0.5,
                transition: 'all 0.15s',
              }}
            >
              {getImageUrl(award) && (
                <img
                  src={getImageUrl(award)}
                  alt={award.name}
                  style={{ width: 48, height: 48, objectFit: 'contain' }}
                />
              )}
              <span style={{ color: '#fff', fontSize: 12 }}>{award.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}