# Sravanam — User Guide

## What This App Is For

Sravanam helps you listen to binaural beats — two slightly different tones sent to the left and right ear — with optional ambient beds and an immersive visual layer.

It is a personal listening tool, not medical treatment, therapy, or clinical neurofeedback.

Preset labels like delta, theta, alpha, beta, and gamma are informal listening aids, not clinical claims.

## Before You Listen

1. Use stereo headphones
2. Keep the volume low
3. Use the app only in a safe, stationary setting
4. Stop if the sound feels unpleasant, dizzying, or overstimulating

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

- carrier frequency
- beat frequency
- waveform
- volume
- Saptaswar note snapping for the carrier

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
