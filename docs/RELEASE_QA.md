# Production Release QA

This document defines the standard production release QA workflow for **Sravanam**.

Use this plan for release candidates, not for every small local change. For day-to-day testing and bug-finding, see [../TESTING.md](../TESTING.md).

For the recurring qualitative and architectural review rubric used on major changes, see [PRODUCT_ARCH_QA.md](PRODUCT_ARCH_QA.md).

## Release Standard

Sravanam uses a **balanced** production release QA process:

- **Automated gates on every release candidate**
- **Full manual certification on Chrome desktop**
- **Full manual certification on Safari on iPhone**
- **Spot checks on one additional desktop Chromium browser and one additional mobile browser when available**

The release plan is designed to protect the app's real production hotspots:

- session start under autoplay rules
- immersive playback
- p5 mandala rendering
- fullscreen controls
- PWA behavior
- clean return from `Stop`

## Release Gates

These are required before release approval:

```bash
npm run check
npm run test:e2e
```

Release approval also requires:

- green CI in [../.github/workflows/ci.yml](../.github/workflows/ci.yml)
- no unresolved blocker findings from manual certification

## When To Run The Full Plan

Run the full balanced plan when the release touches any of these areas:

- routing
- session state
- audio engine
- immersive screen
- advanced tuning
- session teardown / `Stop`
- PWA or production preview behavior

If the release is docs-only or isolated to non-runtime content:

- still run the automated gates
- reduce manual QA to the main smoke path and a quick production preview sanity pass

## Release Checklist

### 1. Release Candidate Prep

- Confirm the release candidate commit / branch and record the SHA.
- Review the changed areas and decide whether the release needs the full balanced plan or the reduced docs-only path.
- Use the production artifact under test consistently:
  - manual release QA must use `npm run preview`
  - do not certify production behavior from `npm run dev`

### 2. Automated Validation

- Run `npm run check`
- Run `npm run test:e2e`
- Confirm CI is green on Node 22
- If any automated gate fails, stop release QA and fix the issue first

### 3. Chrome Desktop Certification

Use a production build served by `npm run preview`.

- [ ] App boots with no failed chunks and no blocking console errors
- [ ] Landing loads and `Begin a session` works
- [ ] Intention picker opens and at least one card can be selected
- [ ] Session card renders correctly
- [ ] Pressing `I'm ready` enters immersive playback
- [ ] `Stop` returns to session card cleanly
- [ ] Audio starts successfully after user gesture
- [ ] If autoplay is blocked, `audioStartError` is visible and retry works
- [ ] Immersive canvas is visible and non-zero size
- [ ] Ephemeris node is present and updates without console errors
- [ ] Advanced tuning changes carrier, beat, volume, waveform, and Saptaswar snap without breaking playback
- [ ] Fullscreen enter / exit works
- [ ] Reduced-motion setting does not break the experience
- [ ] PWA update, install, and offline banners behave correctly in preview
- [ ] Cached revisit works without broken assets
- [ ] Media Session metadata behaves correctly where supported
- [ ] Wake lock behavior is acceptable where supported

### 4. Safari On iPhone Certification

Use the same production preview build.

- [ ] App boots successfully
- [ ] Initial session start succeeds after explicit user gesture
- [ ] If autoplay fails, the error is recoverable and retry succeeds
- [ ] Landing → intentions → session → immersive → `Stop` works end-to-end
- [ ] Immersive screen is usable
- [ ] Orientation / fullscreen behavior is acceptable for the current product
- [ ] PWA install hint is acceptable
- [ ] Cached revisit behavior is acceptable
- [ ] No blocker console/runtime errors are observed during the critical path

### 5. Spot Checks

When available, run a lighter pass on:

- one additional desktop Chromium browser
- one additional mobile browser

Spot checks only need to confirm:

- app boot
- session start
- immersive entry
- `Stop` return path

### 6. Signoff

- Classify each finding as either **blocker** or **follow-up**
- Approve release only when all blockers are resolved
- When the release includes major product, flow, or architecture changes, attach the completed [PRODUCT_ARCH_QA_TEMPLATE.md](PRODUCT_ARCH_QA_TEMPLATE.md) scorecard
- Record the final signoff note with:
  - tester
  - date
  - commit SHA
  - platform / browser matrix
  - automated gate status
  - manual certification status
  - remaining follow-ups, if any

## Blocking Rules

Treat these as release blockers:

- failure in the main user flow
- audio start failure without recovery
- immersive rendering failure
- broken `Stop` teardown / return path
- failed automated gates
- broken production preview / PWA asset loading

These may ship only with documented follow-up if they do not affect the critical path:

- minor visual polish issues
- non-blocking copy issues
- platform-specific cosmetic issues outside the main session flow

## Evidence Capture

For every release QA pass, record:

- browser and OS
- device type
- tester
- date
- commit SHA
- screenshots for visible issues
- console errors or stack traces
- exact reproduction steps

Recommended signoff template:

```text
Release candidate:
Commit SHA:
Tester:
Date:

Automated gates:
- npm run check: PASS / FAIL
- npm run test:e2e: PASS / FAIL
- CI (Node 22): PASS / FAIL

Manual certification:
- Chrome desktop: PASS / FAIL
- Safari iPhone: PASS / FAIL
- Secondary desktop spot check: PASS / FAIL / N/A
- Secondary mobile spot check: PASS / FAIL / N/A

Blockers:
- None / [list]

Follow-ups:
- None / [list]

Final decision:
- APPROVED / HOLD
```
