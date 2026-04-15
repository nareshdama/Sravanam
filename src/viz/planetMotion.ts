/** Normalize ecliptic longitude to [0, 360). */
export function normalizeLonDeg(lon: number): number {
  return ((lon % 360) + 360) % 360
}

/** Shortest signed difference from `from` to `to` on a circle (degrees). */
export function shortestLonDeltaDeg(from: number, to: number): number {
  const a = normalizeLonDeg(from)
  const b = normalizeLonDeg(to)
  let d = b - a
  if (d > 180) d -= 360
  if (d < -180) d += 360
  return d
}

/**
 * Smoothly tracks ephemeris longitudes each frame for continuous on-wheel motion
 * (handles wrap at 360° / 0°).
 */
export class PlanetLongitudeSmoother {
  private lon: number[] = []

  reset(targets: number[]): void {
    this.lon = targets.map(normalizeLonDeg)
  }

  /**
   * @param targets — fresh geocentric λ from ephemeris (deg)
   * @param dt — seconds since last update
   */
  update(targets: number[], dt: number): number[] {
    if (this.lon.length !== targets.length || this.lon.length === 0) {
      this.reset(targets)
      return [...this.lon]
    }
    const lambda = 28
    const k = 1 - Math.exp(-lambda * Math.min(Math.max(dt, 0), 0.12))
    for (let i = 0; i < targets.length; i++) {
      const delta = shortestLonDeltaDeg(this.lon[i]!, targets[i]!)
      this.lon[i] = normalizeLonDeg(this.lon[i]! + delta * k)
    }
    return [...this.lon]
  }
}
