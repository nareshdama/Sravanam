/**
 * Immersive screen — full-viewport p5 visualization with floating controls.
 * This is the experience: mandala fills the screen, controls auto-hide.
 */

const ICON_STOP = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="4.5" y="4.5" width="9" height="9" rx="2" fill="currentColor"/></svg>`
const ICON_SUN = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.64 3.64l1.41 1.41M12.95 12.95l1.41 1.41M14.36 3.64l-1.41 1.41M5.05 12.95l-1.41 1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
const ICON_BREATHE = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="9" r="3.5" stroke="currentColor" stroke-width="1.25"/></svg>`
const ICON_MINIMIZE = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M7 2v5H2M11 2v5h5M7 16v-5H2M11 16v-5h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const ICON_FULLSCREEN = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M2 7V2h5M16 7V2h-5M2 11v5h5M16 11v5h-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`

import { stopSession, engine } from '../app'
import { renderAppChrome, wireAppHome } from '../components/appChrome'
import { appStore } from '../state/appState'
import { sessionStore } from '../state/sessionState'
import { getTemplateById } from '../data/binauralTemplates'
import { getIntentionById } from '../data/intentions'
import {
  exitFullscreen,
  isFullscreen,
  onFullscreenChange,
  toggleFullscreen,
} from '../lib/fullscreen'
import { prefersReducedMotion } from '../lib/motionPreference'
import { reportError } from '../lib/errorReport'
import { createStaticMandala, type StaticMandalaController } from '../viz/staticMandala'
import type { VedicCosmicControllers } from '../viz/vedicCosmicFlowerP5'
import {
  formatPlanetPanelText,
  getCurrentPlanetSnapshots,
} from '../viz/planetaryEphemeris'
import { breathEngine } from '../lib/breathingEngine'

/** Part 6 — floating controls auto-hide (~4s), reappear on pointer activity */
const IMMERSIVE_CONTROLS_AUTOHIDE_MS = 4000

let vizControl: VedicCosmicControllers | null = null
/** Canvas2D fallback if p5 module fails to load or init */
let staticVizFallback: StaticMandalaController | null = null
let vizModulePromise: Promise<typeof import('../viz/vedicCosmicFlowerP5')> | null = null
let controlsTimer: ReturnType<typeof setTimeout> | null = null
let sessionTimer: ReturnType<typeof setInterval> | null = null
let ephemerisTimer: ReturnType<typeof setInterval> | null = null
let liveFreqTimer: ReturnType<typeof setInterval> | null = null
let breathingTimer: ReturnType<typeof setInterval> | null = null
let unsubFullscreen: (() => void) | null = null
let audioBanner: HTMLElement | null = null

function loadVizModule(): Promise<typeof import('../viz/vedicCosmicFlowerP5')> {
  if (!vizModulePromise) {
    vizModulePromise = import('../viz/vedicCosmicFlowerP5')
  }
  return vizModulePromise
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatHz(n: number): string {
  if (n >= 100) return n.toFixed(1)
  if (n >= 10) return n.toFixed(2)
  return n.toFixed(3)
}

export function renderImmersive(root: HTMLElement): void {
  const session = sessionStore.get()
  const template = session.templateId ? getTemplateById(session.templateId) ?? null : null
  const intention = session.intentionId ? getIntentionById(session.intentionId) ?? null : null

  const label = [
    intention?.title,
    template ? `${template.hzLabel}` : `${formatHz(session.beatHz)} Hz`,
  ]
    .filter(Boolean)
    .join(' \u00B7 ')

  root.innerHTML = `
    <div class="immersive" id="immersive-root">
      ${renderAppChrome('app-chrome--immersive')}
      <div class="immersive__canvas-wrap" id="immersive-canvas"></div>

      <div class="immersive__ephemeris" id="immersive-ephemeris" style="display: none">
        <pre id="immersive-planet-panel"></pre>
      </div>

      <p class="immersive__info" id="immersive-info">
        <span class="immersive__info-line">${label} \u00B7 <span id="immersive-timer">0:00</span></span>
        <span class="immersive__live-freq mono" id="immersive-live-freq" aria-live="polite"></span>
        <span class="immersive__breathing-guide" id="immersive-breathing-guide" style="display:none; font-weight: 500; letter-spacing: 2px; text-transform: uppercase;"></span>
      </p>

      <div class="immersive__audio-banner" id="immersive-audio-banner" style="display:none" role="alert">
        Audio paused by browser &mdash; tap to resume
      </div>

      <div class="immersive__controls" id="immersive-controls">
        <button type="button" class="btn-icon" id="immersive-stop" aria-label="Stop">
          ${ICON_STOP}
        </button>
        <input
          type="range"
          class="immersive__volume"
          id="immersive-volume"
          min="0" max="1" step="0.01"
          value="${session.volume}"
          aria-label="Volume"
        />
        <button type="button" class="btn-icon" id="immersive-ephemeris-toggle" aria-label="Toggle ephemeris">
          ${ICON_SUN}
        </button>
        <button type="button" class="btn-icon" id="immersive-breathing-toggle" aria-label="Toggle breathing pacer">
          ${ICON_BREATHE}
        </button>
        <button type="button" class="btn-icon" id="immersive-minimize" aria-label="Exit fullscreen" disabled>
          ${ICON_MINIMIZE}
        </button>
        <button type="button" class="btn-icon" id="immersive-fullscreen" aria-label="Toggle fullscreen">
          ${ICON_FULLSCREEN}
        </button>
      </div>
    </div>
  `

  wireAppHome(root)

  audioBanner = root.querySelector<HTMLElement>('#immersive-audio-banner')!
  audioBanner.addEventListener('click', () => { engine.resumeContext() })
  audioBanner.addEventListener('touchstart', () => { engine.resumeContext() }, { passive: true })

  engine.onSuspended = () => { if (audioBanner) audioBanner.style.display = '' }
  engine.onResumed = () => { if (audioBanner) audioBanner.style.display = 'none' }

  const canvasMount = root.querySelector<HTMLElement>('#immersive-canvas')!
  const controlsEl = root.querySelector<HTMLElement>('#immersive-controls')!
  const infoEl = root.querySelector<HTMLElement>('#immersive-info')!
  const timerEl = root.querySelector<HTMLElement>('#immersive-timer')!
  const volumeEl = root.querySelector<HTMLInputElement>('#immersive-volume')!
  const ephemerisEl = root.querySelector<HTMLElement>('#immersive-ephemeris')!
  const planetPanel = root.querySelector<HTMLElement>('#immersive-planet-panel')!
  const liveFreqEl = root.querySelector<HTMLElement>('#immersive-live-freq')!
  const minimizeBtn = root.querySelector<HTMLButtonElement>('#immersive-minimize')!
  const breathingGuideEl = root.querySelector<HTMLElement>('#immersive-breathing-guide')!
  const breathingToggleBtn = root.querySelector<HTMLButtonElement>('#immersive-breathing-toggle')!

  function updateLiveFreqText(): void {
    const ch = engine.getChannelFrequencies()
    if (!ch) {
      liveFreqEl.textContent = ''
      return
    }
    const delta = ch.rightHz - ch.leftHz
    liveFreqEl.textContent = `L ${formatHz(ch.leftHz)} \u00B7 R ${formatHz(ch.rightHz)} \u00B7 \u0394 ${formatHz(delta)}`
  }

  liveFreqTimer = window.setInterval(updateLiveFreqText, 250)
  updateLiveFreqText()

  function syncMinimizeButton(): void {
    minimizeBtn.disabled = !isFullscreen()
  }
  syncMinimizeButton()

  // Auto-hide controls
  function showControls(): void {
    controlsEl.classList.remove('immersive__controls--hidden')
    infoEl.classList.remove('immersive__info--hidden')
    if (controlsTimer) clearTimeout(controlsTimer)
    controlsTimer = setTimeout(() => {
      controlsEl.classList.add('immersive__controls--hidden')
      infoEl.classList.add('immersive__info--hidden')
    }, IMMERSIVE_CONTROLS_AUTOHIDE_MS)
  }

  canvasMount.addEventListener('mousemove', showControls)
  canvasMount.addEventListener('touchstart', showControls, { passive: true })
  showControls()

  // Canvas tap → toggle ephemeris
  canvasMount.addEventListener('click', () => {
    const visible = ephemerisEl.style.display !== 'none'
    ephemerisEl.style.display = visible ? 'none' : ''
    appStore.set({ ephemerisVisible: !visible })
  })

  // Stop button
  root.querySelector<HTMLButtonElement>('#immersive-stop')!.addEventListener('click', () => {
    stopSession()
  })

  // Volume
  volumeEl.addEventListener('input', () => {
    const v = Number(volumeEl.value)
    engine.setVolume(v)
    sessionStore.set({ volume: v })
  })

  // Ephemeris toggle button
  root.querySelector<HTMLButtonElement>('#immersive-ephemeris-toggle')!.addEventListener('click', (e) => {
    e.stopPropagation()
    const visible = ephemerisEl.style.display !== 'none'
    ephemerisEl.style.display = visible ? 'none' : ''
    appStore.set({ ephemerisVisible: !visible })
  })

  // Breathing toggle button
  breathingToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    const active = !appStore.get().breathingPacer
    appStore.set({ breathingPacer: active })
    if (active) {
       breathEngine.start()
    }
  })

  // Fullscreen
  root.querySelector<HTMLButtonElement>('#immersive-fullscreen')!.addEventListener('click', (e) => {
    e.stopPropagation()
    void toggleFullscreen(root.querySelector<HTMLElement>('#immersive-root') ?? undefined)
  })
  unsubFullscreen?.()
  unsubFullscreen = onFullscreenChange((fs) => {
    appStore.set({ immersiveFullscreen: fs })
    syncMinimizeButton()
  })

  minimizeBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    void exitFullscreen()
  })

  // Session timer
  const startTime = Date.now()
  sessionTimer = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000
    timerEl.textContent = formatTime(elapsed)
  }, 1000)

  // Ephemeris updates
  planetPanel.textContent = formatPlanetPanelText(getCurrentPlanetSnapshots())
  ephemerisTimer = setInterval(() => {
    planetPanel.textContent = formatPlanetPanelText(getCurrentPlanetSnapshots())
  }, 2000)

  // Breathing UI sync
  breathingTimer = setInterval(() => {
    const isPacing = appStore.get().breathingPacer
    if (isPacing) {
       breathingGuideEl.style.display = 'block'
       liveFreqEl.style.display = 'none'
       breathingGuideEl.textContent = breathEngine.getState().label
    } else {
       breathingGuideEl.style.display = 'none'
       liveFreqEl.style.display = ''
    }
  }, 100)

  function mountStaticFallback(reason: unknown): void {
    reportError('immersive:vizFallback', reason, { severity: 'warn' })
    if (!canvasMount.isConnected) return
    vizControl?.stop()
    vizControl = null
    staticVizFallback?.stop()
    staticVizFallback = null
    canvasMount.replaceChildren()
    const wrap = document.createElement('div')
    wrap.className = 'immersive__viz-fallback'
    wrap.setAttribute('role', 'img')
    wrap.setAttribute(
      'aria-label',
      'Calm geometric pattern. Live mandala could not load; showing a still pattern instead.',
    )
    canvasMount.appendChild(wrap)
    if (!wrap.isConnected) return
    staticVizFallback = createStaticMandala(wrap, {
      reducedMotion: prefersReducedMotion(),
    })
    staticVizFallback.start()
  }

  // Boot p5 visualization (fallback: static Canvas2D mandala)
  void loadVizModule()
    .then((mod) => {
      if (!canvasMount.isConnected) return
      try {
        vizControl = mod.createVedicCosmicFlower({
          mount: canvasMount,
          reducedMotion: prefersReducedMotion(),
          planetPanel: null, // We manage ephemeris separately
          getAudioSync: () => {
             const clock = engine.getAudioClock()
             const start = engine.getPlaybackStartTime()
             if (!clock || start === null) return null
             const beatHz = sessionStore.get().beatHz
             return { elapsed: clock.currentTime - start, beatHz }
          },
          getBreathingSync: () => {
             if (!appStore.get().breathingPacer) return null
             return { expansion: breathEngine.getState().expansion }
          }
        })
        vizControl.start()
      } catch (e) {
        mountStaticFallback(e)
      }
    })
    .catch((e) => {
      mountStaticFallback(e)
    })
}

export function destroyImmersive(): void {
  engine.onSuspended = null
  engine.onResumed = null
  audioBanner = null

  vizControl?.stop()
  vizControl = null
  staticVizFallback?.stop()
  staticVizFallback = null
  if (controlsTimer) clearTimeout(controlsTimer)
  controlsTimer = null
  if (sessionTimer) clearInterval(sessionTimer)
  sessionTimer = null
  if (ephemerisTimer) clearInterval(ephemerisTimer)
  ephemerisTimer = null
  if (liveFreqTimer) clearInterval(liveFreqTimer)
  liveFreqTimer = null
  if (breathingTimer) clearInterval(breathingTimer)
  breathingTimer = null
  unsubFullscreen?.()
  unsubFullscreen = null
  // Exit fullscreen if active
  if (isFullscreen()) {
    void document.exitFullscreen().catch((e) => {
      reportError('immersive:exitFullscreen', e, { severity: 'warn' })
    })
  }
}
