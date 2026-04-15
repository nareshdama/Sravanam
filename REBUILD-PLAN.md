# Sravanam Rebuild Plan

## Executive Assessment

Sravanam is a binaural-beat listening tool with Vedic-themed cosmic visualization. The current build is technically competent (~4,500 lines of TypeScript, working audio engine, p5.js canvas, real ephemeris data) but it reads like an **engineering demo**, not a **product people reach for**. The entire UI is a vertical stack of form controls and disclaimers. There is no emotional arc, no sense of entering a sacred space, no progressive disclosure that draws the listener inward.

The rebuild preserves the strong audio core and data layer but replaces the presentation layer with an experience designed from first principles around the actual use case: *someone puts on headphones, sits down, and wants to be guided into a focused or contemplative state*.

---

## Part 1 — Product Critique

### What works
- Audio engine is well-built (Nyquist-safe, Web Audio lifecycle correct, ambient beds are evocative)
- Template library is thoughtfully curated with responsible disclaimers
- Dual-frame session guide (Vedic + modern) is a genuinely original idea
- p5.js cosmic flower is visually rich and has real astronomical data behind it
- Accessibility baseline is solid (ARIA, reduced motion, dark mode)

### What fails as product

| Problem | Why it matters |
|---------|---------------|
| **Wall of controls on first load** | User sees carrier Hz, beat Hz, waveform, volume, template dropdown, sound library, session guide, acknowledge checkbox — *before* they hear a single tone. This is a synthesizer control panel, not a listening experience. |
| **Visualization is buried** | The mandala sits inside a collapsed `<details>` at the bottom. It should be the centerpiece — the first thing you see, the thing that draws you in. |
| **Session guide gate is friction without warmth** | Forcing checkbox acknowledgment before playback is safety-theater. A first-time listener needs *invitation*, not a consent form. The disclaimer language is correct but the UX pattern is wrong. |
| **No sense of journey** | Every template plays the same way: press Start, hear tone, optionally open viz. There is no guided breathing, no ramp-in, no transition between states, no gentle ending. |
| **Typography and spacing feel utilitarian** | Cormorant Garamond is a beautiful choice but it's used at the same scale as body text. The hierarchy doesn't create the feeling of opening an illuminated manuscript. |
| **No mobile-native feel** | The 560px max-width centered layout works but doesn't feel like an app. No haptic cues, no gesture nav, no full-screen immersive mode. |
| **Sound library is afterthought** | OM drone, cosmic noise, and nāda pair are hidden in a dropdown. These should be first-class experiences with their own visual identity. |

### The core insight

The current app asks: *"What frequency do you want?"*
It should ask: *"What do you need right now?"*

---

## Part 2 — Design Language: "Temple at Dusk"

### Philosophy

Every screen should feel like walking into a dimly lit temple at twilight — warm stone, soft gold, deep shadow, a single lamp flame. The interface recedes; the experience emerges.

### Color System

```
Background:
  Light  — #f5f0e8 (aged parchment, warm)
  Dark   — #0c0a12 (deep indigo-black, the sky before stars appear)

Surface (cards, panels):
  Light  — #fffdf7 / rgba(255,253,247,0.7)  (translucent vellum)
  Dark   — #1a1520 / rgba(26,21,32,0.6)     (temple shadow)

Primary accent:
  Gold   — #c8a246 (brass lamp, warm)
  Glow   — #e8c86a (flame highlight)

Secondary accent:
  Kāṣāya — #a0522d (monk's robe, earthy)
  Rose   — #c27488 (lotus, used sparingly)

Text:
  Light  — #1a1510 (carbon ink on parchment)
  Dark   — #e8dfd0 (moonlit stone)
  Muted  — 55% opacity of text color

State:
  Active/Playing — gold glow + subtle pulse
  Danger/Stop    — deep red #8b2020 (not alarming, grounding)
  Disabled       — 30% opacity
```

### Typography

