/**
 * Intention layer — maps the 9 Nāda Brahma Life Mode protocols to
 * binaural template selections and ambient bed defaults.
 * Replaces the earlier 5-intention (rest/calm/focus/deep/vedic) system.
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
  // 1. Deep Sleep — Sushupti
  {
    id: 'deep-sleep',
    title: 'Deep Sleep',
    subtitle: 'Sushupti — ego dissolves',
    description: 'Delta waves invite the deepest subconscious reprogramming during sleep.',
    icon: '\u263D', // crescent moon
    brainwaves: ['delta'],
    defaultTemplateId: 'vedic-deep-sleep-aum-136.1',
    alternateTemplateIds: [
      'vedic-delta-healing-3',
      'vedic-aum-drone-136.1',
      'vedic-deep-delta-3.2',
      'vedic-delta-seed-0.5-4',
      'vedic-delta-seed-0.98',
    ],
    defaultBed: 'om',
    color: '#2a3a5c',
    illustration: 'moon-lotus',
  },

  // 2. Relax — Pratyahara
  {
    id: 'relax',
    title: 'Relax',
    subtitle: 'Pratyahara — senses withdraw',
    description: 'Theta frequencies dissolve stress and open the inner space.',
    icon: '\u2766', // fleuron
    brainwaves: ['theta'],
    defaultTemplateId: 'vedic-theta-relax-sa-432',
    alternateTemplateIds: [
      'vedic-sleep-onset-aum-136.1',
      'vedic-sankalpa-6.32',
      'vedic-sankalpa-shakti-7.5',
      'vedic-theta-aum-7.83',
      'vedic-lipton-theta-6',
      'vedic-sankalpa-theta-4-8',
      'vedic-theta-phi-4.84',
    ],
    defaultBed: 'om',
    color: '#3d5a47',
    illustration: 'leaf-spiral',
  },

  // 3. Focus — Dharana
  {
    id: 'focus',
    title: 'Focus',
    subtitle: 'Dharana — one-pointed mind',
    description: 'Alpha-beta frequencies support sustained concentration and flow.',
    icon: '\u2736', // six-pointed star
    brainwaves: ['alpha', 'beta'],
    defaultTemplateId: 'vedic-smr-focus-sa-432',
    alternateTemplateIds: [
      'vedic-beta-attention-sa-432',
      'vedic-alpha-clarity-10',
      'vedic-alpha-phi-12.67',
      'vedic-beta-execution-23.49',
      'vedic-beta-execution-12-30',
      'vedic-billionaire-brain-10',
    ],
    defaultBed: 'off',
    color: '#8b6914',
    illustration: 'flame-single',
  },

  // 4. Ultra Focus — Spanda
  {
    id: 'ultra-focus',
    title: 'Ultra Focus',
    subtitle: "Spanda — Shiva's power",
    description: 'Gamma frequencies unlock peak cognition and visionary thinking.',
    icon: '\u26A1', // lightning bolt
    brainwaves: ['gamma', 'beta'],
    defaultTemplateId: 'vedic-fortune-gate-dha-720',
    alternateTemplateIds: [
      'vedic-spanda-power-40',
      'vedic-beta-sharp-33.18',
      'vedic-gamma-ashta-62.64',
      'vedic-gamma-sovereignty-30-100',
    ],
    defaultBed: 'off',
    color: '#6b2d7a',
    illustration: 'lightning',
  },

  // 5. Knowledge & Wisdom — Jnana
  {
    id: 'knowledge',
    title: 'Knowledge',
    subtitle: "Jnana — Saraswati's light",
    description: 'Theta-alpha and solfeggio carriers illuminate learning and intuition.',
    icon: '\u2605', // star (book glyph not reliable cross-platform)
    brainwaves: ['theta', 'alpha', 'gamma'],
    defaultTemplateId: 'vedic-theta-aum-7.83',
    alternateTemplateIds: [
      'vedic-ajna-vision-dha-720',
      'vedic-vak-siddhi-pa-648',
      'vedic-jupiter-prosperity-7-8',
      'vedic-alpha-phi-12.67',
    ],
    defaultBed: 'om',
    color: '#1a5c6b',
    illustration: 'open-eye',
  },

  // 6. Health & Healing — Arogyam
  {
    id: 'healing',
    title: 'Healing',
    subtitle: 'Arogyam — Dhanvantari',
    description: 'Activating-carrier practice paired with heart-centered breath.',
    icon: '\u2665', // heart
    brainwaves: ['alpha'],
    defaultTemplateId: 'vedic-heart-bridge-pa-648',
    alternateTemplateIds: [
      'vedic-agni-transformation-528',
      'vedic-lakshmi-nada-432',
      'vedic-manifestation-stack-432-528',
    ],
    defaultBed: 'om',
    color: '#2d6b3a',
    illustration: 'lotus',
  },

  // 7. Wealth & Abundance — Riddhi-Siddhi
  {
    id: 'wealth',
    title: 'Wealth',
    subtitle: "Riddhi-Siddhi — Lakshmi's grace",
    description: 'Sacred frequencies aligned with Lakshmi Tattva and prosperity consciousness.',
    icon: '\u0950', // Om
    brainwaves: ['alpha', 'theta', 'gamma'],
    defaultTemplateId: 'vedic-lakshmi-nada-432',
    alternateTemplateIds: [
      'vedic-manifestation-stack-432-528',
      'vedic-sankalpa-6.32',
      'vedic-aishwarya-octave-864',
      'vedic-fortune-gate-dha-720',
      'vedic-lakshmi-stack-octave-864',
      'vedic-love-fusion-pa-648',
    ],
    defaultBed: 'om',
    color: '#7a5c00',
    illustration: 'flame-single',
  },

  // 8. Love & Relationships — Prema
  {
    id: 'love',
    title: 'Love',
    subtitle: 'Prema — Anahata opens',
    description: 'Heart-centered frequencies dissolve separation and open divine love.',
    icon: '\u2764', // red heart
    brainwaves: ['alpha'],
    defaultTemplateId: 'vedic-heart-bridge-pa-648',
    alternateTemplateIds: [
      'vedic-love-fusion-pa-648',
      'vedic-lakshmi-nada-432',
    ],
    defaultBed: 'om',
    color: '#7a2d4a',
    illustration: 'heart-lotus',
  },

  // 9. Spiritual Ascension — Turiya
  {
    id: 'spiritual',
    title: 'Spiritual',
    subtitle: 'Turiya — the fourth state',
    description: 'Crown frequencies dissolve the ego and approach Moksha.',
    icon: '\u2609', // sun circle
    brainwaves: ['gamma'],
    defaultTemplateId: 'vedic-brahmarandhra-crown-ni-810',
    alternateTemplateIds: [
      'vedic-parabrahman-octave-864',
      'vedic-ajna-vision-dha-720',
      'vedic-gamma-sovereignty-30-100',
      'vedic-turiya-gamma-60',
      'vedic-turiya-gamma-80',
    ],
    defaultBed: 'nada',
    color: '#3d1a6b',
    illustration: 'crown-lotus',
  },
] as const

export function getIntentionById(id: string): Intention | undefined {
  return INTENTIONS.find((i) => i.id === id)
}

/** All template IDs reachable from an intention (default + alternates). */
export function getIntentionTemplateIds(intention: Intention): string[] {
  return [intention.defaultTemplateId, ...intention.alternateTemplateIds]
}
