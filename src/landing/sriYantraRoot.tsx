/**
 * Mounts the Sri Yantra WebGL hero for the vanilla landing screen.
 */

import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { SriYantraMotionAnimation } from './SriYantraMotionAnimation'

export function mountSriYantraLanding(container: HTMLElement): Root {
  const root = createRoot(container)
  root.render(
    <StrictMode>
      <SriYantraMotionAnimation drive="page" quality="medium" />
    </StrictMode>,
  )
  return root
}

export function unmountSriYantraLanding(root: Root | null): void {
  if (root) root.unmount()
}
