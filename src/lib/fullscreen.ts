/**
 * Fullscreen API wrapper — request / exit / query / listen.
 * Safe when API is unavailable (returns false, no-ops).
 */

export function isFullscreenSupported(): boolean {
  return typeof document !== 'undefined' && typeof document.fullscreenEnabled === 'boolean' && document.fullscreenEnabled
}

export function isFullscreen(): boolean {
  return typeof document !== 'undefined' && document.fullscreenElement !== null
}

export async function requestFullscreen(el?: HTMLElement): Promise<boolean> {
  const target = el ?? document.documentElement
  if (!isFullscreenSupported()) return false
  try {
    await target.requestFullscreen()
    return true
  } catch {
    return false
  }
}

export async function exitFullscreen(): Promise<boolean> {
  if (!isFullscreen()) return false
  try {
    await document.exitFullscreen()
    return true
  } catch {
    return false
  }
}

export async function toggleFullscreen(el?: HTMLElement): Promise<boolean> {
  if (isFullscreen()) {
    return exitFullscreen()
  }
  return requestFullscreen(el)
}

export function onFullscreenChange(callback: (isFs: boolean) => void): () => void {
  const handler = (): void => callback(isFullscreen())
  document.addEventListener('fullscreenchange', handler)
  return () => document.removeEventListener('fullscreenchange', handler)
}
