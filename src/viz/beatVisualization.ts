import type { BinauralEngine } from '../audio/binauralEngine'
import { getPlanetSnapshots, longitudeToCanvasAngle, type PlanetSnapshot } from './planetaryEphemeris'
import { PlanetLongitudeSmoother } from './planetMotion'
import { drawSriChakra, SRICHAKRA_ROTATION_PERIOD_SEC } from './sriChakraDraw'

/** Cap visual modulation frequency (Hz) to reduce rapid flicker at high beat rates. */
export const VISUAL_BEAT_CAP_HZ = 8

/**
 * Effective frequency used for the breathing animation (rad/s factor in phase).
 */
export function effectiveVisualBeatHz(beatHz: number): number {
  if (beatHz <= 0) return 0.25
  return Math.min(beatHz, VISUAL_BEAT_CAP_HZ)
}

/**
 * Phase in radians for a smooth breathe at the perceived beat (capped for display).
 */
export function computeBeatPhase(elapsedAudioSec: number, beatHz: number): number {
  const f = effectiveVisualBeatHz(beatHz)
  return 2 * Math.PI * f * elapsedAudioSec
}

export { prefersReducedMotion } from '../lib/motionPreference'

export interface BeatVizControllers {
  start: () => void
  stop: () => void
}

interface Star {
  x: number
  y: number
  r: number
  tw: number
  /** 0 = distant pin, 1 = brighter */
  layer: number
}

