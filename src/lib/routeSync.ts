/**
 * Hash URL sync with app screen — Part 4 optional deep-linking.
 * Format: #/landing | #/intentions | #/session | #/immersive
 * Immersive requires active audio; otherwise falls back to session.
 */

import { engine } from '../app'
import { appStore, type Screen } from '../state/appState'
import { viewTransition } from './viewTransition'

const SCREENS: readonly Screen[] = [
  'landing',
  'intentions',
  'session',
  'immersive',
]

function parseHash(): Screen | null {
  const raw = location.hash.replace(/^#\/?/, '').trim()
  if (!raw) return null
  return (SCREENS as readonly string[]).includes(raw) ? (raw as Screen) : null
}

function sanitizeScreen(screen: Screen): Screen {
  if (screen === 'immersive' && !engine.running) return 'session'
  return screen
}

function hashForScreen(screen: Screen): string {
  return `#/${screen}`
}

/**
 * Call after {@link boot} so prefs and initial `screen` are set, before first paint.
 */
export function initRouteSync(): void {
  const fromUrl = parseHash()
  if (fromUrl) {
    appStore.set({ screen: sanitizeScreen(fromUrl) })
  } else {
    history.replaceState(
      null,
      '',
      `${location.pathname}${location.search}${hashForScreen(appStore.get().screen)}`,
    )
  }

  window.addEventListener('hashchange', () => {
    const next = parseHash()
    if (!next) return
    const s = sanitizeScreen(next)
    if (s !== appStore.get().screen) {
      viewTransition(() => appStore.set({ screen: s }))
    }
  })

  appStore.subscribe((state) => {
    const want = hashForScreen(state.screen)
    if (location.hash !== want) {
      history.replaceState(
        null,
        '',
        `${location.pathname}${location.search}${want}`,
      )
    }
  })
}
