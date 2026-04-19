/**
 * Preset binaural beat targets (Hz = perceived beat = |f_right − f_left|).
 * Carrier is a stereo tone frequency; beat is the interaural difference.
 * Delta/theta/alpha/beta/gamma labels are informal EEG-inspired shorthand, not clinical or śāstra categories.
 */

import { VEDIC_FREQUENCIES } from './vedicFrequencies'

export type Brainwave =
  | 'delta'
  | 'theta'
  | 'alpha'
  | 'beta'
  | 'gamma'
  | 'alpha-beta'

export interface VedicSource {
  text: string        // e.g., "Mandukya Upanishad"
  verse?: string      // e.g., "1.1.1"
  tradition?: string  // e.g., "Advaita", "Tantric"
}

export interface BreathingPattern {
  name: string        // e.g., "Nāḍī Śodhana"
  inhaleSec: number
  holdSec: number
  exhaleSec: number
}

export interface BinauralTemplate {
  id: string
  /** Display string for the beat row (e.g. "0.5–2 Hz", "7.83 Hz") */
  hzLabel: string
  brainwave: Brainwave
  useCase: string
  effect: string
  beatHzMin: number
  beatHzMax: number
  /** Starting beat when applying template (midpoint for ranges) */
  defaultBeatHz: number
  /** Typical carrier for sine binaural beats (Hz) */
  recommendedCarrierHz: number

  // Vedic metadata (all optional for backward compatibility)
  vedicSources?: readonly VedicSource[]
  associatedChakra?: string
  mantras?: readonly string[]
  breathingPattern?: BreathingPattern
  postures?: readonly string[]
  vedaVerification?: string
  practiceNotes?: string
  timeOfDay?: string
  seasonalAlignment?: readonly string[]
}

export const DEFAULT_TEMPLATE_CARRIER_HZ = 200

export const BINAURAL_TEMPLATES: readonly BinauralTemplate[] = [
  {
    id: 'delta-0.5-2',
    hzLabel: '0.5–2 Hz',
    brainwave: 'delta',
    useCase: 'Sleep / rest',
    effect:
      'Very slow beat; some people use this range while lying down or before sleep. For rest contexts only — not a medical treatment.',
    beatHzMin: 0.5,
    beatHzMax: 2,
    defaultBeatHz: 1.25,
    recommendedCarrierHz: DEFAULT_TEMPLATE_CARRIER_HZ,
  },
  {
    id: 'delta-3',
    hzLabel: '3 Hz',
    brainwave: 'delta',
    useCase: 'Sleep / rest',
    effect:
      'Some people listen while winding down before sleep; responses vary and this is not sleep therapy.',
    beatHzMin: 3,
    beatHzMax: 3,
    defaultBeatHz: 3,
    recommendedCarrierHz: DEFAULT_TEMPLATE_CARRIER_HZ,
  },
  {
    id: 'theta-4',
    hzLabel: '4 Hz',
    brainwave: 'theta',
    useCase: 'Wind-down',
    effect:
      'May accompany drowsiness or the transition toward sleep — experiences differ widely.',
    beatHzMin: 4,
    beatHzMax: 4,
    defaultBeatHz: 4,
    recommendedCarrierHz: DEFAULT_TEMPLATE_CARRIER_HZ,
  },
  {
    id: 'theta-5-6',
    hzLabel: '5–6 Hz',
    brainwave: 'theta',
    useCase: 'Contemplation / rest',
    effect:
      'Deep relaxation, imagery, and an open, receptive mood — everyday language, not a clinical or “programming” claim.',
    beatHzMin: 5,
    beatHzMax: 6,
    defaultBeatHz: 5.5,
    recommendedCarrierHz: DEFAULT_TEMPLATE_CARRIER_HZ,
  },
  {
    id: 'theta-5-7-yoga',
    hzLabel: '5–7 Hz',
    brainwave: 'theta',
    useCase: 'Movement practice',
    effect:
      'Some people pair this with slow movement, breath awareness, and calm inward focus — optional listening aid only.',
    beatHzMin: 5,
    beatHzMax: 7,
    defaultBeatHz: 6,
    recommendedCarrierHz: DEFAULT_TEMPLATE_CARRIER_HZ,
  },
  {
    id: 'theta-7',
    hzLabel: '7 Hz',
    brainwave: 'theta',
    useCase: 'Contemplation',
    effect:
      'Relaxed creativity and contemplative mood — subjective and not guaranteed.',
    beatHzMin: 7,
    beatHzMax: 7,
    defaultBeatHz: 7,
    recommendedCarrierHz: DEFAULT_TEMPLATE_CARRIER_HZ,
  },
  {
    id: 'theta-7.83',
    hzLabel: '7.83 Hz',
    brainwave: 'theta',
    useCase: 'Movement practice',
    effect:
      'Schumann resonances are a real geophysical ELF phenomenon in the Earth–ionosphere cavity; headphone binaural tones are not that electromagnetic signal — only a popular analogy. Not grounding therapy or medical care.',
    beatHzMin: 7.83,
    beatHzMax: 7.83,
    defaultBeatHz: 7.83,
    recommendedCarrierHz: DEFAULT_TEMPLATE_CARRIER_HZ,
  },
  {
    id: 'alpha-8-10',
    hzLabel: '8–10 Hz',
    brainwave: 'alpha',
    useCase: 'Movement practice',
    effect:
      'Relaxed alertness and body awareness for gentle practice — if you find it helpful.',
    beatHzMin: 8,
    beatHzMax: 10,
    defaultBeatHz: 9,
    recommendedCarrierHz: DEFAULT_TEMPLATE_CARRIER_HZ,
  },
  {
    id: 'alpha-10.5',
    hzLabel: '10.5 Hz',
    brainwave: 'alpha',
    useCase: 'General / movement',
    effect: 'Softer focus and a calmer subjective feel — not a claim about autonomic or medical effects.',
    beatHzMin: 10.5,
    beatHzMax: 10.5,
    defaultBeatHz: 10.5,
    recommendedCarrierHz: DEFAULT_TEMPLATE_CARRIER_HZ,
  },
  {
    id: 'alpha-11',
    hzLabel: '11 Hz',
    brainwave: 'alpha',
    useCase: 'Focus',
    effect:
      'Relaxed attention and an even pace of attention for some listeners — effects vary.',
    beatHzMin: 11,
    beatHzMax: 11,
    defaultBeatHz: 11,
    recommendedCarrierHz: DEFAULT_TEMPLATE_CARRIER_HZ,
  },
  {
    id: 'alpha-beta-12-15',
    hzLabel: '12–15 Hz',
    brainwave: 'alpha-beta',
    useCase: 'Focus',
    effect:
      'Brighter-feeling attention; some use it before demanding tasks — not a performance guarantee.',
    beatHzMin: 12,
    beatHzMax: 15,
    defaultBeatHz: 13.5,
    recommendedCarrierHz: DEFAULT_TEMPLATE_CARRIER_HZ,
  },
  {
    id: 'beta-20',
    hzLabel: '20 Hz',
    brainwave: 'beta',
    useCase: 'Focus',
    effect:
      'May feel more alert or “woken up” for some people during active thinking — subjective and short sessions are prudent.',
    beatHzMin: 20,
    beatHzMax: 20,
    defaultBeatHz: 20,
    recommendedCarrierHz: DEFAULT_TEMPLATE_CARRIER_HZ,
  },
  {
    id: 'beta-28-30',
    hzLabel: '28–30 Hz',
    brainwave: 'beta',
    useCase: 'Focus',
    effect:
      'Strong-feeling concentration for some listeners; keep sessions short and stop if unpleasant.',
    beatHzMin: 28,
    beatHzMax: 30,
    defaultBeatHz: 29,
    recommendedCarrierHz: DEFAULT_TEMPLATE_CARRIER_HZ,
  },
  {
    id: 'gamma-40',
    hzLabel: '40 Hz',
    brainwave: 'gamma',
    useCase: 'Strong focus',
    effect:
      'High beat rate sometimes explored in research-style audio; evidence for benefit in daily use is limited and individual.',
    beatHzMin: 40,
    beatHzMax: 40,
    defaultBeatHz: 40,
    recommendedCarrierHz: DEFAULT_TEMPLATE_CARRIER_HZ,
  },
] as const

