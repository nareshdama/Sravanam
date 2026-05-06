/**
 * Stereo binaural tone generator: left ear = carrier Hz, right ear = carrier + beat Hz.
 * Perceived beat frequency ≈ beat Hz (use headphones).
 *
 * Optional Vedic-inspired ambient bed (see {@link SoundLibraryMode}) mixes under the binaural pair.
 *
 * ## Scale (many simultaneous listeners)
 *
 * Playback runs entirely in the **user’s browser** via Web Audio — there is no shared server
 * audio path. “N simultaneous users” means **N independent tabs/devices**, each with its own
 * `AudioContext` and **O(1)** CPU/memory on the client. Backend scale does not apply to synthesis
 * here; this class is hardened for **single-tab** robustness (lifecycle, suspension, allocation
 * bounds), not datacenter fan-out.
 */

import type { SoundLibraryMode } from '../data/vedicSoundLibrary'
import { reportError } from '../lib/errorReport'

export type BinauralWaveType = OscillatorType

/**
 * How the beat frequency is delivered.
 *
 * - `binaural`: Left ear = carrier, right ear = carrier + beat. Beat is integrated
 *   centrally; requires headphones; weakest of the three for measurable EEG
 *   entrainment but smoothest perceptual experience.
 * - `monaural`: Both ears receive (carrier) + (carrier + beat) summed in air. Produces
 *   a real acoustic beat. Works on speakers. Generally stronger entrainment than
 *   binaural in published meta-analyses (Garcia-Argibay 2019).
 * - `isochronic`: A single carrier is amplitude-gated at the beat rate (sine envelope
 *   0..1). Strongest perceptual pulse and the most reliable entrainment driver in
 *   the literature; works on speakers. Can sound buzzy at high beat rates.
 */
export type BeatMode = 'binaural' | 'monaural' | 'isochronic'

/** Allows tests to inject a mock `AudioContext` while production uses the real API. */
export type AudioContextFactory = () => AudioContext

export interface BinauralLimits {
  sampleRate: number
  nyquist: number
  minCarrierHz: number
  maxCarrierHz: number
  minBeatHz: number
  maxBeatHz: number
}

export interface BinauralParams {
  carrierHz: number
  beatHz: number
  volume: number
  wave: BinauralWaveType
  mode: BeatMode
}

/** Snapshot of the Web Audio clock for visuals synced to playback. */
export interface AudioClockSnapshot {
  currentTime: number
  sampleRate: number
}

const DEFAULT_CARRIER = 200
const DEFAULT_BEAT = 10
const DEFAULT_VOLUME = 0.2
const FADE_S = 0.06
const FREQ_RAMP_S = 0.015   // 15 ms — smooth freq transitions, no slider click
const VOLUME_RAMP_S = 0.008 // 8 ms — smooth volume drag, shorter than fade-in

/** Praṇava-inspired partials (Hz) — modern additive synthesis. */
const OM_FREQS = [136, 272, 408] as const
const OM_PARTIAL_GAINS = [1, 0.32, 0.18] as const
const OM_SUM_SCALE = 0.2

const NADA_LOW_HZ = 55
const NADA_DETUNE_HZ = 0.45

const LIBRARY_GAIN: Record<Exclude<SoundLibraryMode, 'off'>, number> = {
  om: 0.11,
  cosmic: 0.055,
  nada: 0.09,
}

/** Cosmic bed: looped noise buffer; cap length so very high `sampleRate` cannot allocate huge RAM. */
const COSMIC_BUFFER_SECONDS = 4
const MAX_COSMIC_BUFFER_FRAMES = 480_000

/**
 * Cache the raw random samples keyed by frame count.
 * A 4s buffer at 48kHz = 192,000 floats filled via Math.random in a hot loop —
 * regenerating per session is ~8–15 ms on a mid-tier phone. Cache it.
 * We cache the Float32Array (not the AudioBuffer) because AudioBuffers are
 * bound to a specific AudioContext and cannot be reused across contexts.
 *
 * Spectrum: **pink (1/f)**, generated via Paul Kellet's "economy" filter cascade —
 * close enough to true pink within ~0.5 dB across the audible band, far cheaper than
 * an FFT shape. Pink (vs white) matches the natural spectrum of wind/water/breath and
 * is the conventional choice for ambient meditation beds.
 *   See: https://www.firstpr.com.au/dsp/pink-noise/  (Kellet, 1999, public domain)
 */
const cosmicNoiseSampleCache = new Map<number, Float32Array>()

