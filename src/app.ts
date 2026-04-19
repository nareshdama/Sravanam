/**
 * App shell — boots the application, manages screen routing,
 * and wires state stores to the audio engine.
 */

import { BinauralEngine, clampBinauralFrequencies } from './audio/binauralEngine'
import { getTemplateById, resolveTemplateFrequencies } from './data/binauralTemplates'
import { getIntentionById } from './data/intentions'
import { loadPrefs, savePrefs } from './lib/persistence'
import { prefersReducedMotion } from './lib/motionPreference'
import { viewTransition } from './lib/viewTransition'
import { appStore, type Screen } from './state/appState'
import { sessionStore, type SessionState } from './state/sessionState'

export const engine = new BinauralEngine()

function syncEngineFromSession(session: Readonly<SessionState>): void {
  engine.setCarrierHz(session.carrierHz)
  engine.setBeatHz(session.beatHz)
  engine.setVolume(session.volume)
  engine.setWave(session.wave)
  engine.setSoundLibrary(session.bedId)
}

let lastSession = sessionStore.get()
sessionStore.subscribe((session) => {
  if (
    session.carrierHz !== lastSession.carrierHz ||
    session.beatHz !== lastSession.beatHz ||
    session.volume !== lastSession.volume ||
    session.wave !== lastSession.wave ||
    session.bedId !== lastSession.bedId
  ) {
    syncEngineFromSession(session)
  }
  lastSession = session
})

export function normalizeScreenTarget(screen: Screen): Screen {
  const { playing } = sessionStore.get()
  if (playing && screen !== 'immersive') return 'immersive'
  if (!playing && screen === 'immersive') return 'session'
  return screen
}

/** Navigate to a screen with an optional view transition. */
export function navigate(screen: Screen): void {
  const target = normalizeScreenTarget(screen)
  viewTransition(() => {
    appStore.set({ screen: target })
  })
}

/**
 * Return to landing: stop audio if playing, then navigate home.
 * Used by the global wordmark (Part 4: logo → landing from any screen).
 */
export function goHome(): void {
  if (engine.running) {
    engine.stop()
    sessionStore.set({ playing: false })
  }
  navigate('landing')
}

/**
 * Apply a template + intention selection to session state.
 * Resolves frequencies, clamps to engine limits, and updates the store.
 */
export function applyIntention(intentionId: string): void {
  const intention = getIntentionById(intentionId)
  if (!intention) return

  const template = getTemplateById(intention.defaultTemplateId)
  if (!template) return

  const sr = engine.getLimits().sampleRate
  const resolved = resolveTemplateFrequencies(template, {
    carrierHz: template.recommendedCarrierHz,
  })
  const clamped = clampBinauralFrequencies(sr, resolved.carrierHz, resolved.beatHz)

  sessionStore.set({
    intentionId,
    templateId: template.id,
    bedId: intention.defaultBed,
    carrierHz: clamped.carrierHz,
    beatHz: clamped.beatHz,
    playing: false,
  })

  syncEngineFromSession(sessionStore.get())
}

/** Apply a specific template (from alternate selection on session card). */
export function applyTemplate(templateId: string): void {
  const template = getTemplateById(templateId)
  if (!template) return

  const sr = engine.getLimits().sampleRate
  const resolved = resolveTemplateFrequencies(template)
  const clamped = clampBinauralFrequencies(sr, resolved.carrierHz, resolved.beatHz)

  sessionStore.set({
    templateId,
    carrierHz: clamped.carrierHz,
    beatHz: clamped.beatHz,
  })

  syncEngineFromSession(sessionStore.get())
}

/** Start audio playback and enter immersive mode. */
export async function startSession(): Promise<void> {
  const session = sessionStore.get()

  sessionStore.set({ audioStartError: null })
  syncEngineFromSession(session)

  try {
    await engine.start()
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : 'Audio could not start. Tap the button to try again.'
    sessionStore.set({ playing: false, audioStartError: msg })
    return
  }

  const live = engine.getParams()
  const liveBedId = engine.getSoundLibrary()
  sessionStore.set({
    playing: true,
    audioStartError: null,
    carrierHz: live.carrierHz,
    beatHz: live.beatHz,
    volume: live.volume,
    wave: live.wave,
    bedId: liveBedId,
  })
  navigate('immersive')

  savePrefs({
    intentionId: session.intentionId,
    templateId: session.templateId,
    bedId: liveBedId,
    carrierHz: live.carrierHz,
    beatHz: live.beatHz,
    wave: live.wave,
    volume: live.volume,
  })
}

/** Stop audio and return to session card. */
export function stopSession(): void {
  engine.stop()
  sessionStore.set({ playing: false })
  navigate('session')
}

/**
 * Boot the application.
 * Called once from main.ts after styles are loaded.
 */
export function boot(): void {
  // Detect reduced motion
  appStore.set({ reducedMotion: prefersReducedMotion() })

  if (typeof window !== 'undefined') {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    mq.addEventListener('change', (e) => {
      appStore.set({ reducedMotion: e.matches })
    })
  }

  // Restore persisted preferences into session state
  const prefs = loadPrefs()
  sessionStore.set({
    intentionId: prefs.intentionId,
    templateId: prefs.templateId,
    bedId: prefs.bedId,
    carrierHz: prefs.carrierHz,
    beatHz: prefs.beatHz,
    wave: prefs.wave,
    volume: prefs.volume,
  })

  // Start on landing screen
  appStore.set({ screen: 'landing' })
}
