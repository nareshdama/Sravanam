import { describe, expect, it } from 'vitest'
import { normalizeLonDeg, PlanetLongitudeSmoother, shortestLonDeltaDeg } from './planetMotion'

describe('planetMotion', () => {
  it('normalizeLonDeg wraps into [0,360)', () => {
    expect(normalizeLonDeg(-10)).toBe(350)
    expect(normalizeLonDeg(370)).toBe(10)
  })

  it('shortestLonDeltaDeg crosses 0° correctly', () => {
    expect(shortestLonDeltaDeg(350, 10)).toBe(20)
    expect(shortestLonDeltaDeg(10, 350)).toBe(-20)
  })

  it('PlanetLongitudeSmoother moves toward target', () => {
    const s = new PlanetLongitudeSmoother()
    s.reset([0])
    const next = s.update([5], 1 / 60)
    expect(next[0]).toBeGreaterThan(0)
    expect(next[0]).toBeLessThan(5)
  })
})
