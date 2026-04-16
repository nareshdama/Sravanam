/**
 * Lightweight static mandala for the landing screen.
 * Canvas2D only — no p5 dependency. Renders a slowly rotating
 * Sri Yantra with outer ring and Vedic-inspired markers.
 * Enhanced with floating prana particles and organic breathing.
 */

const TAU = Math.PI * 2


// Nakshatra-inspired dots (27 Vedic lunar mansions as subtle markers)
const NAKSHATRA_COUNT = 12 // Using 12 for outer ring symmetry

const GOLD = '#c8a246'
const GOLD_GLOW = '#e8c86a'
const ROSE = '#c27488'
const INDIGO = '#6366f1'
const AMBER = '#d4a574'

export interface StaticMandalaController {
  start(): void
  stop(): void
  resize(): void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  phase: number
  speed: number
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
  let time = 0

  // Prana particles
  const particles: Particle[] = []
  const PARTICLE_COUNT = reduced ? 0 : 18

  function initParticles(w: number, h: number): void {
    particles.length = 0
    const cx = w / 2
    const cy = h / 2
    const radius = Math.min(cx, cy) * 0.7

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const a = Math.random() * TAU
      const r = radius * (0.3 + Math.random() * 0.7)
      particles.push({
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.08 - Math.random() * 0.12, // Drift upward like incense smoke
        size: 1.5 + Math.random() * 2,
        alpha: 0.1 + Math.random() * 0.25,
        phase: Math.random() * TAU,
        speed: 0.5 + Math.random() * 0.5,
      })
    }
  }

  function updateParticles(w: number, h: number): void {
    const cx = w / 2
    const cy = h / 2
    const radius = Math.min(cx, cy) * 0.85
    for (const p of particles) {
      // Organic drift with slight circular motion
      p.phase += 0.01 * p.speed
      p.vx += Math.sin(p.phase) * 0.002
      p.vy += Math.cos(p.phase * 0.7) * 0.001


      p.x += p.vx
      p.y += p.vy

      // Check if particle drifted outside the ring
      const dx = p.x - cx
      const dy = p.y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)


      if (dist > radius * 1.3 || dist < radius * 0.2) {
        // Respawn at random position within ring
        const a = Math.random() * TAU
        const newR = radius * (0.4 + Math.random() * 0.5)
        p.x = cx + Math.cos(a) * newR
        p.y = cy + Math.sin(a) * newR
        p.vx = (Math.random() - 0.5) * 0.15
        p.vy = -0.08 - Math.random() * 0.12
        p.alpha = 0.1 + Math.random() * 0.2
      }
    }
  }

  function drawParticles(): void {
    for (const p of particles) {
      // Breathing opacity
      const breathe = 0.7 + 0.3 * Math.sin(time * 0.001 + p.phase)
      const alpha = p.alpha * breathe

      // Subtle golden glow
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
      grd.addColorStop(0, `rgba(200, 162, 70, ${alpha})`)
      grd.addColorStop(0.5, `rgba(232, 200, 106, ${alpha * 0.5})`)
      grd.addColorStop(1, 'rgba(200, 162, 70, 0)')

      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 3, 0, TAU)
      ctx.fill()

      // Bright core
      ctx.fillStyle = `rgba(255, 248, 230, ${alpha * 0.8})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 0.5, 0, TAU)
      ctx.fill()
    }
  }

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
    initParticles(w, h)
  }

  function draw(): void {
    time += 16

    const w = canvas.width / (Math.min(window.devicePixelRatio || 1, 2))
    const h = canvas.height / (Math.min(window.devicePixelRatio || 1, 2))
    const cx = w / 2
    const cy = h / 2
    const R = Math.min(cx, cy) * 0.85

    ctx.clearRect(0, 0, w, h)

    // Deep ambient glow
    const breatheIntensity = 0.85 + 0.15 * Math.sin(time * 0.0008)
    const bg = ctx.createRadialGradient(cx, cy, R * 0.02, cx, cy, R * 1.4)
    bg.addColorStop(0, `rgba(200, 162, 70, ${0.12 * breatheIntensity})`)
    bg.addColorStop(0.4, `rgba(200, 162, 70, ${0.05 * breatheIntensity})`)
    bg.addColorStop(0.7, `rgba(180, 140, 60, ${0.02 * breatheIntensity})`)
    bg.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = bg
    ctx.beginPath()
    ctx.arc(cx, cy, R * 1.4, 0, TAU)
    ctx.fill()

    // Draw particles behind the mandala
    drawParticles()

    ctx.save()
    ctx.translate(cx, cy)


    // Outer ring with subtle breathing
    ctx.strokeStyle = GOLD
    ctx.globalAlpha = 0.25 + 0.1 * breatheIntensity
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(0, 0, R, 0, TAU)
    ctx.stroke()

    // Inner ring
    ctx.globalAlpha = 0.15
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.arc(0, 0, R * 0.88, 0, TAU)
    ctx.stroke()

    // Decorative dots (Vedic nakshatra-inspired markers)
    ctx.globalAlpha = 0.35
    ctx.fillStyle = AMBER
    for (let i = 0; i < NAKSHATRA_COUNT; i++) {
      const a = (TAU / NAKSHATRA_COUNT) * i - Math.PI / 2 + angle * 0.05
      const dotR = R * 0.92

      // Small marker dot
      ctx.beginPath()
      ctx.arc(Math.cos(a) * dotR, Math.sin(a) * dotR, 2.5, 0, TAU)
      ctx.fill()

      // Subtle radial line
      ctx.strokeStyle = GOLD
      ctx.globalAlpha = 0.12
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(Math.cos(a) * R * 0.75, Math.sin(a) * R * 0.75)
      ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R)
      ctx.stroke()
    }

    // Sri Yantra triangles (5 down + 4 up)
    ctx.globalAlpha = 1
    const yR = R * 0.55

    // Downward (Sakti) — gold/rose
    for (let i = 4; i >= 0; i--) {
      const scale = 0.28 + (i / 4) * 0.72
      const triR = yR * scale
      const rot = angle * (0.25 + i * 0.015)
      ctx.save()
      ctx.rotate(rot)
      ctx.strokeStyle = GOLD
      ctx.globalAlpha = 0.35 + i * 0.07
      ctx.lineWidth = 1.0 + (i === 4 ? 0.5 : 0)
      drawTriangle(ctx, triR, true)
      ctx.stroke()
      // Faint fill
      ctx.fillStyle = ROSE
      ctx.globalAlpha = 0.015 + i * 0.012
      drawTriangle(ctx, triR, true)
      ctx.fill()
      ctx.restore()
    }

    // Upward (Siva) — indigo/purple
    for (let i = 3; i >= 0; i--) {
      const scale = 0.22 + (i / 3) * 0.58
      const triR = yR * scale
      const rot = -angle * (0.25 + i * 0.015)
      ctx.save()
      ctx.rotate(rot)
      ctx.strokeStyle = INDIGO
      ctx.globalAlpha = 0.4 + i * 0.07
      ctx.lineWidth = 1.0
      drawTriangle(ctx, triR, false)
      ctx.stroke()
      ctx.fillStyle = INDIGO
      ctx.globalAlpha = 0.018 + i * 0.012
      drawTriangle(ctx, triR, false)
      ctx.fill()
      ctx.restore()
    }

    // Bindu (center point) with organic breathing glow
    const br = R * 0.04
    const binduBreathe = 0.85 + 0.15 * Math.sin(time * 0.0012)

    // Outer glow ring
    const binduGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, br * 4 * binduBreathe)
    binduGlow.addColorStop(0, `rgba(255, 251, 235, ${0.85 * binduBreathe})`)
    binduGlow.addColorStop(0.3, `rgba(254, 240, 138, ${0.4 * binduBreathe})`)
    binduGlow.addColorStop(0.6, `rgba(200, 162, 70, ${0.15 * binduBreathe})`)
    binduGlow.addColorStop(1, 'rgba(200, 162, 70, 0)')
    ctx.fillStyle = binduGlow
    ctx.globalAlpha = 1
    ctx.beginPath()
    ctx.arc(0, 0, br * 4 * binduBreathe, 0, TAU)
    ctx.fill()

    // Pulsing ring
    ctx.strokeStyle = GOLD_GLOW
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.5 * binduBreathe
    ctx.beginPath()
    ctx.arc(0, 0, br * 2.5 * binduBreathe, 0, TAU)
    ctx.stroke()

    // Bright core
    ctx.fillStyle = '#fffcf0'
    ctx.globalAlpha = 1
    ctx.beginPath()
    ctx.arc(0, 0, br, 0, TAU)
    ctx.fill()

    // Gold rim
    ctx.strokeStyle = GOLD_GLOW
    ctx.lineWidth = 1.2
    ctx.globalAlpha = 0.8
    ctx.beginPath()
    ctx.arc(0, 0, br, 0, TAU)
    ctx.stroke()

    ctx.restore()

    // Update particles
    updateParticles(w, h)

    // Animate
    if (!reduced) {
      angle += 0.002
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
