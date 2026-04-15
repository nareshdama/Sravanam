/**
 * Labels for optional ambient “bed” layers mixed under the binaural carrier.
 * These are modern syntheses inspired by themes in Indian sonic philosophy (nāda,
 * praṇava, universal tone); they are not archival recordings or ritual substitutes.
 */

export type SoundLibraryMode = 'off' | 'om' | 'cosmic' | 'nada'

export interface SoundLibraryEntry {
  id: SoundLibraryMode
  title: string
  /** Short label for the select */
  subtitle: string
  /** One-line note shown in UI */
  note: string
}

export const SOUND_LIBRARY_DISCLAIMER =
  'Synthesized in your browser — evocative of nāda / śruti themes, not archival chanting or a substitute for traditional study.'

export const SOUND_LIBRARY_ENTRIES: readonly SoundLibraryEntry[] = [
  {
    id: 'off',
    title: 'Binaural only',
    subtitle: 'Carrier + beat only',
    note: 'No extra bed layer.',
  },
  {
    id: 'om',
    title: 'Praṇava-inspired drone (Oṃ)',
    subtitle: 'Harmonic stack ~136 Hz',
    note: 'Additive sine partials (≈136 / 272 / 408 Hz) — a modern nod to praṇava / “Oṃ” as described in many texts, not a field recording of chanting.',
  },
  {
    id: 'cosmic',
    title: 'Ākāśa — cosmic bed',
    subtitle: 'Soft filtered noise',
    note: 'Gentle airy pad — metaphor for spacious “cosmic” backgrounds in contemplative listening; not a claim about physics or scripture.',
  },
  {
    id: 'nada',
    title: 'Nāda — low beating pair',
    subtitle: 'Two detuned lows',
    note: 'Slow-beating sine pair in a low register — loosely evocative of nāda / unstruck–struck sound discussions in darśana; still pure synthesis.',
  },
] as const

export function getSoundLibraryEntry(id: SoundLibraryMode): SoundLibraryEntry {
  const e = SOUND_LIBRARY_ENTRIES.find((x) => x.id === id)
  return e ?? SOUND_LIBRARY_ENTRIES[0]!
}
