import { describe, it, expect } from 'vitest'
import { INTENTIONS, getIntentionById, getIntentionTemplateIds } from './intentions'
import { getTemplateById } from './binauralTemplates'

describe('intentions', () => {
  it('has 4 intentions', () => {
    expect(INTENTIONS).toHaveLength(4)
  })

  it('every intention has a valid default template', () => {
    for (const intention of INTENTIONS) {
      const t = getTemplateById(intention.defaultTemplateId)
      expect(t, `${intention.id} → ${intention.defaultTemplateId}`).toBeDefined()
    }
  })

  it('every alternate template ID is valid', () => {
    for (const intention of INTENTIONS) {
      for (const altId of intention.alternateTemplateIds) {
        const t = getTemplateById(altId)
        expect(t, `${intention.id} → alternate ${altId}`).toBeDefined()
      }
    }
  })

  it('getIntentionById returns correct intention', () => {
    const deep = getIntentionById('deep')
    expect(deep).toBeDefined()
    expect(deep!.title).toBe('Deep')
    expect(deep!.defaultTemplateId).toBe('theta-5-7-yoga')
  })

  it('getIntentionById returns undefined for unknown', () => {
    expect(getIntentionById('nonexistent')).toBeUndefined()
  })

  it('getIntentionTemplateIds includes default + alternates', () => {
    const focus = getIntentionById('focus')!
    const ids = getIntentionTemplateIds(focus)
    expect(ids[0]).toBe('beta-20')
    expect(ids).toContain('alpha-beta-12-15')
    expect(ids).toContain('beta-28-30')
    const deep = getIntentionById('deep')!
    expect(getIntentionTemplateIds(deep)).toContain('theta-5-6')
  })

  it('each intention has a unique ID', () => {
    const ids = INTENTIONS.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every intention has icon and illustration', () => {
    for (const intention of INTENTIONS) {
      expect(intention.icon.length, intention.id).toBeGreaterThan(0)
      expect(intention.illustration.length, intention.id).toBeGreaterThan(0)
    }
  })
})
