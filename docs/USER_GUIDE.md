# Sravanam — User Guide

## What This App Is For

Sravanam helps you listen to brainwave-entrainment audio — two close tones, an acoustic beat between them, or a single tone pulsed at a chosen rate — with optional ambient beds and an immersive visual layer.

It is a personal listening tool, not medical treatment, therapy, or clinical neurofeedback.

Preset labels like delta, theta, alpha, beta, and gamma are EEG-band shorthand, not clinical claims.

## Before You Listen

1. Use stereo headphones for **binaural** mode. **Monaural** and **isochronic** modes work over speakers.
2. Keep the volume low
3. Use the app only in a safe, stationary setting
4. Stop if the sound feels unpleasant, dizzying, or overstimulating

## Beat Delivery Methods

The app offers three ways to deliver the beat. You can switch between them in **Advanced tuning → Beat method**.

| Method | How it works | Headphones | Notes |
|--------|--------------|------------|-------|
| **Binaural** | Left ear gets the carrier, right ear gets carrier + beat. Your brain integrates the two. | Required | Smoothest experience; weakest measurable EEG entrainment of the three. Fusion is best when the carrier is 250–500 Hz and the beat is below 30 Hz — the app shows a live confidence badge. |
| **Monaural** | Both tones are mixed and sent to both ears, producing a real acoustic beat in the air. | Optional | Stronger entrainment than binaural in published meta-analyses. |
| **Isochronic** | A single carrier is rapidly turned on and off (sine envelope) at the beat rate. | Optional | Pulsed; the most reliable entrainment driver in the literature. Can sound buzzy at high beat rates. |

## Evidence Tiers

Every preset is tagged with one of three tiers, shown as a small badge next to the title:

- 🟢 **Validated** — peer-reviewed RCT or replicated EEG-entrainment support for this band and use case (e.g. 40 Hz gamma per Iaccarino 2016; 10 Hz alpha per Vernon 2005; 1.5–4 Hz delta sleep per Ngo 2013).
- 🟡 **Experimental** — plausible based on EEG bands, but not robustly replicated. Treat as personal exploration.
- 🟣 **Traditional** — derived from Vedic śāstra, Saptaswar tuning, Schumann/Cousto math, or planetary correspondence. Cultural framing — not a clinical claim.

Hover or focus a badge for the full rationale. The session card also has an **About the evidence tiers** disclosure with a complete legend.

## App Flow

### 1. Landing

You’ll see the title, background visualization, and a `Begin a session` button.

### 2. Intentions

Choose one of the 9 life-mode intentions, such as:

- Deep Sleep
- Relax
- Focus
- Ultra Focus
- Knowledge
- Healing
- Wealth
- Love
- Spiritual

Each intention applies a default template and ambient bed.

### 3. Session Card

The session card includes:

- current intention / template summary
- ambient bed picker
- tabbed session guide
- optional Vedic metadata panel
- `I'm ready` button
- alternate templates
- advanced tuning
- daily protocol reference

If audio cannot start because of browser autoplay rules, the app will show an error after you press `I'm ready`. Press the button again after interacting with the page.

### 4. Immersive Mode

Immersive mode includes:

- full-screen mandala visualization
- stop button
- volume slider
- ephemeris toggle
- fullscreen toggle
- elapsed session timer
- live left/right/delta frequency readout

Controls auto-hide after a few seconds and reappear when you move the pointer or touch the canvas.

## Advanced Tuning

Advanced tuning lets you adjust:

- **beat method** — binaural / monaural / isochronic (see table above)
- **carrier frequency**
- **beat frequency** (the perceived difference)
- **waveform** — sine, triangle, sawtooth, square. Loudness is matched across waveforms so changing timbre does not change perceived volume.
- **volume**
- **Saptaswar note snapping** for the carrier (Sa = 432 Hz Gandharva grid)

A **fusion confidence** indicator updates live: green when binaural fusion is reliable (carrier 250–500 Hz, beat ≤ 30 Hz), amber for marginal cases, red when fusion is unlikely. Monaural and isochronic always read green because they don't rely on cortical fusion.

The app clamps frequencies to safe Web Audio limits for the current device sample rate.

## URLs

The app syncs screen state to the URL hash:

- `#/landing`
- `#/intentions`
- `#/session`
- `#/immersive`

If playback is not active, direct navigation to `#/immersive` is redirected back to the session screen.

## Offline And Privacy

- A service worker may cache assets in production for faster return visits.
- Preferences are stored locally on your device with `localStorage`.
- The current app shell does not load Google Fonts anymore.
- No accounts or analytics are built into the shipped app.
