import { describe, it, expect } from 'vitest'
import { VEDIC_FREQUENCIES, getVedicFrequencyById } from './vedicFrequencies'

describe('vedicFrequencies', () => {
  it('has exactly 40 Vedic frequency entries', () => {
    expect(VEDIC_FREQUENCIES).toHaveLength(40)
  })

  it('all entries have unique IDs', () => {
    const ids = VEDIC_FREQUENCIES.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all entries start with vedic- prefix', () => {
    for (const f of VEDIC_FREQUENCIES) {
      expect(f.id).toMatch(/^vedic-/)
    }
  })

  it('all entries have default beat Hz within their band', () => {
    for (const f of VEDIC_FREQUENCIES) {
      expect(f.defaultBeatHz).toBeGreaterThanOrEqual(f.beatHzMin - 1e-9)
      expect(f.defaultBeatHz).toBeLessThanOrEqual(f.beatHzMax + 1e-9)
    }
  })

  it('all entries have non-empty useCase and effect', () => {
    for (const f of VEDIC_FREQUENCIES) {
      expect(f.useCase.length).toBeGreaterThan(0)
      expect(f.effect.length).toBeGreaterThan(0)
    }
  })

  it('all entries have non-empty hzLabel', () => {
    for (const f of VEDIC_FREQUENCIES) {
      expect(f.hzLabel.length).toBeGreaterThan(0)
    }
  })

  it('all entries have recommendedCarrierHz > 0', () => {
    for (const f of VEDIC_FREQUENCIES) {
      expect(f.recommendedCarrierHz).toBeGreaterThan(0)
    }
  })

  it('all entries with Vedic sources have complete source metadata', () => {
    for (const f of VEDIC_FREQUENCIES) {
      if (f.vedicSources) {
        expect(f.vedicSources.length).toBeGreaterThan(0)
        for (const src of f.vedicSources) {
          expect(src.text.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('all entries with mantras have non-empty mantra strings', () => {
    for (const f of VEDIC_FREQUENCIES) {
      if (f.mantras) {
        expect(f.mantras.length).toBeGreaterThan(0)
        for (const mantra of f.mantras) {
          expect(mantra.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('all entries with postures have non-empty posture strings', () => {
    for (const f of VEDIC_FREQUENCIES) {
      if (f.postures) {
        expect(f.postures.length).toBeGreaterThan(0)
        for (const posture of f.postures) {
          expect(posture.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('all entries with breathing patterns have valid timing', () => {
    for (const f of VEDIC_FREQUENCIES) {
      if (f.breathingPattern) {
        const bp = f.breathingPattern
        expect(bp.name.length).toBeGreaterThan(0)
        expect(bp.inhaleSec).toBeGreaterThan(0)
        expect(bp.holdSec).toBeGreaterThanOrEqual(0)
        expect(bp.exhaleSec).toBeGreaterThan(0)
      }
    }
  })

  it('all entries are JSON serializable', () => {
    for (const f of VEDIC_FREQUENCIES) {
      expect(() => JSON.stringify(f)).not.toThrow()
    }
  })

  it('getVedicFrequencyById returns correct entries', () => {
    const firstId = VEDIC_FREQUENCIES[0].id
    const entry = getVedicFrequencyById(firstId)
    expect(entry).toBeDefined()
    expect(entry?.id).toBe(firstId)
  })

  it('getVedicFrequencyById returns undefined for unknown IDs', () => {
    expect(getVedicFrequencyById('nonexistent-frequency')).toBeUndefined()
  })

  it('most entries have Vedic sources for reference', () => {
    const withSources = VEDIC_FREQUENCIES.filter((f) => f.vedicSources?.length)
    expect(withSources.length).toBeGreaterThan(15) // Most should have sources
  })

  it('entries have Vedic practice guidance', () => {
    const withGuidance = VEDIC_FREQUENCIES.filter(
      (f) => f.practiceNotes || f.breathingPattern || f.mantras
    )
    expect(withGuidance.length).toBeGreaterThan(15)
  })

  it('all entries have practice notes for guidance', () => {
    const withNotes = VEDIC_FREQUENCIES.filter((f) => f.practiceNotes)
    expect(withNotes.length).toBeGreaterThan(10)
  })

  it('includes guide-calibrated exact carrier + beat presets', () => {
    const exactGuidePresets = [
      ['vedic-deep-sleep-aum-136.1', 136.1, 3],
      ['vedic-theta-relax-sa-432', 432, 5],
      ['vedic-sleep-onset-aum-136.1', 136.1, 6],
      ['vedic-smr-focus-sa-432', 432, 12.5],
      ['vedic-beta-attention-sa-432', 432, 20],
    ] as const

    for (const [id, carrierHz, beatHz] of exactGuidePresets) {
      const preset = getVedicFrequencyById(id)
      expect(preset, id).toBeDefined()
      expect(preset?.recommendedCarrierHz, id).toBeCloseTo(carrierHz, 8)
      expect(preset?.defaultBeatHz, id).toBeCloseTo(beatHz, 8)
    }
  })
})
