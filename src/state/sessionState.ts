/**
 * Session state — what the user is listening to.
 * Drives the audio engine and session card UI.
 */

import type { SoundLibraryMode } from '../data/vedicSoundLibrary'
import { createStore } from './store'

export interface SessionState {
  /** Selected intention ('rest' | 'calm' | 'focus' | 'deep' | null for custom) */
  intentionId: string | null
  /** Active binaural template ID (from binauralTemplates) */
  templateId: string | null
  /** Ambient bed */
  bedId: SoundLibraryMode
  /** Carrier frequency in Hz */
  carrierHz: number
  /** Beat (binaural difference) in Hz */
  beatHz: number
  /** Oscillator waveform */
  wave: OscillatorType
  /** Volume 0–1 */
  volume: number
  /** Session duration in minutes (null = infinite) */
  durationMinutes: number | null
  /** Audio is currently playing */
  playing: boolean
  /** Set when engine.start() fails (e.g. autoplay policy); cleared on success or new attempt */
  audioStartError: string | null
}

export const INITIAL_SESSION: SessionState = {
  intentionId: null,
  templateId: null,
  bedId: 'off',
  carrierHz: 200,
  beatHz: 10,
  wave: 'sine',
  volume: 0.2,
  durationMinutes: 20, // default to 20 minutes instead of infinite
  playing: false,
  audioStartError: null,
}

export const sessionStore = createStore<SessionState>(INITIAL_SESSION)
