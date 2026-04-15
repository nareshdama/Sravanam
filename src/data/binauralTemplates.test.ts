import { describe, expect, it } from 'vitest'
import {
  BINAURAL_TEMPLATES,
  getTemplateById,
  resolveTemplateFrequencies,
} from './binauralTemplates'
import { clampBinauralFrequencies } from '../audio/binauralEngine'

const SAMPLE_RATE = 48_000

describe('binauralTemplates', () => {
  it('has one entry per table row (14 presets)', () => {
    expect(BINAURAL_TEMPLATES).toHaveLength(14)
  })

  it('each template default beat lies within its band', () => {
    for (const t of BINAURAL_TEMPLATES) {
      expect(t.defaultBeatHz).toBeGreaterThanOrEqual(t.beatHzMin - 1e-9)
      expect(t.defaultBeatHz).toBeLessThanOrEqual(t.beatHzMax + 1e-9)
    }
  })

  it('resolve + clamp keeps audible presets unchanged at 48 kHz', () => {
    for (const t of BINAURAL_TEMPLATES) {
      const r = resolveTemplateFrequencies(t)
      const c = clampBinauralFrequencies(SAMPLE_RATE, r.carrierHz, r.beatHz)
      expect(c.carrierHz).toBeCloseTo(r.carrierHz, 5)
      expect(c.beatHz).toBeCloseTo(r.beatHz, 5)
    }
  })

  it('7.83 Hz preset resolves to 7.83 Hz beat', () => {
    const t = getTemplateById('theta-7.83')!
    const r = resolveTemplateFrequencies(t)
    expect(r.beatHz).toBe(7.83)
  })

  it('range preset respects beat override inside the band', () => {
    const t = getTemplateById('delta-0.5-2')!
    const r = resolveTemplateFrequencies(t, { beatHz: 1.9 })
    expect(r.beatHz).toBe(1.9)
    const clamped = clampBinauralFrequencies(SAMPLE_RATE, r.carrierHz, r.beatHz)
    expect(clamped.beatHz).toBe(1.9)
  })

  it('clamps beat override to template band', () => {
    const t = getTemplateById('delta-0.5-2')!
    const r = resolveTemplateFrequencies(t, { beatHz: 99 })
    expect(r.beatHz).toBe(2)
  })
})
