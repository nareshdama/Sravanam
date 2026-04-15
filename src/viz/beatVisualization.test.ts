import { describe, expect, it } from 'vitest'
import {
  VISUAL_BEAT_CAP_HZ,
  computeBeatPhase,
  dampScalar,
  effectiveVisualBeatHz,
  smoothstep01,
} from './beatVisualization'

describe('beatVisualization math', () => {
  it('effectiveVisualBeatHz caps high beats', () => {
    expect(effectiveVisualBeatHz(40)).toBe(VISUAL_BEAT_CAP_HZ)
    expect(effectiveVisualBeatHz(8)).toBe(8)
    expect(effectiveVisualBeatHz(0)).toBe(0.25)
  })

  it('computeBeatPhase is 2π f t with capped f', () => {
    const elapsed = 1
    const beat = 10
    const f = effectiveVisualBeatHz(beat)
    expect(computeBeatPhase(elapsed, beat)).toBeCloseTo(2 * Math.PI * f * elapsed, 8)
  })

  it('zero beat uses slow default frequency for phase', () => {
    const p = computeBeatPhase(2, 0)
    expect(p).toBeCloseTo(2 * Math.PI * 0.25 * 2, 8)
  })

  it('smoothstep01 is 0, 0.5, 1 at edges and midpoint', () => {
    expect(smoothstep01(0)).toBe(0)
    expect(smoothstep01(1)).toBe(1)
    expect(smoothstep01(0.5)).toBe(0.5)
  })

  it('dampScalar moves toward target over dt', () => {
    const a = dampScalar(0, 1, 10, 1 / 60)
    expect(a).toBeGreaterThan(0)
    expect(a).toBeLessThan(1)
    expect(dampScalar(1, 1, 10, 1 / 60)).toBe(1)
  })
})
