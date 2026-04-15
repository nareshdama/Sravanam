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
): string {
  const guide = buildSessionGuide(template, bedId, beatHz, carrierHz)

  // Build separate HTML for each tab
  const esc = (s: string): string =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const vedicHtml = guide.vedicParagraphs.map((p) => `<p class="body-secondary">${esc(p)}</p>`).join('')
  const modernHtml = guide.modernParagraphs.map((p) => `<p class="body-secondary">${esc(p)}</p>`).join('')
  const benefitsHtml = guide.benefits.map((b) => `<li>${esc(b)}</li>`).join('')

  return `
    <div class="session-guide-view">
      <p class="caption" style="margin-bottom: var(--space-sm)">${esc(guide.headline)}</p>

      <div class="tabs" role="tablist">
        <button class="tabs__tab" role="tab" aria-selected="true" data-tab="vedic">
          \u015Aruti-inspired
        </button>
        <button class="tabs__tab" role="tab" aria-selected="false" data-tab="modern">
          Modern clarity
        </button>
      </div>

      <div class="session-guide-view__panel" data-panel="vedic">
        ${vedicHtml}
      </div>
      <div class="session-guide-view__panel" data-panel="modern" style="display: none">
        ${modernHtml}
      </div>

      <h4 class="label-uppercase" style="margin-top: var(--space-md)">Benefits &amp; limits</h4>
      <ul class="session-guide-view__benefits body-secondary" style="padding-left: 1.25rem; margin: var(--space-sm) 0">
        ${benefitsHtml}
      </ul>

      <p class="caption"><strong>Practice:</strong> ${esc(guide.practice)}</p>
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
        p.style.display = p.dataset.panel === target ? '' : 'none'
      })
    })
  })
}