/** Smoother than linear for organic UI motion (Figma-like easing). */
export function smoothstep01(t: number): number {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

/** Frame-rate–independent smoothing toward a target (critically damped feel). */
export function dampScalar(current: number, target: number, lambda: number, dt: number): number {
  if (dt <= 0) return current
  const k = 1 - Math.exp(-lambda * Math.min(dt, 0.1))
  return current + (target - current) * k
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildStars(w: number, h: number, seed: number): Star[] {
  const rnd = mulberry32(seed)
  const n = Math.min(260, Math.floor((w * h) / 2800))
  const stars: Star[] = []
  for (let i = 0; i < n; i++) {
    stars.push({
      x: rnd() * w,
      y: rnd() * h,
      r: 0.25 + rnd() * rnd() * 1.8,
      tw: rnd() * Math.PI * 2,
      layer: rnd(),
    })
  }
  return stars
}

function drawUniverseBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tSec: number,
  reducedMotion: boolean,
): void {
  // Deep multi-stop base (smooth color ramps like vector meshes)
  const g = ctx.createLinearGradient(-w * 0.1, -h * 0.05, w * 1.05, h * 1.02)
  g.addColorStop(0, '#070312')
  g.addColorStop(0.18, '#120a28')
  g.addColorStop(0.38, '#1a1452')
  g.addColorStop(0.52, '#251d6b')
  g.addColorStop(0.68, '#1e1160')
  g.addColorStop(0.85, '#0d1528')
  g.addColorStop(1, '#040814')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  const m = Math.min(w, h)
  // Soft nebula: 3-stop radials for realistic falloff
  const blobs: [number, number, number, [number, string][]][] = [
    [
      w * 0.12,
      h * 0.18,
      m * 0.58,
      [
        [0, 'rgba(192, 132, 252, 0.28)'],
        [0.45, 'rgba(124, 58, 237, 0.12)'],
        [1, 'rgba(0,0,0,0)'],
      ],
    ],
    [
      w * 0.88,
      h * 0.12,
      m * 0.48,
      [
        [0, 'rgba(244, 114, 182, 0.22)'],
        [0.5, 'rgba(190, 24, 93, 0.08)'],
        [1, 'rgba(0,0,0,0)'],
      ],
    ],
    [
      w * 0.52,
      h * 0.88,
      m * 0.52,
      [
        [0, 'rgba(56, 189, 248, 0.14)'],
        [0.55, 'rgba(14, 116, 144, 0.06)'],
        [1, 'rgba(0,0,0,0)'],
      ],
    ],
    [
      w * 0.08,
      h * 0.72,
      m * 0.42,
      [
        [0, 'rgba(251, 191, 36, 0.12)'],
        [0.5, 'rgba(180, 83, 9, 0.05)'],
        [1, 'rgba(0,0,0,0)'],
      ],
    ],
  ]
  for (const [bx, by, br, stops] of blobs) {
    const ng = ctx.createRadialGradient(bx, by, br * 0.08, bx, by, br)
    for (const [t, col] of stops) ng.addColorStop(t, col)
    ctx.fillStyle = ng
    ctx.beginPath()
    ctx.arc(bx, by, br, 0, Math.PI * 2)
    ctx.fill()
  }

  if (!reducedMotion) {
    const drift = tSec * 0.018
    ctx.globalAlpha = 0.12
    const ng2 = ctx.createLinearGradient(
      w * 0.15 + Math.sin(drift) * 28,
      h * 0.05,
      w * 0.92 + Math.cos(drift * 0.62) * 36,
      h * 0.98,
    )
    ng2.addColorStop(0, 'rgba(129, 140, 248, 0.55)')
    ng2.addColorStop(0.5, 'rgba(217, 70, 239, 0.2)')
    ng2.addColorStop(1, 'rgba(236, 72, 153, 0.18)')
    ctx.fillStyle = ng2
    ctx.fillRect(0, 0, w, h)
    ctx.globalAlpha = 1
  }
}

function drawStarfield(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  tSec: number,
  reducedMotion: boolean,
): void {
  const prev = ctx.globalCompositeOperation
  ctx.globalCompositeOperation = 'screen'

  for (const s of stars) {
    const slow = reducedMotion ? 0 : 0.5 + 0.5 * Math.sin(tSec * 0.55 + s.tw)
    const base = 0.35 + s.layer * 0.55
    const tw = reducedMotion ? base * 0.85 : base * (0.72 + 0.28 * slow)
    const glowR = s.r * (2.4 + s.layer * 2.2)
    const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR)
    const core = `rgba(255, 252, 245, ${tw})`
    const mid = `rgba(230, 240, 255, ${tw * 0.35})`
    g.addColorStop(0, core)
    g.addColorStop(0.15, mid)
    g.addColorStop(0.55, `rgba(200, 220, 255, ${tw * 0.08})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalCompositeOperation = prev
}

function drawZodiacRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  breathe: number,
): void {
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Outer soft track + inner hairline (layered like Figma strokes)
  const outerAlpha = 0.14 + 0.1 * breathe
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(167, 139, 250, ${outerAlpha})`
  ctx.lineWidth = 2.25
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, cy, radius * 0.978, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(196, 181, 253, ${0.22 + 0.12 * breathe})`
  ctx.lineWidth = 1
  ctx.stroke()

  // Degree cusps (30°) — short outward ticks, even spacing
  for (let i = 0; i < 12; i++) {
    const a = longitudeToCanvasAngle(i * 30)
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * radius * 0.975, cy + Math.sin(a) * radius * 0.975)
    ctx.lineTo(cx + Math.cos(a) * radius * 1.018, cy + Math.sin(a) * radius * 1.018)
    ctx.strokeStyle = `rgba(253, 224, 71, ${0.14 + 0.07 * breathe})`
    ctx.lineWidth = 1.1
    ctx.stroke()
  }

  const signs = [
    '♈',
    '♉',
    '♊',
    '♋',
    '♌',
    '♍',
    '♎',
    '♏',
    '♐',
    '♑',
    '♒',
    '♓',
  ]
  const fs = Math.max(11, radius * 0.085)
  ctx.font = `500 ${fs}px 'Segoe UI Symbol', 'Apple Symbols', serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < 12; i++) {
    const midLon = i * 30 + 15
    const ang = longitudeToCanvasAngle(midLon)
    const lx = cx + Math.cos(ang) * (radius * 0.88)
    const ly = cy + Math.sin(ang) * (radius * 0.88)
    ctx.shadowColor = 'rgba(251, 191, 36, 0.45)'
    ctx.shadowBlur = 6 + 4 * breathe
    ctx.fillStyle = `rgba(254, 249, 195, ${0.42 + 0.28 * breathe})`
    ctx.fillText(signs[i]!, lx, ly)
  }
  ctx.shadowBlur = 0

  ctx.restore()
}

function drawPlanetWheel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  orbitR: number,
  planets: PlanetSnapshot[],
  tSec: number,
  breathe: number,
): void {
  ctx.save()
  ctx.lineCap = 'round'
  const dotR = Math.max(2.4, orbitR * 0.03)
  for (const p of planets) {
    const ang = longitudeToCanvasAngle(p.lonDeg)
    const px = cx + Math.cos(ang) * orbitR
    const py = cy + Math.sin(ang) * orbitR
    const shimmer = 0.94 + 0.06 * Math.sin(tSec * 0.35 + p.hue * 0.015)
    const r = dotR * shimmer * (0.97 + 0.03 * breathe)

    const bloom = ctx.createRadialGradient(px, py, 0, px, py, r * 4.2)
    bloom.addColorStop(0, `hsla(${p.hue}, 88%, 62%, 0.55)`)
    bloom.addColorStop(0.35, `hsla(${p.hue}, 70%, 45%, 0.18)`)
    bloom.addColorStop(1, 'hsla(0,0%,0%,0)')
    ctx.fillStyle = bloom
    ctx.beginPath()
    ctx.arc(px, py, r * 4.2, 0, Math.PI * 2)
    ctx.fill()

    const core = ctx.createRadialGradient(px, py, 0, px, py, r * 1.15)
    core.addColorStop(0, `hsla(${p.hue}, 92%, 68%, 1)`)
    core.addColorStop(0.65, `hsla(${p.hue}, 85%, 48%, 0.95)`)
    core.addColorStop(1, `hsla(${p.hue}, 70%, 35%, 0.85)`)
    ctx.fillStyle = core
    ctx.beginPath()
    ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(255,255,255,0.42)'
    ctx.lineWidth = 0.85
    ctx.stroke()
  }
  ctx.restore()
}

function drawVignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cx: number,
  cy: number,
  breathe: number,
): void {
  const m = Math.min(w, h)
  const g = ctx.createRadialGradient(cx, cy, m * 0.18, cx, cy, m * 0.92)
  g.addColorStop(0, 'rgba(2, 4, 12, 0)')
  g.addColorStop(0.55, `rgba(6, 8, 22, ${0.08 + 0.04 * breathe})`)
  g.addColorStop(1, `rgba(2, 4, 14, ${0.38 + 0.08 * breathe})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function drawBeatLabel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  bottomY: number,
  text: string,
  breathe: number,
): void {
  ctx.save()
  ctx.font = '600 11px system-ui, "Segoe UI", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.shadowColor = 'rgba(0,0,0,0.45)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetY = 1
  ctx.fillStyle = `rgba(254, 243, 199, ${0.82 + 0.1 * breathe})`
  ctx.fillText(text, cx, bottomY)
  ctx.restore()
}

function formatPlanetPanel(snapshots: PlanetSnapshot[]): string {
  return snapshots
    .map(
      (p) =>
        `${p.label}: ${p.sign} ${p.degInSign}° ${p.minInSign.toString().padStart(2, '0')}' (λ ${p.lonDeg.toFixed(2)}°)`,
    )
    .join('\n')
}

/**
 * Cosmic canvas: starfield, Śrī Chakra, tropical planet wheel, beat-synced glow.
 * Planetary longitudes use astronomy-engine (geocentric ecliptic, tropical).
 */
