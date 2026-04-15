import { describe, it, expect } from 'vitest'
import { getIntentionIllustrationSvg } from './intentionIllustrations'

describe('intentionIllustrations', () => {
  it('returns SVG markup for known illustration ids', () => {
    for (const id of ['moon-lotus', 'leaf-spiral', 'flame-single', 'eye-closed']) {
      const s = getIntentionIllustrationSvg(id)
      expect(s).toContain('<svg')
      expect(s).toContain('xmlns=')
    }
  })

  it('falls back for unknown id', () => {
    const s = getIntentionIllustrationSvg('unknown-id')
    expect(s).toContain('<svg')
    expect(s).toContain('circle')
  })
})
