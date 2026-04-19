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

/** lightning — two angled bolts for ultra-focus / Spanda */
const LIGHTNING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <path d="M28 8l-8 14h8l-8 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M30 22l-4 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
</svg>`

/** open-eye — Ajna / knowledge / vision */
const OPEN_EYE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <path d="M10 24c4-8 10-12 14-12s10 4 14 12c-4 8-10 12-14 12S14 32 10 24z" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="24" cy="24" r="4" stroke="currentColor" stroke-width="1.2"/>
  <circle cx="24" cy="24" r="1.5" fill="currentColor" opacity="0.8"/>
</svg>`

/** lotus — healing / Arogyam */
const LOTUS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <path d="M24 36c0-6-4-12-4-18 0 6-4 12-4 18" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
  <path d="M24 36c0-6 4-12 4-18 0 6 4 12 4 18" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
  <path d="M24 36c0-8-6-14-6-20 0 6-6 12-6 20" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.85"/>
  <path d="M24 36c0-8 6-14 6-20 0 6 6 12 6 20" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.85"/>
  <path d="M24 12v24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M16 38 Q24 32 32 38" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
</svg>`

/** heart-lotus — love / Prema / Anahata */
const HEART_LOTUS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <path d="M24 34C24 34 12 26 12 18c0-4 3-6 6-6 2.5 0 4.5 1.5 6 4 1.5-2.5 3.5-4 6-4 3 0 6 2 6 6 0 8-12 16-12 16z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M21 30c1-2 3-3 3-3s2 1 3 3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity="0.65"/>
</svg>`

/** crown-lotus — spiritual ascension / Turiya / Sahasrara */
const CROWN_LOTUS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <path d="M24 10 L24 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M24 10 L16 20 L8 16 L14 28 L34 28 L40 16 L32 20 Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
  <path d="M14 28 Q24 36 34 28" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M18 28 Q24 34 30 28" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity="0.7"/>
</svg>`

const BY_ID: Record<string, string> = {
  'moon-lotus': MOON_LOTUS,
  'leaf-spiral': LEAF_SPIRAL,
  'flame-single': FLAME_SINGLE,
  'eye-closed': EYE_CLOSED,
  'lightning': LIGHTNING,
  'open-eye': OPEN_EYE,
  'lotus': LOTUS,
  'heart-lotus': HEART_LOTUS,
  'crown-lotus': CROWN_LOTUS,
}

export function getIntentionIllustrationSvg(illustrationId: string): string {
  return BY_ID[illustrationId] ?? DEFAULT_SVG
}
