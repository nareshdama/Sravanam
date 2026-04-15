# Sravanam

**Sravanam** (Sanskrit: śravaṇam — attentive listening) is a browser-based **binaural-beat listening** experience with Vedic-themed visuals. You choose an intention, tune the session, then listen in an immersive full-screen mandala with optional planetary ephemeris.

Built with **TypeScript**, **Vite**, **Web Audio** (synthesis, not pre-recorded tracks), and **p5.js** for the main visualization.

## Documentation

| Doc | Audience |
|-----|----------|
| [User guide](docs/USER_GUIDE.md) | Anyone using the app |
| [Development](docs/DEVELOPMENT.md) | Contributors — setup, tests, **before pushing to GitHub** |
| [Docs index](docs/README.md) | Short map of all `docs/` files |
| [Contributing](CONTRIBUTING.md) | PR expectations and links |
| [Rebuild plan](REBUILD-PLAN.md) | Product and architecture history (long-form) |

## Quick start (development)

```bash
npm ci
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Use **stereo headphones** for binaural beats.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck (`tsc`) + production bundle |
| `npm run preview` | Serve `dist/` locally |
| `npm run test` | Unit tests (Vitest) |
| `npm run check` | **Recommended gate:** `build` + `test` |
| `npm run test:e2e` | Production build + Playwright smoke tests |
| `npm run test:e2e:only` | Playwright only (expects preview or built `dist`) |

## Tech stack

- **Runtime:** modern browsers with Web Audio API  
- **UI:** vanilla TypeScript (no React/Vue), CSS design tokens under `src/design/`  
- **Audio:** [`src/audio/binauralEngine.ts`](src/audio/binauralEngine.ts)  
- **Viz:** landing uses Canvas2D [`src/viz/staticMandala.ts`](src/viz/staticMandala.ts); immersive uses [`src/viz/vedicCosmicFlowerP5.ts`](src/viz/vedicCosmicFlowerP5.ts)  
- **Ephemeris:** [`astronomy-engine`](https://github.com/cosinekitty/astronomy) — tropical zodiac  