function getCosmicNoiseSamples(frames: number): Float32Array {
  const cached = cosmicNoiseSampleCache.get(frames)
  if (cached) return cached

  const samples = new Float32Array(frames)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  let peak = 0
  for (let i = 0; i < frames; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.96900 * b2 + white * 0.1538520
    b3 = 0.86650 * b3 + white * 0.3104856
    b4 = 0.55000 * b4 + white * 0.5329522
    b5 = -0.7616 * b5 - white * 0.0168980
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
    b6 = white * 0.115926
    samples[i] = pink
    const abs = pink < 0 ? -pink : pink
    if (abs > peak) peak = abs
  }
  // Kellet output peaks ≈ ±2.7. Normalize to ±1 so downstream gains are predictable.
  if (peak > 0) {
    const inv = 1 / peak
    for (let i = 0; i < frames; i++) samples[i] *= inv
  }
  cosmicNoiseSampleCache.set(frames, samples)
  return samples
}

function nyquist(sr: number): number {
  return sr / 2
}

function closeContextSafely(ctx: AudioContext, scope: string, context?: Record<string, unknown>): void {
  if (ctx.state === 'closed') return
  void ctx.close().catch((e) => {
    reportError(scope, e, { severity: 'warn', context })
  })
}

const NYQUIST_FACTOR = 0.49

/**
 * Per-waveform amplitude scale so all four `OscillatorType`s produce roughly the same
 * RMS energy (and therefore similar perceived loudness) at the same `volume` setting.
 *
 * RMS at unit peak (assuming Web Audio's bandlimited oscillators):
 *   sine     = 1/√2  ≈ 0.7071  (reference)
 *   square   = 1     ≈ 1.0000  → attenuate to 0.7071
 *   triangle = 1/√3  ≈ 0.5774  → boost   to 1.225
 *   sawtooth = 1/√3  ≈ 0.5774  → boost   to 1.225
 *
 * Boosts stay well inside headroom because the default master volume is 0.2.
 */
const WAVEFORM_LOUDNESS_GAIN: Record<OscillatorType, number> = {
  sine: 1.0,
  square: 0.7071,
  triangle: 1.2247,
  sawtooth: 1.2247,
  custom: 1.0,
}

function sanitizeFiniteHz(value: number, fallback: number): number {
  return isFinite(value) ? value : fallback
}

export function getBinauralLimits(
  sampleRate: number,
  carrierHz: number,
): BinauralLimits {
  if (!isFinite(sampleRate) || sampleRate <= 0) sampleRate = 48_000
  carrierHz = sanitizeFiniteHz(carrierHz, DEFAULT_CARRIER)
  const nq = nyquist(sampleRate) * NYQUIST_FACTOR
  const minCarrierHz = 1
  const maxCarrierHz = Math.max(minCarrierHz, nq - 1e-6)
  const c = Math.min(Math.max(carrierHz, minCarrierHz), maxCarrierHz)
  const maxBeatHz = Math.max(0, nq - c)
  return {
    sampleRate,
    nyquist: nyquist(sampleRate),
    minCarrierHz,
    maxCarrierHz,
    minBeatHz: 0,
    maxBeatHz,
  }
}

/**
 * Heuristic confidence that the listener will perceive a fused binaural beat.
 *
 * For **monaural** and **isochronic** modes the beat is acoustic, so fusion is irrelevant —
 * always returns `'good'`.
 *
 * For **binaural** the literature converges on:
 *   - Carrier ~250–500 Hz is the sweet spot (Oster 1973; Karino 2006).
 *   - Below ~150 Hz, monaural localization cues weaken the fusion illusion.
 *   - Above ~1000 Hz, binaural beat amplitude in EEG drops sharply.
 *   - Beat > ~30 Hz is hard for the central auditory system to integrate.
 */
export type FusionConfidence = 'good' | 'marginal' | 'poor'

export interface FusionAssessment {
  level: FusionConfidence
  reason: string
}

export function assessBinauralFusion(
  mode: BeatMode,
  carrierHz: number,
  beatHz: number,
): FusionAssessment {
  if (mode !== 'binaural') {
    return { level: 'good', reason: `${mode} beats are acoustic — no fusion required` }
  }
  if (!isFinite(carrierHz) || !isFinite(beatHz)) {
    return { level: 'poor', reason: 'Invalid carrier or beat' }
  }
  if (beatHz > 30) {
    return {
      level: 'poor',
      reason: 'Beat above ~30 Hz fuses weakly — try monaural or isochronic',
    }
  }
  if (carrierHz >= 250 && carrierHz <= 500) {
    return { level: 'good', reason: 'Carrier in the 250–500 Hz binaural sweet spot' }
  }
  if (carrierHz >= 150 && carrierHz < 250) {
    return { level: 'marginal', reason: 'Carrier a bit low — fusion still works for most' }
  }
  if (carrierHz > 500 && carrierHz <= 1000) {
    return { level: 'marginal', reason: 'Carrier high — fusion weakens above ~600 Hz' }
  }
  if (carrierHz < 150) {
    return {
      level: 'poor',
      reason: 'Carrier too low — try ≥250 Hz or switch to monaural',
    }
  }
  return {
    level: 'poor',
    reason: 'Carrier too high — binaural beats fade above ~1 kHz',
  }
}

