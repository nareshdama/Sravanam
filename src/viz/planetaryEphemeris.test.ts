import { describe, expect, it } from 'vitest'
import { longitudeToCanvasAngle, tropicalZodiacFromLongitude } from './planetaryEphemeris'

describe('planetaryEphemeris', () => {
  it('tropicalZodiacFromLongitude maps degrees to signs', () => {
    expect(tropicalZodiacFromLongitude(0).sign).toBe('Aries')
    expect(tropicalZodiacFromLongitude(29.9).sign).toBe('Aries')
    expect(tropicalZodiacFromLongitude(30).sign).toBe('Taurus')
    expect(tropicalZodiacFromLongitude(359).sign).toBe('Pisces')
  })

  it('longitudeToCanvasAngle puts 0° near top of circle', () => {
    expect(longitudeToCanvasAngle(0)).toBeCloseTo(Math.PI / 2, 5)
  })
})
