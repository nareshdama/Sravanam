import { afterEach, describe, expect, it } from 'vitest'
import { normalizeScreenTarget } from './app'
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
