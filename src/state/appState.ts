/**
 * Application UI state — which screen is visible, display preferences.
 */

import { createStore } from './store'

export type Screen = 'landing' | 'intentions' | 'session' | 'immersive'

export interface AppState {
  /** Currently visible screen */
  screen: Screen
  /** Whether immersive mode is truly fullscreen (Fullscreen API) */
  immersiveFullscreen: boolean
  /** Whether ephemeris overlay is shown in immersive mode */
  ephemerisVisible: boolean
  /** Whether advanced tuning panel is open on session card */
  advancedTuningOpen: boolean
  /** OS reduced-motion preference */
  reducedMotion: boolean
}

export const INITIAL_APP: AppState = {
  screen: 'landing',
  immersiveFullscreen: false,
  ephemerisVisible: false,
  advancedTuningOpen: false,
  reducedMotion: false,
}

export const appStore = createStore<AppState>(INITIAL_APP)
