'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useField } from '@payloadcms/ui'

// ── Color math ────────────────────────────────────────────────────────────────

function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1))
  }
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`
}

function hexToHsv(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  const s = max === 0 ? 0 : d / max
  const v = max
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }
  return [h, s, v]
}

function isValidHex(hex: string) {
  return /^#[0-9a-fA-F]{6}$/.test(hex)
}

// ── Component ─────────────────────────────────────────────────────────────────

type Props = {
  path: string
  label?: string
  description?: string
}

export function ColorPickerField({ path, label, description }: Props) {
  const { value, setValue } = useField<string>({ path })

  const initial = isValidHex(value ?? '') ? value! : '#3b82f6'
  const [hsv, setHsv] = useState<[number, number, number]>(() => hexToHsv(initial))
  const [hex, setHex] = useState(initial)
  const [open, setOpen] = useState(false)

  const svRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const draggingSV = useRef(false)
  const draggingHue = useRef(false)

  const [h, s, v] = hsv

  // Sync hex → hsv when value changes externally
  useEffect(() => {
    if (value && isValidHex(value) && value !== hex) {
      setHex(value)
      setHsv(hexToHsv(value))
    }
  }, [value])

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const commitHsv = useCallback((newHsv: [number, number, number]) => {
    setHsv(newHsv)
    const newHex = hsvToHex(...newHsv)
    setHex(newHex)
    setValue(newHex)
  }, [setValue])

  // SV canvas drag
  const handleSVMouseDown = (e: React.MouseEvent) => {
    draggingSV.current = true
    updateSV(e.nativeEvent)
  }

  const updateSV = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!svRef.current) return
    const rect = svRef.current.getBoundingClientRect()
    const newS = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const newV = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height))
    commitHsv([h, newS, newV])
  }, [h, commitHsv])

  // Hue slider drag
  const handleHueMouseDown = (e: React.MouseEvent) => {
    draggingHue.current = true
    updateHue(e.nativeEvent)
  }

  const updateHue = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!hueRef.current) return
    const rect = hueRef.current.getBoundingClientRect()
    const newH = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360))
    commitHsv([newH, s, v])
  }, [s, v, commitHsv])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (draggingSV.current) updateSV(e)
      if (draggingHue.current) updateHue(e)
    }
    function onUp() {
      draggingSV.current = false
      draggingHue.current = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [updateSV, updateHue])

  function handleHexInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setHex(val)
    if (isValidHex(val)) {
      setHsv(hexToHsv(val))
      setValue(val)
    }
  }

  const hueColor = hsvToHex(h, 1, 1)

  return (
    <div style={{ marginBottom: 24 }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 8,
          color: 'var(--theme-text)',
        }}>
          {label}
        </label>
      )}

      <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>

        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '7px 12px',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 4,
            background: 'var(--theme-elevation-50)',
            cursor: 'pointer',
            color: 'var(--theme-text)',
            fontSize: 13,
          }}
        >
          <span style={{
            display: 'inline-block',
            width: 20,
            height: 20,
            borderRadius: 3,
            background: hex,
            border: '1px solid var(--theme-elevation-200)',
            flexShrink: 0,
          }} />
          <span style={{ fontFamily: 'monospace', letterSpacing: '0.03em' }}>{hex}</span>
        </button>

        {/* Popover */}
        {open && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 100,
            background: 'var(--theme-elevation-100)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 8,
            padding: 16,
            width: 240,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            userSelect: 'none',
          }}>

            {/* Saturation / Value canvas */}
            <div
              ref={svRef}
              onMouseDown={handleSVMouseDown}
              style={{
                position: 'relative',
                width: '100%',
                height: 160,
                borderRadius: 6,
                overflow: 'hidden',
                cursor: 'crosshair',
                marginBottom: 12,
                background: hueColor,
              }}
            >
              {/* White gradient left→right */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to right, #fff 0%, transparent 100%)',
              }} />
              {/* Black gradient top→bottom */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent 0%, #000 100%)',
              }} />
              {/* Cursor */}
              <div style={{
                position: 'absolute',
                left: `${s * 100}%`,
                top: `${(1 - v) * 100}%`,
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '2px solid #fff',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }} />
            </div>

            {/* Hue slider */}
            <div
              ref={hueRef}
              onMouseDown={handleHueMouseDown}
              style={{
                position: 'relative',
                width: '100%',
                height: 14,
                borderRadius: 7,
                cursor: 'pointer',
                marginBottom: 12,
                background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
              }}
            >
              {/* Hue thumb */}
              <div style={{
                position: 'absolute',
                left: `${(h / 360) * 100}%`,
                top: '50%',
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: '2px solid #fff',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
                transform: 'translate(-50%, -50%)',
                background: hueColor,
                pointerEvents: 'none',
              }} />
            </div>

            {/* Hex input + preview */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                background: hex,
                border: '1px solid var(--theme-elevation-200)',
                flexShrink: 0,
              }} />
              <input
                type="text"
                value={hex}
                onChange={handleHexInput}
                maxLength={7}
                spellCheck={false}
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontFamily: 'monospace',
                  padding: '6px 8px',
                  border: '1px solid var(--theme-elevation-150)',
                  borderRadius: 4,
                  background: 'var(--theme-elevation-50)',
                  color: 'var(--theme-text)',
                  outline: 'none',
                }}
              />
            </div>

          </div>
        )}
      </div>

      {description && (
        <p style={{
          fontSize: 12,
          color: 'var(--theme-elevation-500)',
          marginTop: 6,
          marginBottom: 0,
        }}>
          {description}
        </p>
      )}
    </div>
  )
}