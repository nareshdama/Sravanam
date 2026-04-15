/**
 * Segmented control for selecting the ambient bed (OM, Cosmic, Nada, Off).
 */

import type { SoundLibraryMode } from '../data/vedicSoundLibrary'

const BED_OPTIONS: { id: SoundLibraryMode; label: string; icon: string }[] = [
  { id: 'off', label: 'None', icon: '\u2014' },
  { id: 'om', label: 'O\u1E43', icon: '\u0950' },
  { id: 'cosmic', label: '\u0100k\u0101\u015Ba', icon: '\u2728' },
  { id: 'nada', label: 'N\u0101da', icon: '\u266B' },
]

export function renderAmbientBedPicker(
  selected: SoundLibraryMode,
  onChange: (bed: SoundLibraryMode) => void,
): string {
  const html = BED_OPTIONS.map(
    (o) => `
    <button
      type="button"
      class="segmented__option"
      data-bed="${o.id}"
      aria-pressed="${o.id === selected}"
      aria-label="${o.label}"
    >
      <span aria-hidden="true">${o.icon}</span>
      <span>${o.label}</span>
    </button>
  `,
  ).join('')

  // Store onChange in a module-level so we can wire it after render
  _pendingOnChange = onChange
  return `<div class="segmented" role="group" aria-label="Ambient bed">${html}</div>`
}

let _pendingOnChange: ((bed: SoundLibraryMode) => void) | null = null

/** Call after innerHTML is set to wire click handlers. */
export function wireAmbientBedPicker(container: HTMLElement): void {
  if (!_pendingOnChange) return
  const onChange = _pendingOnChange
  _pendingOnChange = null

  container.querySelectorAll<HTMLButtonElement>('.segmented__option').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bed = btn.dataset.bed as SoundLibraryMode
      // Update aria-pressed
      container
        .querySelectorAll('.segmented__option')
        .forEach((b) => b.setAttribute('aria-pressed', 'false'))
      btn.setAttribute('aria-pressed', 'true')
      onChange(bed)
    })
  })
}
