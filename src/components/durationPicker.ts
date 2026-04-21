/**
 * Duration Picker Component — Segmented control for session length
 */

import { sessionStore } from '../state/sessionState'

const DURATIONS = [
  { value: null, label: '\u221E' }, // Infinity / Open-ended
  { value: 10, label: '10m' },
  { value: 20, label: '20m' },
  { value: 45, label: '45m' },
  { value: 60, label: '1h' }
]

export function renderDurationPicker(activeDurationMinutes: number | null): string {
  return `
    <div class="segmented" role="radiogroup" aria-label="Session duration">
      ${DURATIONS.map(d => `
        <button
          type="button"
          class="segmented__option duration-btn"
          role="radio"
          aria-checked="${activeDurationMinutes === d.value}"
          data-duration="${d.value === null ? 'infinity' : d.value}"
          style="min-width: 3.5rem"
        >
          ${d.label}
        </button>
      `).join('')}
    </div>
  `
}

export function wireDurationPicker(root: HTMLElement, onChange?: () => void): void {
  const btns = root.querySelectorAll<HTMLButtonElement>('.duration-btn')
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const valStr = btn.dataset.duration
      const durationMinutes = valStr === 'infinity' ? null : parseInt(valStr || '0', 10)
      
      sessionStore.set({ durationMinutes })
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(10) } catch(e) {}
      }

      btns.forEach(b => b.setAttribute('aria-checked', 'false'))
      btn.setAttribute('aria-checked', 'true')
      
      if (onChange) onChange()
    })
  })
}
