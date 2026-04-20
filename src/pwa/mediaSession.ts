/**
 * Media Session + Wake Lock — native app polish on the web.
 *
 * - Media Session: shows a media notification on Android and on the iOS lock
 *   screen / Control Center during playback. Without this, binaural audio
 *   plays but users see nothing about "what's playing" on the lock screen,
 *   which feels broken after Spotify/Apple Music.
 * - Wake Lock: prevents the screen from dimming during a meditation session.
 *   Graceful no-op on unsupported browsers (Safari < 16.4, Firefox Android).
 */

interface WakeLockSentinelLike {
  release: () => Promise<void>
  addEventListener: (type: string, cb: () => void) => void
}

let wakeLock: WakeLockSentinelLike | null = null
let wakeLockReacquireHandler: (() => void) | null = null

export interface SessionMetadata {
  title: string
  artist: string
  album?: string
  artwork?: { src: string; sizes: string; type: string }[]
}

const DEFAULT_ARTWORK = [
  { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
  { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
]

export interface MediaSessionHandlers {
  onPlay?: () => void
  onPause?: () => void
  onStop?: () => void
}

/** Set the lock-screen / notification tile metadata. */
export function setMediaSessionMetadata(meta: SessionMetadata): void {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: meta.title,
      artist: meta.artist,
      album: meta.album ?? 'Sravanam',
      artwork: meta.artwork ?? DEFAULT_ARTWORK,
    })
  } catch {
    /* older browsers */
  }
}

/** Wire play/pause/stop handlers for hardware media keys & lock-screen controls. */
export function setMediaSessionHandlers(handlers: MediaSessionHandlers): void {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
  try {
    navigator.mediaSession.setActionHandler('play', handlers.onPlay ?? null)
    navigator.mediaSession.setActionHandler('pause', handlers.onPause ?? null)
    navigator.mediaSession.setActionHandler('stop', handlers.onStop ?? null)
  } catch {
    /* unsupported action — ignore */
  }
}

/** Tell the OS whether the session is playing/paused/none. */
export function setMediaSessionPlaybackState(state: 'playing' | 'paused' | 'none'): void {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
  navigator.mediaSession.playbackState = state
}

export function clearMediaSession(): void {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
  try {
    navigator.mediaSession.metadata = null
    navigator.mediaSession.playbackState = 'none'
    for (const action of ['play', 'pause', 'stop'] as const) {
      navigator.mediaSession.setActionHandler(action, null)
    }
  } catch {
    /* */
  }
}

/** Request a screen wake lock. Safe to call on unsupported browsers. */
export async function acquireWakeLock(): Promise<void> {
  if (typeof navigator === 'undefined') return
  const wl = (navigator as { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> } }).wakeLock
  if (!wl) return
  try {
    wakeLock = await wl.request('screen')
    // If the tab is backgrounded, the OS auto-releases the lock. Re-acquire on return.
    wakeLockReacquireHandler = () => {
      if (document.visibilityState === 'visible' && wakeLock === null) {
        void acquireWakeLock()
      }
    }
    document.addEventListener('visibilitychange', wakeLockReacquireHandler)
    wakeLock.addEventListener('release', () => {
      wakeLock = null
    })
  } catch {
    /* user denied / policy */
  }
}

export async function releaseWakeLock(): Promise<void> {
  if (wakeLockReacquireHandler) {
    document.removeEventListener('visibilitychange', wakeLockReacquireHandler)
    wakeLockReacquireHandler = null
  }
  if (wakeLock) {
    try {
      await wakeLock.release()
    } catch {
      /* already released */
    }
    wakeLock = null
  }
}
