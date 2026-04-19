# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server at http://localhost:5173 (hot reload)
npm run check        # TypeScript check + production build + Vitest — run before every push
npm run test         # Vitest unit tests only (src/**/*.test.ts)
npm run test:e2e     # Production build + Playwright smoke tests (Chromium)
npm run test:e2e:only  # Playwright only, reuses existing preview on port 4173
npm run build        # Production bundle (dist/)
npm run preview      # Serve dist/ locally at port 4173
```

One-time Playwright setup: `npx playwright install chromium`

CI runs: `npm ci` → `npm run check` → Playwright on the built artifacts.

## Architecture

**Sravanam** is a browser-based binaural-beat meditation app. All audio is synthesized live in-browser via the Web Audio API — no pre-recorded tracks. Visuals are driven by p5.js (immersive screen) and Three.js (landing Sri Yantra).

### Screen Router & Lifecycle

`src/main.ts` boots the app and subscribes to `appStore`. Screen transitions call `navigate(screen)` in `src/app.ts`, which handles per-screen `render*()` / `destroy*()` pairs for resource cleanup. Four screens: `landing → intentions → session → immersive`. Hash-based routing (`#landing`, etc.) keeps the URL in sync via `src/lib/routeSync.ts`.

### State Management

Two pub/sub stores (factory in `src/state/store.ts`):
- **appStore** (`src/state/appState.ts`): UI state — current screen, fullscreen, ephemeris visibility, advanced tuning open, reducedMotion
- **sessionStore** (`src/state/sessionState.ts`): Audio session — intention, template, carrier Hz, beat Hz, waveform, volume, bed type, error status

### Audio Pipeline

`src/audio/binauralEngine.ts` is the sole audio module. Left ear = carrier Hz, right ear = carrier + beat Hz. Optional ambient beds (om/cosmic/nada) are mixed underneath using Praṇava-inspired partials (136/272/408 Hz for "om" mode). `startSession()` in `app.ts` calls `engine.start()`; sessionStore changes propagate to the engine via store subscriptions. `stopSession()` kills the audio context and navigates back to the session card.

### Data Layer

`src/data/` holds all preset content:
- `binauralTemplates.ts` — named frequency presets (Alpha, Theta, etc.)
- `intentions.ts` — 5 intentions with default templates and guide text
- `sessionGuide.ts` — per-intention meditation guidance
- `vedicFrequencies.ts` — Vedic frequency reference data and mappings

### Visualization

- **Landing**: Three.js Sri Yantra with GLSL shaders (`src/landing/`). Uses React only for this component; the rest of the app is vanilla TypeScript.
- **Immersive**: p5.js mandala (`src/viz/vedicCosmicFlowerP5.ts`), lazy-loaded. Canvas2D fallback in `src/viz/staticMandala.ts`. Planetary ephemeris overlays computed via `astronomy-engine`.
- GPU capability is detected at boot (`src/lib/gpuCapabilities.ts`) to gate heavy Three.js/WebGL paths.

### CSS Design System

`src/design/` contains modular CSS imported in order: `tokens.css` (CSS custom properties) → `reset.css` → `typography.css` → `components.css` → `screens.css` → `animations.css`. `src/style.css` is legacy and being phased out; prefer the design system files.

### Chunk Strategy

Vite config manually chunks `p5`, `three`, and `@react-three/fiber` into separate bundles. The p5 chunk is intentionally large — it is lazy-loaded only on the immersive screen. The 1400 KB warning limit is a deliberate override.

## Key Constraints

- **No new frameworks.** Vanilla TypeScript for all app code; React is isolated to the Sri Yantra landing viz and must not spread.
- **User gesture required for AudioContext.** The session card surfaces `audioStartError` when autoplay is blocked.
- **E2E smoke path**: landing → intention → session card → "I'm Ready" → immersive → Stop. Touch this path after any routing, audio, or immersive change.
- Match existing TypeScript and CSS style; keep changes scoped to the task.
