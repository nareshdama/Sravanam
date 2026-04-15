/**
 * Lightweight static mandala for the landing screen.
 * Canvas2D only — no p5 dependency. Renders a slowly rotating
 * Sri Yantra with outer ring and zodiac markers.
 * ~200 lines, loads instantly, no lazy chunk.
 */

const TAU = Math.PI * 2
const ZODIAC_GLYPHS = [
  '\u2648', '\u2649', '\u264A', '\u264B', '\u264C', '\u264D',
  '\u264E', '\u264F', '\u2650', '\u2651', '\u2652', '\u2653',
]

const GOLD = '#c8a246'
const GOLD_GLOW = '#e8c86a'
const ROSE = '#c27488'
const INDIGO = '#6366f1'

export interface StaticMandalaController {
  start(): void
  stop(): void
  resize(): void
}

export function createStaticMandala(
  mount: HTMLElement,
  opts?: { reducedMotion?: boolean },
): StaticMandalaController {
  const canvas = document.createElement('canvas')
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  mount.appendChild(canvas)

  const ctx = canvas.getContext('2d')!
  const reduced = opts?.reducedMotion ?? false
  let raf = 0
  let angle = 0
  let running = false

  function resize(): void {
    const rect = mount.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(100, rect.width)
    const h = Math.max(100, rect.height)
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function draw(): void {
    const w = canvas.width / (Math.min(window.devicePixelRatio || 1, 2))
    const h = canvas.height / (Math.min(window.devicePixelRatio || 1, 2))
    const cx = w / 2
    const cy = h / 2
    const R = Math.min(cx, cy) * 0.85

    ctx.clearRect(0, 0, w, h)

    // Background radial glow
    const bg = ctx.createRadialGradient(cx, cy, R * 0.05, cx, cy, R * 1.2)
    bg.addColorStop(0, 'rgba(200, 162, 70, 0.08)')
    bg.addColorStop(0.5, 'rgba(200, 162, 70, 0.03)')
    bg.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = bg
    ctx.beginPath()
    ctx.arc(cx, cy, R * 1.2, 0, TAU)
    ctx.fill()

    ctx.save()
    ctx.translate(cx, cy)

    // Outer ring
    ctx.strokeStyle = GOLD
    ctx.globalAlpha = 0.35
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(0, 0, R, 0, TAU)
    ctx.stroke()

    // Inner ring
    ctx.globalAlpha = 0.2
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.arc(0, 0, R * 0.88, 0, TAU)
    ctx.stroke()

    // Zodiac cusps + glyphs
    ctx.globalAlpha = 0.3
    ctx.font = `${Math.max(10, R * 0.09)}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = GOLD_GLOW
    for (let i = 0; i < 12; i++) {
      const a = (TAU / 12) * i - Math.PI / 2 + angle * 0.1
      // Cusp tick
      ctx.strokeStyle = GOLD
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.moveTo(Math.cos(a) * R * 0.88, Math.sin(a) * R * 0.88)
      ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R)
      ctx.stroke()
      // Glyph
      const gr = R * 0.94
      ctx.globalAlpha = 0.25
      ctx.fillText(ZODIAC_GLYPHS[i]!, Math.cos(a) * gr, Math.sin(a) * gr)
    }

    // Sri Yantra triangles (5 down + 4 up)
    ctx.globalAlpha = 1
    const yR = R * 0.55

    // Downward (Sakti) — gold/rose
    for (let i = 4; i >= 0; i--) {
      const scale = 0.28 + (i / 4) * 0.72
      const triR = yR * scale
      const rot = angle * (0.3 + i * 0.02)
      ctx.save()
      ctx.rotate(rot)
      ctx.strokeStyle = GOLD
      ctx.globalAlpha = 0.3 + i * 0.06
      ctx.lineWidth = 1.0 + (i === 4 ? 0.4 : 0)
      drawTriangle(ctx, triR, true)
      ctx.stroke()
      // Faint fill
      ctx.fillStyle = ROSE
      ctx.globalAlpha = 0.02 + i * 0.01
      drawTriangle(ctx, triR, true)
      ctx.fill()
      ctx.restore()
    }

    // Upward (Siva) — indigo/purple
    for (let i = 3; i >= 0; i--) {
      const scale = 0.22 + (i / 3) * 0.58
      const triR = yR * scale
      const rot = -angle * (0.3 + i * 0.02)
      ctx.save()
      ctx.rotate(rot)
      ctx.strokeStyle = INDIGO
      ctx.globalAlpha = 0.35 + i * 0.08
      ctx.lineWidth = 1.0
      drawTriangle(ctx, triR, false)
      ctx.stroke()
      ctx.fillStyle = INDIGO
      ctx.globalAlpha = 0.02 + i * 0.015
      drawTriangle(ctx, triR, false)
      ctx.fill()
      ctx.restore()
    }

    // Bindu (center point)
    const br = R * 0.035
    const binduGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, br * 3)
    binduGlow.addColorStop(0, 'rgba(255, 251, 235, 0.9)')
    binduGlow.addColorStop(0.4, 'rgba(254, 240, 138, 0.3)')
    binduGlow.addColorStop(1, 'rgba(200, 162, 70, 0)')
    ctx.fillStyle = binduGlow
    ctx.globalAlpha = 1
    ctx.beginPath()
    ctx.arc(0, 0, br * 3, 0, TAU)
    ctx.fill()

    ctx.fillStyle = '#fffcf0'
    ctx.beginPath()
    ctx.arc(0, 0, br, 0, TAU)
    ctx.fill()

    ctx.strokeStyle = GOLD_GLOW
    ctx.lineWidth = 1.2
    ctx.globalAlpha = 0.7
    ctx.beginPath()
    ctx.arc(0, 0, br, 0, TAU)
    ctx.stroke()

    ctx.restore()

    // Animate
    if (!reduced) {
      angle += 0.003
    }
    if (running) {
      raf = requestAnimationFrame(draw)
    }
  }

  return {
    start() {
      if (running) return
      running = true
      resize()
      raf = requestAnimationFrame(draw)
    },
    stop() {
      running = false
      cancelAnimationFrame(raf)
    },
    resize() {
      resize()
      if (!running) draw()
    },
  }
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  r: number,
  down: boolean,
): void {
  const tipY = down ? r * 0.55 : -r * 0.5
  const baseY = down ? -r * 0.42 : r * 0.38
  const half = r * (down ? 0.48 : 0.42)
  ctx.beginPath()
  ctx.moveTo(0, tipY)
  ctx.lineTo(-half, baseY)
  ctx.lineTo(half, baseY)
  ctx.closePath()
}
