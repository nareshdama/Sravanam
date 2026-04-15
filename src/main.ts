/**
 * Sravanam — entry point.
 * Imports the design system, boots the app, and wires the screen router.
 */

/* Design system */
import './design/tokens.css'
import './design/reset.css'
import './design/typography.css'
import './design/components.css'
import './design/screens.css'
import './design/animations.css'

/* Keep legacy styles for components that still reference them (viz panel, etc.) */
import './style.css'

/* App core */
import { boot } from './app'
import { initRouteSync } from './lib/routeSync'
import { appStore, type Screen } from './state/appState'
import { renderLanding, destroyLanding } from './screens/landing'
import { renderIntentionPicker, destroyIntentionPicker } from './screens/intentionPicker'
import { renderSessionCard, destroySessionCard } from './screens/sessionCard'
import { renderImmersive, destroyImmersive } from './screens/immersive'

const appRoot = document.querySelector<HTMLDivElement>('#app')!

let currentScreen: Screen | null = null

/** Destroy the current screen's resources, then render the new one. */
function renderScreen(screen: Screen): void {
  // Destroy previous screen
  if (currentScreen) {
    switch (currentScreen) {
      case 'landing':
        destroyLanding()
        break
      case 'intentions':
        destroyIntentionPicker()
        break
      case 'session':
        destroySessionCard()
        break
      case 'immersive':
        destroyImmersive()
        break
    }
  }

  // Render new screen
  currentScreen = screen
  switch (screen) {
    case 'landing':
      renderLanding(appRoot)
      break
    case 'intentions':
      renderIntentionPicker(appRoot)
      break
    case 'session':
      renderSessionCard(appRoot)
      break
    case 'immersive':
      renderImmersive(appRoot)
      break
  }
}

// Subscribe to screen changes
appStore.subscribe((state) => {
  if (state.screen !== currentScreen) {
    renderScreen(state.screen)
  }
})

// Boot the application, sync URL hash to screen, then render the initial screen
boot()
initRouteSync()
renderScreen(appStore.get().screen)

/** Part 7 — cache shell + assets for offline revisit (production only) */
if (import.meta.env.PROD && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* registration optional */
    })
  })
}