export function clampBinauralFrequencies(
  sampleRate: number,
  carrierHz: number,
  beatHz: number,
): { carrierHz: number; beatHz: number } {
  carrierHz = sanitizeFiniteHz(carrierHz, DEFAULT_CARRIER)
  beatHz = sanitizeFiniteHz(beatHz, DEFAULT_BEAT)
  const lim = getBinauralLimits(sampleRate, carrierHz)
  const c = Math.min(Math.max(carrierHz, lim.minCarrierHz), lim.maxCarrierHz)
  const lim2 = getBinauralLimits(sampleRate, c)
  const b = Math.min(Math.max(beatHz, lim2.minBeatHz), lim2.maxBeatHz)
  return { carrierHz: c, beatHz: b }
}

export class BinauralEngine {
  private context: AudioContext | null = null
  private merger: ChannelMergerNode | null = null
  private oscL: OscillatorNode | null = null
  private oscR: OscillatorNode | null = null
  private binauralGain: GainNode | null = null
  /** Compensation gain so all `OscillatorType`s match sine's RMS loudness. */
  private waveGain: GainNode | null = null
  private masterGain: GainNode | null = null
  private libraryGain: GainNode | null = null
  private libraryMode: SoundLibraryMode = 'off'
  /** Stoppable sources + disconnectable nodes for the ambient layer */
  private libraryDisposables: { disconnect: () => void }[] = []
  /** Singing bowl end-of-session bell — tracked so stop() can fade it cleanly. */
  private bowlGain: GainNode | null = null
  private bowlOscillators: OscillatorNode[] = []
  /** `AudioContext.currentTime` when binaural oscillators started (phase reference). */
  private playbackStartTime: number | null = null
  /** Scheduled from `stop()`; cleared if user starts again before fade completes. */
  private stopFadeTimer: ReturnType<typeof setTimeout> | null = null
  /** Guards against duplicate/concurrent `start()` calls. */
  private startPromise: Promise<void> | null = null
  private onVisibilityResume: (() => void) | null = null
  private onContextStateResume: (() => void) | null = null
  /** True while startInternal() initial fade-in is in progress; prevents ramp cancellation. */
  private startingUp = false

  /** Called when AudioContext becomes suspended/interrupted (e.g. iOS audio interruption). */
  onSuspended: (() => void) | null = null
  /** Called when AudioContext returns to running state. */
  onResumed: (() => void) | null = null
  /** Called when the scheduled duration elapses and the wind-down completes. */
  onAutoSessionEnd: (() => void) | null = null

  private durationTimer: ReturnType<typeof setTimeout> | null = null
  private durationMinutes: number | null = null

  private params: BinauralParams = {
    carrierHz: DEFAULT_CARRIER,
    beatHz: DEFAULT_BEAT,
    volume: DEFAULT_VOLUME,
    wave: 'sine',
    mode: 'binaural',
  }

  /** Stoppable sources + disconnectable nodes for the carrier/beat layer. */
  private beatDisposables: { disconnect: () => void }[] = []
  /** Isochronic envelope LFO; null in other modes. */
  private gateLfo: OscillatorNode | null = null

  private readonly createAudioContext: AudioContextFactory

  constructor(createAudioContext?: AudioContextFactory) {
    this.createAudioContext =
      createAudioContext ??
      (() => {
        // iOS Safari < 14.1 and some Android WebViews still expose only
        // `webkitAudioContext`. Use the prefixed constructor as a last resort
        // so the app boots audio on older mobile browsers.
        const Ctor: typeof AudioContext =
          typeof AudioContext !== 'undefined'
            ? AudioContext
            : (globalThis as unknown as { webkitAudioContext?: typeof AudioContext })
                .webkitAudioContext ?? AudioContext
        try {
          return new Ctor({ latencyHint: 'interactive' })
        } catch {
          return new Ctor()
        }
      })
  }

  get running(): boolean {
    return this.oscL !== null
  }

  getParams(): BinauralParams {
    return { ...this.params }
  }

  getSoundLibrary(): SoundLibraryMode {
    return this.libraryMode
  }

  setSoundLibrary(mode: SoundLibraryMode): void {
    this.libraryMode = mode
    if (this.running) {
      this.applyLibraryLayer()
    }
  }

  getChannelFrequencies(): { leftHz: number; rightHz: number } | null {
    if (!this.oscL || !this.oscR) return null
    return {
      leftHz: this.oscL.frequency.value,
      rightHz: this.oscR.frequency.value,
    }
  }