```
Display / Titles:
  Cormorant Garamond 600, tracking +0.03em
  Sizes: 2.5rem (hero), 1.75rem (section), 1.25rem (card)
  Used for: app name, section names, template names, sound names

Body / Controls:
  Source Sans 3 400/500
  Sizes: 1rem (body), 0.875rem (secondary), 0.75rem (caption)
  Used for: descriptions, controls, metadata

Monospace (data):
  System monospace, 0.8125rem
  Used for: Hz values, ephemeris coordinates, signal limits

Sanskrit / Devanagari accents:
  Cormorant Garamond italic for transliterated terms
```

### Spatial System (8px grid)

```
--space-xs:  4px    (icon gaps)
--space-sm:  8px    (inline padding)
--space-md:  16px   (card padding, control spacing)
--space-lg:  24px   (section gaps)
--space-xl:  32px   (page margins)
--space-2xl: 48px   (hero spacing)
--space-3xl: 64px   (section separation)

Border radius:
  Card:    16px  (soft, organic)
  Button:  12px
  Input:   8px
  Circle:  50%  (avatar, viz frame)
```

### Motion Principles

```
1. Everything breathes — subtle scale oscillation on idle elements (0.998 → 1.002)
2. Transitions are slow and deliberate — 400ms ease-out minimum for layout shifts
3. Gold elements glow when active — box-shadow: 0 0 20px rgba(200,162,70,0.3)
4. No bounce, no overshoot — movements feel gravitational, not elastic
5. Reduced motion: static glow (no pulse), instant transitions, still mandala center
```

---

## Part 3 — Information Architecture Rebuild

### Current (flat stack)
```
Header + disclaimer
  └─ Template dropdown
  └─ Carrier input + slider
  └─ Beat input + slider
  └─ Volume slider
  └─ Waveform select
  └─ Sound library dropdown
  └─ Session guide (collapsed)
  └─ Acknowledge checkbox
  └─ Start/Stop button
  └─ Visualization (collapsed <details>)
  └─ Safety footnote
```

### Proposed (layered experience)

```
┌─────────────────────────────────────────────┐
│  LANDING / HERO                             │
│  Mandala preview (static, centered, large)  │
│  "Sravanam" + tagline                       │
│  "Begin a session" CTA                      │
└─────────────────────────────────────────────┘
            ↓ (scroll or tap CTA)
┌─────────────────────────────────────────────┐
│  INTENTION PICKER                           │
│  "What draws you here?"                     │
│                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ Rest │ │ Focus│ │ Calm │ │ Deep │       │
│  │  ◯   │ │  ◯   │ │  ◯   │ │  ◯   │       │
│  │delta │ │ beta │ │alpha │ │theta │       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
│                                             │
│  Each card → subtle illustration,           │
│  band name, 1-line description              │
│  Tapping one auto-selects best template     │
└─────────────────────────────────────────────┘
            ↓ (after selection)
┌─────────────────────────────────────────────┐
│  SESSION CARD                               │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  Template name + Hz label             │  │
│  │  Ambient bed selector (icon row)      │  │
│  │  Session guide (Vedic | Modern tabs)  │  │
│  │  ─────────────────────────────────    │  │
│  │  "I'm ready" →  ▶  PLAY              │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Advanced tuning (collapsed):               │
│  carrier, beat, waveform, volume            │
└─────────────────────────────────────────────┘
            ↓ (after play)
┌─────────────────────────────────────────────┐
│  IMMERSIVE MODE                             │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │                                       │  │
│  │        FULL MANDALA CANVAS            │  │
│  │        (fills viewport)               │  │
│  │                                       │  │
│  │    Ephemeris overlay (subtle)         │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Floating controls: volume, stop, minimize  │
│  Session timer + current Hz display         │
│  Tap canvas → toggle ephemeris panel        │
└─────────────────────────────────────────────┘
```

### Key UX Changes

