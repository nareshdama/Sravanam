/**
 * Session card screen — template detail, ambient bed picker,
 * session guide, "I'm ready" CTA, advanced tuning disclosure.
 */

import { navigate, applyTemplate, startSession } from '../app'
import { renderAppChrome, wireAppHome } from '../components/appChrome'
import { getTemplateById } from '../data/binauralTemplates'
import { getIntentionById, getIntentionTemplateIds } from '../data/intentions'
import { sessionStore } from '../state/sessionState'
import {
  renderAmbientBedPicker,
  wireAmbientBedPicker,
} from '../components/ambientBedPicker'
import {
  renderSessionGuideView,
  wireSessionGuideView,
} from '../components/sessionGuideView'
import {
  renderAdvancedTuning,
  wireAdvancedTuning,
} from '../components/advancedTuning'
import {
  renderVedicMetadata,
  hasVedicMetadata,
} from '../components/vedicMetadataPanel'
import { renderDailyProtocol } from '../components/dailyProtocol'
import { engine } from '../app'
import type { SoundLibraryMode } from '../data/vedicSoundLibrary'

function brainwaveLabel(bw: string): string {
  const labels: Record<string, string> = {
    delta: 'Delta',
    theta: 'Theta',
    alpha: 'Alpha',
    'alpha-beta': 'Alpha / Beta',
    beta: 'Beta',
    gamma: 'Gamma',
  }
  return labels[bw] ?? bw
}

export function renderSessionCard(root: HTMLElement): void {
  const session = sessionStore.get()
  const template = session.templateId ? getTemplateById(session.templateId) ?? null : null
  const intention = session.intentionId ? getIntentionById(session.intentionId) ?? null : null

  // Alternate templates (from intention)
  const alternateIds = intention
    ? getIntentionTemplateIds(intention).filter((id) => id !== session.templateId)
    : []
  const alternates = alternateIds
    .map((id) => getTemplateById(id))
    .filter((t): t is NonNullable<typeof t> => t != null)

  const title = template
    ? `${intention?.title ?? ''} \u00B7 ${brainwaveLabel(template.brainwave)} \u00B7 ${template.hzLabel}`
    : 'Custom session'

  const subtitle = template?.useCase ?? 'Manual frequencies'

  const alternatesHtml = alternates.length > 0
    ? `
      <details class="disclosure" id="alt-templates">
        <summary>Choose a different template</summary>
        <div style="padding-top: var(--space-2); display: flex; flex-direction: column; gap: var(--space-2)">
          ${alternates.map((t) => `
            <button type="button" class="btn btn--ghost" style="min-height: 40px; font-size: 0.875rem" data-alt-template="${t.id}">
              ${brainwaveLabel(t.brainwave)} \u00B7 ${t.hzLabel} \u2014 ${t.useCase}
            </button>
          `).join('')}
        </div>
      </details>
    `
    : ''

  root.innerHTML = `
    <div class="app__screen app__screen--padded">
      ${renderAppChrome()}
      <div class="session">
        <div class="session__header">
          <button type="button" class="session__back" id="session-back">\u2190 Back</button>
          <h2 class="display-card">${title}</h2>
          <p class="body-secondary">${subtitle}</p>
          ${template ? `<p class="caption" style="margin-top: var(--space-1)">${template.effect}</p>` : ''}
        </div>

        <div class="card">
          <p class="label-uppercase" style="margin-bottom: var(--space-2)">Ambient bed</p>
          ${renderAmbientBedPicker(session.bedId, onBedChange)}
        </div>

        <div class="card">
          <p class="label-uppercase" style="margin-bottom: var(--space-2)">Session guide</p>
          <div class="session__guide" id="session-guide-content">
            ${renderSessionGuideView(template, session.bedId, session.beatHz, session.carrierHz, session.intentionId ?? undefined)}
          </div>
        </div>

        ${template && hasVedicMetadata(template) ? `
          <div class="card">
            <p class="label-uppercase" style="margin-bottom: var(--space-2)">Vedic Practice Guide</p>
            <div class="vedic-metadata-container" id="vedic-metadata-content">
              ${renderVedicMetadata({ template, showSources: true, showChakra: true, showMantras: true, showBreathing: true, showPostures: true, showPracticeNotes: true })}
            </div>
          </div>
        ` : ''}

        <div class="session__cta-area">
          <p
            class="session__audio-error caption"
            id="session-audio-error"
            role="alert"
            aria-live="assertive"
            ${session.audioStartError ? '' : 'hidden'}
          >${session.audioStartError ?? ''}</p>
          <button type="button" class="btn btn--full" id="session-play">
            I'm ready
          </button>
          <p class="footnote" style="text-align: center">
            Stereo headphones \u00B7 keep volume low \u00B7 not medical treatment
          </p>
        </div>

        ${alternatesHtml}

        ${renderAdvancedTuning()}
        ${renderDailyProtocol()}
      </div>
    </div>
  `

  wireAppHome(root)

  // Wire components
  wireAmbientBedPicker(root)
  wireSessionGuideView(root)
  wireAdvancedTuning(root)

  // Back button
  root.querySelector<HTMLButtonElement>('#session-back')!.addEventListener('click', () => {
    navigate('intentions')
  })

  // Play button
  root.querySelector<HTMLButtonElement>('#session-play')!.addEventListener('click', async () => {
    const errEl = root.querySelector<HTMLElement>('#session-audio-error')
    if (errEl) {
      errEl.textContent = ''
      errEl.setAttribute('hidden', '')
    }
    await startSession()
    const err = sessionStore.get().audioStartError
    if (err && errEl) {
      errEl.textContent = err
      errEl.removeAttribute('hidden')
    }
  })

  // Alternate template buttons
  root.querySelectorAll<HTMLButtonElement>('[data-alt-template]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.altTemplate
      if (!id) return
      applyTemplate(id)
      renderSessionCard(root) // Re-render with new template
    })
  })
}

function onBedChange(bed: SoundLibraryMode): void {
  engine.setSoundLibrary(bed)
  sessionStore.set({ bedId: bed })
  // Re-render the guide section
  const guideEl = document.querySelector<HTMLElement>('#session-guide-content')
  if (guideEl) {
    const s = sessionStore.get()
    const template = s.templateId ? getTemplateById(s.templateId) ?? null : null
    guideEl.innerHTML = renderSessionGuideView(template, s.bedId, s.beatHz, s.carrierHz, s.intentionId ?? undefined)
    wireSessionGuideView(guideEl)
  }
}

export function destroySessionCard(): void {
  // No cleanup needed
}
