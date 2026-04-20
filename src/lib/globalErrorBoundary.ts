/**
 * Global error boundary — captures uncaught errors and unhandled promise
 * rejections, funnels them through reportError, and surfaces a recoverable
 * user prompt for truly fatal ones.
 *
 * We intentionally DON'T show a toast for every error — that would be noisy
 * (third-party scripts, extension errors, network hiccups). The threshold
 * for a user-visible banner is: >= 2 fatal-looking errors within 10s, OR a
 * ChunkLoadError (stale SW after deploy — reload fixes it).
 */

import { showAppBanner } from './appBanner'
import { reportError } from './errorReport'

const FATAL_WINDOW_MS = 10_000
const FATAL_THRESHOLD = 2
const fatalTimestamps: number[] = []

let bannerShown = false
let installed = false

function isChunkLoadError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const name = err.name || ''
  const msg = err.message || ''
  return /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported/i.test(`${name} ${msg}`)
}

function renderRecoveryBanner(reason: 'chunk' | 'fatal'): void {
  if (bannerShown) return
  bannerShown = true
  showAppBanner({
    id: 'global-recovery',
    variant: 'error',
    role: 'alert',
    message:
      reason === 'chunk'
        ? 'A newer version is ready. Reload to continue.'
        : 'Something went wrong. Reload to recover.',
    action: {
      label: 'Reload',
      onClick: () => window.location.reload(),
    },
    onDismiss: () => {
      bannerShown = false
    },
  })
}

function trackFatal(): void {
  const now = Date.now()
  fatalTimestamps.push(now)
  while (fatalTimestamps.length > 0 && now - fatalTimestamps[0]! > FATAL_WINDOW_MS) {
    fatalTimestamps.shift()
  }
  if (fatalTimestamps.length >= FATAL_THRESHOLD) {
    renderRecoveryBanner('fatal')
  }
}

export function installGlobalErrorBoundary(): void {
  if (typeof window === 'undefined' || installed) return
  installed = true

  window.addEventListener('error', (event) => {
    const err = event.error ?? event.message
    if (isChunkLoadError(err)) {
      reportError('global:error', err, { severity: 'warn', context: { reason: 'chunk' } })
      renderRecoveryBanner('chunk')
      return
    }
    reportError('global:error', err, {
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    })
    trackFatal()
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    if (isChunkLoadError(reason)) {
      reportError('global:rejection', reason, { severity: 'warn', context: { reason: 'chunk' } })
      renderRecoveryBanner('chunk')
      return
    }
    reportError('global:rejection', reason)
    trackFatal()
  })
}
