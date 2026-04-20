/**
 * 9 Nāda Brahma Life Mode protocols from the Vedic frequency guide.
 * Each mode specifies frequency stacks, posture, mudra, mantra, and time of day.
 * Modes map 1:1 to the 9 Intention entries in intentions.ts.
 */

export interface FrequencyStack {
  /** Binaural beat Hz (interaural difference) */
  beatHz: number
  /** Carrier frequency in Hz */
  carrierHz: number
  /** Template ID from vedicFrequencies.ts or binauralTemplates.ts */
  templateId: string
  /** Practice purpose from guide */
  purpose: string
  /** Method of practice from guide */
  method: string
  /** Recommended duration in minutes */
  durationMin: number
}

export interface LifeMode {
  /** Kebab-case identifier, matches Intention.id */
  id: string
  /** Mode number 1–9 */
  number: number
  /** English name */
  name: string
  /** Sanskrit name */
  sanskritName: string
  /** Sanskrit meaning / state description */
  sanskritMeaning: string
  /** Unicode glyph for the tile icon */
  icon: string
  /** CSS hex color for the tile accent */
  color: string
  /** Frequency stacks ordered by priority */
  stacks: readonly FrequencyStack[]
  /** Index into stacks[] to use as the default */
  defaultStackIndex: number
  /** Primary posture instruction */
  posture: string
  /** Primary mudra */
  mudra: string
  /** Primary mantra */
  mantra: string
  /** How many times to repeat the mantra (3 or 108) */
  mantraCount: number
  /** Recommended time of day */
  timeOfDay?: string
  /** Hour range for the daily schedule (24-hour) */
  dailyScheduleSlot?: { startHour: number; endHour: number }
}

