export type AppBannerVariant = 'update' | 'install' | 'offline' | 'error' | 'online'
export type AppBannerPosition = 'top' | 'bottom'

export interface AppBannerAction {
  label: string
  onClick: () => void
}

export interface ShowAppBannerOptions {
  id: string
  message: string
  variant?: AppBannerVariant
  role?: 'status' | 'alert'
  position?: AppBannerPosition
  action?: AppBannerAction
  dismissible?: boolean
  autoDismissMs?: number
  onDismiss?: () => void
}

interface BannerRecord {
  el: HTMLElement
  timer: ReturnType<typeof setTimeout> | null
  onDismiss?: () => void
}

const banners = new Map<string, BannerRecord>()

function clearBannerTimer(record: BannerRecord): void {
  if (!record.timer) return
  clearTimeout(record.timer)
  record.timer = null
}

export function hideAppBanner(id: string): void {
  const record = banners.get(id)
  if (!record) return
  clearBannerTimer(record)
  record.el.remove()
  banners.delete(id)
  record.onDismiss?.()
}

export function showAppBanner(options: ShowAppBannerOptions): HTMLElement | null {
  if (typeof document === 'undefined') return null

  hideAppBanner(options.id)

  const {
    id,
    message,
    variant = 'update',
    role = 'status',
    position = variant === 'offline' || variant === 'online' ? 'top' : 'bottom',
    action,
    dismissible = true,
    autoDismissMs,
    onDismiss,
  } = options

  const el = document.createElement('div')
  el.className = `pwa-banner pwa-banner--${variant} pwa-banner--${position}`
  el.setAttribute('role', role)

  const text = document.createElement('span')
  text.className = 'pwa-banner__text'
  text.textContent = message
  el.appendChild(text)

  if (action) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'pwa-banner__btn'
    button.textContent = action.label
    button.addEventListener('click', () => {
      action.onClick()
    })
    el.appendChild(button)
  }

  if (dismissible) {
    const dismiss = document.createElement('button')
    dismiss.type = 'button'
    dismiss.className = 'pwa-banner__dismiss'
    dismiss.setAttribute('aria-label', 'Dismiss')
    dismiss.textContent = '×'
    dismiss.addEventListener('click', () => {
      hideAppBanner(id)
    })
    el.appendChild(dismiss)
  }

  document.body.appendChild(el)

  const record: BannerRecord = {
    el,
    timer: null,
    onDismiss,
  }
  banners.set(id, record)

  if (autoDismissMs && autoDismissMs > 0) {
    record.timer = setTimeout(() => {
      hideAppBanner(id)
    }, autoDismissMs)
  }

  return el
}
