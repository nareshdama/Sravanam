# Sravanam

**Sravanam** (Sanskrit: shravanam — attentive listening) is a browser-based binaural-beat listening experience with Vedic-themed visuals. You choose a life-mode intention, optionally tune the session, then listen inside an immersive full-screen mandala with optional planetary ephemeris.

All audio is synthesized live in the browser with the Web Audio API. There are no pre-recorded meditation tracks.

## Documentation

| Doc | Audience |
|-----|----------|
| [User guide](docs/USER_GUIDE.md) | Anyone using the app |
| [Development](docs/DEVELOPMENT.md) | Contributors — setup, tests, repo layout, before-push checklist |
| [Production release QA](docs/RELEASE_QA.md) | Release owners — RC gates, manual certification matrix, signoff rules |
| [Product + architecture QA](docs/PRODUCT_ARCH_QA.md) | Designers and engineers — recurring rubric for product quality and architectural integrity |
| [Docs index](docs/README.md) | Short map of the docs set |
| [Contributing](CONTRIBUTING.md) | PR expectations and links |
| [Rebuild plan](REBUILD-PLAN.md) | Product and architecture history |

## Quick Start

```bash
npm ci
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`.

For the intended effect, use stereo headphones.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | TypeScript compile + production bundle |
| `npm run preview` | Serve `dist/` locally |
| `npm run test` | Vitest unit tests |
| `npm run check` | Recommended gate: `build` + `test` |
| `npm run test:e2e` | Build + Playwright smoke tests |
| `npm run test:e2e:only` | Playwright only, against an existing preview |
| `npm run test:e2e:ui` | Playwright UI mode |

One-time browser install for E2E:

```bash
npx playwright install chromium
```

## Current Architecture

- **Runtime:** modern browsers with Web Audio API
- **Router / app shell:** `src/main.ts` and `src/app.ts`
- **State:** lightweight pub/sub stores in `src/state/`
- **Audio engine:** `src/audio/binauralEngine.ts`
- **Landing visualization:** React + React Three Fiber under `src/landing/`
- **Immersive visualization:** lazy-loaded p5 sketch in `src/viz/vedicCosmicFlowerP5.ts`
- **Fallback visualization:** `src/viz/staticMandala.ts`
- **Ephemeris:** `astronomy-engine`
- **Styles:** design system in `src/design/`

## UI Flow

The app currently has four primary screens:

1. `landing`
2. `intentions`
3. `session`
4. `immersive`

The main smoke path is:

1. Landing
2. Choose one of the 9 life-mode intention cards
3. Review the session card
4. Press `I'm ready`
5. Enter immersive playback
6. Press `Stop` to return to the session card

## Notes For Contributors

- React is intentionally isolated to the landing/global Sri Yantra layer.
- The main app flow and UI outside that layer are vanilla TypeScript.
- The active styling system is `src/design/`. The legacy `src/style.css` file remains in the repo for reference/history, but it is no longer part of the runtime bundle.
