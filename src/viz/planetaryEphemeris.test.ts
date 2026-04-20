import { describe, expect, it } from 'vitest'
import {
  getCurrentPlanetSnapshots,
  getPlanetSnapshots,
  longitudeToCanvasAngle,
  tropicalZodiacFromLongitude,
} from './planetaryEphemeris'

describe('planetaryEphemeris', () => {
  it('tropicalZodiacFromLongitude maps degrees to signs', () => {
    expect(tropicalZodiacFromLongitude(0).sign).toBe('Aries')
    expect(tropicalZodiacFromLongitude(29.9).sign).toBe('Aries')
    expect(tropicalZodiacFromLongitude(30).sign).toBe('Taurus')
    expect(tropicalZodiacFromLongitude(359).sign).toBe('Pisces')
  })

  it('longitudeToCanvasAngle puts 0 degrees near top of circle', () => {
    expect(longitudeToCanvasAngle(0)).toBeCloseTo(Math.PI / 2, 5)
  })

  it('reuses the current snapshot inside the throttle window', () => {
    const a = getCurrentPlanetSnapshots(new Date('2026-04-19T12:00:00.000Z'))
    const b = getCurrentPlanetSnapshots(new Date('2026-04-19T12:00:01.000Z'))
    const c = getCurrentPlanetSnapshots(new Date('2026-04-19T12:00:03.500Z'))

    expect(a).toBe(b)
    expect(c).toBe(getPlanetSnapshots(new Date('2026-04-19T12:00:03.500Z')))
  })
})
