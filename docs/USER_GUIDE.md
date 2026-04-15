# Sravanam — User guide

## What this app is for

Sravanam helps you **listen** to binaural beats (two slightly different tones in left and right ear) while optional ambient beds (Oṃ, nāda-like texture, cosmic noise) add atmosphere. A **session guide** explains each preset in both Vedic and modern language.

**This is not medical treatment, therapy, or clinical neurofeedback.** Preset labels (delta, theta, alpha, beta) are informal listening aids. If you have sound sensitivity, epilepsy, or health concerns, consult a professional before use.

## Before you listen

1. **Use stereo headphones** — binaural beats require isolated left/right channels; speakers do not work the same way.  
2. **Keep volume low** — start quiet; increase only if comfortable.  
3. **Use in a safe, stationary setting** — not while driving or operating machinery.  
4. **Personal listening** — the experience is tuned for one listener with headphones.

## Flow through the app

### 1. Landing

You see a static mandala, the title, and **Begin a session**. Optional: use **Skip to content** (keyboard) to jump past chrome.

### 2. Intentions (“What draws you here?”)

Pick one of four **intentions** — Rest, Calm, Focus, or Deep. Each maps to a default binaural template and ambient bed. Your choice sets frequencies for the session.

### 3. Session card

- **Title line** — intention, brainwave band, and frequency range.  
- **Ambient bed** — choose None, Oṃ, Ākāśa (cosmic), or Nāda (where available).  
- **Session guide** — tabs for **Vedic** and **Modern** copy about the current template.  
- **I’m ready** — starts audio and moves you to immersive mode.  
- **Advanced tuning** (optional) — carrier, beat, waveform, volume.  
- **Choose a different template** — alternates allowed for your intention, if any.

If audio cannot start (browser autoplay rules), an **error message** may appear after **I’m ready**; try tapping the button again after interacting with the page.

### 4. Immersive mode

- Full-screen **mandala** visualization.  
- **Stop** — ends playback and returns to the session card.  
- **Volume** slider.  
- **Ephemeris** — optional panel with simplified tropical planetary positions (tap canvas or use the control to show/hide).  
- **Fullscreen** / **Exit fullscreen** — standard browser fullscreen API.  
- Controls **auto-hide** after a few seconds; move the pointer over the canvas to show them again.  
- A line at the bottom shows intention, Hz label, elapsed time, and optional live channel frequencies.

## URLs (optional)

The app can sync the screen to the address hash:

- `#/landing`
- `#/intentions`
- `#/session`
- `#/immersive` — only if audio is already playing; otherwise you are sent to the session card.

## Offline and updates

In production builds, a **service worker** may cache assets so a return visit loads faster. It does not replace a network connection for the first install. There is **no** custom “Add to home screen” prompt.

## Privacy

No analytics or accounts are built into this app as shipped; preferences stay on your device (`localStorage`). Third-party fonts may load from Google Fonts when online (see `index.html`).
