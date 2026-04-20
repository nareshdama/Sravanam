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
 */
const cosmicNoiseSampleCache = new Map<number, Float32Array>()

function getCosmicNoiseSamples(frames: number): Float32Array {
  const cached = cosmicNoiseSampleCache.get(frames)
  if (cached) return cached
  const samples = new Float32Array(frames)
  for (let i = 0; i < frames; i++) samples[i] = Math.random() * 2 - 1
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

export function getBinauralLimits(
  sampleRate: number,
  carrierHz: number,
): BinauralLimits {
  if (!isFinite(sampleRate) || sampleRate <= 0) sampleRate = 48_000
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

export function clampBinauralFrequencies(
  sampleRate: number,
  carrierHz: number,
  beatHz: number,
): { carrierHz: number; beatHz: number } {
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
  private masterGain: GainNode | null = null
  private libraryGain: GainNode | null = null
  private libraryMode: SoundLibraryMode = 'off'
  /** Stoppable sources + disconnectable nodes for the ambient layer */
  private libraryDisposables: { disconnect: () => void }[] = []
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

  private params: BinauralParams = {
    carrierHz: DEFAULT_CARRIER,
    beatHz: DEFAULT_BEAT,
    volume: DEFAULT_VOLUME,
    wave: 'sine',
  }

  private readonly createAudioContext: AudioContextFactory

  constructor(createAudioContext?: AudioContextFactory) {
    this.createAudioContext =
      createAudioContext ??
      (() => {
        try {
          return new AudioContext({ latencyHint: 'interactive' })
        } catch {
          return new AudioContext()
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

  setVolume(linear: number): void {
    this.params.volume = Math.min(1, Math.max(0, linear))
    if (this.binauralGain && this.context && !this.startingUp) {
      const t = this.context.currentTime
      this.binauralGain.gain.cancelScheduledValues(t)
      this.binauralGain.gain.setValueAtTime(this.binauralGain.gain.value, t)
      this.binauralGain.gain.linearRampToValueAtTime(this.params.volume, t + VOLUME_RAMP_S)
    }
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
      closeContextSafely(ctx, 'audio:closeAfterInterruptedStart', { state: ctx.state })
      throw new Error('Audio start was interrupted. Please try again.')
    }

    this.attachResumeHandlers(ctx)

    const merger = ctx.createChannelMerger(2)
    this.merger = merger

    const binauralGain = ctx.createGain()
    this.binauralGain = binauralGain
    binauralGain.gain.value = 0

    const libraryGain = ctx.createGain()
    this.libraryGain = libraryGain
    libraryGain.gain.value = 0

    const masterGain = ctx.createGain()
    this.masterGain = masterGain
    masterGain.gain.value = 1

    merger.connect(binauralGain)
    binauralGain.connect(masterGain)
    libraryGain.connect(masterGain)
    masterGain.connect(ctx.destination)

    const t = ctx.currentTime
    binauralGain.gain.linearRampToValueAtTime(this.params.volume, t + FADE_S)

    const oscL = ctx.createOscillator()
    const oscR = ctx.createOscillator()
    this.oscL = oscL
    this.oscR = oscR
    oscL.type = this.params.wave
    oscR.type = this.params.wave

    this.applyFrequencies()
    oscL.connect(merger, 0, 0)
    oscR.connect(merger, 0, 1)
    this.playbackStartTime = t
    oscL.start(t)
    oscR.start(t)
    this.startingUp = false

    this.applyLibraryLayer()
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

    if (!masterGain || !oscL || !oscR) {
      this.teardown(ctx)
      return
    }

    const t = ctx.currentTime
    masterGain.gain.cancelScheduledValues(t)
    masterGain.gain.setValueAtTime(masterGain.gain.value, t)
    masterGain.gain.linearRampToValueAtTime(0, t + FADE_S)

    const stopAt = t + FADE_S + 0.02
    try {
      oscL.stop(stopAt)
      oscR.stop(stopAt)
    } catch {
      /* already stopped */
    }

    this.stopFadeTimer = globalThis.setTimeout(() => {
      this.stopFadeTimer = null
      this.teardown(ctx)
    }, (FADE_S + 0.05) * 1000)
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

    this.detachResumeHandlers(this.context)

    this.clearLibraryLayer()

    const now = this.context?.currentTime ?? 0
    if (this.oscL) {
      try {
        this.oscL.stop(now)
      } catch {
        /* already stopped */
      }
    }
    if (this.oscR) {
      try {
        this.oscR.stop(now)
      } catch {
        /* already stopped */
      }
    }

    this.oscL?.disconnect()
    this.oscR?.disconnect()
    this.merger?.disconnect()
    this.binauralGain?.disconnect()
    this.libraryGain?.disconnect()
    this.masterGain?.disconnect()
    this.oscL = null
    this.oscR = null
    this.merger = null
    this.binauralGain = null
    this.libraryGain = null
    this.masterGain = null
    if (closeContext && closeContext.state !== 'closed') {
      closeContextSafely(closeContext, 'audio:teardownCloseContext', { state: closeContext.state })
    }
    this.context = null
    this.playbackStartTime = null
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
    if (!ctx || !oscL || !oscR) return

    const { carrierHz, beatHz } = clampBinauralFrequencies(
      ctx.sampleRate,
      this.params.carrierHz,
      this.params.beatHz,
    )
    this.params.carrierHz = carrierHz
    this.params.beatHz = beatHz

    const now = ctx.currentTime
    oscL.frequency.cancelScheduledValues(now)
    oscR.frequency.cancelScheduledValues(now)
    oscL.frequency.setValueAtTime(oscL.frequency.value, now)
    oscR.frequency.setValueAtTime(oscR.frequency.value, now)
    oscL.frequency.linearRampToValueAtTime(carrierHz, now + FREQ_RAMP_S)
    oscR.frequency.linearRampToValueAtTime(carrierHz + beatHz, now + FREQ_RAMP_S)
  }
}
