/**
 * Landing screen — Sri Yantra WebGL hero (or static mandala when reduced motion), title, CTA.
 */

import type { Root } from 'react-dom/client'

import { navigate } from '../app'
import { mountSriYantraLanding, unmountSriYantraLanding } from '../landing/sriYantraRoot'
import { prefersReducedMotion } from '../lib/motionPreference'
import { createStaticMandala, type StaticMandalaController } from '../viz/staticMandala'

let mandala: StaticMandalaController | null = null
let reactRoot: Root | null = null

export function renderLanding(root: HTMLElement): void {
  const reduced = prefersReducedMotion()

  root.innerHTML = `
    <div class="app__screen app__screen--landing">
      <div class="landing landing--fullbg${reduced ? ' landing--viz-static' : ' landing--viz-webgl'}">
        <div class="landing__bg" id="landing-viz-root" aria-hidden="true"></div>
        <div class="landing__content-shell">
          <div class="landing__content">
            <div class="landing__hero-text">
              <h1 class="display-hero landing__title">S R A V A N A M</h1>
              <div class="landing__tagline">
                <p class="landing__tagline-line landing__tagline-line--lead" lang="sa-Latn">
                  Śravaṇam — attentive
                </p>
                <p class="landing__tagline-line landing__tagline-line--tail">listening</p>
              </div>
            </div>
            <button type="button" class="btn btn--ghost landing__cta" id="landing-cta">
              Begin a session
            </button>
            <p class="footnote landing__disclaimer">
              Use stereo headphones · personal listening only
            </p>
          </div>
        </div>
        <div class="landing__scroll-spacer" aria-hidden="true"></div>
      </div>
    </div>
  `

  const vizMount = root.querySelector<HTMLElement>('#landing-viz-root')
  if (!vizMount) return

  if (reduced) {
    mandala?.stop()
    mandala = createStaticMandala(vizMount, { reducedMotion: true })
    mandala.start()
  } else {
    unmountSriYantraLanding(reactRoot)
    reactRoot = null
    reactRoot = mountSriYantraLanding(vizMount)
  }

  const cta = root.querySelector<HTMLButtonElement>('#landing-cta')
  if (cta) {
    cta.addEventListener('click', () => {
      navigate('intentions')
    })
  }
}

export function destroyLanding(): void {
  mandala?.stop()
  mandala = null
  unmountSriYantraLanding(reactRoot)
  reactRoot = null
}
