/**
 * Intention layer — maps user goals ("What do you need right now?")
 * to binaural template selections and ambient bed defaults.
 */

import type { Brainwave } from './binauralTemplates'
import type { SoundLibraryMode } from './vedicSoundLibrary'

export interface Intention {
  id: string
  title: string
  subtitle: string
  description: string
  /** Unicode glyph or future SVG path / symbol reference */
  icon: string
  brainwaves: Brainwave[]
  /** Best single template for this intention */
  defaultTemplateId: string
  /** Other good templates the user can switch to */
  alternateTemplateIds: string[]
  /** Default ambient bed */
  defaultBed: SoundLibraryMode
  /** Card accent color (CSS value) */
  color: string
  /** SVG illustration ID (sprite / asset lookup) */
  illustration: string
}

export const INTENTIONS: readonly Intention[] = [
  {
    id: 'rest',
    title: 'Rest',
    subtitle: 'Release the day',
    description: 'Low delta waves invite the body toward sleep.',
    icon: '\u263D',
    brainwaves: ['delta'],
    defaultTemplateId: 'delta-0.5-2',
    alternateTemplateIds: ['delta-3'],
    defaultBed: 'nada',
    color: '#4a6fa5',
    illustration: 'moon-lotus',
  },
  {
    id: 'calm',
    title: 'Calm',
    subtitle: 'Settle the breath',
    description: 'Alpha rhythms mirror a quiet, alert mind.',
    icon: '\u2766',
    brainwaves: ['alpha'],
    defaultTemplateId: 'alpha-10.5',
    alternateTemplateIds: ['alpha-8-10', 'alpha-11'],
    defaultBed: 'om',
    color: '#6b8e6b',
    illustration: 'leaf-spiral',
  },
  {
    id: 'focus',
    title: 'Focus',
    subtitle: 'Sharpen attention',
    description: 'Beta entrainment supports sustained concentration.',
    icon: '\u2736',
    brainwaves: ['beta', 'alpha-beta'],
    defaultTemplateId: 'beta-20',
    alternateTemplateIds: ['alpha-beta-12-15', 'beta-28-30'],
    defaultBed: 'off',
    color: '#c8a246',
    illustration: 'flame-single',
  },
  {
    id: 'deep',
    title: 'Deep',
    subtitle: 'Turn inward',
    description: 'Theta waves accompany meditative absorption.',
    icon: '\u2609',
    brainwaves: ['theta'],
    defaultTemplateId: 'theta-5-7-yoga',
    alternateTemplateIds: ['theta-7.83', 'theta-7', 'theta-4', 'theta-5-6'],
    defaultBed: 'cosmic',
    color: '#7b5ea7',
    illustration: 'eye-closed',
  },
] as const

export function getIntentionById(id: string): Intention | undefined {
  return INTENTIONS.find((i) => i.id === id)
}

/** All template IDs reachable from an intention (default + alternates). */
export function getIntentionTemplateIds(intention: Intention): string[] {
  return [intention.defaultTemplateId, ...intention.alternateTemplateIds]
}
