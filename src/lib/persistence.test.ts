import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearPrefs, loadPrefs, savePrefs } from './persistence'

/** In-memory Storage for Node test runs (no browser localStorage). */
function createMemoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear(): void {
      map.clear()
    },
    getItem(key: string): string | null {
      return map.get(key) ?? null
    },
    key(index: number): string | null {
      return [...map.keys()][index] ?? null
    },
    removeItem(key: string): void {
      map.delete(key)
    },
    setItem(key: string, value: string): void {
      map.set(key, value)
    },
  }
}

describe('persistence', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage())
  })

  afterEach(() => {
    clearPrefs()
    vi.unstubAllGlobals()
  })

  it('returns defaults when storage is empty', () => {
    expect(loadPrefs()).toEqual({
      intentionId: null,
      templateId: null,
      bedId: 'off',
      carrierHz: 200,
      beatHz: 10,
      wave: 'sine',
      volume: 0.2,
      durationMinutes: 20,
    })
  })

  it('round-trips save and load', () => {
    savePrefs({
      intentionId: 'rest',
      templateId: 'delta-0.5-2',
      bedId: 'nada',
      carrierHz: 180,
      beatHz: 1.25,
      wave: 'triangle',
      volume: 0.35,
    })
    expect(loadPrefs()).toEqual({
      intentionId: 'rest',
      templateId: 'delta-0.5-2',
      bedId: 'nada',
      carrierHz: 180,
      beatHz: 1.25,
      wave: 'triangle',
      volume: 0.35,
      durationMinutes: 20,
    })
  })

  it('preserves a muted volume across save and reload', () => {
    savePrefs({
      volume: 0,
      carrierHz: 180,
      beatHz: 6,
    })

    expect(loadPrefs().volume).toBe(0)
  })

  it('merges partial saves with previous values', () => {
    savePrefs({ carrierHz: 220, volume: 0.5 })
    savePrefs({ beatHz: 7.83 })
    expect(loadPrefs().carrierHz).toBe(220)
    expect(loadPrefs().volume).toBe(0.5)
    expect(loadPrefs().beatHz).toBe(7.83)
  })

  it('ignores invalid JSON and returns defaults', () => {
    localStorage.setItem('sravanam_prefs', '{not json')
    expect(loadPrefs().bedId).toBe('off')
    expect(localStorage.getItem('sravanam_prefs')).toBeNull()
  })

  it('discards non-object stored values and returns defaults', () => {
    localStorage.setItem('sravanam_prefs', JSON.stringify('not-an-object'))
    expect(loadPrefs().bedId).toBe('off')
    expect(localStorage.getItem('sravanam_prefs')).toBeNull()
  })

  it('sanitizes unknown bedId and wave values', () => {
    localStorage.setItem(
      'sravanam_prefs',
      JSON.stringify({
        bedId: 'invalid',
        wave: 'custom',
        carrierHz: -5,
        beatHz: -1,
        volume: 2,
      }),
    )
    const p = loadPrefs()
    expect(p.bedId).toBe('off')
    expect(p.wave).toBe('sine')
    expect(p.carrierHz).toBe(200)
    expect(p.beatHz).toBe(10)
    expect(p.volume).toBe(0.2)
  })

  it('migrates legacy prefs forward and rewrites the stored schema version', () => {
    localStorage.setItem(
      'sravanam_prefs',
      JSON.stringify({
        intentionId: 'rest',
        templateId: 'delta-0.5-2',
        bedId: 'om',
        carrierHz: 180,
        beatHz: 1.25,
        wave: 'triangle',
        volume: 0,
      }),
    )

    expect(loadPrefs()).toEqual({
      intentionId: 'rest',
      templateId: 'delta-0.5-2',
      bedId: 'om',
      carrierHz: 180,
      beatHz: 1.25,
      wave: 'triangle',
      volume: 0.05,
      durationMinutes: 20,
    })

    const stored = JSON.parse(localStorage.getItem('sravanam_prefs')!)
    expect(stored.version).toBe(2)
    expect(stored.volume).toBe(0.05)
  })

  it('falls back to in-memory prefs when storage writes fail', () => {
    const storage = createMemoryStorage()
    vi.stubGlobal('localStorage', {
      ...storage,
      setItem() {
        throw new DOMException('Quota exceeded', 'QuotaExceededError')
      },
    } satisfies Storage)

    savePrefs({
      intentionId: 'focus',
      templateId: 'gamma-40',
      bedId: 'cosmic',
      carrierHz: 222,
      beatHz: 40,
      volume: 0.4,
    })

    expect(loadPrefs()).toEqual({
      intentionId: 'focus',
      templateId: 'gamma-40',
      bedId: 'cosmic',
      carrierHz: 222,
      beatHz: 40,
      wave: 'sine',
      volume: 0.4,
      durationMinutes: 20,
    })
  })

  it('clearPrefs removes stored data', () => {
    savePrefs({ intentionId: 'calm' })
    expect(loadPrefs().intentionId).toBe('calm')
    clearPrefs()
    expect(loadPrefs().intentionId).toBeNull()
  })
})
