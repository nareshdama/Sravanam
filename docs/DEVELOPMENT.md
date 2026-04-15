# Development guide

## Prerequisites

- **Node.js** 20+ or 22+ (CI uses 22; see `.github/workflows/ci.yml`)  
- **npm** (lockfile: `package-lock.json` if present; use `npm ci` when available)

## Setup

```bash
git clone <your-repo-url>
cd Yoga   # or your project folder name
npm ci    # or npm install
```

### One-time Playwright browsers (for E2E)

```bash
npx playwright install chromium
```

Full CI installs with `npx playwright install chromium --with-deps` on Ubuntu.

## Daily commands

```bash
npm run dev          # http://localhost:5173 — hot reload
npm run check        # tsc + vite build + vitest (run before push)
```

## Project layout (short)

```
src/
  app.ts              # Routing helpers, engine, start/stop session
  main.ts             # Boot, screen render, SW registration (production)
  audio/              # Binaural engine
  data/               # Templates, intentions, guides, sound library
  design/             # tokens.css, typography, screens, components
  screens/            # landing, intentionPicker, sessionCard, immersive
  components/         # Bed picker, guide view, advanced tuning, chrome
  lib/                # persistence, routeSync, fullscreen, view transitions
  state/              # app + session stores
  viz/                # staticMandala, vedicCosmicFlowerP5, ephemeris
e2e/                  # Playwright smoke tests
public/               # sw.js, favicon, static assets
```

Deep product and phase history: [REBUILD-PLAN.md](../REBUILD-PLAN.md).

## Testing

| Command | What it runs |
|---------|----------------|
| `npm run test` | Vitest unit tests (`src/**/*.test.ts`) |
| `npm run check` | `tsc`, Vite production build, then Vitest |
| `npm run test:e2e` | Build + Playwright against `vite preview` (see `playwright.config.ts`) |
| `npm run test:e2e:only` | Playwright only — reuse existing preview on port 4173 or start manually |

E2E expects a **production build** quality bundle (same as CI).

## Before pushing to GitHub

Use this checklist so CI stays green and reviews stay focused.

### Required

1. **`npm run check`** — must pass (TypeScript, build, unit tests).  
2. **Review `git status`** — only intentional files; no secrets, API keys, or local machine paths.  
3. **`.gitignore`** — `node_modules/`, `dist/`, Playwright reports, editor junk should remain ignored.

### Strongly recommended

4. **`npm run test:e2e`** — matches CI’s Playwright step (needs Chromium installed).  
5. **Smoke the UI** — landing → intention → session → **I’m ready** → immersive → **Stop**.  
6. **Branch** — use a feature branch; open a PR to `main`/`master` if that is your workflow.

### Optional

7. **Update docs** — if behavior or scripts changed, adjust [README.md](../README.md) and this file or [USER_GUIDE.md](USER_GUIDE.md).  
8. **REBUILD-PLAN** — only if you are tracking product phases there; not required for every code change.

### What CI runs (`.github/workflows/ci.yml`)

On push/PR to `main` or `master`:

1. `npm ci`  
2. `npm run check`  
3. `npx playwright install chromium --with-deps`  
4. `npx playwright test`  

Local `test:e2e` runs `npm run build` first; CI relies on the build artifacts from step 2’s `npm run check` (which includes `vite build`). Align with CI by running the full `npm run test:e2e` before push if you touch routing, audio, or immersive.

## Troubleshooting

| Issue | Hint |
|-------|------|
| AudioContext / autoplay errors | User gesture required; session card surfaces `audioStartError` when start fails. |
| E2E port in use | `playwright.config.ts` uses `127.0.0.1:4173`; stop other previews. |
| p5 chunk huge | Expected; lazy-loaded for immersive. |

## Contributing

- Match existing **TypeScript and CSS** style; keep changes scoped to the task.  
- No new framework unless the product explicitly changes ([Part 8](../REBUILD-PLAN.md#part-8--what-were-not-doing)).  
- Prefer extending [USER_GUIDE.md](USER_GUIDE.md) when user-visible behavior changes.
