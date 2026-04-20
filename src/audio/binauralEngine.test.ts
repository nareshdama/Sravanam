import { describe, expect, it } from 'vitest'
import { BinauralEngine, clampBinauralFrequencies, getBinauralLimits } from './binauralEngine'
import { getTemplateById, resolveTemplateFrequencies } from '../data/binauralTemplates'

/** Minimal Web Audio mocks so `BinauralEngine` runs in Node without a browser. */
function createAudioParam(initial = 0) {
  const p = {
    value: initial,
    setValueAtTime(v: number) {
      p.value = v
      return p
    },
    linearRampToValueAtTime(v: number) {
      p.value = v
      return p
    },
    cancelScheduledValues() {
      return p
    },
  }
  return p
}

/** Variant that records every scheduling call so tests can assert ramp vs hard-set. */
function createTrackingAudioParam(initial = 0) {
  const calls: Array<{ method: string; value: number }> = []
  const p = {
    value: initial,
    calls,
    setValueAtTime(v: number, _t?: number) {
      p.value = v
      calls.push({ method: 'set', value: v })
      return p
    },
    linearRampToValueAtTime(v: number, _t?: number) {
      p.value = v
      calls.push({ method: 'ramp', value: v })
      return p
    },
    cancelScheduledValues() {
      return p
    },
  }
  return p
}

function createMockAudioContextFactory(
  sampleRate: number,
  options?: { resume?: () => Promise<unknown> },
) {
  const oscillators: { frequency: ReturnType<typeof createAudioParam> }[] = []
  const contexts: Array<{ closeCalls: number }> = []

  const factory = () => {
    const ctx = {
      sampleRate,
      currentTime: 0 as number,
      state: 'suspended' as AudioContextState,
      destination: {} as AudioDestinationNode,
      async resume() {
        await options?.resume?.()
        if (ctx.state !== 'closed') {
          ctx.state = 'running'
        }
        return ctx
      },
      async close() {
        ctx.state = 'closed'
        tracker.closeCalls += 1
      },
      addEventListener() {},
      removeEventListener() {},
      createChannelMerger() {
        return {
          connect(dest: AudioNode) {
            return dest
          },
          disconnect() {},
        }
      },
      createGain() {
        return {
          connect(_dest: AudioNode) {
            return _dest
          },
          gain: createAudioParam(0),
          disconnect() {},
        }
      },
      createOscillator() {
        const frequency = createAudioParam(0)
        oscillators.push({ frequency })
        return {
          frequency,
          type: 'sine' as OscillatorType,
          connect() {
            return {}
          },
          disconnect() {},
          start() {},
          stop() {},
        }
      },
    }
    const tracker = { closeCalls: 0 }
    contexts.push(tracker)
    return ctx as unknown as AudioContext
  }

  return { factory, oscillators, contexts }
}