export const LIFE_MODES: readonly LifeMode[] = [
  // Mode 1 — Deep Sleep (Sushupti)
  {
    id: 'deep-sleep',
    number: 1,
    name: 'Deep Sleep',
    sanskritName: 'Sushupti',
    sanskritMeaning: 'Ego fully dissolved; subconscious wide open',
    icon: '\u263D', // crescent moon
    color: '#2a3a5c',
    stacks: [
      {
        beatHz: 0.98,
        carrierHz: 200,
        templateId: 'vedic-delta-seed-0.98',
        purpose: 'Fall asleep faster',
        method: 'Pillow speaker; low volume; begin 20 min before sleep',
        durationMin: 480,
      },
      {
        beatHz: 3.0,
        carrierHz: 200,
        templateId: 'vedic-delta-healing-3',
        purpose: 'Deep REM healing',
        method: 'Room speaker at low volume all night; no headphones',
        durationMin: 480,
      },
      {
        beatHz: 3.2,
        carrierHz: 200,
        templateId: 'vedic-deep-delta-3.2',
        purpose: 'Deepest unconscious reprogramming',
        method: 'Shavasana; state Sankalpa 3× aloud before sleep',
        durationMin: 480,
      },
    ],
    defaultStackIndex: 0,
    posture: 'Shavasana — flat on back, arms at sides, palms facing upward',
    mudra: 'Chin Mudra (index + thumb) during pre-sleep practice',
    mantra: 'Om Tat Sat',
    mantraCount: 3,
    timeOfDay: 'Before sleep (10 PM onward)',
    dailyScheduleSlot: { startHour: 22, endHour: 6 },
  },

  // Mode 2 — Relax (Pratyahara)
  {
    id: 'relax',
    number: 2,
    name: 'Relax',
    sanskritName: 'Pratyahara',
    sanskritMeaning: 'Withdrawal of senses; stress dissolves',
    icon: '\u2766', // fleuron
    color: '#3d5a47',
    stacks: [
      {
        beatHz: 4.84,
        carrierHz: 200,
        templateId: 'vedic-theta-phi-4.84',
        purpose: 'Immediate stress and anxiety relief',
        method: 'Headphones; 4-count inhale, 4-count exhale',
        durationMin: 25,
      },
      {
        beatHz: 6.33,
        carrierHz: 432,
        templateId: 'vedic-sankalpa-6.32',
        purpose: 'Emotional release',
        method: 'Nadi Shodhana (9 rounds) while listening',
        durationMin: 20,
      },
      {
        beatHz: 7.83,
        carrierHz: 432,
        templateId: 'vedic-theta-aum-7.83',
        purpose: 'Deep meditative relaxation',
        method: 'Sukhasana; Chin Mudra; let mind float',
        durationMin: 30,
      },
    ],
    defaultStackIndex: 0,
    posture: 'Sukhasana or Shavasana',
    mudra: 'Chin Mudra (index + thumb, palms on knees)',
    mantra: 'So Hum',
    mantraCount: 108,
    timeOfDay: 'Evening decompression (6–7 PM) or anytime stress arises',
    dailyScheduleSlot: { startHour: 18, endHour: 19 },
  },

  // Mode 3 — Focus (Dharana)
  {
    id: 'focus',
    number: 3,
    name: 'Focus',
    sanskritName: 'Dharana',
    sanskritMeaning: 'One-pointed concentrated attention',
    icon: '\u2736', // six-pointed star
    color: '#8b6914',
    stacks: [
      {
        beatHz: 10.0,
        carrierHz: 200,
        templateId: 'vedic-alpha-clarity-10',
        purpose: 'Relaxed alert focus',
        method: 'Low volume background; single task only',
        durationMin: 90,
      },
      {
        beatHz: 12.67,
        carrierHz: 432,
        templateId: 'vedic-alpha-phi-12.67',
        purpose: 'Flow state; creative work',
        method: '3 Ujjayi breaths before; then work naturally',
        durationMin: 90,
      },
      {
        beatHz: 23.49,
        carrierHz: 432,
        templateId: 'vedic-beta-execution-23.49',
        purpose: 'Productive execution',
        method: 'Low background volume; Karma Yoga mindset',
        durationMin: 90,
      },
    ],
    defaultStackIndex: 0,
    posture: 'Upright seated; Gyan Mudra (index + thumb, palms on knees)',
    mudra: 'Gyan Mudra (index finger + thumb)',
    mantra: 'Om Gam Ganapataye Namaha',
    mantraCount: 21,
    timeOfDay: 'Morning and afternoon work hours (8 AM – 6 PM)',
    dailyScheduleSlot: { startHour: 8, endHour: 18 },
  },

  // Mode 4 — Ultra Focus (Spanda)
  {
    id: 'ultra-focus',
    number: 4,
    name: 'Ultra Focus',
    sanskritName: 'Spanda',
    sanskritMeaning: "Shiva's consciousness in full operational power",
    icon: '\u26A1', // lightning bolt
    color: '#6b2d7a',
    stacks: [
      {
        beatHz: 40.0,
        carrierHz: 200,
        templateId: 'vedic-spanda-power-40',
        purpose: 'Peak cognitive performance',
        method: '3 Ujjayi breaths; upright spine; complete immersion',
        durationMin: 120,
      },
      {
        beatHz: 33.18,
        carrierHz: 528,
        templateId: 'vedic-beta-sharp-33.18',
        purpose: 'Maximum executive function',
        method: 'Use for decisions, negotiations, complex problems',
        durationMin: 60,
      },
      {
        beatHz: 62.64,
        carrierHz: 432,
        templateId: 'vedic-gamma-ashta-62.64',
        purpose: 'Visionary breakthrough thinking',
        method: '5 min Trataka (candle gaze) before starting',
        durationMin: 90,
      },
    ],
    defaultStackIndex: 0,
    posture: 'Virasana (hero pose) or power-seated; perfect spinal alignment',
    mudra: 'Kali Mudra (fingers interlaced, index fingers pointing up)',
    mantra: 'Om Namah Shivaya',
    mantraCount: 11,
    timeOfDay: 'Peak energy hours (12 PM – 2 PM)',
    dailyScheduleSlot: { startHour: 12, endHour: 14 },
  },

  // Mode 5 — Knowledge & Wisdom (Jnana)
  {
    id: 'knowledge',
    number: 5,
    name: 'Knowledge & Wisdom',
    sanskritName: 'Jnana',
    sanskritMeaning: "Illumined intelligence; Saraswati's domain",
    icon: '\u1F4D6', // book (fallback: \u2605 star)
    color: '#1a5c6b',
    stacks: [
      {
        beatHz: 7.83,
        carrierHz: 432,
        templateId: 'vedic-theta-aum-7.83',
        purpose: 'Deep learning absorption',
        method: 'Read sacred or technical texts while listening',
        durationMin: 45,
      },
      {
        beatHz: 7.83,
        carrierHz: 720,
        templateId: 'vedic-ajna-vision-dha-720',
        purpose: 'Intuition and inner knowing',
        method: 'Shambhavi Mudra; Trataka 10 min; then eyes closed',
        durationMin: 30,
      },
      {
        beatHz: 40,
        carrierHz: 648,
        templateId: 'vedic-vak-siddhi-pa-648',
        purpose: 'Speech power (Vāksiddhi)',
        method: '1 hr silence before; chant Om Aim Saraswatyai 108×',
        durationMin: 30,
      },
    ],
    defaultStackIndex: 0,
    posture: 'Siddhasana; Chin Mudra',
    mudra: 'Chin Mudra (index + thumb — consciousness union)',
    mantra: 'Om Aim Saraswatyai Namaha',
    mantraCount: 108,
    timeOfDay: 'Brahma Muhurta (4–6 AM) for deepest absorption',
    dailyScheduleSlot: { startHour: 4, endHour: 6 },
  },

  // Mode 6 — Health & Healing (Arogyam)
  {
    id: 'healing',
    number: 6,
    name: 'Health & Healing',
    sanskritName: 'Arogyam',
    sanskritMeaning: "Disease-free radiant vitality; Dhanvantari's blessing",
    icon: '\u2665', // heart
    color: '#2d6b3a',
    stacks: [
      {
        beatHz: 10,
        carrierHz: 528,
        templateId: 'vedic-agni-transformation-528',
        purpose: 'Activating energy practice',
        method: 'Shavasana or seated; visualize warmth at Manipura',
        durationMin: 40,
      },
      {
        beatHz: 10,
        carrierHz: 432,
        templateId: 'vedic-lakshmi-nada-432',
        purpose: 'Daily vitality and relaxed alertness',
        method: 'Daily; any relaxed posture; pair with Sattvic diet',
        durationMin: 30,
      },
      {
        beatHz: 10,
        carrierHz: 648,
        templateId: 'vedic-heart-bridge-pa-648',
        purpose: 'Heart-centered coherence (Pa / perfect fifth)',
        method: 'Heart-focused breathing: 5 counts in, 5 counts out',
        durationMin: 20,
      },
    ],
    defaultStackIndex: 0,
    posture: 'Shavasana or Sukhasana',
    mudra: 'Hakini Mudra (all fingertips touching partner fingertips)',
    mantra: 'Om Dhanvantre Namaha',
    mantraCount: 108,
    timeOfDay: 'Morning (5–6 AM) for Surya energy; evening for repair',
    dailyScheduleSlot: { startHour: 5, endHour: 6 },
  },

  // Mode 7 — Wealth & Abundance (Riddhi-Siddhi)
  {
    id: 'wealth',
    number: 7,
    name: 'Wealth & Abundance',
    sanskritName: 'Riddhi-Siddhi',
    sanskritMeaning: "Prosperity and perfection; Lakshmi's domain",
    icon: '\u0950', // Om symbol
    color: '#7a5c00',
    stacks: [
      {
        beatHz: 10,
        carrierHz: 432,
        templateId: 'vedic-lakshmi-nada-432',
        purpose: 'Lakshmi alignment; abundance practice',
        method: 'Dawn facing East; Varada Mudra; chant Sri Sukta',
        durationMin: 30,
      },
      {
        beatHz: 10,
        carrierHz: 480,
        templateId: 'vedic-manifestation-stack-432-528',
        purpose: 'Mid-register carrier for triple-bija practice',
        method: 'Hakini Mudra; 9 rounds Nadi Shodhana; Shreem Hreem Kleem 108×',
        durationMin: 30,
      },
      {
        beatHz: 6.33,
        carrierHz: 432,
        templateId: 'vedic-sankalpa-6.32',
        purpose: 'Subconscious wealth programming',
        method: '108× "Aham Brahmasmi" on mala; whisper in sync',
        durationMin: 20,
      },
    ],
    defaultStackIndex: 0,
    posture: 'Padmasana; Lotus Mudra at heart',
    mudra: 'Varada Mudra (right palm open, facing outward — boon-giving)',
    mantra: 'Om Shreem Mahalakshmiyei Namaha',
    mantraCount: 108,
    timeOfDay: 'Dawn (4:30–5 AM) and evening (7–8 PM)',
    dailyScheduleSlot: { startHour: 19, endHour: 20 },
  },

  // Mode 8 — Love & Relationships (Prema)
  {
    id: 'love',
    number: 8,
    name: 'Love & Relationships',
    sanskritName: 'Prema',
    sanskritMeaning: 'Unconditional divine love; Anahata wide open',
    icon: '\u2764', // red heart
    color: '#7a2d4a',
    stacks: [
      {
        beatHz: 10,
        carrierHz: 648,
        templateId: 'vedic-heart-bridge-pa-648',
        purpose: 'Heart opening; self-love (Pa / perfect fifth)',
        method: 'Both palms over heart; Hridaya Mudra; breathe love into chest',
        durationMin: 20,
      },
      {
        beatHz: 10,
        carrierHz: 648,
        templateId: 'vedic-love-fusion-pa-648',
        purpose: 'Bhakti practice; heart-centered attention',
        method: 'Visualize pink and gold light merging at heart',
        durationMin: 30,
      },
      {
        beatHz: 10,
        carrierHz: 432,
        templateId: 'vedic-lakshmi-nada-432',
        purpose: 'Deepen existing bond',
        method: 'Practice with partner; synchronized breathing; Trataka',
        durationMin: 20,
      },
    ],
    defaultStackIndex: 0,
    posture: 'Sukhasana; both hands over heart',
    mudra: 'Hridaya Mudra (index at base of thumb, middle + ring on thumb tip, pinky extended)',
    mantra: 'Om Kleem Krishnaya Namaha',
    mantraCount: 108,
    timeOfDay: 'Evening (7–8 PM)',
    dailyScheduleSlot: { startHour: 19, endHour: 20 },
  },

  // Mode 9 — Spiritual Ascension (Turiya)
  {
    id: 'spiritual',
    number: 9,
    name: 'Spiritual Ascension',
    sanskritName: 'Turiya',
    sanskritMeaning: 'The fourth state beyond waking, dream, and deep sleep',
    icon: '\u2609', // sun circle (Brahman symbol)
    color: '#3d1a6b',
    stacks: [
      {
        beatHz: 7.83,
        carrierHz: 810,
        templateId: 'vedic-brahmarandhra-crown-ni-810',
        purpose: 'Crown practice (Ni / Sahasrara)',
        method: 'Shavasana; Khechari Mudra; silent AUM as vibration',
        durationMin: 45,
      },
      {
        beatHz: 4.84,
        carrierHz: 864,
        templateId: 'vedic-parabrahman-octave-864',
        purpose: 'Witness-consciousness inquiry (Turiya pointer)',
        method: 'Absolute silence; no mantra; pure witness; Neti Neti',
        durationMin: 45,
      },
      {
        beatHz: 7.83,
        carrierHz: 720,
        templateId: 'vedic-ajna-vision-dha-720',
        purpose: 'Third-eye practice (Dha / Ajna)',
        method: 'Shambhavi Mahamudra; dawn; East-facing; silence before and after',
        durationMin: 30,
      },
    ],
    defaultStackIndex: 0,
    posture: 'Padmasana or Siddhasana',
    mudra: 'Khechari Mudra (tongue folded to palate) for advanced; Chin Mudra for beginners',
    mantra: 'AUM — then silence as the true practice',
    mantraCount: 3,
    timeOfDay: 'Brahma Muhurta (4–4:30 AM)',
    dailyScheduleSlot: { startHour: 4, endHour: 4 },
  },
]

const MODE_INDEX = new Map(LIFE_MODES.map((m) => [m.id, m]))

export function getLifeModeById(id: string): LifeMode | undefined {
  return MODE_INDEX.get(id)
}
