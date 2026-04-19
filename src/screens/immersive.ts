/**
 * Immersive screen — full-viewport p5 visualization with floating controls.
 * This is the experience: mandala fills the screen, controls auto-hide.
 */

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
import { createStaticMandala, type StaticMandalaController } from '../viz/staticMandala'
import type { VedicCosmicControllers } from '../viz/vedicCosmicFlowerP5'
import {
  formatPlanetPanelText,
  getPlanetSnapshots,
} from '../viz/planetaryEphemeris'

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
let unsubFullscreen: (() => void) | null = null

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
      </p>

      <div class="immersive__controls" id="immersive-controls">
        <button type="button" class="btn-icon" id="immersive-stop" aria-label="Stop">
          \u25A0
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
          \u2609
        </button>
        <button type="button" class="btn-icon" id="immersive-minimize" aria-label="Exit fullscreen" disabled>
          \u29C9
        </button>
        <button type="button" class="btn-icon" id="immersive-fullscreen" aria-label="Toggle fullscreen">
          \u26F6
        </button>
      </div>
    </div>
  `

  wireAppHome(root)

  const canvasMount = root.querySelector<HTMLElement>('#immersive-canvas')!
  const controlsEl = root.querySelector<HTMLElement>('#immersive-controls')!
  const infoEl = root.querySelector<HTMLElement>('#immersive-info')!
  const timerEl = root.querySelector<HTMLElement>('#immersive-timer')!
  const volumeEl = root.querySelector<HTMLInputElement>('#immersive-volume')!
  const ephemerisEl = root.querySelector<HTMLElement>('#immersive-ephemeris')!
  const planetPanel = root.querySelector<HTMLElement>('#immersive-planet-panel')!
  const liveFreqEl = root.querySelector<HTMLElement>('#immersive-live-freq')!
  const minimizeBtn = root.querySelector<HTMLButtonElement>('#immersive-minimize')!

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
  planetPanel.textContent = formatPlanetPanelText(getPlanetSnapshots())
  ephemerisTimer = setInterval(() => {
    planetPanel.textContent = formatPlanetPanelText(getPlanetSnapshots())
  }, 2000)

  function mountStaticFallback(reason: unknown): void {
    console.error('Immersive p5 visualization unavailable', reason)
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
  unsubFullscreen?.()
  unsubFullscreen = null
  // Exit fullscreen if active
  if (isFullscreen()) {
    void document.exitFullscreen().catch(() => {})
  }
}
