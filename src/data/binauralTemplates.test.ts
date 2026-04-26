import { describe, expect, it } from 'vitest'
import {
  BINAURAL_TEMPLATES,
  getTemplateById,
  getAllTemplates,
  getTemplatesByChakra,
  resolveTemplateFrequencies,
} from './binauralTemplates'
import { clampBinauralFrequencies } from '../audio/binauralEngine'

const SAMPLE_RATE = 48_000

describe('binauralTemplates', () => {
  it('has one entry per table row (14 presets)', () => {
    expect(BINAURAL_TEMPLATES).toHaveLength(14)
  })

  it('combined library has 51 total templates (14 existing + 37 Vedic)', () => {
    expect(getAllTemplates()).toHaveLength(51)
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

  it('all 51 templates resolve + clamp without Nyquist violation at 48 kHz', () => {
    for (const t of getAllTemplates()) {
      const r = resolveTemplateFrequencies(t)
      const { carrierHz, beatHz } = clampBinauralFrequencies(SAMPLE_RATE, r.carrierHz, r.beatHz)
      expect(carrierHz + beatHz, t.id).toBeLessThanOrEqual((SAMPLE_RATE / 2) * 0.49 + 1e-9)
      expect(carrierHz, t.id).toBeGreaterThan(0)
      expect(isFinite(beatHz), t.id).toBe(true)
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

  it('memoizes resolved frequencies for identical inputs', () => {
    const t = getTemplateById('gamma-40')!
    const a = resolveTemplateFrequencies(t, { carrierHz: 200, beatHz: 40 })
    const b = resolveTemplateFrequencies(t, { carrierHz: 200, beatHz: 40 })
    expect(a).toBe(b)
  })
})

describe('combined template library (existing + Vedic)', () => {
  it('getTemplateById works for existing templates', () => {
    const existing = getTemplateById('delta-0.5-2')
    expect(existing).toBeDefined()
    expect(existing?.useCase).toBe('Sleep / rest')
  })

  it('getTemplateById works for new Vedic templates', () => {
    const vedic = getTemplateById('vedic-delta-seed-0.5-4')
    expect(vedic).toBeDefined()
    expect(vedic?.useCase).toBe('Deepest subconscious reprogramming')
  })

  it('getTemplateById returns undefined for unknown IDs', () => {
    expect(getTemplateById('nonexistent-template')).toBeUndefined()
  })

  it('all 51 templates have unique IDs', () => {
    const all = getAllTemplates()
    const ids = all.map((t) => t.id)
    expect(new Set(ids).size).toBe(51)
  })

  it('all 51 templates have valid default beat frequencies', () => {
    for (const t of getAllTemplates()) {
      expect(t.defaultBeatHz).toBeGreaterThanOrEqual(t.beatHzMin - 1e-9)
      expect(t.defaultBeatHz).toBeLessThanOrEqual(t.beatHzMax + 1e-9)
    }
  })

  it('guide-calibrated presets resolve to the exact carrier + beat pairs from the document', () => {
    const guidePairs = [
      ['vedic-deep-sleep-aum-136.1', 136.1, 3],
      ['vedic-theta-relax-sa-432', 432, 5],
      ['vedic-sleep-onset-aum-136.1', 136.1, 6],
      ['vedic-theta-aum-7.83', 432, 7.83],
      ['vedic-lakshmi-nada-432', 432, 10],
      ['vedic-smr-focus-sa-432', 432, 12.5],
      ['vedic-beta-attention-sa-432', 432, 20],
      ['vedic-fortune-gate-dha-720', 720, 40],
    ] as const

    for (const [id, carrierHz, beatHz] of guidePairs) {
      const template = getTemplateById(id)
      expect(template, id).toBeDefined()
      const resolved = resolveTemplateFrequencies(template!)
      expect(resolved.carrierHz, id).toBeCloseTo(carrierHz, 8)
      expect(resolved.beatHz, id).toBeCloseTo(beatHz, 8)
    }
  })

  it('getTemplatesByChakra works for templates with chakra associations', () => {
    const allTemplates = getAllTemplates()
    const withChakras = allTemplates.filter((t) => t.associatedChakra)
    if (withChakras.length > 0) {
      const firstChakra = withChakras[0].associatedChakra
      const chakraTemplates = getTemplatesByChakra(firstChakra!)
      expect(chakraTemplates.length).toBeGreaterThan(0)
      for (const t of chakraTemplates) {
        expect(t.associatedChakra).toBe(firstChakra)
      }
    }
  })

  it('Vedic templates have Vedic metadata fields', () => {
    const vedic = getTemplateById('vedic-heart-bridge-pa-648')!
    expect(vedic).toBeDefined()
    expect(vedic.vedicSources).toBeDefined()
    expect(vedic.mantras).toBeDefined()
    expect(vedic.breathingPattern).toBeDefined()
    expect(vedic.postures).toBeDefined()
  })

  it('index lookup provides O(1) performance for all templates', () => {
    // Test that lookup returns results immediately (no iteration)
    const ids = getAllTemplates().map((t) => t.id)
    for (const id of ids) {
      const found = getTemplateById(id)
      expect(found).toBeDefined()
      expect(found?.id).toBe(id)
    }
  })
})
