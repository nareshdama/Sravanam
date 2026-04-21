/**
 * Breathing Pacer logic.
 * Simple 4-7-8 breathing mechanics.
 */

export type BreathPhase = 'inhale' | 'hold-full' | 'exhale' | 'hold-empty'

export interface BreathState {
  phase: BreathPhase
  /** 0.0 to 1.0, representing lung volume expansion */
  expansion: number
  /** Text suitable for UI ('Inhale', 'Hold', 'Exhale') */
  label: string
}

// 4-7-8 cycle (4s inhale, 7s hold, 8s exhale, 0s hold-empty)
// We'll add a 1s empty hold to match rhythm better
const DURATIONS: Record<BreathPhase, number> = {
  'inhale': 4000,
  'hold-full': 7000,
  'exhale': 8000,
  'hold-empty': 1000
}

export class BreathingEngine {
  private startTime: number = 0
  
  start(): void {
    this.startTime = Date.now()
  }

  getState(): BreathState {
    const elapsed = (Date.now() - this.startTime)
    const totalCycle = DURATIONS['inhale'] + DURATIONS['hold-full'] + DURATIONS['exhale'] + DURATIONS['hold-empty']
    const tCycle = elapsed % totalCycle

    let passed = 0
    
    // Inhale
    if (tCycle < passed + DURATIONS['inhale']) {
      const progress = (tCycle - passed) / DURATIONS['inhale']
      // ease in-out
      return { phase: 'inhale', expansion: this.easeInOutSine(progress), label: 'Inhale...' }
    }
    passed += DURATIONS['inhale']

    // Hold Full
    if (tCycle < passed + DURATIONS['hold-full']) {
      return { phase: 'hold-full', expansion: 1.0, label: 'Hold' }
    }
    passed += DURATIONS['hold-full']

    // Exhale
    if (tCycle < passed + DURATIONS['exhale']) {
      const progress = (tCycle - passed) / DURATIONS['exhale']
      return { phase: 'exhale', expansion: 1.0 - this.easeInOutSine(progress), label: 'Exhale...' }
    }
    passed += DURATIONS['exhale']

    // Hold Empty
    return { phase: 'hold-empty', expansion: 0.0, label: 'Hold' }
  }

  private easeInOutSine(x: number): number {
    return -(Math.cos(Math.PI * x) - 1) / 2;
  }
}

export const breathEngine = new BreathingEngine()
