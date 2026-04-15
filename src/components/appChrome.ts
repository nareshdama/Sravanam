/**
 * Shared top chrome — wordmark returns to landing (Part 4 screen flow).
 */

import { goHome } from '../app'

/** HTML for the Sravanam home header (non-landing screens). */
export function renderAppChrome(modifierClass = ''): string {
  const extra = modifierClass ? ` ${modifierClass}` : ''
  return `
    <header class="app-chrome${extra}">
      <button type="button" class="app-chrome__home" id="app-home" aria-label="Sravanam home">
        Sravanam
      </button>
    </header>
  `
}

/** Wire the home button inside `root` (call after innerHTML is set). */
export function wireAppHome(root: HTMLElement): void {
  const btn = root.querySelector<HTMLButtonElement>('#app-home')
  if (!btn) return
  btn.addEventListener('click', () => {
    goHome()
  })
}
