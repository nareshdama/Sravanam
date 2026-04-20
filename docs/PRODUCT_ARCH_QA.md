# Product Design And Architectural QA

This document defines the recurring QA rubric for **Sravanam** major product changes and release candidates.

Use this rubric when we need to review both:

- the **product experience quality**
- the **architectural integrity** of the implementation

This is not a one-time audit. It is a repeatable review process for major changes.

For day-to-day testing and bug-finding, see [../TESTING.md](../TESTING.md). For release-candidate certification and signoff, see [RELEASE_QA.md](RELEASE_QA.md).

## Purpose

Sravanam should be reviewed as one integrated experience, not as separate design and engineering tracks.

The recurring QA rubric is built around the app's real seams:

- the 4-screen journey: `landing → intentions → session → immersive`
- the split state model: `appStore` vs `sessionStore`
- the runtime boundary between the vanilla app shell and the isolated React global visualization layer
- the immersive, audio, fullscreen, reduced-motion, and PWA lifecycle

## When To Run The Full Rubric

Run the full rubric when a change touches any of these areas:

- screen flow or content hierarchy
- onboarding, intention choice, or session setup UX
- state ownership or route behavior
- audio lifecycle or autoplay recovery
- immersive mode, fullscreen, ephemeris, or stop/return behavior
- design tokens, visual hierarchy, motion, or component patterns
- PWA shell or runtime side effects

Use a lighter PR-gate review only when the change is narrowly scoped and non-structural, such as:

- isolated copy polish
- small visual refinements inside an existing pattern
- non-architectural component cleanup with no user-flow impact

## Review Tracks

Every full-rubric pass runs two tracks together.

### Product Design QA

Review for:

- clarity of purpose on each screen
- emotional arc and sense of journey
- screen hierarchy and CTA quality
- interaction friction and cognitive load
- mobile feel, not just desktop correctness
- accessibility and trust-building language
- immersive quality and sense of transition into playback

### Architectural QA

Review for:

- correct state ownership
- clean screen lifecycle symmetry
- routing correctness and protected immersive entry
- audio lifecycle correctness and teardown safety
- lazy-load boundaries and boot-cost discipline
- component cohesion and separation of responsibilities
- design-token compliance
- PWA and runtime side effects

## Review Checkpoints

### 1. Journey Flow

Review the main user-critical path:

1. `landing`
2. `intentions`
3. `session`
4. `I'm ready`
5. `immersive`
6. `Stop`

Check:

- each screen has a clear job
- the next action is obvious
- the flow remains intention-first rather than control-panel-first
- transitions feel coherent rather than abrupt or mechanical
- safety language supports trust without overwhelming the flow

### 2. Interaction Model

Review these interaction seams together:

- advanced tuning disclosure
- alternate template selection
- fullscreen toggle
- ephemeris toggle
- reduced-motion behavior
- autoplay failure and recovery
- return path after `Stop`

Check:

- defaults serve first-time users well
- advanced controls remain opt-in
- interaction states are understandable on mobile and desktop
- recovery paths are humane and unambiguous

### 3. Architecture Boundaries

Review these boundaries directly:

- `src/main.ts` boot and screen rendering flow
- `src/app.ts` orchestration responsibilities
- screen `render*()` / `destroy*()` ownership
- `appStore` vs `sessionStore` responsibilities
- centralized session-to-engine sync
- React isolation to the landing/global visualization layer
- lazy-loaded immersive p5 module
- route normalization protecting invalid `immersive` entry

Check:

- screen-specific UI logic does not drift into global orchestration
- state remains in the correct store
- no architectural leakage crosses the React / vanilla / immersive boundaries
- changes do not increase boot complexity without clear justification

### 4. Design System Integrity

Review the active design system in `src/design/`.

Check:

- new UI uses tokens and established patterns
- type hierarchy remains coherent
- spacing and grouping support the product flow
- color semantics and focus states remain consistent
- motion timing remains intentional and accessible
- no drift toward legacy `src/style.css` or ad hoc one-off styling

## Review Sequence

### 1. Change Intake

- Identify impacted areas: flow, content hierarchy, interaction model, state, routing, audio, immersive, design system, PWA
- Choose review depth:
  - full rubric
  - lightweight PR gate

### 2. Product Design QA

Review each impacted screen for:

- purpose clarity
- hierarchy and CTA quality
- cognitive load
- continuity with the next screen
- emotional fit with the guided-listening product

### 3. Architectural QA

Confirm:

- every screen still has clean render/destroy ownership
- `appStore` remains for UI mode and preferences
- `sessionStore` remains for listening state
- `app.ts` stays orchestration-focused
- the React landing/global viz boundary remains isolated
- immersive visualization remains lazy-loaded
- session changes still flow through centralized session-to-engine sync
- routing and normalization still protect `immersive` from invalid entry states

### 4. Design System QA

Verify:

- new UI uses `src/design/` tokens and patterns
- spacing, typography, color, focus, and motion remain coherent
- any deviation is intentional and documented

### 5. Decision And Signoff

- Classify findings as **blocker** or **follow-up**
- Require both product-design signoff and architecture signoff for full-rubric reviews
- Record the completed scorecard and attach evidence

## Review Scenarios

Run the rubric against these scenarios as relevant:

- first-time user choosing an intention
- returning user starting a session quickly
- cautious user hitting autoplay failure
- power user opening advanced tuning
- mobile user entering immersive mode
- route normalization into each screen
- start/stop playback symmetry
- tuning or template changes while not playing and while playing
- fullscreen, ephemeris, reduced-motion, and PWA shell interactions

## Acceptance Criteria

A full QA pass is acceptable only when:

- there is no blocker-level product friction in the main journey
- there are no boundary violations in state, screen lifecycle, or audio architecture
- there is no unexplained design-system drift
- every finding has an owner, evidence, and disposition

## Standard Output

Use the reusable scorecard template in [PRODUCT_ARCH_QA_TEMPLATE.md](PRODUCT_ARCH_QA_TEMPLATE.md).

Every completed QA pass should include:

- pass/fail or red/yellow/green by category
- blockers vs follow-ups
- screenshots or evidence links where needed
- code references when architecture findings are involved
- explicit owner and next action for each finding
