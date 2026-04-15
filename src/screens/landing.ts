/**
 * Landing screen — static mandala, title, CTA.
 * The first thing the user sees. Sets the emotional tone.
 */

import { navigate } from '../app'
import { createStaticMandala, type StaticMandalaController } from '../viz/staticMandala'

let mandala: StaticMandalaController | null = null

export function renderLanding(root: HTMLElement): void {
  root.innerHTML = `
    <div class="app__screen app__screen--centered">
      <div class="landing">
        <div class="landing__mandala" id="landing-mandala"></div>
        <div class="landing__hero-text">
          <h1 class="display-hero landing__title">S R A V A N A M</h1>
          <div class="landing__tagline">
            <p class="landing__tagline-line landing__tagline-line--lead" lang="sa-Latn">
              \u015Arava\u1E47am \u2014 attentive
            </p>
            <p class="landing__tagline-line landing__tagline-line--tail">listening</p>
          </div>
        </div>
        <button type="button" class="btn btn--ghost landing__cta" id="landing-cta">
          Begin a session
        </button>
        <p class="footnote landing__disclaimer">
          Use stereo headphones \u00B7 personal listening only
        </p>
      </div>
    </div>
  `

  // Boot mandala
  const mount = root.querySelector<HTMLElement>('#landing-mandala')!
  mandala?.stop()
  mandala = createStaticMandala(mount, {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  })
  mandala.start()

  // CTA
  root.querySelector<HTMLButtonElement>('#landing-cta')!.addEventListener('click', () => {
    navigate('intentions')
  })
}

export function destroyLanding(): void {
  mandala?.stop()
  mandala = null
}
