/**
 * Intention picker screen — "Nāda Brahma: Choose Your Mode"
 * 9 life mode cards in a 3×3 grid.
 */

import { navigate, applyIntention } from '../app'
import { renderAppChrome, wireAppHome } from '../components/appChrome'
import { getTemplateById } from '../data/binauralTemplates'
import { getIntentionIllustrationSvg } from '../data/intentionIllustrations'
import { INTENTIONS, type Intention } from '../data/intentions'
import { sessionStore } from '../state/sessionState'

function brainwaveShort(bw: string): string {
  const m: Record<string, string> = {
    delta: 'Delta',
    theta: 'Theta',
    alpha: 'Alpha',
    'alpha-beta': '\u03B1/\u03B2',
    beta: 'Beta',
    gamma: 'Gamma',
  }
  return m[bw] ?? bw
}

/** Compact band line + default template Hz (Part 3 wireframe). */
function intentionBandLine(i: Intention): string {
  const bands = i.brainwaves.map(brainwaveShort).join(' \u00B7 ')
  const t = getTemplateById(i.defaultTemplateId)
  const hz = t?.hzLabel ?? ''
  return hz ? `${bands} \u00B7 ${hz}` : bands
}

function renderCard(intention: typeof INTENTIONS[number], selected: boolean): string {
  const illustration = getIntentionIllustrationSvg(intention.illustration)
  const label = `${intention.title}: ${intention.subtitle}${selected ? ', selected' : ''}`
  const checkSvg = `<svg class="intention-card__check-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19l12-12l-1.41-1.41z"/></svg>`
  return `
    <button
      type="button"
      class="intention-card"
      data-intention="${intention.id}"
      data-illustration="${intention.illustration}"
      aria-pressed="${selected}"
      aria-label="${label}"
    >
      <span class="intention-card__check" aria-hidden="true">${checkSvg}</span>
      <span
        class="intention-card__icon"
        style="background: ${intention.color}22; color: ${intention.color}"
      >${illustration}</span>
      <span class="intention-card__title">${intention.title}</span>
      <span class="intention-card__subtitle">${intention.subtitle}</span>
      <span class="intention-card__hz caption">${intentionBandLine(intention)}</span>
      <span class="intention-card__desc footnote">${intention.description}</span>
    </button>
  `
}

export function renderIntentionPicker(root: HTMLElement): void {
  const session = sessionStore.get()

  root.innerHTML = `
    <div class="app__screen app__screen--padded">
      ${renderAppChrome()}
      <div class="intentions">
        <div class="intentions__heading">
          <h2 class="display-section">N\u0101da Brahma</h2>
          <p class="body-secondary" style="margin-top: var(--space-2)">
            The universe is sound. Choose your mode.
          </p>
        </div>
        <div class="intentions__grid" role="list">
          ${INTENTIONS.map((i) => renderCard(i, session.intentionId === i.id)).join('')}
        </div>
        <p class="footnote" style="text-align: center; max-width: 28rem;">
          Preset bands (delta, theta, \u2026) are informal listening labels, not clinical categories. Not medical advice.
        </p>
      </div>
    </div>
  `

  wireAppHome(root)

  // Card click handlers
  const cards = root.querySelectorAll<HTMLButtonElement>('.intention-card')
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.intention
      if (!id) return

      // Visual feedback + aria (selected state)
      cards.forEach((c) => {
        c.setAttribute('aria-pressed', 'false')
        const cid = c.dataset.intention
        const i = INTENTIONS.find((x) => x.id === cid)
        if (i) c.setAttribute('aria-label', `${i.title}: ${i.subtitle}`)
      })
      card.setAttribute('aria-pressed', 'true')
      const picked = INTENTIONS.find((x) => x.id === id)
      if (picked) {
        card.setAttribute('aria-label', `${picked.title}: ${picked.subtitle}, selected`)
      }

      // Apply and navigate after brief delay for visual feedback
      applyIntention(id)
      setTimeout(() => navigate('session'), 180)
    })
  })
}

export function destroyIntentionPicker(): void {
  // No cleanup needed
}
