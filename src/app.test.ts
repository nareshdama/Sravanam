import { afterEach, describe, expect, it } from 'vitest'
import { applyIntention, applyTemplate, normalizeScreenTarget } from './app'
import { getAllTemplates } from './data/binauralTemplates'
import { INITIAL_SESSION, sessionStore } from './state/sessionState'

function resetSession(): void {
  sessionStore.set({ ...INITIAL_SESSION })
}

describe('normalizeScreenTarget', () => {
  afterEach(() => {
    resetSession()
  })

  it('keeps playback on the immersive screen while the session is playing', () => {
    sessionStore.set({ playing: true })

    expect(normalizeScreenTarget('landing')).toBe('immersive')
    expect(normalizeScreenTarget('session')).toBe('immersive')
    expect(normalizeScreenTarget('immersive')).toBe('immersive')
  })

  it('blocks immersive navigation when nothing is playing', () => {
    sessionStore.set({ playing: false })

    expect(normalizeScreenTarget('immersive')).toBe('session')
  })
})

describe('applyIntention', () => {
  afterEach(() => {
    resetSession()
  })

  it('applies deep-sleep with carrier ~136.1 Hz, beat 3 Hz, bed om', () => {
    applyIntention('deep-sleep')
    const s = sessionStore.get()
    expect(s.carrierHz).toBeCloseTo(136.1, 4)
    expect(s.beatHz).toBeCloseTo(3, 8)
    expect(s.bedId).toBe('om')
    expect(s.intentionId).toBe('deep-sleep')
    expect(s.playing).toBe(false)
  })

  it('all 9 valid intentions produce finite clamped carrier and beat', () => {
    const ids = [
      'deep-sleep', 'relax', 'focus', 'ultra-focus',
      'knowledge', 'healing', 'wealth', 'love', 'spiritual',
    ]
    for (const id of ids) {
      applyIntention(id)
      const s = sessionStore.get()
      expect(isFinite(s.carrierHz), `${id} carrierHz finite`).toBe(true)
      expect(isFinite(s.beatHz), `${id} beatHz finite`).toBe(true)
      expect(s.carrierHz, `${id} carrier > 0`).toBeGreaterThan(0)
      expect(s.beatHz, `${id} beat >= 0`).toBeGreaterThanOrEqual(0)
    }
  })

  it('unknown intention ID leaves session state unchanged', () => {
    const before = sessionStore.get()
    applyIntention('not-a-real-intention')
    const after = sessionStore.get()
    expect(after.carrierHz).toBe(before.carrierHz)
    expect(after.beatHz).toBe(before.beatHz)
    expect(after.intentionId).toBe(before.intentionId)
  })
})

describe('applyTemplate', () => {
  afterEach(() => {
    resetSession()
  })

  it('applies gamma-40 with beat 40 Hz and carrier 200 Hz', () => {
    applyTemplate('gamma-40')
    const s = sessionStore.get()
    expect(s.beatHz).toBeCloseTo(40, 8)
    expect(s.carrierHz).toBeCloseTo(200, 8)
    expect(s.templateId).toBe('gamma-40')
  })

  it('applies vedic-deep-sleep-aum-136.1 with correct carrier and beat', () => {
    applyTemplate('vedic-deep-sleep-aum-136.1')
    const s = sessionStore.get()
    expect(s.carrierHz).toBeCloseTo(136.1, 4)
    expect(s.beatHz).toBeCloseTo(3, 8)
    expect(s.templateId).toBe('vedic-deep-sleep-aum-136.1')
  })

  it('unknown template ID leaves session state unchanged', () => {
    const before = sessionStore.get()
    applyTemplate('not-a-real-template')
    const after = sessionStore.get()
    expect(after.carrierHz).toBe(before.carrierHz)
    expect(after.beatHz).toBe(before.beatHz)
    expect(after.templateId).toBe(before.templateId)
  })

  it('result carrier + beat never exceeds Nyquist limit at 48 kHz', () => {
    const limit = (48_000 / 2) * 0.49
    for (const t of getAllTemplates()) {
      applyTemplate(t.id)
      const s = sessionStore.get()
      expect(s.carrierHz + s.beatHz, `${t.id} right channel`).toBeLessThanOrEqual(limit + 1e-9)
    }
  })
})
