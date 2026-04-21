import p5 from 'p5'
import { formatPlanetPanelText, getCurrentPlanetSnapshots } from './planetaryEphemeris'

const PHI = 1.618033988749
const CHAKRA: [number, number, number][] = [
  [220, 40, 40],
  [255, 120, 30],
  [255, 220, 40],
  [40, 220, 100],
  [40, 160, 255],
  [100, 60, 255],
  [200, 80, 255],
]
const CHAKRA_GLOW: [number, number, number][] = [
  [255, 80, 80],
  [255, 160, 60],
  [255, 240, 80],
  [80, 255, 140],
  [80, 200, 255],
  [140, 100, 255],
  [240, 120, 255],
]

export interface VedicCosmicControllers {
  start: () => void
  stop: () => void
}

type Star = {
  x: number
  y: number
  z: number
  flicker: number
  hue: [number, number, number]
  size: number
}
type Nebula = {
  x: number
  y: number
  r: number
  col: [number, number, number]
  glow: [number, number, number]
  phase: number
  drift: number
  layers: number
}
type GalaxyArm = {
  baseA: number
  baseR: number
  ox: number
  oy: number
  size: number
  col: [number, number, number]
  alpha: number
  flicker: number
}
type AuraP = {
  angle: number
  dist: number
  speed: number
  size: number
  chakra: number
  life: number
  lifeSpeed: number
}
type KundaliniP = {
  seed: number
  phase: number
  speed: number
}

/**
 * “Vedic Cosmic Flower — Transcendence” (p5), instance mode — matches reference sketch:
 * `targetFreq = map(mouseX, 0, width, 0.005, 0.1)`, `currentFreq = lerp(..., 0.03)`,
 * `angle += currentFreq`, `mantaTime += 0.016`, full layers/trail/bloom. Ephemeris panel optional.
 */
