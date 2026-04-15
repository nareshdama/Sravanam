/**
 * Browser GPU feature probing: WebGL / WebGL2 (sync) and WebGPU (async).
 * Use for renderer selection, diagnostics, or guarding WebGPU compute / WGSL paths.
 */

export type WebGLProbeResult = {
  readonly webgl1: boolean
  readonly webgl2: boolean
  /** Highest GL context successfully created, if any. */
  readonly highest: 'webgl2' | 'webgl' | null
  readonly vendor: string | null
  readonly renderer: string | null
  readonly maxTextureSize: number | null
}

export type WebGPUProbeResult = {
  readonly supported: boolean
  readonly secureContext: boolean
  readonly adapter: boolean
  /** True if an adapter was returned only after a second `powerPreference: 'low-power'` attempt. */
  readonly adapterFallback: boolean
  readonly device: boolean
  readonly featureCount: number
  /** Small sample of enabled features (stable order not guaranteed). */
  readonly sampleFeatures: readonly string[]
  readonly error: string | undefined
}

export type RecommendedGpuBackend = 'webgpu' | 'webgl2' | 'webgl' | 'canvas2d'

function readUnmaskedStrings(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
): { vendor: string | null; renderer: string | null } {
  const ext = gl.getExtension('WEBGL_debug_renderer_info') as WEBGL_debug_renderer_info | null
  if (!ext) return { vendor: null, renderer: null }
  try {
    return {
      vendor: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL),
      renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL),
    }
  } catch {
    return { vendor: null, renderer: null }
  }
}

/** Narrow extension shape (names differ slightly across TS DOM versions). */
type WEBGL_debug_renderer_info = {
  readonly UNMASKED_VENDOR_WEBGL: number
  readonly UNMASKED_RENDERER_WEBGL: number
}

/**
 * Probe WebGL1 / WebGL2 availability and basic limits. Uses a throwaway canvas unless one is passed.
 * Safe when `document` is missing (returns a null result).
 */
export function probeWebGL(canvas?: HTMLCanvasElement): WebGLProbeResult {
  const empty: WebGLProbeResult = {
    webgl1: false,
    webgl2: false,
    highest: null,
    vendor: null,
    renderer: null,
    maxTextureSize: null,
  }
  const c =
    canvas ??
    (typeof document !== 'undefined' ? document.createElement('canvas') : null)
  if (!c) return empty
  const attrs: WebGLContextAttributes = {
    alpha: true,
    antialias: true,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
    failIfMajorPerformanceCaveat: false,
  }

  const gl2Maybe = c.getContext('webgl2', attrs)
  if (gl2Maybe) {
    const gl2 = gl2Maybe as WebGL2RenderingContext
    const { vendor, renderer } = readUnmaskedStrings(gl2)
    return {
      webgl1: true,
      webgl2: true,
      highest: 'webgl2',
      vendor,
      renderer,
      maxTextureSize: gl2.getParameter(gl2.MAX_TEXTURE_SIZE) as number,
    }
  }

  const gl1Maybe =
    c.getContext('webgl', attrs) ??
    c.getContext('experimental-webgl', attrs as WebGLContextAttributes)
  if (!gl1Maybe) return empty

  const gl1 = gl1Maybe as WebGLRenderingContext
  const { vendor, renderer } = readUnmaskedStrings(gl1)
  return {
    webgl1: true,
    webgl2: false,
    highest: 'webgl',
    vendor,
    renderer,
    maxTextureSize: gl1.getParameter(gl1.MAX_TEXTURE_SIZE) as number,
  }
}

/**
 * Probe WebGPU: adapter + short-lived device to confirm the pipeline can initialize.
 * Does not keep the device — safe for a one-time capability check.
 */
export async function probeWebGPU(): Promise<WebGPUProbeResult> {
  const base: WebGPUProbeResult = {
    supported: false,
    secureContext:
      typeof window !== 'undefined' ? Boolean(window.isSecureContext) : false,
    adapter: false,
    adapterFallback: false,
    device: false,
    featureCount: 0,
    sampleFeatures: [],
    error: undefined,
  }

  if (typeof navigator === 'undefined' || !navigator.gpu) {
    return { ...base, error: 'WebGPU API not exposed' }
  }

  if (typeof window !== 'undefined' && !window.isSecureContext) {
    return { ...base, supported: true, error: 'WebGPU requires a secure context (HTTPS or localhost)' }
  }

  try {
    let adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' })
    let fallback = false
    if (!adapter) {
      adapter = await navigator.gpu.requestAdapter({ powerPreference: 'low-power' })
      fallback = Boolean(adapter)
    }
    if (!adapter) {
      return {
        ...base,
        supported: true,
        adapter: false,
        error: 'No suitable GPUAdapter (blocked, disabled, or no hardware)',
      }
    }

    const device = await adapter.requestDevice()
    const features = [...device.features].sort()
    device.destroy()

    return {
      supported: true,
      secureContext: true,
      adapter: true,
      adapterFallback: fallback,
      device: true,
      featureCount: features.length,
      sampleFeatures: features.slice(0, 6),
      error: undefined,
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return {
      ...base,
      supported: true,
      error: msg,
    }
  }
}

/** Prefer WebGPU when the full probe succeeds; else WebGL2 / WebGL; else 2D canvas. */
export function recommendedGpuBackend(
  gl: WebGLProbeResult,
  webgpu: WebGPUProbeResult,
): RecommendedGpuBackend {
  if (webgpu.device && webgpu.adapter) return 'webgpu'
  if (gl.webgl2) return 'webgl2'
  if (gl.webgl1) return 'webgl'
  return 'canvas2d'
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return `${s.slice(0, Math.max(0, max - 1))}…`
}

/** One-line summary for status UI or logs. */
export function formatGpuSummaryLine(
  gl: WebGLProbeResult,
  webgpu: WebGPUProbeResult | { kind: 'pending' },
): string {
  const glPart = gl.highest
    ? gl.highest === 'webgl2'
      ? 'WebGL 2'
      : 'WebGL 1'
    : 'no WebGL'

  let glExtra = ''
  if (gl.renderer) {
    glExtra = ` — ${truncate(gl.renderer, 42)}`
  }

  if ('kind' in webgpu && webgpu.kind === 'pending') {
    return `Graphics: ${glPart}${glExtra} · WebGPU: …`
  }

  const w = webgpu as WebGPUProbeResult
  if (!w.supported) {
    return `Graphics: ${glPart}${glExtra} · WebGPU: not available`
  }
  if (w.error && !w.device) {
    return `Graphics: ${glPart}${glExtra} · WebGPU: ${truncate(w.error, 56)}`
  }
  if (w.device) {
    const fb = w.adapterFallback ? ' (fallback adapter)' : ''
    return `Graphics: ${glPart}${glExtra} · WebGPU: ready${fb} · ${w.featureCount} features`
  }
  return `Graphics: ${glPart}${glExtra} · WebGPU: no adapter`
}
