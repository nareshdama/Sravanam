/**
 * Gandharva Veda Saptaswar scale — 7 sacred notes from Sa = 432 Hz.
 * Ratios from just intonation (not equal temperament), encoded in the Gandharva Veda.
 * Each note corresponds to a chakra and the Schumann-432 Hz mathematical system.
 */

export interface SaptaswarNote {
  /** Short syllable: "Sa", "Ri", "Ga", "Ma", "Pa", "Dha", "Ni" */
  note: string
  /** Full Sanskrit name */
  sanskrit: string
  /** Just-intonation ratio relative to Sa */
  ratio: string
  /** Numerator of the ratio */
  ratioNum: number
  /** Denominator of the ratio */
  ratioDen: number
  /** Frequency in Hz (Sa = 432 Hz base) */
  hz: number
  /** Associated chakra */
  chakra: string
  /** Chakra Sanskrit name */
  chakraSanskrit: string
}

export const SAPTASWAR_SCALE: readonly SaptaswarNote[] = [
  {
    note: 'Sa',
    sanskrit: 'Shadja',
    ratio: '1:1',
    ratioNum: 1,
    ratioDen: 1,
    hz: 432,
    chakra: 'Root',
    chakraSanskrit: 'Muladhara',
  },
  {
    note: 'Ri',
    sanskrit: 'Rishabha',
    ratio: '9:8',
    ratioNum: 9,
    ratioDen: 8,
    hz: 486,
    chakra: 'Sacral',
    chakraSanskrit: 'Svadhisthana',
  },
  {
    note: 'Ga',
    sanskrit: 'Gandhara',
    ratio: '5:4',
    ratioNum: 5,
    ratioDen: 4,
    hz: 540,
    chakra: 'Solar Plexus',
    chakraSanskrit: 'Manipura',
  },
  {
    note: 'Ma',
    sanskrit: 'Madhyama',
    ratio: '4:3',
    ratioNum: 4,
    ratioDen: 3,
    hz: 576,
    chakra: 'Heart',
    chakraSanskrit: 'Anahata',
  },
  {
    note: 'Pa',
    sanskrit: 'Panchama',
    ratio: '3:2',
    ratioNum: 3,
    ratioDen: 2,
    hz: 648,
    chakra: 'Throat',
    chakraSanskrit: 'Vishuddha',
  },
  {
    note: 'Dha',
    sanskrit: 'Dhaivata',
    ratio: '5:3',
    ratioNum: 5,
    ratioDen: 3,
    hz: 720,
    chakra: 'Third Eye',
    chakraSanskrit: 'Ajna',
  },
  {
    note: 'Ni',
    sanskrit: 'Nishada',
    ratio: '15:8',
    ratioNum: 15,
    ratioDen: 8,
    hz: 810,
    chakra: 'Crown',
    chakraSanskrit: 'Sahasrara',
  },
]

const SA_HZ = 432

/** Returns the note with an exact Hz match, or undefined if none match. */
export function getNoteByHz(hz: number): SaptaswarNote | undefined {
  return SAPTASWAR_SCALE.find((n) => n.hz === hz)
}

/** Returns the note whose Hz is closest to the given value. */
export function getNearestNote(hz: number): SaptaswarNote {
  return SAPTASWAR_SCALE.reduce((closest, note) =>
    Math.abs(note.hz - hz) < Math.abs(closest.hz - hz) ? note : closest
  )
}

/** Verifies that each note's Hz equals Sa (432) × (ratioNum / ratioDen). */
export function verifyRatioMath(): boolean {
  return SAPTASWAR_SCALE.every(
    (n) => Math.abs(n.hz - SA_HZ * (n.ratioNum / n.ratioDen)) < 0.01
  )
}