1. **Intention-first, not frequency-first** — user picks a goal ("Rest", "Focus", "Calm", "Deep meditation"), not a Hz value
2. **Session card replaces form** — one coherent card per session, not scattered fields
3. **"I'm ready" replaces checkbox** — the guide is *part of* the session card, reading it is natural, confirming is a single button that also starts playback
4. **Immersive mode on play** — visualization becomes full-screen, controls float as an overlay, the experience takes over
5. **Advanced tuning is opt-in** — carrier/beat/waveform hide in a disclosure for power users; most listeners never need them
6. **Ambient beds are visual** — icon row (OM symbol, wave, silence) instead of a dropdown

---

## Part 4 — Technical Architecture

### Stack Decision

**Keep:** TypeScript, Vite, Web Audio API, astronomy-engine
**Replace:** Raw DOM → lightweight reactive layer
**Add:** View transitions API, Web Animations API, Fullscreen API

### Why not React/Svelte/Vue?

The app has ~5 interactive screens with minimal shared state. A framework adds 30-80KB to the bundle for component lifecycle management this app doesn't need. Instead:

- **Vanilla TS with a thin state store** (pub/sub pattern, ~60 lines)
- **HTML templates as tagged template literals** (no JSX transpilation)
- **View Transitions API** for screen changes (progressive enhancement)
- **CSS animations** for all motion (GPU-composited, no JS frame loop for UI)

This keeps the bundle under 50KB (excluding p5 which lazy-loads), loads in <1s on 3G, and has zero framework churn risk.

### Module Architecture

```
src/
├── app.ts                    # Boot, router, state subscription
├── state/
│   ├── store.ts              # Pub/sub state store
│   ├── sessionState.ts       # Session config (template, bed, carrier, beat, wave, vol)
│   └── appState.ts           # UI state (screen, playing, immersive, guide-read)
├── screens/
│   ├── landing.ts            # Hero + mandala preview + CTA
│   ├── intentionPicker.ts    # Goal cards grid
│   ├── sessionCard.ts        # Template detail + guide + play
│   └── immersive.ts          # Full-screen viz + floating controls
├── components/
│   ├── ambientBedPicker.ts   # Icon row for OM / cosmic / nāda / off
│   ├── advancedTuning.ts     # Carrier, beat, waveform, volume (disclosure)
│   ├── sessionGuide.ts       # Tabbed Vedic | Modern guide
│   ├── floatingControls.ts   # Overlay during immersive mode
│   ├── ephemerisOverlay.ts   # Planet positions on canvas
│   └── intentionCard.ts      # Single goal card (Rest, Focus, etc.)
├── audio/
│   ├── binauralEngine.ts     # [KEEP — minor refactors only]
│   ├── fadeManager.ts        # Extract fade-in/out logic
│   └── ambientBeds.ts        # Extract OM / cosmic / nāda synthesis
├── data/
│   ├── binauralTemplates.ts  # [KEEP]
│   ├── sessionGuide.ts       # [KEEP — adapt rendering]
│   ├── vedicSoundLibrary.ts  # [KEEP]
│   └── intentions.ts         # NEW: maps intentions → template sets
├── viz/
│   ├── cosmicFlower.ts       # Refactored p5 sketch (thinner, delegates to layers)
│   ├── layers/
│   │   ├── starfield.ts      # Star rendering
│   │   ├── nebulae.ts        # Nebula blobs
│   │   ├── galaxyArms.ts     # Spiral arm particles
│   │   ├── mandalaRings.ts   # Rotating petal rings
│   │   ├── chakraAura.ts     # Aura particles + chakra rings
│   │   ├── sriYantra.ts      # [extracted from sriChakraDraw.ts]
│   │   ├── flowerOfLife.ts   # Sacred geometry overlay
│   │   ├── kundalini.ts      # Ascending particle spirals
│   │   └── omWave.ts         # Ripple distortion
│   ├── bloom.ts              # Glow buffer compositing
│   ├── planetaryEphemeris.ts # [KEEP]
│   └── planetMotion.ts       # [KEEP]
├── lib/
│   ├── gpuCapabilities.ts    # [KEEP]
│   ├── motionPreference.ts   # [KEEP]
│   ├── fullscreen.ts         # NEW: Fullscreen API wrapper
│   ├── viewTransition.ts     # NEW: View Transitions API wrapper
│   └── persistence.ts        # NEW: localStorage for preferences
├── design/
│   ├── tokens.css            # Color, spacing, typography variables
│   ├── reset.css             # Minimal reset
│   ├── typography.css         # Font faces, scale, prose styles
│   ├── components.css        # Button, card, field, disclosure styles
│   ├── screens.css           # Per-screen layout
│   ├── immersive.css         # Full-screen viz + floating controls
│   └── animations.css        # Keyframes, transitions, motion preferences
└── main.ts                   # Entry: import styles, boot app
```

