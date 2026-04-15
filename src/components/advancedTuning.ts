/**
 * Advanced tuning disclosure — carrier, beat, waveform, volume.
 * For power users who want manual control.
 */

import { sessionStore } from '../state/sessionState'
import { engine } from '../app'
import {
  clampBinauralFrequencies,
  getBinauralLimits,
} from '../audio/binauralEngine'

function formatHz(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(3).replace(/\.?0+$/, '')} kHz`
  if (n >= 100) return n.toFixed(1)
  if (n >= 10) return n.toFixed(2)
  return n.toFixed(3)
}

export function renderAdvancedTuning(): string {
  const s = sessionStore.get()
  return `
    <details class="disclosure" id="advanced-tuning">
      <summary>Advanced tuning</summary>
      <div style="padding-top: var(--space-md); display: flex; flex-direction: column; gap: var(--space-md)">
        <label class="field">
          <span class="field__label">Carrier (Hz)</span>
          <input type="number" id="adv-carrier" min="1" step="any" value="${s.carrierHz}" />
          <input type="range" id="adv-carrier-range" min="1" max="20000" step="1" value="${s.carrierHz}" />
        </label>
        <label class="field">
          <span class="field__label">Beat / binaural difference (Hz)</span>
          <input type="number" id="adv-beat" min="0" step="any" value="${s.beatHz}" />
          <input type="range" id="adv-beat-range" min="0" max="100" step="0.1" value="${s.beatHz}" />
        </label>
        <label class="field">
          <span class="field__label">Volume</span>
          <input type="range" id="adv-volume" min="0" max="1" step="0.01" value="${s.volume}" />
        </label>
        <div class="field field--inline">
          <span class="field__label">Waveform</span>
          <select id="adv-wave" class="field__select" style="flex: 1; min-width: 8rem">
            <option value="sine" ${s.wave === 'sine' ? 'selected' : ''}>Sine</option>
            <option value="triangle" ${s.wave === 'triangle' ? 'selected' : ''}>Triangle</option>
            <option value="sawtooth" ${s.wave === 'sawtooth' ? 'selected' : ''}>Sawtooth</option>
            <option value="square" ${s.wave === 'square' ? 'selected' : ''}>Square</option>
          </select>
        </div>
        <p class="mono-sm" id="adv-limits" style="text-align: center"></p>
      </div>
    </details>
  `
}

export function wireAdvancedTuning(container: HTMLElement): void {
  const carrierNum = container.querySelector<HTMLInputElement>('#adv-carrier')!
  const carrierRange = container.querySelector<HTMLInputElement>('#adv-carrier-range')!
  const beatNum = container.querySelector<HTMLInputElement>('#adv-beat')!
  const beatRange = container.querySelector<HTMLInputElement>('#adv-beat-range')!
  const volumeEl = container.querySelector<HTMLInputElement>('#adv-volume')!
  const waveEl = container.querySelector<HTMLSelectElement>('#adv-wave')!
  const limitsEl = container.querySelector<HTMLElement>('#adv-limits')!

  function syncFromInputs(): void {
    const sr = engine.getLimits().sampleRate
    const c = Number(carrierNum.value)
    const b = Number(beatNum.value)
    const { carrierHz, beatHz } = clampBinauralFrequencies(sr, c, b)

    carrierNum.value = String(carrierHz)
    carrierRange.value = String(Math.min(Number(carrierRange.max), carrierHz))
    beatNum.value = String(beatHz)
    beatRange.value = String(Math.min(Number(beatRange.max), beatHz))

    engine.setCarrierHz(carrierHz)
    engine.setBeatHz(beatHz)
    sessionStore.set({ carrierHz, beatHz })
    refreshLimits()
  }

  function refreshLimits(): void {
    const sr = engine.getLimits().sampleRate
    const c = Number(carrierNum.value)
    const l = getBinauralLimits(sr, c)
    limitsEl.textContent = `SR ${sr} Hz \u00B7 Carrier ${formatHz(l.minCarrierHz)}\u2013${formatHz(l.maxCarrierHz)} \u00B7 Max beat ${formatHz(l.maxBeatHz)}`
    beatRange.max = String(Math.max(0.1, l.maxBeatHz))
    carrierRange.max = String(l.maxCarrierHz)
  }

  carrierNum.addEventListener('input', () => {
    carrierRange.value = carrierNum.value
    syncFromInputs()
  })
  carrierRange.addEventListener('input', () => {
    carrierNum.value = carrierRange.value
    syncFromInputs()
  })
  beatNum.addEventListener('input', () => {
    beatRange.value = beatNum.value
    syncFromInputs()
  })
  beatRange.addEventListener('input', () => {
    beatNum.value = beatRange.value
    syncFromInputs()
  })
  volumeEl.addEventListener('input', () => {
    const v = Number(volumeEl.value)
    engine.setVolume(v)
    sessionStore.set({ volume: v })
  })
  waveEl.addEventListener('change', () => {
    const w = waveEl.value as OscillatorType
    engine.setWave(w)
    sessionStore.set({ wave: w })
  })

  refreshLimits()
}