export function createBeatVisualization(options: {
  canvas: HTMLCanvasElement
  engine: BinauralEngine
  reducedMotion: boolean
  planetPanel?: HTMLElement | null
}): BeatVizControllers {
  const { canvas, engine, reducedMotion, planetPanel } = options
  let rafId = 0
  let running = false
  let stars: Star[] = []
  let starSeed = 42
  let lastPanelUpdate = 0
  let lastStarW = 0
  let lastStarH = 0
  /** Smoothed 0–1 breathe envelope (lags audio target for fluid motion). */
  let smoothBreathe = 0.5
  let lastAudioTime: number | null = null
  const planetSmoother = new PlanetLongitudeSmoother()
  /** Wall clock for ephemeris drift + Śrī Chakra spin (sec). */
  let lastWallSec: number | null = null
  let sriSpinStartSec = 0

  const maybeCtx = canvas.getContext('2d', { alpha: true, desynchronized: true })
  if (!maybeCtx) {
    return {
      start: () => {},
      stop: () => {},
    }
  }
  const ctx = maybeCtx
  ctx.imageSmoothingEnabled = true

  function resize(): void {
    const dpr = window.devicePixelRatio ?? 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (w === 0 || h === 0) return
    const nw = Math.floor(w * dpr)
    const nh = Math.floor(h * dpr)
    if (canvas.width !== nw || canvas.height !== nh) {
      canvas.width = nw
      canvas.height = nh
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (w !== lastStarW || h !== lastStarH) {
      lastStarW = w
      lastStarH = h
      stars = buildStars(w, h, starSeed)
    }
  }

  function drawAnimated(nowMs: number): void {
    const clock = engine.getAudioClock()
    const t0 = engine.getPlaybackStartTime()
    const p = engine.getParams()
    if (!clock || t0 === null) return

    const w = canvas.clientWidth
    const h = canvas.clientHeight
    const elapsed = clock.currentTime - t0
    const phase = computeBeatPhase(elapsed, p.beatHz)
    const tAudio = clock.currentTime
    const dt =
      lastAudioTime === null ? 1 / 60 : Math.min(0.09, Math.max(0, tAudio - lastAudioTime))
    lastAudioTime = tAudio
    const targetBreathe = smoothstep01(0.5 + 0.5 * Math.sin(phase))
    smoothBreathe = dampScalar(smoothBreathe, targetBreathe, 16, dt)
    const breathe = smoothBreathe
    const tSec = tAudio

    const wallNow = performance.now() / 1000
    const dtWall =
      lastWallSec === null ? 1 / 60 : Math.min(0.12, Math.max(1e-4, wallNow - lastWallSec))
    lastWallSec = wallNow

    const raw = getPlanetSnapshots(new Date())
    const smoothLons = planetSmoother.update(
      raw.map((s) => s.lonDeg),
      dtWall,
    )
    const wheelSnaps: PlanetSnapshot[] = raw.map((s, i) => ({
      ...s,
      lonDeg: smoothLons[i]!,
    }))

    if (planetPanel && nowMs - lastPanelUpdate > 900) {
      lastPanelUpdate = nowMs
      planetPanel.textContent = formatPlanetPanel(raw)
    }

    drawUniverseBackground(ctx, w, h, tSec, reducedMotion)
    drawStarfield(ctx, stars, tSec, reducedMotion)

    const cx = w / 2
    const cy = h * 0.52
    const minDim = Math.min(w, h)

    const wheelR = minDim * 0.36
    drawZodiacRing(ctx, cx, cy, wheelR, breathe)
    ctx.save()
    ctx.setLineDash([5, 7])
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(cx, cy, wheelR * 0.92, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(52, 211, 153, ${0.12 + 0.12 * breathe})`
    ctx.lineWidth = 1.15
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()

    drawPlanetWheel(ctx, cx, cy, wheelR * 0.78, wheelSnaps, tSec, breathe)

    const sriR = minDim * 0.2
    const sriRot =
      (wallNow - sriSpinStartSec) * ((2 * Math.PI) / SRICHAKRA_ROTATION_PERIOD_SEC)
    drawSriChakra(ctx, cx, cy, sriR, breathe, sriRot)

    drawVignette(ctx, w, h, cx, cy, breathe)

    const beatLabel =
      p.beatHz > 0
        ? `Binaural beat ≈ ${p.beatHz.toFixed(2)} Hz${p.beatHz > VISUAL_BEAT_CAP_HZ ? ` (pulse display ≤${VISUAL_BEAT_CAP_HZ} Hz)` : ''}`
        : 'Binaural beat 0 Hz — still center'
    drawBeatLabel(ctx, cx, h - 12, beatLabel, breathe)
  }

  function loop(t: number): void {
    if (!running) return
    if (!engine.running) {
      running = false
      return
    }
    resize()
    if (reducedMotion) {
      drawStatic(t)
    } else {
      drawAnimated(t)
    }
    rafId = requestAnimationFrame(loop)
  }

  function drawStatic(nowMs: number): void {
    const p = engine.getParams()
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    const clock = engine.getAudioClock()
    const tSec = clock?.currentTime ?? 0

    const wallNow = performance.now() / 1000
    const dtWall =
      lastWallSec === null ? 1 / 60 : Math.min(0.12, Math.max(1e-4, wallNow - lastWallSec))
    lastWallSec = wallNow

    const raw = getPlanetSnapshots(new Date())
    const smoothLons = planetSmoother.update(
      raw.map((s) => s.lonDeg),
      dtWall,
    )
    const wheelSnaps: PlanetSnapshot[] = raw.map((s, i) => ({
      ...s,
      lonDeg: smoothLons[i]!,
    }))

    if (planetPanel && nowMs - lastPanelUpdate > 900) {
      lastPanelUpdate = nowMs
      planetPanel.textContent = formatPlanetPanel(raw)
    }

    drawUniverseBackground(ctx, w, h, tSec, true)
    drawStarfield(ctx, stars, tSec, true)

    const cx = w / 2
    const cy = h * 0.52
    const minDim = Math.min(w, h)
    const wheelR = minDim * 0.36
    const calm = 0.52
    drawZodiacRing(ctx, cx, cy, wheelR, calm)
    ctx.save()
    ctx.setLineDash([5, 7])
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(cx, cy, wheelR * 0.92, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(52, 211, 153, ${0.18})`
    ctx.lineWidth = 1.1
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
    drawPlanetWheel(ctx, cx, cy, wheelR * 0.78, wheelSnaps, tSec, calm)
    drawSriChakra(ctx, cx, cy, minDim * 0.2, calm, 0)
    drawVignette(ctx, w, h, cx, cy, calm)
    drawBeatLabel(ctx, cx, h - 12, `Beat ${p.beatHz.toFixed(2)} Hz · motion reduced`, calm)
  }

  return {
    start: () => {
      if (running) return
      running = true
      starSeed = (Date.now() & 0xffffffff) >>> 0
      lastPanelUpdate = 0
      smoothBreathe = 0.5
      lastAudioTime = null
      lastWallSec = null
      sriSpinStartSec = performance.now() / 1000
      planetSmoother.reset(getPlanetSnapshots(new Date()).map((s) => s.lonDeg))
      resize()
      rafId = requestAnimationFrame(loop)
    },
    stop: () => {
      running = false
      cancelAnimationFrame(rafId)
      rafId = 0
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    },
  }
}

export function formatVizBeatSummary(engine: BinauralEngine): string {
  const p = engine.getParams()
  return `Perceived beat ≈ ${p.beatHz.toFixed(2)} Hz. Visualization is for relaxation only — not medical or EEG feedback.`
}