  getLimits(): BinauralLimits {
    const sr = this.context?.sampleRate ?? 48000
    return getBinauralLimits(sr, this.params.carrierHz)
  }

  /** Same timeline as the oscillators; null when stopped. */
  getAudioClock(): AudioClockSnapshot | null {
    if (!this.context) return null
    return {
      currentTime: this.context.currentTime,
      sampleRate: this.context.sampleRate,
    }
  }

  /** AudioContext time at which oscillators started; null when stopped. */
  getPlaybackStartTime(): number | null {
    return this.playbackStartTime
  }

  setCarrierHz(hz: number): void {
    this.params.carrierHz = hz
    this.applyFrequencies()
  }

  setBeatHz(hz: number): void {
    this.params.beatHz = hz
    this.applyFrequencies()
  }

  /**
   * Slowly ramp the beat from its current value to `targetHz` over `rampSeconds`.
   * Useful for entrainment protocols that drift across bands (e.g. 12 → 6 Hz over 10 min
   * for a sleep-onset session). Honors device Nyquist via `clampBinauralFrequencies`.
   *
   * No-op if the engine is not running; returns the clamped target so callers can mirror
   * it into UI state immediately.
   */
  rampBeatHz(targetHz: number, rampSeconds: number): number {
    const ctx = this.context
    if (!ctx || rampSeconds <= 0 || !isFinite(rampSeconds)) {
      this.setBeatHz(targetHz)
      return this.params.beatHz
    }
    const { carrierHz, beatHz } = clampBinauralFrequencies(
      ctx.sampleRate,
      this.params.carrierHz,
      targetHz,
    )
    const now = ctx.currentTime
    const endAt = now + rampSeconds
    const mode = this.params.mode

    if (mode === 'isochronic' && this.gateLfo) {
      this.gateLfo.frequency.cancelScheduledValues(now)
      this.gateLfo.frequency.setValueAtTime(this.gateLfo.frequency.value, now)
      this.gateLfo.frequency.linearRampToValueAtTime(beatHz, endAt)
    } else if (this.oscR) {
      this.oscR.frequency.cancelScheduledValues(now)
      this.oscR.frequency.setValueAtTime(this.oscR.frequency.value, now)
      this.oscR.frequency.linearRampToValueAtTime(carrierHz + beatHz, endAt)
    }

    this.params.beatHz = beatHz
    return beatHz
  }

  setVolume(linear: number): void {
    this.params.volume = Math.min(1, Math.max(0, linear))
    if (this.binauralGain && this.context && !this.startingUp) {
      const t = this.context.currentTime
      this.binauralGain.gain.cancelScheduledValues(t)
      this.binauralGain.gain.setValueAtTime(this.binauralGain.gain.value, t)
      this.binauralGain.gain.linearRampToValueAtTime(this.params.volume, t + VOLUME_RAMP_S)
    }
  }

  setDurationMinutes(mins: number | null): void {
    this.durationMinutes = mins
  }

  /** Resume a suspended AudioContext — must be called inside a user gesture on iOS Safari. */
  resumeContext(): void {
    if (this.context && this.context.state !== 'running') {
      void this.context.resume().catch((e) => {
        reportError('audio:resumeContext', e, { severity: 'warn' })
      })
    }
  }

  setWave(wave: BinauralWaveType): void {
    this.params.wave = wave
    if (this.oscL) this.oscL.type = wave
    if (this.oscR) this.oscR.type = wave
    if (this.waveGain && this.context) {
      const t = this.context.currentTime
      this.waveGain.gain.cancelScheduledValues(t)
      this.waveGain.gain.setValueAtTime(this.waveGain.gain.value, t)
      this.waveGain.gain.linearRampToValueAtTime(
        WAVEFORM_LOUDNESS_GAIN[wave] ?? 1,
        t + VOLUME_RAMP_S,
      )
    }
  }

  getBeatMode(): BeatMode {
    return this.params.mode
  }

  /**
   * Switch beat delivery method. While running this rebuilds the carrier graph;
   * the master fade keeps the transition click-free.
   */
  setBeatMode(mode: BeatMode): void {
    if (mode === this.params.mode) return
    this.params.mode = mode
    if (this.context && this.binauralGain && this.merger) {
      this.rebuildBeatGraph()
    }
  }

  async start(): Promise<void> {
    if (this.startPromise) return this.startPromise

    const run = this.startInternal()
    this.startPromise = run.finally(() => {
      if (this.startPromise === run) {
        this.startPromise = null
      }
    })
    return this.startPromise
  }