### State Store Design

```typescript
// state/store.ts — ~60 lines, no dependencies

type Listener<T> = (state: T) => void

interface Store<T> {
  get(): Readonly<T>
  set(partial: Partial<T>): void
  subscribe(listener: Listener<T>): () => void
}

function createStore<T extends Record<string, unknown>>(initial: T): Store<T>
```

```typescript
// state/sessionState.ts

interface SessionState {
  intentionId: string | null        // 'rest' | 'focus' | 'calm' | 'deep' | null
  templateId: string | null         // from binauralTemplates
  bedId: SoundLibraryMode           // 'off' | 'om' | 'cosmic' | 'nada'
  carrierHz: number
  beatHz: number
  wave: OscillatorType
  volume: number
  playing: boolean
}
```

```typescript
// state/appState.ts

interface AppState {
  screen: 'landing' | 'intentions' | 'session' | 'immersive'
  immersiveFullscreen: boolean
  ephemerisVisible: boolean
  advancedTuningOpen: boolean
  reducedMotion: boolean
}
```

### Screen Transition Flow

```
landing ──[CTA click]──→ intentions
intentions ──[card tap]──→ session (auto-selects best template for intention)
session ──["I'm ready" tap]──→ immersive (starts audio + full viz)
immersive ──[stop / minimize]──→ session (stops audio)
session ──[back]──→ intentions
Any screen ──[logo tap]──→ landing
```

Transitions use the View Transitions API where supported, falling back to CSS opacity crossfade.

Hash routes (`#/landing`, `#/intentions`, `#/session`, `#/immersive`) stay in sync with `appStore.screen` (see `src/lib/routeSync.ts`). Loading `#/immersive` without active playback resolves to `#/session`.

---

## Part 5 — Intention Mapping (New Data Layer)

```typescript
// data/intentions.ts

interface Intention {
  id: string
  title: string                    // "Rest"
  subtitle: string                 // "Release the day"
  description: string              // 1 sentence
  icon: string                     // SVG path or symbol reference
  brainwaves: Brainwave[]          // ['delta', 'theta']
  defaultTemplateId: string        // best single preset
  alternateTemplateIds: string[]   // other good options
  defaultBed: SoundLibraryMode     // 'nada' for rest, 'off' for focus, etc.
  color: string                    // card accent color
  illustration: string             // SVG illustration ID
}

const INTENTIONS: Intention[] = [
  {
    id: 'rest',
    title: 'Rest',
    subtitle: 'Release the day',
    description: 'Low delta waves invite the body toward sleep.',
    brainwaves: ['delta'],
    defaultTemplateId: 'delta-0.5-2',
    alternateTemplateIds: ['delta-3'],
    defaultBed: 'nada',
    color: '#4a6fa5',
    illustration: 'moon-lotus',
  },
  {
    id: 'calm',
    title: 'Calm',
    subtitle: 'Settle the breath',
    description: 'Alpha rhythms mirror a quiet, alert mind.',
    brainwaves: ['alpha'],
    defaultTemplateId: 'alpha-10.5',
    alternateTemplateIds: ['alpha-8-10', 'alpha-11'],
    defaultBed: 'om',
    color: '#6b8e6b',
    illustration: 'leaf-spiral',
  },
  {
    id: 'focus',
    title: 'Focus',
    subtitle: 'Sharpen attention',
    description: 'Beta entrainment supports sustained concentration.',
    brainwaves: ['beta', 'alpha-beta'],
    defaultTemplateId: 'beta-20',
    alternateTemplateIds: ['alpha-beta-12-15', 'beta-28-30'],
    defaultBed: 'off',
    color: '#c8a246',
    illustration: 'flame-single',
  },
  {
    id: 'deep',
    title: 'Deep',
    subtitle: 'Turn inward',
    description: 'Theta waves accompany meditative absorption.',
    brainwaves: ['theta'],
    defaultTemplateId: 'theta-5-7-yoga',
    alternateTemplateIds: ['theta-7.83', 'theta-7', 'theta-4', 'theta-5-6'],
    defaultBed: 'cosmic',
    color: '#7b5ea7',
    illustration: 'eye-closed',
  },
]
```

