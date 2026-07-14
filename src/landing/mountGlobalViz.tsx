/**
 * Mounts the persistent WebGL background (body → #app-global-viz).
 */

import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'

import { GlobalVizLayer } from './globalVizLayer'

let root: Root | null = null

export function mountGlobalVizLayer(container: HTMLElement): Root {
  root = createRoot(container)
  root.render(
    <StrictMode>
      <GlobalVizLayer />
      <Analytics />
    </StrictMode>,
  )
  return root
}

export function unmountGlobalVizLayer(): void {
  root?.unmount()
  root = null
}