export function createVedicCosmicFlower(options: {
  mount: HTMLElement
  reducedMotion: boolean
  planetPanel?: HTMLElement | null
  getAudioSync?: () => { elapsed: number; beatHz: number } | null
  getBreathingSync?: () => { expansion: number } | null
}): VedicCosmicControllers {
  const { mount, reducedMotion, planetPanel, getAudioSync, getBreathingSync } = options

  let instance: p5 | undefined
  let booting = false
  let lastPanelMs = 0
  let resizeObs: ResizeObserver | null = null

  const sketch = (p: p5) => {
    let animAngle = 0
    let currentFreq = 0.02
    let mantaTime = 0
    let omWave = 0
    let glowBuffer: p5.Graphics
    let trailBuffer: p5.Graphics
    let stars: Star[] = []
    let nebulae: Nebula[] = []
    let galaxyArms: GalaxyArm[] = []
    let auraP: AuraP[] = []
    let kundaliniP: KundaliniP[] = []

    function initCosmos() {
      const light = reducedMotion
      stars = []
      nebulae = []
      galaxyArms = []
      auraP = []
      kundaliniP = []
      const nStars = light ? 500 : 1200
      for (let i = 0; i < nStars; i++) {
        stars.push({
          x: p.random(-2, 2),
          y: p.random(-2, 2),
          z: p.random(0.15, 1),
          flicker: p.random(1000),
          hue:
            p.random() < 0.2
              ? [p.random(160, 255), p.random(180, 240), 255]
              : [255, 255, p.random(220, 255)],
          size: p.random(0.4, 3.5),
        })
      }
      const nNeb = light ? 10 : 20
      for (let i = 0; i < nNeb; i++) {
        nebulae.push({
          x: p.random(-1.3, 1.3),
          y: p.random(-1.3, 1.3),
          r: p.random(0.12, 0.6),
          col: [...CHAKRA[p.floor(p.random(7))]] as [number, number, number],
          glow: [...CHAKRA_GLOW[p.floor(p.random(7))]] as [number, number, number],
          phase: p.random(p.TWO_PI),
          drift: p.random(0.0003, 0.0012),
          layers: p.floor(p.random(4, 8)),
        })
      }
      for (let arm = 0; arm < 6; arm++) {
        const armAngle = arm * (p.TWO_PI / 6)
        const nArm = light ? 90 : 180
        for (let i = 0; i < nArm; i++) {
          const t = light ? i / nArm : i / 180
          galaxyArms.push({
            baseA: armAngle + t * p.PI * 3,
            baseR: t * 0.95,
            ox: p.random(-0.025, 0.025),
            oy: p.random(-0.025, 0.025),
            size: p.random(0.5, 3) * (1 - t * 0.5),
            col: [...CHAKRA[p.floor(t * 6.9) % 7]] as [number, number, number],
            alpha: p.random(0.3, 1) * (1 - t * 0.4),
            flicker: p.random(1000),
          })
        }
      }
      const nAura = light ? 200 : 500
      for (let i = 0; i < nAura; i++) {
        auraP.push({
          angle: p.random(p.TWO_PI),
          dist: p.random(0.04, 0.7),
          speed: p.random(0.001, 0.014) * (p.random() > 0.5 ? 1 : -1),
          size: p.random(1, 6),
          chakra: p.floor(p.random(7)),
          life: p.random(p.TWO_PI),
          lifeSpeed: p.random(0.006, 0.04),
        })
      }
      const nK = light ? 40 : 90
      for (let i = 0; i < nK; i++) {
        kundaliniP.push({
          seed: i * 137.508,
          phase: p.random(p.TWO_PI),
          speed: p.random(0.18, 0.5),
        })
      }
    }

    p.setup = () => {
      const rect = mount.getBoundingClientRect()
      const w = Math.max(280, rect.width || mount.clientWidth || 800)
      const h = Math.max(
        200,
        rect.height > 10 ? Math.floor(rect.height) : Math.floor((w * 9) / 16),
      )
      p.createCanvas(w, h)
      p.pixelDensity(reducedMotion ? 1 : 2)
      glowBuffer = p.createGraphics(p.width, p.height)
      glowBuffer.pixelDensity(1)
      trailBuffer = p.createGraphics(p.width, p.height)
      trailBuffer.pixelDensity(1)
      trailBuffer.background(0, 0)
      p.noFill()
      initCosmos()
    }

    p.draw = () => {
      const cx = p.width / 2
      const cy = p.height / 2
      const dim = p.min(p.width, p.height)
      p.background(2, 1, 6, 20)

      let breath = p.sin(animAngle * 0.5) * 0.5 + 0.5
      const w = p.max(p.width, 1)
      const mx = p.constrain(p.mouseX, 0, w)
      const targetFreq = p.map(mx, 0, w, 0.005, 0.1)
      currentFreq = p.lerp(currentFreq, targetFreq, 0.03)
      omWave = p.sin(animAngle * 0.3) * 0.5 + 0.5

      // Phase 3: Visual Entrainment (Audio/Visual Sync)
      if (getAudioSync && !reducedMotion) {
        const sync = getAudioSync()
        if (sync) {
           const beatPhase = p.abs(p.sin(p.PI * sync.beatHz * sync.elapsed))
           breath = p.lerp(breath, beatPhase, 0.35)
           omWave = p.lerp(omWave, beatPhase, 0.25)
        }
      }

      // Phase 4: Guided Breathing Pacer
      if (getBreathingSync) {
        const bSync = getBreathingSync()
        if (bSync) {
           // Completely override the autonomous cycle with the explicit 4-7-8 breathing pacer
           breath = p.lerp(breath, bSync.expansion, 0.1)
        }
      }

      if (planetPanel) {
        const now = p.millis()
        if (now - lastPanelMs > 900) {
          lastPanelMs = now
          planetPanel.textContent = formatPlanetPanelText(getCurrentPlanetSnapshots())
        }
      }

      glowBuffer.clear()
      glowBuffer.resetMatrix()
      glowBuffer.translate(cx, cy)

      drawGalaxyArms(cx, cy, dim)
      drawNebulae(cx, cy, dim)
      drawStarField(cx, cy, dim)
      drawAuraField(cx, cy, dim)

      p.push()
      p.translate(cx, cy)
      drawOmWaveDistortion(dim, breath)
      drawMandalaRings(dim, breath)
      drawChakraRings(dim, breath)
      drawSriYantra(dim, breath)
      const baseR = dim * 0.21 + p.sin(animAngle) * dim * 0.035
      drawFlowerOfLife(baseR, breath)
      drawTrailLayer(baseR)
      drawBindu(dim, breath)
      p.pop()

      trailBuffer.background(0, 0, 0, 5)
      p.push()
      p.blendMode(p.ADD)
      p.tint(255, 35)
      p.image(trailBuffer, 0, 0)
      p.blendMode(p.BLEND)
      p.noTint()
      p.pop()
      drawBloom()
      drawKundaliniParticles(cx, cy, dim)
      drawVignette(cx, cy)

      animAngle += currentFreq
      mantaTime += 0.016
    }

    function drawGalaxyArms(cx: number, cy: number, dim: number) {
      p.noStroke()
      const rot = animAngle * 0.015
      for (const g of galaxyArms) {
        const a = g.baseA + rot
        const r = g.baseR * dim * 0.55
        const px = cx + p.cos(a) * r + g.ox * dim
        const py = cy + p.sin(a) * r + g.oy * dim
        const fl = p.sin(animAngle * 1.5 + g.flicker) * 0.3 + 0.7
        const al = g.alpha * fl * 130
        p.fill(g.col[0], g.col[1], g.col[2], al)
        const sz = g.size * (dim / 650)
        p.ellipse(px, py, sz, sz)
        p.fill(g.col[0], g.col[1], g.col[2], al * 0.12)
        p.ellipse(px, py, sz * 6, sz * 6)
      }
    }

    function drawNebulae(cx: number, cy: number, dim: number) {
      p.noStroke()
      for (const n of nebulae) {
        const nx = cx + n.x * dim * 0.7 + p.sin(animAngle * 0.08 + n.phase) * dim * 0.06
        const ny = cy + n.y * dim * 0.7 + p.cos(animAngle * 0.06 + n.phase) * dim * 0.05
        const nr = n.r * dim
        const br = p.sin(animAngle * 0.25 + n.phase) * 0.35 + 0.65
        for (let ring = n.layers; ring > 0; ring--) {
          const t = ring / n.layers
          p.fill(
            p.lerp(n.glow[0], n.col[0], t),
            p.lerp(n.glow[1], n.col[1], t),
            p.lerp(n.glow[2], n.col[2], t),
            t * 11 * br,
          )
          p.ellipse(
            nx + p.sin(animAngle * 0.1 + ring) * 4,
            ny + p.cos(animAngle * 0.1 + ring) * 4,
            nr * ring * 0.35,
            nr * ring * 0.3,
          )
        }
      }
    }

    function drawStarField(cx: number, cy: number, dim: number) {
      p.noStroke()
      for (const s of stars) {
        const sx = cx + s.x * dim
        const sy = cy + s.y * dim
        const fl = p.sin(animAngle * 2.5 + s.flicker) * 0.35 + 0.65
        const al = fl * s.z * 230
        p.fill(s.hue[0], s.hue[1], s.hue[2], al)
        const sz = s.size * s.z * (dim / 700)
        p.ellipse(sx, sy, sz, sz)
        if (s.size > 2.2) {
          p.stroke(s.hue[0], s.hue[1], s.hue[2], al * 0.25)
          p.strokeWeight(0.4)
          const flen = sz * 5
          p.line(sx - flen, sy, sx + flen, sy)
          p.line(sx, sy - flen, sx, sy + flen)
          p.noStroke()
          p.fill(s.hue[0], s.hue[1], s.hue[2], al * 0.08)
          p.ellipse(sx, sy, sz * 8, sz * 8)
        }
      }
    }

    function drawAuraField(cx: number, cy: number, dim: number) {
      p.noStroke()
      for (const part of auraP) {
        part.angle += part.speed * (reducedMotion ? 0.45 : 1)
        part.life += part.lifeSpeed * (reducedMotion ? 0.55 : 1)
        const r = part.dist * dim * 0.52
        const wobble = p.sin(part.life * 3) * dim * 0.025
        const px = cx + p.cos(part.angle) * (r + wobble)
        const py = cy + p.sin(part.angle) * (r + wobble)
        const al = p.sin(part.life) * 0.5 + 0.5
        const g = CHAKRA_GLOW[part.chakra]
        const c = CHAKRA[part.chakra]
        p.fill(g[0], g[1], g[2], al * 85)
        const sz = part.size * (dim / 500)
        p.ellipse(px, py, sz, sz)
        p.fill(c[0], c[1], c[2], al * 10)
        p.ellipse(px, py, sz * 6, sz * 6)
      }
    }

    function drawOmWaveDistortion(dim: number, _breath: number) {
      p.noFill()
      for (let w = 0; w < 6; w++) {
        let waveR = dim * (0.08 + w * 0.11) * (0.8 + omWave * 0.4)
        const waveT = (animAngle * 0.8 + w * 1.2) % p.TWO_PI
        waveR += p.sin(waveT) * dim * 0.035
        const ci = (p.floor(animAngle * 0.15) + w) % 7
        const c = CHAKRA_GLOW[ci]
        const al = p.sin(waveT) * 0.5 + 0.5
        p.stroke(c[0], c[1], c[2], al * 40)
        p.strokeWeight(p.map(dim, 400, 2000, 1, 4))
        p.beginShape()
        for (let i = 0; i <= 140; i++) {
          const a = (p.TWO_PI / 140) * i
          const d = p.sin(a * 9 + animAngle * 2 + w) * dim * 0.01 * omWave
          p.vertex(p.cos(a) * (waveR + d), p.sin(a) * (waveR + d))
        }
        p.endShape()

        glowBuffer.noFill()
        glowBuffer.stroke(c[0], c[1], c[2], al * 18)
        glowBuffer.strokeWeight(p.map(dim, 400, 2000, 4, 12))
        glowBuffer.beginShape()
        for (let i = 0; i <= 70; i++) {
          const a = (p.TWO_PI / 70) * i
          const d = p.sin(a * 9 + animAngle * 2 + w) * dim * 0.01 * omWave
          glowBuffer.vertex(p.cos(a) * (waveR + d), p.sin(a) * (waveR + d))
        }
        glowBuffer.endShape()
      }
    }

    function drawMandalaRings(dim: number, _breath: number) {
      for (let ring = 0; ring < 4; ring++) {
        const mR = dim * (0.28 + ring * 0.055)
        const segments = 12 + ring * 8
        const ci = (p.floor(animAngle * 0.1) + ring * 2) % 7
        const c = CHAKRA[ci]
        const al = p.sin(animAngle * 0.4 + ring) * 0.4 + 0.5
        p.push()
        p.rotate(animAngle * 0.035 * (ring % 2 === 0 ? 1 : -1))
        p.stroke(c[0], c[1], c[2], al * 55)
        p.strokeWeight(p.map(dim, 400, 2000, 0.5, 2))
        p.noFill()
        p.ellipse(0, 0, mR * 2, mR * 2)
        for (let i = 0; i < segments; i++) {
          const a = (p.TWO_PI / segments) * i
          const px = p.cos(a) * mR
          const py = p.sin(a) * mR
          p.push()
          p.translate(px, py)
          p.rotate(a + p.HALF_PI)
          const pH = dim * 0.03 * (1 + p.sin(animAngle + i) * 0.3)
          const pW = dim * 0.012
          p.stroke(c[0], c[1], c[2], al * 45)
          p.beginShape()
          p.vertex(0, -pH)
          const pb = p as unknown as {
            bezierVertex: (x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) => void
          }
          pb.bezierVertex(-pW, -pH * 0.5, -pW, pH * 0.3, 0, pH * 0.5)
          pb.bezierVertex(pW, pH * 0.3, pW, -pH * 0.5, 0, -pH)
          p.endShape()
          p.pop()
          if (i % 2 === 0) {
            p.stroke(c[0], c[1], c[2], al * 18)
            p.line(0, 0, p.cos(a) * mR * 0.85, p.sin(a) * mR * 0.85)
          }
        }
        p.pop()
      }
    }

    function drawChakraRings(dim: number, breath: number) {
      p.noFill()
      for (let i = 0; i < 7; i++) {
        const c = CHAKRA_GLOW[i]
        const ringR = dim * (0.35 + i * 0.035) * (0.92 + breath * 0.08)
        const al = p.sin(animAngle * 0.5 + i * 0.9) * 0.5 + 0.5
        p.stroke(c[0], c[1], c[2], al * 45)
        p.strokeWeight(p.map(dim, 400, 2000, 0.4, 2))
        p.push()
        p.rotate(animAngle * 0.04 * (i % 2 === 0 ? 1 : -1) + i * 0.5)
        p.beginShape()
        for (let j = 0; j <= 100; j++) {
          const a = (p.TWO_PI / 100) * j
          const wobble = p.sin(a * (6 + i) + animAngle * 1.5 + i) * dim * 0.005
          p.vertex(p.cos(a) * (ringR + wobble), p.sin(a) * (ringR + wobble))
        }
        p.endShape()
        p.pop()

        glowBuffer.noFill()
        glowBuffer.stroke(c[0], c[1], c[2], al * 14)
        glowBuffer.strokeWeight(p.map(dim, 400, 2000, 3, 8))
        glowBuffer.push()
        glowBuffer.rotate(animAngle * 0.04 * (i % 2 === 0 ? 1 : -1) + i * 0.5)
        glowBuffer.ellipse(0, 0, ringR * 2, ringR * 2)
        glowBuffer.pop()
      }
    }

    function drawSriYantra(dim: number, breath: number) {
      const yR = dim * 0.27 * (0.95 + breath * 0.05)
      p.noFill()
      for (let t = 0; t < 9; t++) {
        const isUp = t < 5
        const sc = 1 - t * 0.07
        const triR = yR * sc
        const c = CHAKRA_GLOW[t % 7]
        const al = p.sin(animAngle * 0.35 + t * 0.8) * 0.45 + 0.45
        p.stroke(c[0], c[1], c[2], al * 95)
        p.strokeWeight(p.map(dim, 400, 2000, 0.8, 3))
        p.push()
        p.rotate(animAngle * 0.022 * (isUp ? 1 : -1) + t * 0.12)
        p.beginShape()
        for (let i = 0; i < 3; i++) {
          const a = (p.TWO_PI / 3) * i + (isUp ? -p.HALF_PI : p.HALF_PI)
          p.vertex(p.cos(a) * triR, p.sin(a) * triR)
        }
        p.endShape(p.CLOSE)
        p.pop()

        glowBuffer.noFill()
        glowBuffer.stroke(c[0], c[1], c[2], al * 28)
        glowBuffer.strokeWeight(p.map(dim, 400, 2000, 4, 10))
        glowBuffer.push()
        glowBuffer.rotate(animAngle * 0.022 * (isUp ? 1 : -1) + t * 0.12)
        glowBuffer.beginShape()
        for (let i = 0; i < 3; i++) {
          const a = (p.TWO_PI / 3) * i + (isUp ? -p.HALF_PI : p.HALF_PI)
          glowBuffer.vertex(p.cos(a) * triR, p.sin(a) * triR)
        }
        glowBuffer.endShape(p.CLOSE)
        glowBuffer.pop()
      }
    }

    function drawFlowerOfLife(r: number, breath: number) {
      for (let layer = 0; layer < 4; layer++) {
        p.push()
        const la = animAngle * (0.1 + layer * 0.065) * (layer % 2 === 0 ? 1 : -1)
        p.rotate(la)
        const shift = (animAngle * 0.4 + layer * 1.8) % 7
        const c1i = p.floor(shift) % 7
        const c2i = (c1i + 1) % 7
        const bl = shift - p.floor(shift)
        const cr = p.lerp(CHAKRA_GLOW[c1i][0], CHAKRA_GLOW[c2i][0], bl)
        const cg2 = p.lerp(CHAKRA_GLOW[c1i][1], CHAKRA_GLOW[c2i][1], bl)
        const cb = p.lerp(CHAKRA_GLOW[c1i][2], CHAKRA_GLOW[c2i][2], bl)
        const al = p.map(layer, 0, 3, 230, 75) * (0.5 + breath * 0.5)
        const sw = p.map(r, 50, 800, 1.2, 5) * (1 - layer * 0.1)
        p.stroke(cr, cg2, cb, al)
        p.strokeWeight(sw)
        p.noFill()
        p.ellipse(0, 0, r, r)
        for (let i = 0; i < 6; i++) {
          const a = (p.TWO_PI / 6) * i
          p.ellipse(p.cos(a) * (r / 2), p.sin(a) * (r / 2), r, r)
        }
        for (let i = 0; i < 6; i++) {
          const a = (p.TWO_PI / 6) * i
          p.ellipse(p.cos(a) * r, p.sin(a) * r, r, r)
        }
        for (let i = 0; i < 6; i++) {
          const a = (p.TWO_PI / 6) * i + p.TWO_PI / 12
          p.ellipse(p.cos(a) * r * 0.866, p.sin(a) * r * 0.866, r, r)
        }
        if (layer < 2) {
          p.stroke(cr, cg2, cb, al * 0.5)
          for (let i = 0; i < 12; i++) {
            const a = (p.TWO_PI / 12) * i
            p.ellipse(p.cos(a) * r * 1.32, p.sin(a) * r * 1.32, r * 0.8, r * 0.8)
          }
        }
        if (layer === 0) {
          p.stroke(cr, cg2, cb, al * 0.22)
          for (let i = 0; i < 12; i++) {
            const a = (p.TWO_PI / 12) * i + p.TWO_PI / 24
            p.ellipse(p.cos(a) * r * 1.6, p.sin(a) * r * 1.6, r * 0.6, r * 0.6)
          }
          p.stroke(cr, cg2, cb, al * 0.1)
          for (let i = 0; i < 18; i++) {
            const a = (p.TWO_PI / 18) * i
            p.ellipse(p.cos(a) * r * 1.85, p.sin(a) * r * 1.85, r * 0.45, r * 0.45)
          }
        }
        glowBuffer.push()
        glowBuffer.rotate(la)
        glowBuffer.noFill()
        glowBuffer.stroke(cr, cg2, cb, al * 0.2)
        glowBuffer.strokeWeight(sw * 5)
        glowBuffer.ellipse(0, 0, r, r)
        for (let i = 0; i < 6; i++) {
          const a = (p.TWO_PI / 6) * i
          glowBuffer.ellipse(p.cos(a) * (r / 2), p.sin(a) * (r / 2), r, r)
        }
        for (let i = 0; i < 6; i++) {
          const a = (p.TWO_PI / 6) * i
          glowBuffer.ellipse(p.cos(a) * r, p.sin(a) * r, r, r)
        }
        glowBuffer.pop()
        p.pop()
        r *= 1 / PHI
      }
    }

    function drawTrailLayer(baseR: number) {
      trailBuffer.push()
      trailBuffer.translate(p.width / 2, p.height / 2)
      trailBuffer.noFill()
      const shift = animAngle * 0.5
      const ci = p.floor(shift) % 7
      const cn = (ci + 1) % 7
      const t = shift - p.floor(shift)
      trailBuffer.stroke(
        p.lerp(CHAKRA[ci][0], CHAKRA[cn][0], t),
        p.lerp(CHAKRA[ci][1], CHAKRA[cn][1], t),
        p.lerp(CHAKRA[ci][2], CHAKRA[cn][2], t),
        20,
      )
      trailBuffer.strokeWeight(1.8)
      trailBuffer.rotate(animAngle * 0.15)
      for (let i = 0; i < 6; i++) {
        const a = (p.TWO_PI / 6) * i
        trailBuffer.ellipse(p.cos(a) * (baseR / 2), p.sin(a) * (baseR / 2), baseR, baseR)
      }
      trailBuffer.pop()
    }

    function drawBindu(dim: number, breath: number) {
      const bR = dim * 0.015
      p.noStroke()
      for (let g = 14; g > 0; g--) {
        const cycle = (animAngle * 0.4) % 7
        const ci = p.floor(cycle) % 7
        const cn = (ci + 1) % 7
        const t = cycle - p.floor(cycle)
        const gc = CHAKRA_GLOW[ci]
        const gn = CHAKRA_GLOW[cn]
        p.fill(
          p.lerp(gc[0], gn[0], t),
          p.lerp(gc[1], gn[1], t),
          p.lerp(gc[2], gn[2], t),
          (g / 14) * 28 * (0.55 + breath * 0.45),
        )
        p.ellipse(0, 0, bR * g * 4, bR * g * 4)
      }
      p.fill(255, 255, 230, 215 + breath * 40)
      p.ellipse(0, 0, bR * 1.3, bR * 1.3)
      p.fill(255, 255, 255, 255)
      p.ellipse(0, 0, bR * 0.5, bR * 0.5)
      glowBuffer.noStroke()
      glowBuffer.fill(255, 255, 200, 45)
      glowBuffer.ellipse(0, 0, bR * 22, bR * 22)
    }

    function drawBloom() {
      glowBuffer.resetMatrix()
      p.push()
      p.blendMode(p.ADD)
      p.tint(255, 60)
      p.image(glowBuffer, 0, 0)
      p.tint(255, 28)
      p.image(glowBuffer, -4, -4, p.width + 8, p.height + 8)
      p.blendMode(p.BLEND)
      p.noTint()
      p.pop()
    }

    function drawKundaliniParticles(cx: number, cy: number, dim: number) {
      p.noStroke()
      for (const part of kundaliniP) {
        const life = (((mantaTime * part.speed + part.seed) % 5) / 5) as number
        const spiralA = part.seed + life * p.TWO_PI * 3 + part.phase
        const spiralR = life * dim * 0.6
        const px = cx + p.cos(spiralA) * spiralR
        const py = cy + p.sin(spiralA) * spiralR - life * dim * 0.08
        const al = p.sin(life * p.PI) * 230
        const c = CHAKRA_GLOW[p.floor(life * 6.9) % 7]
        p.fill(c[0], c[1], c[2], al)
        const sz = (1 - life * 0.5) * 6 * (dim / 650)
        p.ellipse(px, py, sz, sz)
        p.fill(c[0], c[1], c[2], al * 0.16)
        p.ellipse(px, py, sz * 6, sz * 6)
        if (p.random() < 0.12) {
          p.fill(255, 255, 255, al * 0.55)
          p.ellipse(px + p.random(-4, 4), py + p.random(-4, 4), 2, 2)
        }
      }
    }

    function drawVignette(cx: number, cy: number) {
      p.noStroke()
      const maxR = p.sqrt(cx * cx + cy * cy)
      for (let i = 0; i < 24; i++) {
        const t = i / 24
        p.fill(0, 0, 0, t * t * 55)
        p.ellipse(cx, cy, maxR * (0.45 + t * 0.55) * 2, maxR * (0.45 + t * 0.55) * 2)
      }
    }

    p.windowResized = () => {
      const rect = mount.getBoundingClientRect()
      const w = Math.max(280, rect.width || mount.clientWidth || 800)
      const h = Math.max(
        200,
        rect.height > 10 ? Math.floor(rect.height) : Math.floor((w * 9) / 16),
      )
      p.resizeCanvas(w, h)
      glowBuffer.resizeCanvas(p.width, p.height)
      trailBuffer.resizeCanvas(p.width, p.height)
      trailBuffer.background(0, 0)
    }
  }

  return {
    start: () => {
      if (instance || booting) return
      booting = true
      lastPanelMs = 0
      let bootAttempts = 0
      const boot = () => {
        if (!booting) return // stop() was called while waiting for mount width
        bootAttempts++
        const rect = mount.getBoundingClientRect()
        const cw = rect.width > 0 ? rect.width : mount.clientWidth
        if (cw < 8 && bootAttempts < 90) {
          requestAnimationFrame(boot)
          return
        }
        instance = new p5(sketch, mount)
        booting = false
        resizeObs = new ResizeObserver(() => {
          window.dispatchEvent(new Event('resize'))
        })
        resizeObs.observe(mount)
      }
      requestAnimationFrame(boot)
    },
    stop: () => {
      booting = false
      resizeObs?.disconnect()
      resizeObs = null
      instance?.remove()
      instance = undefined
      mount.replaceChildren()
    },
  }
}
