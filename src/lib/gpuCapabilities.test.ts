import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  formatGpuSummaryLine,
  probeWebGL,
  probeWebGPU,
  recommendedGpuBackend,
} from './gpuCapabilities'

describe('probeWebGL', () => {
  it('returns empty when no GL context can be created', () => {
    const canvas = { getContext: vi.fn(() => null) } as unknown as HTMLCanvasElement
    expect(probeWebGL(canvas)).toMatchObject({
      webgl1: false,
      webgl2: false,
      highest: null,
    })
  })

  it('prefers WebGL2 when getContext("webgl2") returns a context', () => {
    const fakeGl = {
      MAX_TEXTURE_SIZE: 3379,
      getExtension: vi.fn(() => null),
      getParameter: vi.fn((p: number) => (p === 3379 ? 16384 : null)),
    }
    const canvas = {
      getContext: vi.fn((type: string) => (type === 'webgl2' ? fakeGl : null)),
    } as unknown as HTMLCanvasElement

    const r = probeWebGL(canvas)
    expect(r.webgl2).toBe(true)
    expect(r.webgl1).toBe(true)
    expect(r.highest).toBe('webgl2')
    expect(r.maxTextureSize).toBe(16384)
  })

  it('falls back to WebGL1 when WebGL2 is unavailable', () => {
    const fakeGl = {
      MAX_TEXTURE_SIZE: 3379,
      getExtension: vi.fn(() => null),
      getParameter: vi.fn((p: number) => (p === 3379 ? 8192 : null)),
    }
    const canvas = {
      getContext: vi.fn((type: string) => {
        if (type === 'webgl2') return null
        if (type === 'webgl' || type === 'experimental-webgl') return fakeGl
        return null
      }),
    } as unknown as HTMLCanvasElement

    const r = probeWebGL(canvas)
    expect(r.webgl2).toBe(false)
    expect(r.webgl1).toBe(true)
    expect(r.highest).toBe('webgl')
  })
})

describe('probeWebGPU', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns not supported when navigator.gpu is missing', async () => {
    vi.stubGlobal('navigator', { gpu: undefined })
    const r = await probeWebGPU()
    expect(r.supported).toBe(false)
    expect(r.error).toMatch(/not exposed/i)
  })

  it('resolves adapter and device when WebGPU is mocked', async () => {
    const destroy = vi.fn()
    const device = {
      features: new Set(['depth32float-stencil8', 'texture-compression-bc']),
      destroy,
    }
    const adapter = {
      requestDevice: vi.fn(async () => device),
    }
    vi.stubGlobal('navigator', {
      gpu: {
        requestAdapter: vi.fn(async () => adapter),
      },
    })
    vi.stubGlobal('window', { isSecureContext: true })

    const r = await probeWebGPU()
    expect(r.device).toBe(true)
    expect(r.adapter).toBe(true)
    expect(r.featureCount).toBe(2)
    expect(destroy).toHaveBeenCalled()
  })
})

describe('recommendedGpuBackend', () => {
  it('prefers webgpu when probe succeeds', () => {
    expect(
      recommendedGpuBackend(
        { webgl1: true, webgl2: true, highest: 'webgl2', vendor: null, renderer: null, maxTextureSize: 4096 },
        {
          supported: true,
          secureContext: true,
          adapter: true,
          adapterFallback: false,
          device: true,
          featureCount: 3,
          sampleFeatures: [],
          error: undefined,
        },
      ),
    ).toBe('webgpu')
  })

  it('falls back to webgl2', () => {
    expect(
      recommendedGpuBackend(
        { webgl1: true, webgl2: true, highest: 'webgl2', vendor: null, renderer: null, maxTextureSize: 4096 },
        {
          supported: true,
          secureContext: true,
          adapter: false,
          adapterFallback: false,
          device: false,
          featureCount: 0,
          sampleFeatures: [],
          error: 'x',
        },
      ),
    ).toBe('webgl2')
  })
})

describe('formatGpuSummaryLine', () => {
  it('shows pending WebGPU', () => {
    const line = formatGpuSummaryLine(
      { webgl1: true, webgl2: true, highest: 'webgl2', vendor: null, renderer: null, maxTextureSize: 4096 },
      { kind: 'pending' },
    )
    expect(line).toContain('WebGL 2')
    expect(line).toContain('WebGPU: …')
  })
})