  private async startInternal(): Promise<void> {
    if (this.stopFadeTimer !== null) {
      clearTimeout(this.stopFadeTimer)
      this.stopFadeTimer = null
      this.teardown(this.context)
    }
    if (this.oscL) return

    this.startingUp = true
    const ctx = this.createAudioContext()
    this.context = ctx
    try {
      await ctx.resume()
    } catch (e) {
      reportError('audio:start', e, {
        severity: 'warn',
        context: { state: ctx.state, reason: 'resume-rejected' },
      })
      this.startingUp = false
      if (this.context === ctx) {
        this.teardown(ctx)
      } else {
        closeContextSafely(ctx, 'audio:closeAfterFailedStart', { state: ctx.state })
      }
      throw new Error('AudioContext could not start — tap anywhere on the page first, then try again.')
    }

    // `stop()` may have run while `resume()` was pending.
    if (this.context !== ctx) {
      this.startingUp = false
      closeContextSafely(ctx, 'audio:closeAfterInterruptedStart', { state: ctx.state })
      throw new Error('Audio start was interrupted. Please try again.')
    }

    this.attachResumeHandlers(ctx)

    const merger = ctx.createChannelMerger(2)
    this.merger = merger

    const waveGain = ctx.createGain()
    this.waveGain = waveGain
    waveGain.gain.value = WAVEFORM_LOUDNESS_GAIN[this.params.wave] ?? 1

    const binauralGain = ctx.createGain()
    this.binauralGain = binauralGain
    binauralGain.gain.value = 0

    const libraryGain = ctx.createGain()
    this.libraryGain = libraryGain
    libraryGain.gain.value = 0

    const masterGain = ctx.createGain()
    this.masterGain = masterGain
    masterGain.gain.value = 1

    merger.connect(waveGain)
    waveGain.connect(binauralGain)
    binauralGain.connect(masterGain)
    libraryGain.connect(masterGain)
    masterGain.connect(ctx.destination)

    const t = ctx.currentTime
    binauralGain.gain.linearRampToValueAtTime(this.params.volume, t + FADE_S)

    this.buildBeatGraph(t)
    this.playbackStartTime = t
    this.startingUp = false

    // BUG 2 fix: if setVolume() was called during the startingUp window the ramp
    // was silently dropped. Re-apply the current volume if it diverged from fade-in.
    if (binauralGain.gain.value !== this.params.volume) {
      const tv = ctx.currentTime
      binauralGain.gain.cancelScheduledValues(tv)
      binauralGain.gain.setValueAtTime(binauralGain.gain.value, tv)
      binauralGain.gain.linearRampToValueAtTime(this.params.volume, tv + VOLUME_RAMP_S)
    }

    this.applyLibraryLayer()

    if (this.durationMinutes !== null) {
      const durationSeconds = this.durationMinutes * 60
      const windDownStart = t + durationSeconds
      const windDownEnd = windDownStart + 30 // 30 second gentle fade
      
      // Schedule fade out
      masterGain.gain.setValueAtTime(1, windDownStart)
      masterGain.gain.linearRampToValueAtTime(0.001, windDownEnd)
      
      // Schedule singing bowl
      this.scheduleBowl(windDownEnd)
      
      // Schedule actual teardown 5 seconds after bowl rings
      this.durationTimer = globalThis.setTimeout(() => {
        this.onAutoSessionEnd?.()
      }, (durationSeconds + 35) * 1000)
    }
  }

  stop(): void {
    const ctx = this.context
    const masterGain = this.masterGain
    const oscL = this.oscL
    const oscR = this.oscR

    if (!ctx) {
      this.teardown(null)
      return
    }

    if (!masterGain || !oscL) {
      this.teardown(ctx)
      return
    }

    const t = ctx.currentTime
    masterGain.gain.cancelScheduledValues(t)
    masterGain.gain.setValueAtTime(masterGain.gain.value, t)
    masterGain.gain.linearRampToValueAtTime(0, t + FADE_S)

    if (this.bowlGain) {
      this.bowlGain.gain.cancelScheduledValues(t)
      this.bowlGain.gain.setValueAtTime(this.bowlGain.gain.value, t)
      this.bowlGain.gain.linearRampToValueAtTime(0, t + FADE_S)
    }

    const stopAt = t + FADE_S + 0.02
    try {
      oscL.stop(stopAt)
      oscR?.stop(stopAt)
      this.gateLfo?.stop(stopAt)
    } catch {
      /* already stopped */
    }

    this.stopFadeTimer = globalThis.setTimeout(() => {
      this.stopFadeTimer = null
      this.teardown(ctx)
    }, (FADE_S + 0.05) * 1000)
  }

