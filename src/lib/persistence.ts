/**
 * localStorage persistence for user preferences.
 *
 * Hardening:
 *   - Schema version (PREFS_VERSION) — if we ever ship a breaking change
 *     to this shape we can migrate old blobs instead of crashing on them.
 *   - Defensive load: every field is validated individually; one bad value
 *     doesn't nuke the whole record.
 *   - Quota-safe save: if localStorage is full (iOS private-mode quota,
 *     extension-polluted storage) we report and fall back to an in-memory
 *     copy so the current session still works.
 *   - Safe JSON.parse wrapped in try/catch; corrupt blobs are discarded
 *     (not thrown) and the corrupt value is logged.
 */

import type { SoundLibraryMode } from '../data/vedicSoundLibrary'
import { reportError } from './errorReport'

const STORAGE_KEY = 'sravanam_prefs'
const PREFS_VERSION = 2

export interface PersistedPrefs {
  intentionId: string | null
  templateId: string | null
  bedId: SoundLibraryMode
  carrierHz: number
  beatHz: number
  wave: OscillatorType
  volume: number
  durationMinutes: number | null
}

interface StoredPrefs extends PersistedPrefs {
  version: number
}

type RawPrefs = Record<string, unknown>

const DEFAULTS: PersistedPrefs = {
  intentionId: null,
  templateId: null,
  bedId: 'off',
  carrierHz: 200,
  beatHz: 10,
  wave: 'sine',
  volume: 0.2,
  durationMinutes: 20,
}

/** In-memory fallback when localStorage is unavailable or full. */
let memoryFallback: PersistedPrefs | null = null

function discardStoredPrefs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    reportError('persistence:discard', e, { severity: 'warn' })
  }
}

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    reportError('persistence:read', e, { severity: 'warn' })
    return null
  }
}

function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    reportError('persistence:write', e, {
      severity: 'warn',
      context: { key, bytes: value.length },
    })
    return false
  }
}

function isRawPrefs(value: unknown): value is RawPrefs {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function migrate(raw: RawPrefs, version: number): RawPrefs {
  const migrated: RawPrefs = { ...raw }

  if (
    version < 2 &&
    typeof migrated.volume === 'number' &&
    isFinite(migrated.volume) &&
    migrated.volume >= 0 &&
    migrated.volume < 0.05
  ) {
    migrated.volume = 0.05
  }

  migrated.version = PREFS_VERSION
  return migrated
}

function validate(raw: Record<string, unknown>): PersistedPrefs {
  return {
    intentionId:
      typeof raw.intentionId === 'string' ? raw.intentionId : DEFAULTS.intentionId,
    templateId:
      typeof raw.templateId === 'string' ? raw.templateId : DEFAULTS.templateId,
    bedId:
      typeof raw.bedId === 'string' && ['off', 'om', 'cosmic', 'nada'].includes(raw.bedId)
        ? (raw.bedId as SoundLibraryMode)
        : DEFAULTS.bedId,
    carrierHz:
      typeof raw.carrierHz === 'number' && isFinite(raw.carrierHz) && raw.carrierHz > 0
        ? raw.carrierHz
        : DEFAULTS.carrierHz,
    beatHz:
      typeof raw.beatHz === 'number' && isFinite(raw.beatHz) && raw.beatHz >= 0
        ? raw.beatHz
        : DEFAULTS.beatHz,
    wave:
      typeof raw.wave === 'string' &&
      ['sine', 'triangle', 'sawtooth', 'square'].includes(raw.wave)
        ? (raw.wave as OscillatorType)
        : DEFAULTS.wave,
    volume:
      typeof raw.volume === 'number' &&
      isFinite(raw.volume) &&
      raw.volume >= 0 &&
      raw.volume <= 1
        ? raw.volume
        : DEFAULTS.volume,
    durationMinutes:
      raw.durationMinutes === null || (typeof raw.durationMinutes === 'number' && isFinite(raw.durationMinutes) && raw.durationMinutes > 0)
        ? (raw.durationMinutes as number | null)
        : DEFAULTS.durationMinutes,
  }
}

export function loadPrefs(): PersistedPrefs {
  if (memoryFallback) return { ...memoryFallback }

  const raw = safeGetItem(STORAGE_KEY)
  if (!raw) return { ...DEFAULTS }

  let parsed: Record<string, unknown>
  try {
    const decoded = JSON.parse(raw) as unknown
    if (!isRawPrefs(decoded)) {
      discardStoredPrefs()
      return { ...DEFAULTS }
    }
    parsed = decoded
  } catch (e) {
    reportError('persistence:parse', e, { severity: 'warn', context: { rawLen: raw.length } })
    discardStoredPrefs()
    return { ...DEFAULTS }
  }

  const version = typeof parsed.version === 'number' ? parsed.version : 1
  if (version < PREFS_VERSION) {
    parsed = migrate(parsed, version)
    safeSetItem(STORAGE_KEY, JSON.stringify(parsed))
  }

  return validate(parsed)
}

export function savePrefs(prefs: Partial<PersistedPrefs>): void {
  const current = loadPrefs()
  const merged: StoredPrefs = { ...current, ...prefs, version: PREFS_VERSION }
  const ok = safeSetItem(STORAGE_KEY, JSON.stringify(merged))
  if (!ok) {
    // Storage failed (quota, disabled, private mode) — keep the session alive in memory.
    memoryFallback = { ...current, ...prefs }
  } else if (memoryFallback) {
    memoryFallback = null
  }
}

export function clearPrefs(): void {
  memoryFallback = null
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    reportError('persistence:clear', e, { severity: 'warn' })
  }
}
