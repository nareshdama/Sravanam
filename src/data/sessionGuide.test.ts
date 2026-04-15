import { describe, expect, it } from 'vitest'
import {
  buildSessionGuide,
  inferBrainwaveBand,
  renderSessionGuideHtml,
} from './sessionGuide'
import { getTemplateById } from './binauralTemplates'

describe('sessionGuide', () => {
  it('infers bands from beat Hz', () => {
    expect(inferBrainwaveBand(1)).toBe('delta')
    expect(inferBrainwaveBand(6)).toBe('theta')
    expect(inferBrainwaveBand(10)).toBe('alpha')
    expect(inferBrainwaveBand(40)).toBe('gamma')
  })

  it('builds guide for template + sound', () => {
    const t = getTemplateById('theta-7.83')!
    const g = buildSessionGuide(t, 'om', 7.83, 200)
    expect(g.headline).toContain('Oṃ')
    expect(g.vedicParagraphs.length).toBeGreaterThan(0)
    expect(g.benefits.length).toBe(3)
    expect(g.practice).toMatch(/headphones/i)
  })

  it('builds guide for custom + off', () => {
    const g = buildSessionGuide(null, 'off', 12, 200)
    expect(g.headline).toMatch(/Custom/)
    expect(renderSessionGuideHtml(g)).toContain('session-guide__columns')
  })
})
