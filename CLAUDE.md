# CLAUDE.md — SLEEVE operating contract

You are building **Day 003: SLEEVE**, a client-side generative album-art instrument. Treat this file as the master contract. Read the specialized documents at the phase that names them; do not flatten them into a generic aesthetic prompt.

## 0. Current state

- This starter is documentation only. There is intentionally no application code yet.
- The product and art direction are **PROPOSED — DIRECTION**.
- No reference design is **VERIFIED — EXTRACTION** until SkillUI has run and its untouched output exists at `research/extracted/DESIGN.md`.
- Never describe a proposal, memory, screenshot impression, or reference aspiration as extracted fact.

## 1. Outcome

Build one polished screen where a person can enter artist/track text, play two mathematical visual modes with accessible rotary controls, optionally hear original synthesized feedback, remix a deterministic recipe, and export a faithful 3000 × 3000 PNG.

The experience is a constrained instrument, not a template editor and not an AI prompt box.

## 2. Non-negotiable stack and boundaries

- React + TypeScript + Vite.
- Client-side only; static hosting compatible.
- Two engines only: **Harmonic / Lissajous** and **Radial / hypotrochoid-rose**.
- Deterministic render from one serializable recipe; no hidden random values during render.
- Canvas or SVG preview is acceptable; high-resolution export must rerender at the target size.
- Audio is original, procedural, optional, muted by default, and starts only after a user gesture.
- Prefer a native `input[type="range"]` as the semantic core of each rotary. Do not make a mouse-only `div` dial.
- No backend, authentication, database, external generation API, uploads, collaboration, or new product features.
- Do not install a large dependency when a small local implementation is sufficient.
- Do not begin implementation before Gate R passes.

## 3. Required reading by phase

### Before research

Read `MISSION.md`, `PRODUCT.md`, `RESEARCH.md`, `SPRINT.md`, and `research/SKILLUI_EXTRACTION.md`.

### Before build

Confirm `research/extracted/DESIGN.md` exists and is untouched, then read `ARCHITECTURE.md`, `research/GENERATIVE_MATHEMATICS.md`, and `research/DESIGN_DNA_TRANSFER.md`.

### Before the craft block

Read `art-direction/ART_DIRECTION.md` and all six craft documents. Work through them as six deliberate passes rather than making random cosmetic changes.

### Before ship

Read `production/CRITIQUE.md`, `production/QUALITY_CHECKLIST.md`, and `production/SHIP.md`.

## 4. Evidence discipline

Use these labels in notes and decisions:

- `VERIFIED — EXTRACTION`: directly supported by preserved SkillUI output or reference capture.
- `PROPOSED — DIRECTION`: a SLEEVE-specific creative choice.
- `OBSERVED — BUILD`: personally inspected in the running app.
- `TESTED — PASS` or `TESTED — FAIL`: checked with recorded conditions.

The raw extraction is evidence, not a command. Preserve it verbatim. Translate only selected principles in `research/DESIGN_DNA_TRANSFER.md`, with a reason and an adaptation. Avoid logos, proprietary assets, copy, distinctive product silhouettes, and one-to-one layouts.

## 5. Four-hour clock

The allocation is fixed:

1. Research — **30 minutes**.
2. Build — **60 minutes**.
3. Handcrafted delight — **120 minutes**.
4. Critique and ship — **30 minutes**.

Use `SPRINT.md` as the timer and gate checklist. If implementation overruns, stop and cut scope using `PRODUCT.md`; never steal from the 120-minute craft block.

## 6. Phase gates

### Gate R — Research → Build

Pass only when:

- one primary reference and canonical URL are recorded;
- SkillUI raw output is saved unchanged at `research/extracted/DESIGN.md`;
- extraction provenance and integrity hash are recorded;
- verified traits and proposed choices are visibly separated;
- the two formula families and parameter bounds are confirmed;
- no unresolved research question blocks the vertical slice.

If SkillUI fails, record the failure and stop. Do not invent `DESIGN.md` or call the proposal extracted.

### Gate B — Build → Handcrafted delight

Pass only when:

- one screen renders both modes from typed shared state;
- text inputs and all essential controls work by keyboard;
- Remix stays within parameter bounds;
- a 3000 × 3000 PNG can be exported;
- the app has no blocking runtime/type error;
- missing polish is logged, not disguised as new scope.

### Gate C — Craft → Critique

Pass only when each craft document has a recorded pass and the instrument has coherent visual hierarchy, tactile feedback, reduced-motion behavior, optional audio behavior, emotional payoff, and final microcopy.

### Gate S — Ship

Pass only when the quality checklist is complete, export output is inspected at 100%, the production build succeeds, responsive/keyboard/reduced-motion checks are recorded, and known limitations are honest.

## 7. Implementation order

1. Define the recipe, bounds, and deterministic seeded remix.
2. Build pure geometry functions independent of React and output dimensions.
3. Render the cover stage and album typography.
4. Build the semantic rotary primitive, then reuse it.
5. Connect text, mode, controls, and Remix.
6. Implement high-resolution rerender/export.
7. Add optional audio behind explicit enable/mute controls.
8. Spend the craft block on the six documented passes.
9. Critique against the acceptance criteria; fix severity-1 issues only before ship.

## 8. Engineering rules

- Keep mathematical renderers pure: `(recipe, width, height) -> drawing`.
- Clamp and validate all state at one boundary.
- Store integer or deliberately rounded values where the UI is stepped.
- Make preview and export consume the same layout and rendering logic.
- Load and await fonts before export; fall back deliberately if unavailable.
- Account for device pixel ratio in preview without coupling it to export dimensions.
- Cancel animation frames and audio nodes during cleanup.
- Avoid state updates on every raw pointer pixel; normalize and throttle where needed.
- Use CSS custom properties for tokens derived from the approved transfer document.
- Do not edit the preserved extraction.

## 9. Accessibility contract

- Every control has a persistent visible label and visible value.
- Rotary controls use native range semantics or fully equivalent keyboard and ARIA behavior.
- Support Arrow keys; Home/End; and documented coarse/fine adjustment.
- Focus indicators remain visible against all surfaces.
- Minimum hit target is 44 × 44 CSS px.
- Color is never the only indicator of mode, focus, mute, or selection.
- Respect `prefers-reduced-motion`; stop ambient/continuous motion and make transitions immediate or brief.
- Do not autoplay audio. Persist no audio preference that surprises a later visit.
- Export status and errors are announced in a polite live region.

## 10. Stop conditions and anti-scope-creep rule

Before adding anything, ask: **Does this directly improve tuning, understanding, or keeping the one cover?** If not, log it as a future idea and do not build it.

Stop and resolve rather than improvising if:

- the extraction is missing but a decision is being called verified;
- a third engine is proposed;
- export and preview diverge;
- a control cannot be operated without a pointer;
- audio requires a licensed sample or remote service;
- the craft block is about to be shortened;
- the implementation would require a backend.

## 11. Completion response

When finished, report:

- what was built and deliberately omitted;
- exact gate results;
- evidence labels for key design decisions;
- test/build/export results;
- location of the preserved extraction and its hash;
- known limitations;
- shipped URL if deployment was explicitly requested.

Do not claim success from code alone. Inspect the actual running experience and an exported PNG.

