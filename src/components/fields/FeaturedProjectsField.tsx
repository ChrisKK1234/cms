'use client'

import React, { useEffect, useState } from 'react'
import { useField } from '@payloadcms/ui'

type Project = {
  id: string
  title: string
  thumbnail?: {
    url?: string
    cloudinary?: { secure_url?: string }
  }
}

type Props = {
  path: string
  label?: string
}

export function FeaturedProjectsField({ path, label }: Props) {
  const { value, setValue } = useField<string[]>({ path })
  const [projects, setProjects] = useState<Project[]>([])
  const [selected, setSelected] = useState<string[]>(value ?? [])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects?limit=100&sort=title')
      .then(r => r.json())
      .then(data => {
        setProjects(data.docs ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Sync inbound value
  useEffect(() => {
    if (value) setSelected(value)
  }, [JSON.stringify(value)])

  function toggle(id: string) {
    const next = selected.includes(id)
      ? selected.filter(s => s !== id)
      : [...selected, id]
    setSelected(next)
    setValue(next)
  }

  function moveUp(id: string) {
    const idx = selected.indexOf(id)
    if (idx <= 0) return
    const next = [...selected]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    setSelected(next)
    setValue(next)
  }

  function moveDown(id: string) {
    const idx = selected.indexOf(id)
    if (idx === -1 || idx >= selected.length - 1) return
    const next = [...selected]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    setSelected(next)
    setValue(next)
  }

  function getThumbnailUrl(project: Project): string | null {
    return (
      project.thumbnail?.cloudinary?.secure_url ??
      project.thumbnail?.url ??
      null
    )
  }

  // Sort all projects: selected first (in order), then unselected
  const selectedProjects = selected
    .map(id => projects.find(p => p.id === id))
    .filter(Boolean) as Project[]

  const unselectedProjects = projects.filter(p => !selected.includes(p.id))

  return (
    <div style={{ marginBottom: 24 }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 4,
          color: 'var(--theme-text)',
        }}>
          {label}
        </label>
      )}
      <p style={{ fontSize: 12, color: 'var(--theme-elevation-500)', marginBottom: 16, marginTop: 0 }}>
        {selected.length} projekt{selected.length !== 1 ? 'er' : ''} valgt
      </p>

      {loading && <p style={{ fontSize: 13, color: 'var(--theme-elevation-500)' }}>Henter projekter...</p>}

      {!loading && projects.length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--theme-elevation-500)' }}>Ingen projekter endnu</p>
      )}

      {!loading && projects.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Selected projects */}
          {selectedProjects.length > 0 && (
            <div>
              <p style={s.sectionLabel}>Valgte projekter</p>
              <div style={s.grid}>
                {selectedProjects.map((project, idx) => {
                  const thumb = getThumbnailUrl(project)
                  return (
                    <div key={project.id} style={{ ...s.card, ...s.cardSelected }}>
                      <div style={s.thumb}>
                        {thumb
                          ? <img src={thumb} alt={project.title} style={s.thumbImg} />
                          : <div style={s.thumbEmpty} />
                        }
                        <div style={s.checkBadge}>✓</div>
                      </div>
                      <div style={s.cardBody}>
                        <p style={s.cardTitle}>{project.title}</p>
                        <div style={s.cardActions}>
                          <div style={s.orderButtons}>
                            <button
                              type="button"
                              onClick={() => moveUp(project.id)}
                              disabled={idx === 0}
                              style={{ ...s.orderBtn, opacity: idx === 0 ? 0.3 : 1 }}
                              title="Flyt op"
                            >↑</button>
                            <button
                              type="button"
                              onClick={() => moveDown(project.id)}
                              disabled={idx === selectedProjects.length - 1}
                              style={{ ...s.orderBtn, opacity: idx === selectedProjects.length - 1 ? 0.3 : 1 }}
                              title="Flyt ned"
                            >↓</button>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggle(project.id)}
                            style={s.removeBtn}
                          >
                            Fjern
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Unselected projects */}
          {unselectedProjects.length > 0 && (
            <div>
              <p style={s.sectionLabel}>
                {selectedProjects.length > 0 ? 'Øvrige projekter' : 'Alle projekter'}
              </p>
              <div style={s.grid}>
                {unselectedProjects.map(project => {
                  const thumb = getThumbnailUrl(project)
                  return (
                    <div
                      key={project.id}
                      style={s.card}
                      onClick={() => toggle(project.id)}
                    >
                      <div style={s.thumb}>
                        {thumb
                          ? <img src={thumb} alt={project.title} style={s.thumbImg} />
                          : <div style={s.thumbEmpty} />
                        }
                      </div>
                      <div style={s.cardBody}>
                        <p style={s.cardTitle}>{project.title}</p>
                        <p style={s.addLabel}>+ Tilføj</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--theme-elevation-500)',
    margin: '0 0 10px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 12,
  },
  card: {
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: 8,
    overflow: 'hidden',
    background: 'var(--theme-elevation-50)',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  cardSelected: {
    borderColor: 'var(--theme-text)',
    cursor: 'default',
  },
  thumb: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16/9',
    background: 'var(--theme-elevation-100)',
    overflow: 'hidden',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  thumbEmpty: {
    width: '100%',
    height: '100%',
    background: 'var(--theme-elevation-150)',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: 'var(--theme-text)',
    color: 'var(--theme-bg)',
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: '8px 10px',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--theme-text)',
    margin: '0 0 6px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderButtons: {
    display: 'flex',
    gap: 4,
  },
  orderBtn: {
    fontSize: 12,
    background: 'none',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: 3,
    padding: '2px 6px',
    cursor: 'pointer',
    color: 'var(--theme-text)',
    lineHeight: 1.4,
  },
  removeBtn: {
    fontSize: 11,
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: 0,
  },
  addLabel: {
    fontSize: 11,
    color: 'var(--theme-elevation-500)',
    margin: 0,
  },
}