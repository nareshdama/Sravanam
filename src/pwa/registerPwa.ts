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

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
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
  const el = document.createElement('div')
  el.className = 'pwa-banner pwa-banner--update'
  el.setAttribute('role', 'status')
  el.innerHTML = `
    <span class="pwa-banner__text">A new version of Sravanam is ready.</span>
    <button type="button" class="pwa-banner__btn" id="pwa-reload">Reload</button>
    <button type="button" class="pwa-banner__dismiss" id="pwa-dismiss" aria-label="Dismiss">\u00D7</button>
  `
  document.body.appendChild(el)
  el.querySelector<HTMLButtonElement>('#pwa-reload')!.addEventListener('click', () => {
    el.remove()
    onReload()
  })
  el.querySelector<HTMLButtonElement>('#pwa-dismiss')!.addEventListener('click', () => {
    el.remove()
  })
  return el
}

function renderInstallBanner(onInstall: () => void): HTMLElement {
  const el = document.createElement('div')
  el.className = 'pwa-banner pwa-banner--install'
  el.setAttribute('role', 'status')
  el.innerHTML = `
    <span class="pwa-banner__text">Install Sravanam for a fuller, distraction-free practice.</span>
    <button type="button" class="pwa-banner__btn" id="pwa-install">Install</button>
    <button type="button" class="pwa-banner__dismiss" id="pwa-install-dismiss" aria-label="Dismiss">\u00D7</button>
  `
  document.body.appendChild(el)
  el.querySelector<HTMLButtonElement>('#pwa-install')!.addEventListener('click', () => {
    el.remove()
    onInstall()
  })
  el.querySelector<HTMLButtonElement>('#pwa-install-dismiss')!.addEventListener('click', () => {
    el.remove()
    localStorage.setItem('sravanam_install_dismissed', String(Date.now()))
  })
  return el
}

function renderIosHint(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'pwa-banner pwa-banner--install'
  el.setAttribute('role', 'status')
  el.innerHTML = `
    <span class="pwa-banner__text">Tap <b>Share</b> &rarr; <b>Add to Home Screen</b> to install.</span>
    <button type="button" class="pwa-banner__dismiss" id="pwa-ios-dismiss" aria-label="Dismiss">\u00D7</button>
  `
  document.body.appendChild(el)
  el.querySelector<HTMLButtonElement>('#pwa-ios-dismiss')!.addEventListener('click', () => {
    el.remove()
    localStorage.setItem('sravanam_ios_hint_dismissed', String(Date.now()))
  })
  return el
}

export function initPwa(): void {
  if (typeof window === 'undefined') return

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
      console.warn('[pwa] SW registration failed', error)
    },
  })

  // 2) Install prompt (Android / desktop Chrome)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredInstallPrompt = e as BeforeInstallPromptEvent
    if (isStandalone()) return
    const dismissed = localStorage.getItem('sravanam_install_dismissed')
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
    const dismissed = localStorage.getItem('sravanam_ios_hint_dismissed')
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
