/**
 * Advanced tuning disclosure — carrier, beat, waveform, volume.
 * Includes Saptaswar scale picker for snapping carrier to Gandharva Veda notes.
 */

import { sessionStore } from '../state/sessionState'
import { engine } from '../app'
import {
  assessBinauralFusion,
  clampBinauralFrequencies,
  getBinauralLimits,
  type BeatMode,
} from '../audio/binauralEngine'
import { SAPTASWAR_SCALE } from '../data/saptaswarScale'

function formatHz(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(3).replace(/\.?0+$/, '')} kHz`
  if (n >= 100) return n.toFixed(1)
  if (n >= 10) return n.toFixed(2)
  return n.toFixed(3)
}

function renderSaptaswarPicker(currentCarrierHz: number): string {
  const buttons = SAPTASWAR_SCALE.map((note) => {
    const active = note.hz === currentCarrierHz ? ' tuning__saptaswar-btn--active' : ''
    return `<button
      type="button"
      class="tuning__saptaswar-btn${active}"
      data-saptaswar-hz="${note.hz}"
      title="${note.sanskrit} — ${note.chakraSanskrit} (${note.hz} Hz)"
      aria-pressed="${note.hz === currentCarrierHz}"
    >${note.note}</button>`
  }).join('')
  return `
    <div class="tuning__saptaswar" role="group" aria-label="Saptaswar scale — snap carrier to Gandharva Veda note">
      <span class="tuning__saptaswar-label">Saptaswar</span>
      <div class="tuning__saptaswar-notes">${buttons}</div>
    </div>
  `
}

export function renderAdvancedTuning(): string {
  const s = sessionStore.get()
  const limits = engine.getLimits()
  const carrierMax = limits.maxCarrierHz.toFixed(0)
  const beatMax = Math.max(limits.maxBeatHz, 100).toFixed(2)
  return `
    <details class="disclosure" id="advanced-tuning">
      <summary>Advanced tuning</summary>
      <div style="padding-top: var(--space-4); display: flex; flex-direction: column; gap: var(--space-4)">
        <div class="field">
          <span class="field__label" id="adv-mode-label">Beat method</span>
          <div class="tuning__mode" role="radiogroup" aria-labelledby="adv-mode-label">
            <label class="tuning__mode-opt">
              <input type="radio" name="adv-mode" value="binaural" ${s.mode === 'binaural' ? 'checked' : ''} aria-describedby="adv-mode-binaural-desc" />
              <span><strong>Binaural</strong><br><small id="adv-mode-binaural-desc">Headphones · two ears integrate</small></span>
            </label>
            <label class="tuning__mode-opt">
              <input type="radio" name="adv-mode" value="monaural" ${s.mode === 'monaural' ? 'checked' : ''} aria-describedby="adv-mode-monaural-desc" />
              <span><strong>Monaural</strong><br><small id="adv-mode-monaural-desc">Speakers OK · acoustic beat</small></span>
            </label>
            <label class="tuning__mode-opt">
              <input type="radio" name="adv-mode" value="isochronic" ${s.mode === 'isochronic' ? 'checked' : ''} aria-describedby="adv-mode-isochronic-desc" />
              <span><strong>Isochronic</strong><br><small id="adv-mode-isochronic-desc">Speakers OK · pulsed envelope</small></span>
            </label>
          </div>
        </div>
        ${renderSaptaswarPicker(s.carrierHz)}
        <label class="field">
          <span class="field__label">Carrier (Hz)</span>
          <input type="number" id="adv-carrier" min="1" step="any" value="${s.carrierHz}" />
          <input type="range" id="adv-carrier-range" min="1" max="${carrierMax}" step="1" value="${s.carrierHz}" />
        </label>
        <label class="field">
          <span class="field__label">Beat / binaural difference (Hz)</span>
          <input type="number" id="adv-beat" min="0" step="any" value="${s.beatHz}" />
          <input type="range" id="adv-beat-range" min="0" max="${beatMax}" step="0.1" value="${s.beatHz}" />
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
        <p class="tuning__fusion" id="adv-fusion" aria-live="polite"></p>
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
  const fusionEl = container.querySelector<HTMLElement>('#adv-fusion')!

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
    const b = Number(beatNum.value)
    const l = getBinauralLimits(sr, c)
    limitsEl.textContent = `SR ${sr} Hz \u00B7 Carrier ${formatHz(l.minCarrierHz)}\u2013${formatHz(l.maxCarrierHz)} \u00B7 Max beat ${formatHz(l.maxBeatHz)}`
    beatRange.max = String(Math.max(0.1, l.maxBeatHz))
    carrierRange.max = String(l.maxCarrierHz)

    const mode = sessionStore.get().mode
    const fusion = assessBinauralFusion(mode, c, b)
    fusionEl.dataset.level = fusion.level
    const dot =
      fusion.level === 'good' ? '\u25CF' : fusion.level === 'marginal' ? '\u25D0' : '\u25CB'
    fusionEl.textContent = `${dot} ${fusion.reason}`
  }

  // Saptaswar note buttons — snap carrier to selected note
  container.querySelectorAll<HTMLButtonElement>('[data-saptaswar-hz]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const hz = Number(btn.dataset.saptaswarHz)
      if (!hz) return
      carrierNum.value = String(hz)
      carrierRange.value = String(Math.min(Number(carrierRange.max), hz))
      syncFromInputs()
      // Update active state on all note buttons
      container.querySelectorAll<HTMLButtonElement>('[data-saptaswar-hz]').forEach((b) => {
        const active = Number(b.dataset.saptaswarHz) === hz
        b.setAttribute('aria-pressed', String(active))
        b.classList.toggle('tuning__saptaswar-btn--active', active)
      })
    })
  })

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

  container.querySelectorAll<HTMLInputElement>('input[name="adv-mode"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (!radio.checked) return
      const mode = radio.value as BeatMode
      sessionStore.set({ mode })
      refreshLimits()
    })
  })

  refreshLimits()
}
