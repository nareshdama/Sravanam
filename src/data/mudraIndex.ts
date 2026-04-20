/**
 * 10 Mudras from the Nāda Brahma guide (Part VIII).
 * Each mudra includes Sanskrit glyph, meaning, and best frequency pairings.
 */

export interface Mudra {
  /** English name */
  name: string
  /** Sanskrit transliteration */
  sanskrit: string
  /** Devanagari script glyph */
  devanagari: string
  /** Meaning / purpose */
  meaning: string
  /** Carrier or beat Hz values this mudra pairs best with */
  bestFrequencies: readonly number[]
}

export const MUDRA_INDEX: readonly Mudra[] = [
  {
    name: 'Chin Mudra',
    sanskrit: 'Chin Mudrā',
    devanagari: '\u0909\u0902',
    meaning: 'Consciousness union — index finger + thumb touching',
    bestFrequencies: [7.83, 432, 6.33, 4.84],
  },
  {
    name: 'Gyan Mudra',
    sanskrit: 'Jñāna Mudrā',
    devanagari: '\u091C\u094D\u091E\u093E\u0928',
    meaning: 'Wisdom and knowledge — same as Chin Mudra but palms face down',
    bestFrequencies: [10, 720, 12.67, 23.49],
  },
  {
    name: 'Hridaya Mudra',
    sanskrit: 'Hṛdaya Mudrā',
    devanagari: '\u0939\u0943\u0926\u092F',
    meaning: 'Heart opening — index at base of thumb, middle + ring on thumb tip, pinky extended',
    bestFrequencies: [648, 528, 4.84],
  },
  {
    name: 'Lotus Mudra',
    sanskrit: 'Padma Mudrā',
    devanagari: '\u092A\u0926\u094D\u092E',
    meaning: 'Lakshmi and abundance — wrists touching, fingers open like a blooming lotus',
    bestFrequencies: [432, 528, 480],
  },
  {
    name: 'Kali Mudra',
    sanskrit: 'Kālī Mudrā',
    devanagari: '\u0915\u093E\u0932\u0940',
    meaning: 'Fierce power and ultra focus — all fingers interlaced, index fingers pointing up',
    bestFrequencies: [40, 62.64, 33.18],
  },
  {
    name: 'Varada Mudra',
    sanskrit: 'Varada Mudrā',
    devanagari: '\u0935\u0930\u0926',
    meaning: 'Boon-giving and wealth — right palm open facing outward, fingers pointing down',
    bestFrequencies: [432, 810, 864],
  },
  {
    name: 'Khechari Mudra',
    sanskrit: 'Khecarī Mudrā',
    devanagari: '\u0916\u0947\u091A\u0930\u0940',
    meaning: 'Samadhi gate — tongue folded back toward the palate; advanced practice',
    bestFrequencies: [810, 864],
  },
  {
    name: 'Mula Bandha',
    sanskrit: 'Mūla Bandha',
    devanagari: '\u092E\u0942\u0932',
    meaning: 'Root lock — contraction of the perineum; activates Kundalini',
    bestFrequencies: [136.1, 432],
  },
  {
    name: 'Hakini Mudra',
    sanskrit: 'Hākinī Mudrā',
    devanagari: '\u0939\u093E\u0915\u093F\u0928\u0940',
    meaning: 'All-knowing — all 5 fingertips of both hands touching; activates both hemispheres',
    bestFrequencies: [528, 432, 480],
  },
  {
    name: 'Shambhavi Mudra',
    sanskrit: 'Śāmbhavī Mudrā',
    devanagari: '\u0936\u093E\u092E\u094D\u092D\u0935\u0940',
    meaning: 'Third eye gaze — soft upward gaze between the eyebrows; awakens Ajna',
    bestFrequencies: [720, 810, 12.67],
  },
]

const MUDRA_BY_NAME = new Map(
  MUDRA_INDEX.map((m) => [m.name.toLowerCase(), m])
)

export function getMudraByName(name: string): Mudra | undefined {
  return MUDRA_BY_NAME.get(name.toLowerCase())
}

/**
 * Attempts to find a mudra mentioned anywhere in a string (e.g. posture or practice notes).
 * Returns the first match or undefined.
 */
export function extractMudraFromText(text: string): Mudra | undefined {
  const lower = text.toLowerCase()
  return MUDRA_INDEX.find((m) => lower.includes(m.name.toLowerCase()))
}
