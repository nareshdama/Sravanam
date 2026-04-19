# Development Guide

## Prerequisites

- **Node.js** 20+ or 22+
- **npm**

CI currently runs on Node 22.

## Setup

```bash
git clone https://github.com/nareshdama/Sravanam.git
cd Sravanam
npm ci
```

### One-Time Playwright Install

```bash
npx playwright install chromium
```

## Daily Commands

```bash
npm run dev
npm run check
```

- `npm run dev` starts the Vite dev server at `http://localhost:5173`
- `npm run check` runs the recommended local quality gate before push

## Project Layout

```text
src/
  app.ts              # navigation helpers, session/audio sync, start/stop
  main.ts             # app boot, screen rendering, global viz mount
  audio/              # binaural engine
  components/         # advanced tuning, guide view, metadata, protocol, chrome
  data/               # templates, intentions, guides, frequencies, scales
  design/             # active design system CSS
  landing/            # React + R3F Sri Yantra layer
  lib/                # persistence, route sync, fullscreen, transitions
  screens/            # landing, intention picker, session card, immersive
  state/              # lightweight stores
  viz/                # p5 immersive viz, static fallback, ephemeris
e2e/
  smoke.spec.ts       # landing → session → immersive smoke path
public/
  sw.js
```

## Testing

| Command | What it runs |
|---------|--------------|
| `npm run test` | Vitest unit tests |
| `npm run build` | TypeScript compile + Vite production bundle |
| `npm run check` | `build` + `test` |
| `npm run test:e2e` | production build + Playwright smoke tests |
| `npm run test:e2e:only` | Playwright only, against an existing preview |
| `npm run test:e2e:ui` | Playwright UI mode |

## Important Workflow To Protect

The user-critical path is:

1. Landing
2. Intention picker
3. Session card
4. `I'm ready`
5. Immersive playback
6. `Stop`
7. Return to session card

If you touch routing, audio, advanced tuning, immersive controls, or teardown logic, run at least:

```bash
npm run check
npm run test:e2e
```

## Architecture Notes

- Audio is synthesized in-browser with the Web Audio API.
- The app has four screen renderers: `landing`, `intentions`, `session`, `immersive`.
- React is intentionally isolated to the landing/global visualization layer.
- The immersive visual is a lazy-loaded p5 sketch.
- The active styling system is `src/design/`.
- `src/style.css` is legacy/reference only and is not part of the current runtime bundle.

## Before Pushing

1. Run `npm run check`
2. Run `npm run test:e2e` if you changed navigation, audio, or immersive flow
3. Review `git status`
4. Update docs when behavior or architecture changed

## Troubleshooting

| Issue | Hint |
|-------|------|
| Audio start fails | Browser autoplay policy requires a user gesture; check `audioStartError` handling on the session card |
| E2E port conflict | Preview expects `127.0.0.1:4173` |
| Large p5 / R3F chunks | Expected; they are intentionally split off the critical path |
