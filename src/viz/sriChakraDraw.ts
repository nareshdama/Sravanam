/** One full rotation of the figure in this many seconds (wall-clock while animating). */
export const SRICHAKRA_ROTATION_PERIOD_SEC = 420

/**
 * Stylized Śrī Chakra / Śrī Yantra — nested Śiva (up) and Śakti (down) triangles
 * around a central bindu. Proportions are illustrative, not ritual drafting.
 *
 * @param rotationRad — continuous rotation (e.g. wall-time × 2π / period) for realtime motion
 */
export function drawSriChakra(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  R: number,
  breathe: number,
  rotationRad: number,
): void {
  const pulse = 0.94 + 0.06 * breathe
  const r = R * pulse

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotationRad)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Outer bloom (soft, realistic glow)
  const g = ctx.createRadialGradient(0, 0, r * 0.02, 0, 0, r * 1.22)
  g.addColorStop(0, 'rgba(255, 220, 150, 0.42)')
  g.addColorStop(0.35, 'rgba(244, 114, 182, 0.16)')
  g.addColorStop(0.65, 'rgba(99, 102, 241, 0.08)')
  g.addColorStop(1, 'rgba(15, 23, 42, 0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(0, 0, r * 1.22, 0, Math.PI * 2)
  ctx.fill()

  function strokeTriangleGlow(
    path: () => void,
    stroke: string,
    fill: string,
    lineW: number,
  ): void {
    path()
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineW + 2.5
    ctx.globalAlpha = 0.22
    ctx.stroke()
    ctx.globalAlpha = 1
    path()
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineW
    ctx.stroke()
    path()
    ctx.fillStyle = fill
    ctx.fill()
  }

  // 5 downward (Śakti) — draw largest first (behind), smallest last
  for (let i = 4; i >= 0; i--) {
    const t = i / 4
    const scale = 0.28 + t * 0.72
    const a = r * scale
    const tipY = a * 0.55
    const baseY = -a * 0.42
    const half = a * 0.48
    strokeTriangleGlow(
      () => {
        ctx.beginPath()
        ctx.moveTo(0, tipY)
        ctx.lineTo(-half, baseY)
        ctx.lineTo(half, baseY)
        ctx.closePath()
      },
      `rgba(251, 191, 36, ${0.45 + i * 0.06})`,
      `rgba(244, 63, 94, ${0.04 + i * 0.022})`,
      1.15 + (i === 4 ? 0.45 : 0),
    )
  }

  // 4 upward (Śiva)
  for (let i = 3; i >= 0; i--) {
    const t = i / 3
    const scale = 0.22 + t * 0.58
    const a = r * scale
    const tipY = -a * 0.5
    const baseY = a * 0.38
    const half = a * 0.42
    strokeTriangleGlow(
      () => {
        ctx.beginPath()
        ctx.moveTo(0, tipY)
        ctx.lineTo(-half, baseY)
        ctx.lineTo(half, baseY)
        ctx.closePath()
      },
      `rgba(196, 181, 253, ${0.5 + i * 0.1})`,
      `rgba(99, 102, 241, ${0.05 + i * 0.035})`,
      1.05,
    )
  }

  // Bindu — soft highlight + crisp rim
  const br = r * 0.048 * (0.94 + 0.06 * breathe)
  const binduGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, br * 2.2)
  binduGlow.addColorStop(0, 'rgba(255, 251, 235, 0.95)')
  binduGlow.addColorStop(0.55, 'rgba(254, 240, 138, 0.45)')
  binduGlow.addColorStop(1, 'rgba(251, 191, 36, 0)')
  ctx.fillStyle = binduGlow
  ctx.beginPath()
  ctx.arc(0, 0, br * 2.2, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(0, 0, br, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255, 252, 232, 0.98)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)'
  ctx.lineWidth = 1.35
  ctx.stroke()

  ctx.restore()
}
