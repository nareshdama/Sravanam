/**
 * Full-viewport Sri Yantra layer — stays mounted across screens; hidden in immersive.
 */

import { useEffect, useState } from 'react'

import { appStore } from '../state/appState'
import { SriYantraMotionAnimation } from './SriYantraMotionAnimation'

export function GlobalVizLayer() {
  const [screen, setScreen] = useState(() => appStore.get().screen)
  const [reducedMotion, setReducedMotion] = useState(() => appStore.get().reducedMotion)

  useEffect(() => {
    return appStore.subscribe((s) => {
      setScreen(s.screen)
      setReducedMotion(s.reducedMotion)
    })
  }, [])

  if (reducedMotion) return null
  if (screen === 'immersive') return null

  const drive = screen === 'landing' ? 'page' : 'time'

  return (
    <SriYantraMotionAnimation
      drive={drive}
      quality="medium"
      style={{ width: '100%', height: '100%', minHeight: '100%' }}
    />
  )
}