describe('BinauralEngine', () => {
  it('drives left = carrier and right = carrier + beat on the oscillator AudioParams', async () => {
    const { factory, oscillators } = createMockAudioContextFactory(48_000)
    const engine = new BinauralEngine(factory)

    engine.setCarrierHz(200)
    engine.setBeatHz(7.83)
    await engine.start()

    expect(oscillators).toHaveLength(2)
    const { carrierHz, beatHz } = clampBinauralFrequencies(48_000, 200, 7.83)
    expect(oscillators[0]!.frequency.value).toBeCloseTo(carrierHz, 8)
    expect(oscillators[1]!.frequency.value).toBeCloseTo(carrierHz + beatHz, 8)

    const live = engine.getChannelFrequencies()
    expect(live).not.toBeNull()
    expect(live!.leftHz).toBeCloseTo(carrierHz, 8)
    expect(live!.rightHz).toBeCloseTo(carrierHz + beatHz, 8)

    engine.stop()
  })

  it('updates oscillator frequencies when beat changes while running', async () => {
    const { factory, oscillators } = createMockAudioContextFactory(48_000)
    const engine = new BinauralEngine(factory)
    await engine.start()
    engine.setCarrierHz(200)
    engine.setBeatHz(40)

    const { carrierHz, beatHz } = clampBinauralFrequencies(48_000, 200, 40)
    expect(oscillators[0]!.frequency.value).toBeCloseTo(carrierHz, 8)
    expect(oscillators[1]!.frequency.value).toBeCloseTo(carrierHz + beatHz, 8)

    engine.stop()
  })

  it('gamma 40 Hz template matches engine channel math', async () => {
    const t = getTemplateById('gamma-40')!
    const r = resolveTemplateFrequencies(t)
    const { factory, oscillators } = createMockAudioContextFactory(48_000)
    const engine = new BinauralEngine(factory)
    engine.setCarrierHz(r.carrierHz)
    engine.setBeatHz(r.beatHz)
    await engine.start()

    expect(oscillators[1]!.frequency.value - oscillators[0]!.frequency.value).toBeCloseTo(
      40,
      8,
    )
    engine.stop()
  })

  it('guide-calibrated presets preserve left/right/delta channel math', async () => {
    const guideCases = [
      ['vedic-deep-sleep-aum-136.1', 136.1, 3],
      ['vedic-theta-aum-7.83', 432, 7.83],
      ['vedic-heart-bridge-pa-648', 648, 10],
      ['vedic-fortune-gate-dha-720', 720, 40],
      ['vedic-brahmarandhra-crown-ni-810', 810, 7.83],
      ['vedic-aishwarya-octave-864', 864, 8],
    ] as const

    for (const [id, expectedCarrierHz, expectedBeatHz] of guideCases) {
      const template = getTemplateById(id)!
      const resolved = resolveTemplateFrequencies(template)
      const { factory, oscillators } = createMockAudioContextFactory(48_000)
      const engine = new BinauralEngine(factory)
      engine.setCarrierHz(resolved.carrierHz)
      engine.setBeatHz(resolved.beatHz)
      await engine.start()

      expect(resolved.carrierHz, id).toBeCloseTo(expectedCarrierHz, 8)
      expect(resolved.beatHz, id).toBeCloseTo(expectedBeatHz, 8)
      expect(oscillators[0]!.frequency.value, id).toBeCloseTo(expectedCarrierHz, 8)
      expect(oscillators[1]!.frequency.value, id).toBeCloseTo(
        expectedCarrierHz + expectedBeatHz,
        8,
      )
      expect(
        oscillators[1]!.frequency.value - oscillators[0]!.frequency.value,
        id,
      ).toBeCloseTo(expectedBeatHz, 8)

      engine.stop()
    }
  })

  it('exposes audio clock and playback start time while running', async () => {
    const { factory } = createMockAudioContextFactory(48_000)
    const engine = new BinauralEngine(factory)
    expect(engine.getAudioClock()).toBeNull()
    expect(engine.getPlaybackStartTime()).toBeNull()
    await engine.start()
    const clock = engine.getAudioClock()
    expect(clock).not.toBeNull()
    expect(clock!.sampleRate).toBe(48_000)
    expect(engine.getPlaybackStartTime()).toBe(0)
    engine.stop()
  })

  it('reuses the same in-flight start for rapid duplicate starts', async () => {
    let releaseResume!: () => void
    const resumeGate = new Promise<void>((resolve) => {
      releaseResume = resolve
    })
    const { factory, oscillators, contexts } = createMockAudioContextFactory(48_000, {
      resume: () => resumeGate,
    })
    const engine = new BinauralEngine(factory)

    const first = engine.start()
    const second = engine.start()

    expect(contexts).toHaveLength(1)

    releaseResume()
    await first
    await second

    expect(oscillators).toHaveLength(2)
    expect(contexts).toHaveLength(1)
    engine.stop()
  })

  it('closes a pending AudioContext when stopped before resume resolves', async () => {
    let releaseResume!: () => void
    const resumeGate = new Promise<void>((resolve) => {
      releaseResume = resolve
    })
    const { factory, contexts } = createMockAudioContextFactory(48_000, {
      resume: () => resumeGate,
    })
    const engine = new BinauralEngine(factory)

    const startPromise = engine.start()
    engine.stop()

    releaseResume()
    await expect(startPromise).rejects.toThrow('Audio start was interrupted')

    expect(engine.running).toBe(false)
    expect(contexts[0]?.closeCalls).toBe(1)
  })

  it('clamps frequencies against the actual AudioContext sample rate once started', async () => {
    const { factory } = createMockAudioContextFactory(44_100)
    const engine = new BinauralEngine(factory)

    engine.setCarrierHz(20_000)
    engine.setBeatHz(2_000)
    await engine.start()

    const live = engine.getParams()
    const expected = clampBinauralFrequencies(44_100, 20_000, 2_000)
    expect(live.carrierHz).toBeCloseTo(expected.carrierHz, 8)
    expect(live.beatHz).toBeCloseTo(expected.beatHz, 8)

    engine.stop()
  })

  it('smooths frequency changes via linearRamp, not a hard setValueAtTime cut', async () => {
    const trackingOscillators: Array<{ frequency: ReturnType<typeof createTrackingAudioParam> }> = []

    const factory = () => {
      const ctx = {
        sampleRate: 48_000,
        currentTime: 0 as number,
        state: 'suspended' as AudioContextState,
        destination: {} as AudioDestinationNode,
        async resume() { ctx.state = 'running' as AudioContextState },
        async close() { ctx.state = 'closed' as AudioContextState },
        addEventListener() {},
        removeEventListener() {},
        createChannelMerger() { return { connect(d: AudioNode) { return d }, disconnect() {} } },
        createGain() { return { connect(_d: AudioNode) { return _d }, gain: createAudioParam(0), disconnect() {} } },
        createOscillator() {
          const frequency = createTrackingAudioParam(0)
          trackingOscillators.push({ frequency })
          return { frequency, type: 'sine' as OscillatorType, connect() { return {} }, disconnect() {}, start() {}, stop() {} }
        },
      }
      return ctx as unknown as AudioContext
    }

    const engine = new BinauralEngine(factory)
    await engine.start()
    engine.setCarrierHz(300)

    const calls = trackingOscillators[0]!.frequency.calls
    const anchorIdx = calls.findLastIndex((c) => c.method === 'set')
    const rampIdx = calls.findLastIndex((c) => c.method === 'ramp')
    expect(anchorIdx).toBeGreaterThanOrEqual(0)
    expect(rampIdx).toBeGreaterThan(anchorIdx)
    expect(trackingOscillators[0]!.frequency.value).toBeCloseTo(300, 8)

    engine.stop()
  })

  it('smooths volume changes via linearRamp when setVolume is called while running', async () => {
    let binauralGain: ReturnType<typeof createTrackingAudioParam> | null = null
    let gainCount = 0

    const factory = () => {
      const ctx = {
        sampleRate: 48_000,
        currentTime: 0 as number,
        state: 'suspended' as AudioContextState,
        destination: {} as AudioDestinationNode,
        async resume() { ctx.state = 'running' as AudioContextState },
        async close() { ctx.state = 'closed' as AudioContextState },
        addEventListener() {},
        removeEventListener() {},
        createChannelMerger() { return { connect(d: AudioNode) { return d }, disconnect() {} } },
        createGain() {
          gainCount++
          // binauralGain is the 1st createGain call in startInternal
          const gain = gainCount === 1 ? createTrackingAudioParam(0) : createAudioParam(0)
          if (gainCount === 1) binauralGain = gain as ReturnType<typeof createTrackingAudioParam>
          return { connect(_d: AudioNode) { return _d }, gain, disconnect() {} }
        },
        createOscillator() {
          const frequency = createAudioParam(0)
          return { frequency, type: 'sine' as OscillatorType, connect() { return {} }, disconnect() {}, start() {}, stop() {} }
        },
      }
      return ctx as unknown as AudioContext
    }

    const engine = new BinauralEngine(factory)
    await engine.start()
    engine.setVolume(0.5)

    const calls = binauralGain!.calls
    const anchorIdx = calls.findLastIndex((c) => c.method === 'set')
    const rampIdx = calls.findLastIndex((c) => c.method === 'ramp' && c.value === 0.5)
    expect(anchorIdx).toBeGreaterThanOrEqual(0)
    expect(rampIdx).toBeGreaterThan(anchorIdx)

    engine.stop()
  })

  it('getBinauralLimits returns valid positive limits when sampleRate is 0 or NaN', () => {
    for (const badSr of [0, -1, NaN, Infinity]) {
      const limits = getBinauralLimits(badSr, 200)
      expect(isFinite(limits.maxCarrierHz)).toBe(true)
      expect(limits.maxCarrierHz).toBeGreaterThan(0)
      expect(isFinite(limits.maxBeatHz)).toBe(true)
      expect(limits.maxBeatHz).toBeGreaterThanOrEqual(0)
      expect(limits.sampleRate).toBe(48_000)
    }
  })

  it('clampBinauralFrequencies returns finite defaults for NaN and Infinity inputs', () => {
    for (const bad of [NaN, Infinity, -Infinity]) {
      const clamped = clampBinauralFrequencies(48_000, bad, bad)
      expect(isFinite(clamped.carrierHz)).toBe(true)
      expect(isFinite(clamped.beatHz)).toBe(true)
      expect(clamped.carrierHz).toBeGreaterThan(0)
      expect(clamped.beatHz).toBeGreaterThanOrEqual(0)
    }
  })

  it('resolveTemplateFrequencies falls back to template defaults when given NaN/Infinity inputs', () => {
    const t = getTemplateById('gamma-40')!
    for (const bad of [NaN, Infinity, -Infinity]) {
      const r = resolveTemplateFrequencies(t, { carrierHz: bad, beatHz: bad })
      expect(isFinite(r.carrierHz)).toBe(true)
      expect(isFinite(r.beatHz)).toBe(true)
      expect(r.carrierHz).toBe(t.recommendedCarrierHz)
      expect(r.beatHz).toBe(t.defaultBeatHz)
    }
  })
})
