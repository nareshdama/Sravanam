/**
 * localStorage persistence for user preferences.
 * Graceful degradation — returns defaults if storage is unavailable.
 */

import type { SoundLibraryMode } from '../data/vedicSoundLibrary'

const STORAGE_KEY = 'sravanam_prefs'

export interface PersistedPrefs {
  intentionId: string | null
  templateId: string | null
  bedId: SoundLibraryMode
  carrierHz: number
  beatHz: number
  wave: OscillatorType
  volume: number
}

const DEFAULTS: PersistedPrefs = {
  intentionId: null,
  templateId: null,
  bedId: 'off',
  carrierHz: 200,
  beatHz: 10,
  wave: 'sine',
  volume: 0.2,
}

export function loadPrefs(): PersistedPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return {
      intentionId:
        typeof parsed.intentionId === 'string' ? parsed.intentionId : DEFAULTS.intentionId,
      templateId:
        typeof parsed.templateId === 'string' ? parsed.templateId : DEFAULTS.templateId,
      bedId:
        typeof parsed.bedId === 'string' &&
        ['off', 'om', 'cosmic', 'nada'].includes(parsed.bedId)
          ? (parsed.bedId as SoundLibraryMode)
          : DEFAULTS.bedId,
      carrierHz:
        typeof parsed.carrierHz === 'number' && parsed.carrierHz > 0
          ? parsed.carrierHz
          : DEFAULTS.carrierHz,
      beatHz:
        typeof parsed.beatHz === 'number' && parsed.beatHz >= 0
          ? parsed.beatHz
          : DEFAULTS.beatHz,
      wave:
        typeof parsed.wave === 'string' &&
        ['sine', 'triangle', 'sawtooth', 'square'].includes(parsed.wave)
          ? (parsed.wave as OscillatorType)
          : DEFAULTS.wave,
      volume:
        typeof parsed.volume === 'number' && parsed.volume >= 0.05 && parsed.volume <= 1
          ? parsed.volume
          : DEFAULTS.volume,
    }
  } catch {
    return { ...DEFAULTS }
  }
}

export function savePrefs(prefs: Partial<PersistedPrefs>): void {
  try {
    const current = loadPrefs()
    const merged = { ...current, ...prefs }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch {
    /* storage unavailable — silently ignore */
  }
}

export function clearPrefs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage unavailable */
  }
}
