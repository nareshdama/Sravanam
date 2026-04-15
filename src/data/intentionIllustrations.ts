/**
 * Inline SVG illustrations for intention cards (Part 6 — 48×48, themed via currentColor).
 */

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="10" stroke="currentColor" stroke-width="1.5"/></svg>`

/** moon-lotus — crescent + lotus silhouette */
const MOON_LOTUS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <path d="M28 14c-6 0-11 5-11 11 0 4 2 7.5 5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M18 28c2-4 6-6 10-6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.85"/>
  <path d="M24 34c-1.5-2-1-5 1.5-6.5s5-1 6.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M24 34c1.5-2 1-5-1.5-6.5s-5-1-6.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
</svg>`

/** leaf-spiral — soft leaf curve */
const LEAF_SPIRAL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <path d="M32 10C18 10 10 20 10 28c0 6 4 10 10 10 8 0 14-6 14-14 0-10-8-16-18-16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M14 26c4-6 12-8 18-4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.75"/>
</svg>`

/** flame-single */
const FLAME_SINGLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <path d="M24 8c-4 8-8 12-8 20 0 6 4 12 8 12s8-6 8-12c0-8-4-12-8-20z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M24 22c-2 4-3 8-3 12 0 4 2 6 3 6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
</svg>`

/** eye-closed — meditative closed eye */
const EYE_CLOSED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <path d="M12 24c4-6 10-8 12-8s8 2 12 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M14 26c3.5-3 7-4.5 10-4.5s6.5 1.5 10 4.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.65"/>
  <path d="M18 30h12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
</svg>`

const BY_ID: Record<string, string> = {
  'moon-lotus': MOON_LOTUS,
  'leaf-spiral': LEAF_SPIRAL,
  'flame-single': FLAME_SINGLE,
  'eye-closed': EYE_CLOSED,
}

export function getIntentionIllustrationSvg(illustrationId: string): string {
  return BY_ID[illustrationId] ?? DEFAULT_SVG
}
