/**
 * PWA shell: register the vite-plugin-pwa service worker and surface an
 * in-app update banner when a new build is available. We avoid silent
 * auto-reload so users mid-session don't lose audio state.
 *
 * Also wires the `beforeinstallprompt` event so we can offer an "Install"
 * affordance on Android/desktop Chrome. iOS has no programmatic install
 * prompt — the Add-to-Home-Screen flow is manual — so we show a one-time
 * hint on iOS Safari instead.
 */

import { registerSW } from 'virtual:pwa-register'
import { hideAppBanner, showAppBanner } from '../lib/appBanner'
import { reportError } from '../lib/errorReport'

const OFFLINE_GRACE_MS = 1500 // suppress flicker on brief drops

let offlineTimer: ReturnType<typeof setTimeout> | null = null
let wasOffline = false

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null
let pwaInitialized = false

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    reportError('pwa:storageRead', e, { severity: 'warn', context: { key } })
    return null
  }
}

function safeLocalStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch (e) {
    reportError('pwa:storageWrite', e, { severity: 'warn', context: { key } })
  }
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  // iOS uses the non-standard `navigator.standalone`; Android/desktop use the media query.
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    nav.standalone === true
  )
}

function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const iOS = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)
  const webkit = /WebKit/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
  return iOS && webkit
}

function renderUpdateBanner(onReload: () => void): HTMLElement {
  return showAppBanner({
    id: 'pwa-update',
    variant: 'update',
    message: 'A new version of Sravanam is ready.',
    action: {
      label: 'Reload',
      onClick: () => {
        hideAppBanner('pwa-update')
        onReload()
      },
    },
  })!
}

function renderInstallBanner(onInstall: () => void): HTMLElement {
  return showAppBanner({
    id: 'pwa-install',
    variant: 'install',
    message: 'Install Sravanam for a fuller, distraction-free practice.',
    action: {
      label: 'Install',
      onClick: () => {
        hideAppBanner('pwa-install')
        onInstall()
      },
    },
    onDismiss: () => {
      safeLocalStorageSet('sravanam_install_dismissed', String(Date.now()))
    },
  })!
}

function renderIosHint(): HTMLElement {
  return showAppBanner({
    id: 'pwa-ios-hint',
    variant: 'install',
    message: 'Tap Share → Add to Home Screen to install.',
    onDismiss: () => {
      safeLocalStorageSet('sravanam_ios_hint_dismissed', String(Date.now()))
    },
  })!
}

function showOfflineBanner(): void {
  wasOffline = true
  showAppBanner({
    id: 'network-status',
    variant: 'offline',
    position: 'top',
    dismissible: false,
    message: 'You’re offline. The app keeps running from cache.',
  })
}

function hideOfflineBanner(): void {
  if (offlineTimer) {
    clearTimeout(offlineTimer)
    offlineTimer = null
  }
  hideAppBanner('network-status')
}

function showOnlineToast(): void {
  showAppBanner({
    id: 'network-status',
    variant: 'online',
    position: 'top',
    autoDismissMs: 2500,
    message: 'Back online.',
  })
}

function wireOnlineOfflineDetection(): void {
  if (typeof window === 'undefined') return

  const handleOffline = (): void => {
    if (offlineTimer) return
    // Grace period so a 500ms dropout doesn't flash a banner
    offlineTimer = setTimeout(() => {
      offlineTimer = null
      if (!navigator.onLine) showOfflineBanner()
    }, OFFLINE_GRACE_MS)
  }

  const handleOnline = (): void => {
    hideOfflineBanner()
    if (wasOffline) {
      wasOffline = false
      showOnlineToast()
    }
  }

  window.addEventListener('offline', handleOffline)
  window.addEventListener('online', handleOnline)

  // Respect the initial state
  if (!navigator.onLine) handleOffline()
}

export function initPwa(): void {
  if (typeof window === 'undefined' || pwaInitialized) return
  pwaInitialized = true

  // 1) Service worker registration + update detection
  const updateSW = registerSW({
    onNeedRefresh() {
      renderUpdateBanner(() => {
        void updateSW(true)
      })
    },
    onOfflineReady() {
      // Could surface a toast; silent for now — offline is a capability, not an event.
    },
    onRegisterError(error) {
      reportError('pwa:register', error, { severity: 'warn' })
    },
  })

  wireOnlineOfflineDetection()

  // 2) Install prompt (Android / desktop Chrome)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredInstallPrompt = e as BeforeInstallPromptEvent
    if (isStandalone()) return
    const dismissed = safeLocalStorageGet('sravanam_install_dismissed')
    // Re-show every 14 days max
    if (dismissed && Date.now() - Number(dismissed) < 14 * 24 * 3600 * 1000) return
    // Defer briefly so it doesn't collide with initial page motion
    setTimeout(() => {
      if (!deferredInstallPrompt || isStandalone()) return
      renderInstallBanner(() => {
        void deferredInstallPrompt!.prompt()
        void deferredInstallPrompt!.userChoice.finally(() => {
          deferredInstallPrompt = null
        })
      })
    }, 6000)
  })

  // 3) iOS one-time hint (no beforeinstallprompt on Safari)
  if (isIosSafari() && !isStandalone()) {
    const dismissed = safeLocalStorageGet('sravanam_ios_hint_dismissed')
    if (!dismissed || Date.now() - Number(dismissed) > 30 * 24 * 3600 * 1000) {
      setTimeout(() => {
        if (!isStandalone()) renderIosHint()
      }, 8000)
    }
  }

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null
  })
}
