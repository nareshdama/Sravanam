/**
 * Tabbed session guide component — Vedic | Modern frames.
 * Reuses the existing buildSessionGuide / renderSessionGuideHtml data layer.
 */

import type { BinauralTemplate } from '../data/binauralTemplates'
import type { SoundLibraryMode } from '../data/vedicSoundLibrary'
import { buildSessionGuide } from '../data/sessionGuide'

export type GuideTab = 'vedic' | 'modern'

export function renderSessionGuideView(
  template: BinauralTemplate | null,
  bedId: SoundLibraryMode,
  beatHz: number,
  carrierHz: number,
  intentionId?: string,
): string {
  const guide = buildSessionGuide(template, bedId, beatHz, carrierHz, intentionId)

  // Build separate HTML for each tab
  const esc = (s: string): string =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const vedicHtml = guide.vedicParagraphs.map((p) => `<p class="body-secondary">${esc(p)}</p>`).join('')
  const modernHtml = guide.modernParagraphs.map((p) => `<p class="body-secondary">${esc(p)}</p>`).join('')
  const benefitsHtml = guide.benefits.map((b) => `<li>${esc(b)}</li>`).join('')

  return `
    <div class="session-guide-view">
      <p class="caption session-guide-view__headline">${esc(guide.headline)}</p>

      <div class="tabs" role="tablist" aria-label="Session guide perspectives">
        <button
          class="tabs__tab"
          id="session-guide-tab-vedic"
          role="tab"
          aria-controls="session-guide-panel-vedic"
          aria-selected="true"
          data-tab="vedic"
        >
          \u015Aruti-inspired
        </button>
        <button
          class="tabs__tab"
          id="session-guide-tab-modern"
          role="tab"
          aria-controls="session-guide-panel-modern"
          aria-selected="false"
          data-tab="modern"
        >
          Modern clarity
        </button>
      </div>

      <div
        class="session-guide-view__panel"
        id="session-guide-panel-vedic"
        role="tabpanel"
        aria-labelledby="session-guide-tab-vedic"
        data-panel="vedic"
      >
        ${vedicHtml}
      </div>
      <div
        class="session-guide-view__panel"
        id="session-guide-panel-modern"
        role="tabpanel"
        aria-labelledby="session-guide-tab-modern"
        data-panel="modern"
        hidden
      >
        ${modernHtml}
      </div>

      <h4 class="label-uppercase session-guide-view__section-title">Benefits &amp; limits</h4>
      <ul class="session-guide-view__benefits body-secondary">
        ${benefitsHtml}
      </ul>

      <p class="caption session-guide-view__practice"><strong>Practice &amp; precautions:</strong> ${esc(guide.practice)}</p>
    </div>
  `
}

/** Wire tab switching after innerHTML is set. */
export function wireSessionGuideView(container: HTMLElement): void {
  const tabs = container.querySelectorAll<HTMLButtonElement>('.tabs__tab')
  const panels = container.querySelectorAll<HTMLElement>('.session-guide-view__panel')

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab as GuideTab
      tabs.forEach((t) => t.setAttribute('aria-selected', 'false'))
      tab.setAttribute('aria-selected', 'true')
      panels.forEach((p) => {
        p.hidden = p.dataset.panel !== target
      })
    })
  })
}
