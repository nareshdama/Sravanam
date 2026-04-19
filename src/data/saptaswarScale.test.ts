import { describe, it, expect } from 'vitest'
import {
  SAPTASWAR_SCALE,
  getNoteByHz,
  getNearestNote,
  verifyRatioMath,
} from './saptaswarScale'

describe('saptaswarScale', () => {
  it('has exactly 7 notes', () => {
    expect(SAPTASWAR_SCALE).toHaveLength(7)
  })

  it('starts with Sa at 432 Hz', () => {
    expect(SAPTASWAR_SCALE[0].note).toBe('Sa')
    expect(SAPTASWAR_SCALE[0].hz).toBe(432)
    expect(SAPTASWAR_SCALE[0].ratio).toBe('1:1')
  })

  it('ends with Ni at 810 Hz', () => {
    const ni = SAPTASWAR_SCALE[6]
    expect(ni.note).toBe('Ni')
    expect(ni.hz).toBe(810)
    expect(ni.ratio).toBe('15:8')
  })

  it('all notes have the correct Hz from Sa=432 and their ratio', () => {
    const SA = 432
    for (const note of SAPTASWAR_SCALE) {
      const expected = SA * (note.ratioNum / note.ratioDen)
      expect(note.hz).toBeCloseTo(expected, 1)
    }
  })

  it('verifyRatioMath returns true', () => {
    expect(verifyRatioMath()).toBe(true)
  })

  it('all 7 Hz values: Sa=432, Ri=486, Ga=540, Ma=576, Pa=648, Dha=720, Ni=810', () => {
    const hz = SAPTASWAR_SCALE.map((n) => n.hz)
    expect(hz).toEqual([432, 486, 540, 576, 648, 720, 810])
  })

  it('all notes have unique Hz values', () => {
    const hzValues = SAPTASWAR_SCALE.map((n) => n.hz)
    expect(new Set(hzValues).size).toBe(7)
  })

  it('all notes have non-empty Sanskrit names and chakras', () => {
    for (const note of SAPTASWAR_SCALE) {
      expect(note.sanskrit.length).toBeGreaterThan(0)
      expect(note.chakra.length).toBeGreaterThan(0)
      expect(note.chakraSanskrit.length).toBeGreaterThan(0)
    }
  })

  it('getNoteByHz returns correct note for exact match', () => {
    expect(getNoteByHz(432)?.note).toBe('Sa')
    expect(getNoteByHz(486)?.note).toBe('Ri')
    expect(getNoteByHz(810)?.note).toBe('Ni')
  })

  it('getNoteByHz returns undefined for non-scale Hz', () => {
    expect(getNoteByHz(440)).toBeUndefined()
    expect(getNoteByHz(528)).toBeUndefined()
  })

  it('getNearestNote returns closest note', () => {
    expect(getNearestNote(432).note).toBe('Sa')
    expect(getNearestNote(500).note).toBe('Ri')   // 500 closer to 486 than 540
    expect(getNearestNote(700).note).toBe('Dha')  // 700 closer to 720 than 648
    expect(getNearestNote(810).note).toBe('Ni')
  })

  it('notes are ordered from lowest to highest Hz', () => {
    for (let i = 1; i < SAPTASWAR_SCALE.length; i++) {
      expect(SAPTASWAR_SCALE[i].hz).toBeGreaterThan(SAPTASWAR_SCALE[i - 1].hz)
    }
  })
})
