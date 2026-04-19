import { describe, it, expect } from 'vitest'
import { INTENTIONS, getIntentionById, getIntentionTemplateIds } from './intentions'
import { getTemplateById } from './binauralTemplates'

describe('intentions', () => {
  it('has 9 Nāda Brahma Life Mode intentions', () => {
    expect(INTENTIONS).toHaveLength(9)
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
    const sleep = getIntentionById('deep-sleep')
    expect(sleep).toBeDefined()
    expect(sleep!.title).toBe('Deep Sleep')
    expect(sleep!.defaultTemplateId).toBe('vedic-delta-seed-0.98')
  })

  it('getIntentionById returns undefined for unknown', () => {
    expect(getIntentionById('nonexistent')).toBeUndefined()
    expect(getIntentionById('rest')).toBeUndefined()
    expect(getIntentionById('deep')).toBeUndefined()
  })

  it('getIntentionTemplateIds includes default + alternates', () => {
    const focus = getIntentionById('focus')!
    const ids = getIntentionTemplateIds(focus)
    expect(ids[0]).toBe('vedic-alpha-clarity-10')
    expect(ids).toContain('vedic-alpha-phi-12.67')
    expect(ids).toContain('vedic-beta-execution-23.49')

    const spiritual = getIntentionById('spiritual')!
    expect(getIntentionTemplateIds(spiritual)).toContain('vedic-parabrahman-999')
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

  it('all 9 mode IDs are present', () => {
    const ids = INTENTIONS.map((i) => i.id)
    expect(ids).toContain('deep-sleep')
    expect(ids).toContain('relax')
    expect(ids).toContain('focus')
    expect(ids).toContain('ultra-focus')
    expect(ids).toContain('knowledge')
    expect(ids).toContain('healing')
    expect(ids).toContain('wealth')
    expect(ids).toContain('love')
    expect(ids).toContain('spiritual')
  })
})
