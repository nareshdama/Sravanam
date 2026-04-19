# AGENTS.md

This file provides guidance to Codex and other coding agents working in this repository.

## Commands

```bash
npm run dev            # Vite dev server at http://localhost:5173
npm run check          # production build + Vitest — run before every push
npm run test           # Vitest unit tests only
npm run test:e2e       # production build + Playwright smoke tests
npm run test:e2e:only  # Playwright only, reuse an existing preview on port 4173
npm run build          # production bundle into dist/
npm run preview        # serve dist/ locally on port 4173
```

One-time Playwright setup:

```bash
npx playwright install chromium
```

CI runs:

```bash
npm ci
npm run check
npx playwright test
```

## Architecture

**Sravanam** is a browser-based binaural-beat meditation/listening app. Audio is synthesized live in-browser via the Web Audio API. Visuals are split between a persistent landing/global Sri Yantra layer and a lazy-loaded immersive mandala.

### Screen Router And Lifecycle

`src/main.ts` boots the app, mounts the persistent global visualization layer, and subscribes to `appStore` screen changes.

The app renders four main screens into `#app-screen`:

- `landing`
- `intentions`
- `session`
- `immersive`

Each screen has a paired `render*()` / `destroy*()` lifecycle in `src/screens/`.

Navigation is coordinated in `src/app.ts`. Hash routing is synced in `src/lib/routeSync.ts` using `#/landing`, `#/intentions`, `#/session`, and `#/immersive`.

### State Management

The app uses two lightweight pub/sub stores from `src/state/store.ts`:

- **appStore** in `src/state/appState.ts`
  - current screen
  - immersive fullscreen state
  - ephemeris visibility
  - advanced tuning visibility flag
  - reduced-motion preference
- **sessionStore** in `src/state/sessionState.ts`
  - intention
  - template
  - carrier Hz
  - beat Hz
  - waveform
  - volume
  - ambient bed
  - playback status
  - audio start error

### Audio Pipeline

`src/audio/binauralEngine.ts` is the core audio module.

- Left ear = carrier Hz
- Right ear = carrier + beat Hz
- Optional ambient beds:
  - `off`
  - `om`
  - `cosmic`
  - `nada`

`startSession()` in `src/app.ts` starts playback and routes to immersive mode.

Session changes are synchronized back into the engine through centralized session-to-engine sync in `src/app.ts`, so tuning updates and workflow navigation stay coherent.

### Data Layer

`src/data/` holds the preset and content model:

- `binauralTemplates.ts` — main template catalog
- `intentions.ts` — 9 life-mode intention cards
- `sessionGuide.ts` — Vedic/modern session guide copy
- `vedicFrequencies.ts` — extended Vedic frequency reference data
- `saptaswarScale.ts` — note snapping data for advanced tuning

### Visualization

- **Landing / global layer:** `src/landing/`
  - React + React Three Fiber
  - persistent mount on `#app-global-viz`
  - hidden in immersive mode
- **Immersive:** `src/viz/vedicCosmicFlowerP5.ts`
  - lazy-loaded p5 sketch
  - static Canvas2D fallback in `src/viz/staticMandala.ts`
- **Ephemeris:** `src/viz/planetaryEphemeris.ts`

### CSS Design System

The active styling system is `src/design/`, imported in this order:

1. `tokens.css`
2. `reset.css`
3. `typography.css`
4. `components.css`
5. `screens.css`
6. `animations.css`

`src/style.css` remains in the repo as legacy/reference material, but it is not part of the runtime bundle anymore.

### Chunk Strategy

`vite.config.ts` manually chunks:

- `p5`
- `three`
- `@react-three/*` and related React runtime pieces
- `astronomy-engine`

The p5 and R3F chunks are intentionally large because they stay off the critical path.

## Key Constraints

- **No new framework spread.** React is intentionally isolated to the landing/global visualization layer.
- **AudioContext requires user interaction.** The session card must continue surfacing `audioStartError` for autoplay-policy failures.
- **Protect the smoke path.** If you touch routing, audio, immersive mode, or session start/stop flow, verify:
  - landing → intentions → session → `I'm ready` → immersive → `Stop`
- **Keep changes scoped.** Match the existing TypeScript and CSS style.
