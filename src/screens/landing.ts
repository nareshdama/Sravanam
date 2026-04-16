/**
 * Landing screen — copy + CTA. WebGL Sri Yantra is mounted globally (#app-global-viz).
 * Reduced motion: static mandala in #landing-static-viz-root only on this screen.
 */

import { navigate } from '../app'
import { prefersReducedMotion } from '../lib/motionPreference'
import { createStaticMandala, type StaticMandalaController } from '../viz/staticMandala'

let mandala: StaticMandalaController | null = null

export function renderLanding(root: HTMLElement): void {
  const reduced = prefersReducedMotion()

  root.innerHTML = `
    <div class="app__screen app__screen--landing">
      <div class="landing landing--fullbg${reduced ? ' landing--viz-static' : ' landing--viz-webgl'}">
        ${reduced ? '<div class="landing__bg landing__bg--static" id="landing-static-viz-root" aria-hidden="true"></div>' : ''}
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

  if (reduced) {
    const mount = root.querySelector<HTMLElement>('#landing-static-viz-root')
    if (!mount) return
    mandala?.stop()
    mandala = createStaticMandala(mount, { reducedMotion: true })
    mandala.start()
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
}