---

## Part 6 — Visual Design Specifications

### Landing Screen

```
┌─────────────────────────────────┐
│                                 │
│         [static mandala]        │  ← Canvas2D, no p5 (lightweight)
│          gold on dark           │     Draws: outer ring + sri yantra center
│          slow rotation          │     ~200 lines, no dependencies
│                                 │
│                                 │
│         S R A V A N A M         │  ← Cormorant Garamond 600, 2.5rem
│    Śravaṇam — attentive         │     tracking: 0.15em (display)
│          listening              │  ← Source Sans 3 400 italic, 1rem
│                                 │
│                                 │
│      ┌─────────────────┐        │
│      │  Begin a session │       │  ← Gold border, transparent bg
│      └─────────────────┘        │     On hover: gold fill, dark text
│                                 │
│   Use stereo headphones ·       │  ← 0.75rem, 40% opacity
│   personal listening only       │
│                                 │
└─────────────────────────────────┘
```

### Intention Cards

```
┌──────────────┐
│              │
│    ☽         │  ← SVG illustration, 48x48, themed color
│              │
│    Rest      │  ← Cormorant Garamond 600, 1.25rem
│  Release     │  ← Source Sans 3 400, 0.875rem, 55% opacity
│  the day     │
│              │
│  Delta ·     │  ← 0.75rem, gold accent
│  0.5–3 Hz    │
│              │
└──────────────┘

Grid: 2 columns on mobile, 4 on desktop
Card: glass surface, 16px radius, 1px border (gold at 10%)
Selected state: gold border, subtle glow, check icon
```

### Session Card

```
┌──────────────────────────────────────────┐
│                                          │
│  Rest · Delta · 0.5–2 Hz                │  ← Title bar
│  Sleep / rest                            │  ← Use case
│                                          │
│  ┌─ Ambient bed ──────────────────────┐  │
│  │  ◯ None   ◉ Oṃ   ◯ Ākāśa  ◯ Nāda │  │  ← Segmented control
│  └────────────────────────────────────┘  │
│                                          │
│  ┌─ Session guide ────────────────────┐  │
│  │  [Vedic] [Modern]                  │  │  ← Tab switcher
│  │                                    │  │
│  │  The tradition of śravaṇam ...     │  │  ← Scrollable prose area
│  │  ...                               │  │     max-height: 200px
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │        ▶  I'm ready               │  │  ← Primary CTA
│  └────────────────────────────────────┘  │     Gold gradient, large touch target
│                                          │
│  ▸ Advanced tuning                       │  ← Disclosure
│    Carrier 200 Hz  ═══════●══           │
│    Beat 1.25 Hz    ●════════            │
│    Waveform: Sine  Volume: 20%           │
│                                          │
│  ▸ Choose a different template           │  ← Shows alternates
│                                          │
└──────────────────────────────────────────┘
```

### Immersive Mode

