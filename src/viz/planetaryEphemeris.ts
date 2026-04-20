import { Body, Ecliptic, GeoVector, SunPosition } from 'astronomy-engine'

const ZODIAC = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const

export type ZodiacName = (typeof ZODIAC)[number]

export interface PlanetRow {
  key: string
  label: string
  body: Body
  /** Hue 0–360 for chart dots */
  hue: number
}

/** Bodies shown in the realtime panel (geocentric tropical longitude). */
export const VIZ_PLANETS: PlanetRow[] = [
  { key: 'sun', label: 'Sun', body: Body.Sun, hue: 38 },
  { key: 'moon', label: 'Moon', body: Body.Moon, hue: 210 },
  { key: 'mercury', label: 'Mercury', body: Body.Mercury, hue: 160 },
  { key: 'venus', label: 'Venus', body: Body.Venus, hue: 320 },
  { key: 'mars', label: 'Mars', body: Body.Mars, hue: 0 },
  { key: 'jupiter', label: 'Jupiter', body: Body.Jupiter, hue: 36 },
  { key: 'saturn', label: 'Saturn', body: Body.Saturn, hue: 48 },
  { key: 'uranus', label: 'Uranus', body: Body.Uranus, hue: 195 },
  { key: 'neptune', label: 'Neptune', body: Body.Neptune, hue: 250 },
]

export function tropicalZodiacFromLongitude(lonDeg: number): { sign: ZodiacName; deg: number; min: number } {
  const x = ((lonDeg % 360) + 360) % 360
  const idx = Math.min(11, Math.floor(x / 30))
  const inSign = x - idx * 30
  const deg = Math.floor(inSign)
  const min = Math.floor((inSign - deg) * 60)
  return { sign: ZODIAC[idx], deg, min }
}

function geocentricEclipticLongitude(body: Body, date: Date): number {
  if (body === Body.Sun) {
    return SunPosition(date).elon
  }
  const v = GeoVector(body, date, true)
  return Ecliptic(v).elon
}

export interface PlanetSnapshot {
  key: string
  label: string
  lonDeg: number
  hue: number
  sign: ZodiacName
  degInSign: number
  minInSign: number
}

/** Plain-text lines for the realtime panel under the visualization. */
export function formatPlanetPanelText(snapshots: PlanetSnapshot[]): string {
  return snapshots
    .map(
      (p) =>
        `${p.label}: ${p.sign} ${p.degInSign}° ${p.minInSign.toString().padStart(2, '0')}' (λ ${p.lonDeg.toFixed(2)}°)`,
    )
    .join('\n')
}

/**
 * astronomy-engine's GeoVector + Ecliptic is ~1–2 ms per body on a phone.
 * 9 bodies × several call-sites (2s panel tick + per-frame smoother) can
 * exceed a frame budget. Planetary positions change slowly enough that a
 * minute-granularity cache is visually identical to live values; consumers
 * that need higher resolution pass an explicit Date.
 */
const EPHEMERIS_CACHE_MS = 60_000
const snapshotCache = new Map<number, PlanetSnapshot[]>()
const SNAPSHOT_CACHE_MAX = 8 // ~8 minutes of history worth of entries
const CURRENT_EPHEMERIS_THROTTLE_MS = 2_000

let currentSnapshotCache:
  | {
      atMs: number
      snapshots: PlanetSnapshot[]
    }
  | null = null

function cacheBucket(date: Date): number {
  return Math.floor(date.getTime() / EPHEMERIS_CACHE_MS)
}

export function getPlanetSnapshots(date: Date = new Date()): PlanetSnapshot[] {
  const bucket = cacheBucket(date)
  const cached = snapshotCache.get(bucket)
  if (cached) return cached

  const snapshots = VIZ_PLANETS.map((p) => {
    const lonDeg = geocentricEclipticLongitude(p.body, date)
    const { sign, deg, min } = tropicalZodiacFromLongitude(lonDeg)
    return {
      key: p.key,
      label: p.label,
      lonDeg,
      hue: p.hue,
      sign,
      degInSign: deg,
      minInSign: min,
    }
  })

  snapshotCache.set(bucket, snapshots)
  if (snapshotCache.size > SNAPSHOT_CACHE_MAX) {
    // Evict the oldest bucket (Maps preserve insertion order).
    const oldestKey = snapshotCache.keys().next().value
    if (oldestKey !== undefined) snapshotCache.delete(oldestKey)
  }
  return snapshots
}

/**
 * Shared "live now" ephemeris snapshot for UI/visual consumers.
 * Planetary motion is slow enough that reusing a snapshot for ~2s is visually
 * indistinguishable while avoiding repeated wall-clock lookups across loops.
 */
export function getCurrentPlanetSnapshots(now: Date = new Date()): PlanetSnapshot[] {
  const atMs = now.getTime()
  if (currentSnapshotCache && atMs - currentSnapshotCache.atMs < CURRENT_EPHEMERIS_THROTTLE_MS) {
    return currentSnapshotCache.snapshots
  }
  const snapshots = getPlanetSnapshots(now)
  currentSnapshotCache = {
    atMs,
    snapshots,
  }
  return snapshots
}

/** Canvas angle (radians): 0° Aries at top, zodiac runs counterclockwise. */
export function longitudeToCanvasAngle(lonDeg: number): number {
  const lon = ((lonDeg % 360) + 360) % 360
  return Math.PI / 2 - (lon * Math.PI) / 180
}
