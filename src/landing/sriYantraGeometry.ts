import * as THREE from 'three'

export const SRI_YANTRA_PARTICLE_TIERS = { high: 50_000, medium: 25_000, low: 10_000 } as const

export type SriYantraMotionQuality = keyof typeof SRI_YANTRA_PARTICLE_TIERS

const SRI_YANTRA_CONFIG = { centerRadius: 0.15, triangleLayers: 9 }

/** Brass → gold → umber only (aligned with design tokens — no orange-red / magenta drift). */
const MANDALA_COLOR_PALETTE = [
  new THREE.Color(0xf2e8d4),
  new THREE.Color(0xe8d4a8),
  new THREE.Color(0xd4b060),
  new THREE.Color(0xc8a246),
  new THREE.Color(0xa67c32),
  new THREE.Color(0x7a5a24),
  new THREE.Color(0x523a18),
  new THREE.Color(0x2e2110),
]

export type GeometryData = {
  positions: Float32Array
  startPositions: Float32Array
  colors: Float32Array
  scales: Float32Array
  phases: Float32Array
}

export function generateSriYantraPositions(count: number): GeometryData {
  const positions: number[] = []
  const startPositions: number[] = []
  const colors: number[] = []
  const scales: number[] = []
  const phases: number[] = []

  const { centerRadius, triangleLayers } = SRI_YANTRA_CONFIG
  const maxMandalaRadius = 1.4

  let index = 0

  const addParticle = (x: number, y: number, z: number, colorIdx: number, scale: number) => {
    if (index >= count) return false
    const color = MANDALA_COLOR_PALETTE[colorIdx % MANDALA_COLOR_PALETTE.length]!
    positions.push(x, y, z)
    colors.push(color.r, color.g, color.b)
    scales.push(scale)

    const radialDist = Math.sqrt(x * x + y * y) / maxMandalaRadius
    phases.push(Math.max(0, Math.min(radialDist + (Math.random() - 0.5) * 0.15, 1.0)))

    const ringRadius = 3.0 + Math.random() * 2.0
    const ringAngle = Math.random() * Math.PI * 2
    startPositions.push(Math.cos(ringAngle) * ringRadius, Math.sin(ringAngle) * ringRadius, (Math.random() - 0.5) * 0.2)

    index++
    return true
  }

  const centerCount = Math.floor(count * 0.005)
  for (let i = 0; i < centerCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = Math.random() * centerRadius * 0.3
    const x = Math.cos(angle) * r
    const y = Math.sin(angle) * r
    const z = (Math.random() - 0.5) * 0.02
    if (!addParticle(x, y, z, 0, 1.2 + Math.random() * 0.6)) break
  }

  const triangleCount = Math.floor(count * 0.25)
  const trianglesPerLayer = 4

  for (let layer = 0; layer < triangleLayers; layer++) {
    const layerRadius = centerRadius + (layer + 1) * 0.08
    const isUpward = layer % 2 === 0

    for (let t = 0; t < trianglesPerLayer; t++) {
      const triangleAngle = (t / trianglesPerLayer) * Math.PI * 2
      const particlesPerTriangle = Math.floor(triangleCount / (triangleLayers * trianglesPerLayer))

      for (let p = 0; p < particlesPerTriangle; p++) {
        const sideProgress = p / particlesPerTriangle
        const side = Math.floor(sideProgress * 3)
        const sidePos = (sideProgress * 3) % 1

        let tx: number
        let ty: number
        const triangleSize = layerRadius * 0.6

        if (isUpward) {
          const baseY = -triangleSize * 0.3
          const topY = triangleSize * 0.7

          if (side === 0) {
            tx = (sidePos - 0.5) * triangleSize * 2
            ty = baseY
          } else if (side === 1) {
            tx = triangleSize * 0.5 + sidePos * triangleSize * 0.5
            ty = baseY + sidePos * (topY - baseY)
          } else {
            tx = -triangleSize * 0.5 - sidePos * triangleSize * 0.5
            ty = baseY + sidePos * (topY - baseY)
          }
        } else {
          const baseY = triangleSize * 0.3
          const bottomY = -triangleSize * 0.7

          if (side === 0) {
            tx = (sidePos - 0.5) * triangleSize * 2
            ty = baseY
          } else if (side === 1) {
            tx = triangleSize * 0.5 + sidePos * triangleSize * 0.5
            ty = baseY - sidePos * (baseY - bottomY)
          } else {
            tx = -triangleSize * 0.5 - sidePos * triangleSize * 0.5
            ty = baseY - sidePos * (baseY - bottomY)
          }
        }

        const cosA = Math.cos(triangleAngle)
        const sinA = Math.sin(triangleAngle)
        const rx = tx * cosA - ty * sinA
        const ry = tx * sinA + ty * cosA

        const z = (Math.random() - 0.5) * 0.03
        const noiseX = (Math.random() - 0.5) * 0.01
        const noiseY = (Math.random() - 0.5) * 0.01

        if (!addParticle(rx + noiseX, ry + noiseY, z, layer % MANDALA_COLOR_PALETTE.length, 0.9 + Math.random() * 0.6))
          break
      }
    }
  }

  const ringCount = Math.floor(count * 0.2)
  const numRings = 8

  for (let r = 0; r < numRings; r++) {
    const ringR = 0.35 + (r / numRings) * 0.5
    const particlesPerRing = Math.floor(ringCount / numRings)

    for (let p = 0; p < particlesPerRing; p++) {
      const angle = (p / particlesPerRing) * Math.PI * 2
      const x = Math.cos(angle) * ringR
      const y = Math.sin(angle) * ringR
      const z = (Math.random() - 0.5) * 0.02
      const thickness = 0.015
      const tx = x + (Math.random() - 0.5) * thickness
      const ty = y + (Math.random() - 0.5) * thickness

      if (!addParticle(tx, ty, z, (r + 3) % MANDALA_COLOR_PALETTE.length, 0.8 + Math.random() * 0.5)) break
    }
  }

  const petalCount = Math.floor(count * 0.25)
  const numPetals = 16

  for (let petal = 0; petal < numPetals; petal++) {
    const petalAngle = (petal / numPetals) * Math.PI * 2
    const particlesPerPetal = Math.floor(petalCount / numPetals)

    for (let p = 0; p < particlesPerPetal; p++) {
      const petalProgress = p / particlesPerPetal
      const petalLength = 0.25
      const petalWidth = 0.08

      const t = petalProgress
      const petalR = 0.7 + t * petalLength
      const widthAtT = petalWidth * Math.sin(t * Math.PI)

      const offsetAngle = ((Math.random() - 0.5) * widthAtT) / petalR
      const finalAngle = petalAngle + offsetAngle

      const x = Math.cos(finalAngle) * petalR
      const y = Math.sin(finalAngle) * petalR
      const z = (Math.random() - 0.5) * 0.02

      if (!addParticle(x, y, z, (petal + 5) % MANDALA_COLOR_PALETTE.length, 0.8 + Math.random() * 0.4)) break
    }
  }

  const squareCount = Math.floor(count * 0.15)
  const squareSize = 1.2

  for (let p = 0; p < squareCount; p++) {
    const side = Math.floor(Math.random() * 4)

    let x: number
    let y: number
    const pos = Math.random()

    const isGate = pos > 0.4 && pos < 0.6
    if (isGate && Math.random() > 0.3) continue

    switch (side) {
      case 0:
        x = (pos - 0.5) * squareSize * 2
        y = squareSize
        break
      case 1:
        x = squareSize
        y = (pos - 0.5) * squareSize * 2
        break
      case 2:
        x = (pos - 0.5) * squareSize * 2
        y = -squareSize
        break
      default:
        x = -squareSize
        y = (pos - 0.5) * squareSize * 2
    }

    x += (Math.random() - 0.5) * 0.03
    y += (Math.random() - 0.5) * 0.03
    const z = (Math.random() - 0.5) * 0.02

    if (!addParticle(x, y, z, 7, 0.8 + Math.random() * 0.4)) break
  }

  const outerCircleCount = Math.floor(count * 0.1)
  const outerR = 1.35

  for (let p = 0; p < outerCircleCount; p++) {
    const angle = (p / outerCircleCount) * Math.PI * 2 + Math.random() * 0.05
    const r = outerR + (Math.random() - 0.5) * 0.03
    const x = Math.cos(angle) * r
    const y = Math.sin(angle) * r
    const z = (Math.random() - 0.5) * 0.02

    if (!addParticle(x, y, z, 8, 0.7 + Math.random() * 0.4)) break
  }

  while (index < count) {
    const angle = Math.random() * Math.PI * 2
    const r = Math.random() * 1.4
    const x = Math.cos(angle) * r
    const y = Math.sin(angle) * r
    const z = (Math.random() - 0.5) * 0.05

    if (
      !addParticle(
        x,
        y,
        z,
        Math.floor(Math.random() * MANDALA_COLOR_PALETTE.length),
        0.7 + Math.random() * 0.4,
      )
    )
      break
  }

  return {
    positions: new Float32Array(positions),
    startPositions: new Float32Array(startPositions),
    colors: new Float32Array(colors),
    scales: new Float32Array(scales),
    phases: new Float32Array(phases),
  }
}
