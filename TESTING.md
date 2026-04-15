# Testing and bug-finding

## Automated gates (run on every change / CI)

```bash
npm run check
```

Runs `npm run build` (TypeScript + Vite) then `npm run test` (Vitest). Same commands execute in [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

**End-to-end smoke (optional, requires one-time browser install):**

```bash
npx playwright install chromium
npm run test:e2e
```

This builds the app, serves `vite preview`, and runs [e2e/smoke.spec.ts](e2e/smoke.spec.ts) (main p5 canvas `#beat-viz canvas.p5Canvas` — p5 can add extra offscreen canvases).

After `npm run check`, you can run E2E without rebuilding: `npm run test:e2e:only` (requires `dist/` from a prior build).

## Unit test coverage

- [`src/audio/binauralEngine.test.ts`](src/audio/binauralEngine.test.ts)
- [`src/viz/beatVisualization.test.ts`](src/viz/beatVisualization.test.ts) — math helpers only; large canvas module is not exercised by UI unless re-wired
- [`src/viz/planetaryEphemeris.test.ts`](src/viz/planetaryEphemeris.test.ts)
- [`src/viz/planetMotion.test.ts`](src/viz/planetMotion.test.ts)
- [`src/data/binauralTemplates.test.ts`](src/data/binauralTemplates.test.ts)

[`src/main.ts`](src/main.ts) and [`src/viz/vedicCosmicFlowerP5.ts`](src/viz/vedicCosmicFlowerP5.ts) rely on manual checks and E2E smoke tests.

---

## Manual checklist (browser)

Use `npm run dev`, DevTools **Console** (errors) and **Network** (failed chunks).

### Visualization (`#beat-viz`, p5)

- [ ] With **Visualization** open, a **canvas** appears under `#beat-viz` (not blank).
- [ ] **Collapse** the section → animation should stop / canvas removed; **expand** again → single canvas, no duplicates.
- [ ] **Horizontal mouse position** over the canvas changes animation speed (original `map(mouseX, 0, width, 0.005, 0.1)`).
- [ ] **Resize** the window; sketch should reflow (`ResizeObserver` + `window` resize).

### Audio

- [ ] **Start** / **Stop** playback; no console errors.
- [ ] Change **template**, **carrier**, **beat**, **volume**; limits text updates; no errors.
- [ ] If the browser blocks audio until a gesture, **Start** after click should still work.

### Ephemeris panel

- [ ] With viz open, `#planet-panel` fills with lines over time; no `astronomy-engine` errors in console.

### Accessibility

- [ ] Enable OS **prefers-reduced-motion**: viz should still run (lighter p5 init).
- [ ] **Keyboard**: open/close `<details>` summary; tab through controls; visible focus.

---

## Regression hotspots

| Area | What to verify |
|------|----------------|
| **p5 version** | [`package.json`](package.json) must keep **p5 1.x** (sketch matches p5 1.4-style API). |
| **Viz container CSS** | Do not add `contain: paint` on [`.beat-viz`](src/style.css) — can block canvas repainting. |
| **`<details>` layout** | `#beat-viz` needs non-zero width before p5 boots; if debugging blank canvas, confirm section is open and layout has completed. |

---

## Reporting a bug

Include: browser + OS, full console stack trace, steps to reproduce, and whether the issue happens with **audio playing** vs **visualization only**.