```
┌──────────────────────────────────────────┐
│                                          │
│                                          │
│                                          │
│         FULL VIEWPORT CANVAS             │  ← p5.js, all layers active
│         (cosmic flower mandala)          │     Background: #0c0a12
│                                          │
│                                          │
│                                          │
│                                          │
│  ┌──────────────────────────┐            │
│  │ ♈ Ari 12°34′  ☉ 24°05′  │            │  ← Ephemeris overlay
│  │ ♉ Tau  8°12′  ☽ 15°42′  │            │     Toggled by canvas tap
│  └──────────────────────────┘            │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │  ■ Stop  │  🔊 ═══●══  │  ⛶     │    │  ← Floating control bar
│  └──────────────────────────────────┘    │     Auto-hides after 4s
│                                          │     Reappears on mouse move
│  Rest · Delta 1.25 Hz · 3:42            │  ← Session info, subtle
│                                          │
└──────────────────────────────────────────┘
```

---

## Part 7 — Implementation Phases

Historical checklist below is **aligned to the repo as implemented** (file names and scope updated). Original sketch referred to `cosmicFlower.ts` + `viz/layers/*`; **shipping visualization** is [`src/viz/vedicCosmicFlowerP5.ts`](src/viz/vedicCosmicFlowerP5.ts) (p5 monolith). Layer extraction remains an optional refactor, not a v1 blocker.

### Phase 0: Prep (preserve what works)
- [x] Lock current `src/audio/` — no changes to binauralEngine beyond extracting ambient beds
- [x] Lock current `src/data/` — templates, guides, sound library stay as-is
- [x] Lock current `src/viz/planetaryEphemeris.ts` and `planetMotion.ts`
- [x] Extract all test files, ensure they still pass against unchanged modules
- [x] Create `src/design/tokens.css` with the new color/spacing/type system
- [x] Directory structure in place (`screens/`, `components/`, `design/`, `state/`, `lib/`)

### Phase 1: Foundation — State + Routing (~2 sessions)
- [x] [`state/store.ts`](src/state/store.ts) (pub/sub)
- [x] [`state/sessionState.ts`](src/state/sessionState.ts) and [`state/appState.ts`](src/state/appState.ts)
- [x] [`app.ts`](src/app.ts) with screen router + [`lib/routeSync.ts`](src/lib/routeSync.ts) (hash routes)
- [x] [`lib/viewTransition.ts`](src/lib/viewTransition.ts)
- [x] [`lib/persistence.ts`](src/lib/persistence.ts) (localStorage session prefs)
- [x] Wire: app boots → reads persisted state → renders landing screen
- [x] Test: [`store.test.ts`](src/state/store.test.ts), [`persistence.test.ts`](src/lib/persistence.test.ts)

### Phase 2: Landing + Intentions (~2 sessions)
- [x] [`screens/landing.ts`](src/screens/landing.ts) — static mandala ([`viz/staticMandala.ts`](src/viz/staticMandala.ts)), title, CTA
- [x] [`data/intentions.ts`](src/data/intentions.ts) — four intentions
- [x] Intention cards rendered in [`screens/intentionPicker.ts`](src/screens/intentionPicker.ts) (no separate `intentionCard.ts`; consolidated)
- [x] Wire: CTA → intentions → session with auto-selected template
- [x] Style: `design/tokens.css`, `design/typography.css`, `design/screens.css`
- [x] Test: [`intentions.test.ts`](src/data/intentions.test.ts), etc.

### Phase 3: Session Card (~2 sessions)
- [x] [`components/ambientBedPicker.ts`](src/components/ambientBedPicker.ts)
- [x] [`components/sessionGuideView.ts`](src/components/sessionGuideView.ts) — tabbed Vedic | Modern (named `sessionGuideView`, not `sessionGuide.ts`)
- [x] [`components/advancedTuning.ts`](src/components/advancedTuning.ts)
- [x] [`screens/sessionCard.ts`](src/screens/sessionCard.ts) + “I'm ready” CTA
- [x] Wire: bed / tuning → engine; play → immersive
- [x] Style: [`design/components.css`](src/design/components.css)
- [x] Test: data + engine tests; session guide tests where present

