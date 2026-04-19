/**
 * Renders rich Vedic metadata (sources, chakra, mantras, mudra, breathing, postures)
 * for templates that have extended Vedic information.
 */

import type { BinauralTemplate } from '../data/binauralTemplates'
import { extractMudraFromText } from '../data/mudraIndex'

export interface VedicMetadataPanelOptions {
  template: BinauralTemplate | null
  showSources?: boolean
  showChakra?: boolean
  showMantras?: boolean
  showMudra?: boolean
  showBreathing?: boolean
  showPostures?: boolean
  showPracticeNotes?: boolean
}

export function renderVedicMetadata(options: VedicMetadataPanelOptions): string {
  const {
    template,
    showSources = true,
    showChakra = true,
    showMantras = true,
    showMudra = true,
    showBreathing = true,
    showPostures = true,
    showPracticeNotes = true,
  } = options

  if (!template) return ''

  // Check if template has any Vedic metadata worth displaying
  const hasVedicContent =
    template.vedicSources?.length ||
    template.vedaVerification ||
    template.associatedChakra ||
    template.mantras?.length ||
    template.breathingPattern ||
    template.postures?.length ||
    template.practiceNotes ||
    template.timeOfDay ||
    template.seasonalAlignment?.length

  if (!hasVedicContent) return ''

  let html = '<div class="vedic-metadata">'

  // Vedic sources
  if (showSources && template.vedicSources?.length) {
    html += '<div class="vedic-metadata__section">'
    html += '<h4 class="vedic-metadata__heading">Vedic Sources</h4>'
    html += '<ul class="vedic-metadata__list">'
    for (const src of template.vedicSources) {
      const details =
        src.verse || src.tradition ? ` (${[src.verse, src.tradition].filter((x) => x).join(', ')})` : ''
      html += `<li>${esc(src.text)}${details}</li>`
    }
    html += '</ul>'
    html += '</div>'
  }

  // Vedic verification / context
  if (template.vedaVerification) {
    html += '<div class="vedic-metadata__section">'
    html += `<p class="vedic-metadata__text"><strong>Vedic Verification:</strong> ${esc(template.vedaVerification)}</p>`
    html += '</div>'
  }

  // Associated chakra
  if (showChakra && template.associatedChakra) {
    html += '<div class="vedic-metadata__section">'
    html += `<p class="vedic-metadata__text"><strong>Associated Chakra:</strong> ${esc(template.associatedChakra)}</p>`
    html += '</div>'
  }

  // Mantras
  if (showMantras && template.mantras?.length) {
    html += '<div class="vedic-metadata__section">'
    html += '<h4 class="vedic-metadata__heading">Mantras</h4>'
    html += '<ul class="vedic-metadata__list">'
    for (const mantra of template.mantras) {
      html += `<li><code class="vedic-metadata__code">${esc(mantra)}</code></li>`
    }
    html += '</ul>'
    html += '</div>'
  }

  // Mudra — extracted from postures or practice notes
  if (showMudra) {
    const allText = [
      ...(template.postures ?? []),
      template.practiceNotes ?? '',
    ].join(' ')
    const mudra = extractMudraFromText(allText)
    if (mudra) {
      html += '<div class="vedic-metadata__section vedic-metadata__section--mudra">'
      html += '<h4 class="vedic-metadata__heading">Mudra</h4>'
      html += '<div class="vedic-metadata__mudra">'
      html += `<span class="vedic-metadata__mudra-glyph" aria-hidden="true">${esc(mudra.devanagari)}</span>`
      html += '<span class="vedic-metadata__mudra-info">'
      html += `<strong>${esc(mudra.name)}</strong>`
      html += `<span class="vedic-metadata__mudra-meaning">${esc(mudra.meaning)}</span>`
      html += '</span>'
      html += '</div>'
      html += '</div>'
    }
  }

  // Breathing pattern
  if (showBreathing && template.breathingPattern) {
    const bp = template.breathingPattern
    html += '<div class="vedic-metadata__section">'
    html += '<h4 class="vedic-metadata__heading">Breathing Pattern</h4>'
    html += `<p class="vedic-metadata__text"><strong>${esc(bp.name)}:</strong></p>`
    html += `<p class="vedic-metadata__breath-counts">${bp.inhaleSec}s in • ${bp.holdSec}s hold • ${bp.exhaleSec}s out</p>`
    html += '</div>'
  }

  // Postures
  if (showPostures && template.postures?.length) {
    html += '<div class="vedic-metadata__section">'
    html += '<h4 class="vedic-metadata__heading">Recommended Postures</h4>'
    html += '<ul class="vedic-metadata__list">'
    for (const posture of template.postures) {
      html += `<li>${esc(posture)}</li>`
    }
    html += '</ul>'
    html += '</div>'
  }

  // Practice notes
  if (showPracticeNotes && template.practiceNotes) {
    html += '<div class="vedic-metadata__section">'
    html += `<p class="vedic-metadata__text"><strong>Practice Guide:</strong> ${esc(template.practiceNotes)}</p>`
    html += '</div>'
  }

  // Time of day
  if (template.timeOfDay) {
    html += '<div class="vedic-metadata__section">'
    html += `<p class="vedic-metadata__text"><strong>Optimal Time:</strong> ${esc(template.timeOfDay)}</p>`
    html += '</div>'
  }

  // Seasonal alignment
  if (template.seasonalAlignment?.length) {
    html += '<div class="vedic-metadata__section">'
    html += `<p class="vedic-metadata__text"><strong>Seasons:</strong> ${esc(template.seasonalAlignment.join(', '))}</p>`
    html += '</div>'
  }

  html += '</div>'
  return html
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Returns true if template has significant Vedic metadata to display
 */
export function hasVedicMetadata(template: BinauralTemplate | null): boolean {
  if (!template) return false
  return !!(
    template.vedicSources?.length ||
    template.vedaVerification ||
    template.associatedChakra ||
    template.mantras?.length ||
    template.breathingPattern ||
    template.postures?.length ||
    template.practiceNotes ||
    template.timeOfDay ||
    template.seasonalAlignment?.length
  )
}