// Build index map for O(1) lookup across both existing and Vedic frequencies
const TEMPLATE_INDEX = new Map<string, BinauralTemplate>()

// Initialize with existing templates
BINAURAL_TEMPLATES.forEach((t) => TEMPLATE_INDEX.set(t.id, t))

// Register all 18 Vedic frequencies
VEDIC_FREQUENCIES.forEach((f) => TEMPLATE_INDEX.set(f.id, f))

export function getTemplateById(id: string): BinauralTemplate | undefined {
  return TEMPLATE_INDEX.get(id)
}

export function registerTemplate(template: BinauralTemplate): void {
  TEMPLATE_INDEX.set(template.id, template)
}

export function getAllTemplates(): BinauralTemplate[] {
  return Array.from(TEMPLATE_INDEX.values())
}

export function getTemplatesByChakra(chakra: string): BinauralTemplate[] {
  return Array.from(TEMPLATE_INDEX.values()).filter(
    (t) => t.associatedChakra === chakra,
  )
}

export function getTemplatesByFrequencyRange(
  minHz: number,
  maxHz: number,
): BinauralTemplate[] {
  return Array.from(TEMPLATE_INDEX.values()).filter(
    (t) => !(t.beatHzMax < minHz || t.beatHzMin > maxHz),
  )
}

export interface ResolvedTemplateFrequencies {
  templateId: string
  carrierHz: number
  beatHz: number
}

/**
 * Picks carrier and beat for playback. Beat is clamped to the template band; apply
 * {@link clampBinauralFrequencies} with the device sample rate before audio output.
 */
export function resolveTemplateFrequencies(
  template: BinauralTemplate,
  options?: { beatHz?: number; carrierHz?: number },
): ResolvedTemplateFrequencies {
  const carrierHz = options?.carrierHz ?? template.recommendedCarrierHz
  const rawBeat =
    options?.beatHz !== undefined
      ? Math.min(
          Math.max(options.beatHz, template.beatHzMin),
          template.beatHzMax,
        )
      : template.defaultBeatHz

  return {
    templateId: template.id,
    carrierHz,
    beatHz: rawBeat,
  }
}
