/**
 * View Transitions API wrapper with CSS fallback.
 * Uses document.startViewTransition where supported; otherwise
 * runs the callback immediately (no transition, no crash).
 */

export function viewTransition(callback: () => void | Promise<void>): void {
  if (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    typeof (document as Document & { startViewTransition?: (cb: () => void) => void }).startViewTransition === 'function'
  ) {
    (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
      callback()
    })
  } else {
    callback()
  }
}