### Phase 4: Immersive Mode (~3 sessions)
- [ ] Refactor into `viz/layers/*` + `viz/bloom.ts` (optional; not done — monolith retained)
- [x] **Shipping:** [`viz/vedicCosmicFlowerP5.ts`](src/viz/vedicCosmicFlowerP5.ts) — full cosmic flower (p5)
- [x] Floating controls + ephemeris: implemented inline in [`screens/immersive.ts`](src/screens/immersive.ts) (no separate `floatingControls.ts` / `ephemerisOverlay.ts`)
- [x] [`screens/immersive.ts`](src/screens/immersive.ts) — full-viewport canvas, timer, auto-hide controls
- [x] [`lib/fullscreen.ts`](src/lib/fullscreen.ts)
- [x] Wire: play → immersive, stop → session, fullscreen
- [x] Style: [`design/screens.css`](src/design/screens.css) immersive block + [`design/animations.css`](src/design/animations.css)
- [x] Test: e2e immersive canvas; unit tests for ephemeris / viz where applicable
- [x] **Fallback:** if p5 module fails load/init, static mandala ([`staticMandala.ts`](src/viz/staticMandala.ts)) mounts in immersive (see `immersive.ts`)

### Phase 5: Polish + Edge Cases (~2 sessions)
- [x] [`lib/viewTransition.ts`](src/lib/viewTransition.ts) — progressive enhancement where supported
- [x] Offline: [`public/sw.js`](public/sw.js) — caches successful same-origin GETs; registered from [`src/main.ts`](src/main.ts) in production only
- [x] Accessibility: skip link ([`index.html`](index.html) + `.skip-link` in [`design/screens.css`](src/design/screens.css)); `role="alert"` for audio start failures on session card
- [x] Reduced motion: [`lib/motionPreference.ts`](src/lib/motionPreference.ts) + CSS/landing/immersive usage
- [x] Mobile: safe-area + [`design/components.css`](src/design/components.css) touch targets (e.g. 44px icon buttons)
- [x] Error handling: p5 fallback (above); [`startSession()`](src/app.ts) catches `AudioContext` / autoplay failures and surfaces `audioStartError` on session card
- [ ] Performance: Lighthouse / FCP / TTI targets — **manual / periodic** (not automated in repo)

### Phase 6: Testing + CI (~1 session)
- [x] Unit tests: store, intentions, persistence, audio, data, viz helpers
- [x] E2E: [`e2e/smoke.spec.ts`](e2e/smoke.spec.ts) — flow through screens + immersive canvas
- [x] E2E: play → stop returns to session card
- [x] CI: [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — `npm run check` + Playwright
- [x] Gate: `npm run check` passes clean

---

## Part 8 — What We're NOT Doing

To keep scope honest:

| Temptation | Why we skip it |
|------------|----------------|
| **React/Svelte/Vue** | Bundle overhead for 5 screens; vanilla TS is simpler and faster |
| **Backend / accounts** | No user data to persist server-side; localStorage is sufficient |
| **Audio file streaming** | Synthesis is the point; pre-recorded audio changes the product |
| **Sidereal astrology** | Tropical zodiac is correct for the astronomical data shown |
| **Guided voice narration** | Adds licensing complexity and cultural sensitivity risk |
| **Social features** | This is a solo contemplative tool |
| **PWA install prompt** | Let the browser offer it naturally; don't nag |
| **Analytics** | Not in v1; add later if distribution warrants it |

---

## Summary

The rebuild transforms Sravanam from a **binaural synth control panel** into a **contemplative listening experience**. The audio engine, data layer, and ephemeris module carry forward unchanged. The immersive mandala ships as a single p5 module (`vedicCosmicFlowerP5.ts`); deeper `viz/layers/*` modularization is optional and not required for v1. Everything new is in the presentation layer: intention-first UX, session cards, immersive mode, and a design language that feels like a temple at dusk.

Total effort: ~12 focused sessions across 6 phases.