  private scheduleBowl(t: number): void {
    const ctx = this.context
    if (!ctx) return
    const bowlGain = ctx.createGain()
    this.bowlGain = bowlGain
    bowlGain.connect(ctx.destination) // bypass masterGain fade

    // Soft attack, extremely long decay
    bowlGain.gain.setValueAtTime(0, t)
    bowlGain.gain.linearRampToValueAtTime(0.7, t + 0.15)
    bowlGain.gain.exponentialRampToValueAtTime(0.0001, t + 18)

    // Fundamental + overtone partials for a Tibetan singing bowl
    const freqs = [216, 432, 648, 864, 1296]
    const gains = [0.8, 0.45, 0.2, 0.08, 0.04]

    for (let i = 0; i < freqs.length; i++) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      // Add subtle detune beating to the partials
      osc.frequency.setValueAtTime(freqs[i]! + (Math.random() * 0.4), t)
      const g = ctx.createGain()
      g.gain.value = gains[i]!
      osc.connect(g)
      g.connect(bowlGain)
      osc.start(t)
      osc.stop(t + 20)
      this.bowlOscillators.push(osc)
    }
  }

  private attachResumeHandlers(ctx: AudioContext): void {
    this.detachResumeHandlers(ctx)

    if (typeof document !== 'undefined') {
      this.onVisibilityResume = () => {
        if (ctx.state === 'closed') {
          this.detachResumeHandlers(ctx)
          return
        }
        if (document.visibilityState === 'visible') {
          void ctx.resume().catch((e) => {
            reportError('audio:resumeOnVisibility', e, {
              severity: 'warn',
              context: { state: ctx.state },
            })
          })
        }
      }
      document.addEventListener('visibilitychange', this.onVisibilityResume)
    }

    if (typeof ctx.addEventListener === 'function') {
      this.onContextStateResume = () => {
        if (ctx.state === 'closed') {
          this.detachResumeHandlers(ctx)
          return
        }
        const st = ctx.state as AudioContextState | 'interrupted'
        if (st === 'suspended' || st === 'interrupted') {
          this.onSuspended?.()
          if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
          void ctx.resume().catch((e) => {
            reportError('audio:resumeOnStateChange', e, {
              severity: 'warn',
              context: { state: st },
            })
          })
        } else if (st === 'running') {
          this.onResumed?.()
        }
      }
      ctx.addEventListener('statechange', this.onContextStateResume)
    }
  }

  private detachResumeHandlers(ctx: AudioContext | null): void {
    if (this.onVisibilityResume && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisibilityResume)
    }
    this.onVisibilityResume = null

    if (this.onContextStateResume && ctx && typeof ctx.removeEventListener === 'function') {
      ctx.removeEventListener('statechange', this.onContextStateResume)
    }
    this.onContextStateResume = null
  }

  private teardown(closeContext: AudioContext | null): void {
    if (this.stopFadeTimer !== null) {
      clearTimeout(this.stopFadeTimer)
      this.stopFadeTimer = null
    }
    if (this.durationTimer !== null) {
      clearTimeout(this.durationTimer)
      this.durationTimer = null
    }

    this.detachResumeHandlers(this.context)

    this.clearLibraryLayer()

    this.clearBeatGraph()

    this.merger?.disconnect()
    this.waveGain?.disconnect()
    this.binauralGain?.disconnect()
    this.libraryGain?.disconnect()
    this.masterGain?.disconnect()
    this.merger = null
    this.waveGain = null
    this.binauralGain = null
    this.libraryGain = null
    this.masterGain = null

    for (const osc of this.bowlOscillators) {
      try { osc.stop() } catch { /* already stopped */ }
      osc.disconnect()
    }
    this.bowlOscillators = []
    this.bowlGain?.disconnect()
    this.bowlGain = null

    if (closeContext && closeContext.state !== 'closed') {
      closeContextSafely(closeContext, 'audio:teardownCloseContext', { state: closeContext.state })
    }
    this.context = null
    this.playbackStartTime = null
    // Cosmic noise samples are safe to keep across sessions — the Float32Array is small
    // (~768 KB at 48 kHz) and regenerating it costs ~8–15 ms on a mid-tier phone.
  }

  private clearLibraryLayer(): void {
    for (const d of this.libraryDisposables) {
      try {
        d.disconnect()
      } catch {
        /* ignore */
      }
    }
    this.libraryDisposables = []
    if (this.libraryGain && this.context) {
      const t = this.context.currentTime
      this.libraryGain.gain.cancelScheduledValues(t)
      this.libraryGain.gain.setValueAtTime(0, t)
    }
  }

  private applyLibraryLayer(): void {
    const ctx = this.context
    const libraryGain = this.libraryGain
    if (!ctx || !libraryGain) return

    this.clearLibraryLayer()

    const t = ctx.currentTime
    const mode = this.libraryMode

    if (mode === 'off') {
      libraryGain.gain.setValueAtTime(0, t)
      return
    }

    const target = LIBRARY_GAIN[mode]
    libraryGain.gain.setValueAtTime(0, t)
    libraryGain.gain.linearRampToValueAtTime(target, t + FADE_S)

    if (mode === 'om') {
      const sum = ctx.createGain()
      sum.gain.value = OM_SUM_SCALE
      for (let i = 0; i < OM_FREQS.length; i++) {
        const o = ctx.createOscillator()
        o.type = 'sine'
        o.frequency.setValueAtTime(OM_FREQS[i]!, t)
        const g = ctx.createGain()
        g.gain.value = OM_PARTIAL_GAINS[i]!
        o.connect(g)
        g.connect(sum)
        o.start(t)
        this.libraryDisposables.push({
          disconnect: () => {
            try {
              o.stop()
            } catch {
              /* */
            }
            o.disconnect()
            g.disconnect()
          },
        })
      }
      sum.connect(libraryGain)
      this.libraryDisposables.push({
        disconnect: () => {
          sum.disconnect()
        },
      })
      return
    }

    if (mode === 'nada') {
      const sum = ctx.createGain()
      sum.gain.value = 0.35
      const f1 = NADA_LOW_HZ
      const f2 = NADA_LOW_HZ + NADA_DETUNE_HZ
      for (const f of [f1, f2]) {
        const o = ctx.createOscillator()
        o.type = 'sine'
        o.frequency.setValueAtTime(f, t)
        o.connect(sum)
        o.start(t)
        this.libraryDisposables.push({
          disconnect: () => {
            try {
              o.stop()
            } catch {
              /* */
            }
            o.disconnect()
          },
        })
      }
      sum.connect(libraryGain)
      this.libraryDisposables.push({
        disconnect: () => {
          sum.disconnect()
        },
      })
      return
    }

    if (mode === 'cosmic') {
      const frames = Math.min(
        Math.floor(ctx.sampleRate * COSMIC_BUFFER_SECONDS),
        MAX_COSMIC_BUFFER_FRAMES,
      )
      const buffer = ctx.createBuffer(1, frames, ctx.sampleRate)
      buffer.getChannelData(0).set(getCosmicNoiseSamples(frames))
      const src = ctx.createBufferSource()
      src.buffer = buffer
      src.loop = true
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(420, t)
      filter.Q.setValueAtTime(0.6, t)
      const ng = ctx.createGain()
      ng.gain.value = 0.45
      src.connect(filter)
      filter.connect(ng)
      ng.connect(libraryGain)
      src.start(t)
      this.libraryDisposables.push({
        disconnect: () => {
          try {
            src.stop()
          } catch {
            /* */
          }
          src.disconnect()
          filter.disconnect()
          ng.disconnect()
        },
      })
    }
  }

  private applyFrequencies(): void {
    const ctx = this.context
    const oscL = this.oscL
    const oscR = this.oscR
    if (!ctx) return

    const { carrierHz, beatHz } = clampBinauralFrequencies(
      ctx.sampleRate,
      this.params.carrierHz,
      this.params.beatHz,
    )
    this.params.carrierHz = carrierHz
    this.params.beatHz = beatHz

    const now = ctx.currentTime
    const mode = this.params.mode

    if (mode === 'isochronic') {
      // Single carrier; envelope LFO carries the beat rate.
      if (oscL) {
        oscL.frequency.cancelScheduledValues(now)
        oscL.frequency.setValueAtTime(oscL.frequency.value, now)
        oscL.frequency.linearRampToValueAtTime(carrierHz, now + FREQ_RAMP_S)
      }
      if (this.gateLfo) {
        this.gateLfo.frequency.cancelScheduledValues(now)
        this.gateLfo.frequency.setValueAtTime(this.gateLfo.frequency.value, now)
        this.gateLfo.frequency.linearRampToValueAtTime(beatHz, now + FREQ_RAMP_S)
      }
      return
    }

    // binaural and monaural both keep two carrier oscillators at carrier and carrier+beat.
    if (!oscL || !oscR) return
    oscL.frequency.cancelScheduledValues(now)
    oscR.frequency.cancelScheduledValues(now)
    oscL.frequency.setValueAtTime(oscL.frequency.value, now)
    oscR.frequency.setValueAtTime(oscR.frequency.value, now)
    oscL.frequency.linearRampToValueAtTime(carrierHz, now + FREQ_RAMP_S)
    oscR.frequency.linearRampToValueAtTime(carrierHz + beatHz, now + FREQ_RAMP_S)
  }

  /**
   * Build the per-mode carrier graph and connect it to the merger.
   *
   * Graph contracts (so visuals/tests can introspect):
   *   binaural   — `oscL` plays at `carrierHz` into merger.in[0]; `oscR` at `carrierHz+beatHz` into merger.in[1].
   *   monaural   — `oscL` at `carrierHz`, `oscR` at `carrierHz+beatHz`; both summed and routed equally to L+R.
   *   isochronic — `oscL` plays the carrier; routed through `gateGain` whose `.gain` is driven by an LFO
   *                (`gateLfo`) running at `beatHz`. The LFO's sine output (range -1..1) is scaled by 0.5
   *                and added to the AudioParam's base value (0.5) so the envelope sweeps 0..1.
   */
  private buildBeatGraph(t: number): void {
    const ctx = this.context
    const merger = this.merger
    if (!ctx || !merger) return

    const mode = this.params.mode

    if (mode === 'binaural') {
      const oscL = ctx.createOscillator()
      const oscR = ctx.createOscillator()
      oscL.type = this.params.wave
      oscR.type = this.params.wave
      this.oscL = oscL
      this.oscR = oscR
      this.applyFrequencies()
      oscL.connect(merger, 0, 0)
      oscR.connect(merger, 0, 1)
      oscL.start(t)
      oscR.start(t)
      this.beatDisposables.push({
        disconnect: () => {
          try { oscL.stop() } catch { /* */ }
          try { oscR.stop() } catch { /* */ }
          oscL.disconnect()
          oscR.disconnect()
        },
      })
      return
    }

    if (mode === 'monaural') {
      // Sum (carrier) + (carrier+beat) into a mono bus; route bus equally to both merger inputs.
      const oscL = ctx.createOscillator()
      const oscR = ctx.createOscillator()
      oscL.type = this.params.wave
      oscR.type = this.params.wave
      this.oscL = oscL
      this.oscR = oscR
      this.applyFrequencies()

      const sum = ctx.createGain()
      // Each oscillator at unity would peak at 2 when summed; halve to prevent clipping.
      sum.gain.value = 0.5
      oscL.connect(sum)
      oscR.connect(sum)
      sum.connect(merger, 0, 0)
      sum.connect(merger, 0, 1)
      oscL.start(t)
      oscR.start(t)
      this.beatDisposables.push({
        disconnect: () => {
          try { oscL.stop() } catch { /* */ }
          try { oscR.stop() } catch { /* */ }
          oscL.disconnect()
          oscR.disconnect()
          sum.disconnect()
        },
      })
      return
    }

    // isochronic
    const carrier = ctx.createOscillator()
    carrier.type = this.params.wave
    this.oscL = carrier
    this.oscR = null

    // Envelope: gateGain.gain = 0.5 (constant) + LFO_sine(beatHz) * 0.5 → range 0..1
    const gateGain = ctx.createGain()
    gateGain.gain.value = 0.5
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    const lfoScale = ctx.createGain()
    lfoScale.gain.value = 0.5
    lfo.connect(lfoScale)
    // Connect lfoScale's output to the AudioParam — modulates additively on the .value baseline.
    try {
      lfoScale.connect(gateGain.gain as unknown as AudioNode)
    } catch {
      // Mocked test contexts may not implement AudioParam connection; the envelope is a no-op there.
    }

    this.gateLfo = lfo

    this.applyFrequencies()

    carrier.connect(gateGain)
    gateGain.connect(merger, 0, 0)
    gateGain.connect(merger, 0, 1)
    carrier.start(t)
    lfo.start(t)
    this.beatDisposables.push({
      disconnect: () => {
        try { carrier.stop() } catch { /* */ }
        try { lfo.stop() } catch { /* */ }
        carrier.disconnect()
        try { lfoScale.disconnect() } catch { /* */ }
        lfo.disconnect()
        gateGain.disconnect()
      },
    })
  }

  /** Tear down beat-layer nodes (oscillators, LFO, gate) without touching merger/gain plumbing. */
  private clearBeatGraph(): void {
    for (const d of this.beatDisposables) {
      try { d.disconnect() } catch { /* */ }
    }
    this.beatDisposables = []
    this.oscL = null
    this.oscR = null
    this.gateLfo = null
  }

  /**
   * Rebuild the carrier/beat graph for a new mode while running. Briefly mutes the
   * binaural bus so the swap is click-free; the master and library beds keep playing.
   */
  private rebuildBeatGraph(): void {
    const ctx = this.context
    const binauralGain = this.binauralGain
    if (!ctx || !binauralGain) return

    const t = ctx.currentTime
    const target = this.params.volume
    const swapAt = t + FADE_S
    binauralGain.gain.cancelScheduledValues(t)
    binauralGain.gain.setValueAtTime(binauralGain.gain.value, t)
    binauralGain.gain.linearRampToValueAtTime(0, swapAt)

    this.clearBeatGraph()
    this.buildBeatGraph(swapAt)

    binauralGain.gain.setValueAtTime(0, swapAt)
    binauralGain.gain.linearRampToValueAtTime(target, swapAt + FADE_S)
  }
}
