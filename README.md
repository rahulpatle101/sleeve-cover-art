# Day 003 — SLEEVE

**Status:** v0.2 instrument, working build (not publicly deployed) · client-side only · React 19 + TypeScript + Vite

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run verify     # pure checks: recipe bounds, Remix, geometry, composition, contrast, filenames
node scripts/browser/instrument-check.mjs http://localhost:5173/ production/instrument-v02   # browser checks (needs Chrome)
```

## What's in v0.2

- **Two engines:** Harmonic (Lissajous) and Radial (rose), from one serialisable, deterministic recipe. New Proof makes a seeded remix.
- **Six press sets** in three families:
  - **Ink:** Newsprint, Carbon;
  - **Light:** Spectrum, Horizon;
  - **Matter:** Full Sheet, Macro Relief.
  
  Each has its own renderer, typography and Passes meaning. There is no metadata on the covers, and seed-driven framing aims crops at real curve features.
- **Instrument:** a printed-circuit editorial sheet on a 48 px baseline grid. The tactile dials, rocker and push buttons come from [Analog UI](https://github.com/TechSquidTV/Analog-UI) (MIT, vendored in `src/vendor/analog-ui`, restrained and recoloured in `src/styles/sleeve.css`).
- **Accessibility:** every continuous control is a native `input[type=range]` (Arrow, Shift/Page, Home/End; SLEEVE's relative drag). Engine and Press Set are native radios. Every target is at least 44 px, reduced motion is honoured, and status is announced in a polite live region. Sound is off by default and starts only after a user gesture.
- **Print Sleeve:** re-renders the exact recipe at **3000 × 3000** and downloads a PNG.

## Licences

- Code: see the repository licence.
- **Analog UI:** MIT, © 2026 TechSquidTV (`src/vendor/analog-ui/LICENSE`, `NOTICE.md`).
- **Cover fonts:** SIL Open Font License, with each licence in `public/licenses/`. The fonts are Big Shoulders Display, Space Mono, Schibsted Grotesk, Funnel Display, Bricolage Grotesque and Martian Mono.

## Not included in this repository

- **The raw SkillUI design extraction** (`research/extracted/`). It contains a third-party brand's proprietary webfonts and captures. It is kept untouched locally as evidence; only the analysis (`research/*.md`) is published.
- **The user's curated reference images** (`references/`).
- **Evidence screenshots, contact sheets, exports and builds** (`production/**/*.png`, `screens/`, `release/`, `studies/`). The written records in `production/*.md` are included.

## Known limitations

- Safari and Firefox are not yet verified.
- The older browser scripts (`drive.mjs`, `v02-panel.mjs`, …) target the previous panel. `instrument-check.mjs` is the current suite.
- `library.html` (dev only) still documents the previous panel components.

---

## Original brief


SLEEVE is a constrained, client-side visual instrument for composing an album cover by playing with deterministic mathematics.

> **Play your next album cover.**

## Locked outcome

In one screen, a person can:

1. enter artist and track text;
2. choose **Harmonic** or **Radial** mode;
3. tune the artwork with accessible rotary controls;
4. optionally enable an original synthesized audio response; and
5. export a sharp **3000 × 3000 PNG**.

The build target is React + TypeScript + Vite, entirely in the browser. There is no backend, account, prompt box, image-generation service, or template editor.

## Four-hour contract

| Phase | Time | Gate |
|---|---:|---|
| Research | 30 min | Evidence saved; extraction kept untouched |
| Build | 60 min | Complete vertical slice works |
| Handcrafted delight | 120 min | Six craft passes completed |
| Critique and ship | 30 min | Acceptance checks pass and release is recorded |
| **Total** | **240 min** | No phase borrows from the craft block |

If the build overruns, cut scope. Do not consume the 120-minute craft block.

## Start here

1. Read [CLAUDE.md](CLAUDE.md), [PRODUCT.md](PRODUCT.md), [SPRINT.md](SPRINT.md), and [RESEARCH.md](RESEARCH.md).
2. Perform [the SkillUI extraction workflow](research/SKILLUI_EXTRACTION.md).
3. Keep the raw result at `research/extracted/DESIGN.md` unchanged.
4. Complete `research/DESIGN_DNA_TRANSFER.md`; do not silently copy a reference.
5. Pass Gate R in `SPRINT.md` before creating app code.

## Evidence labels

- **VERIFIED — EXTRACTION:** directly present in the preserved SkillUI output or captured reference evidence.
- **PROPOSED — DIRECTION:** a creative decision for SLEEVE; not a claim about the reference.
- **OBSERVED — BUILD:** seen in the running implementation.
- **TESTED — PASS/FAIL:** backed by a recorded check.

Until SkillUI has run, all art-direction documents in this kit are proposals.

## Documentation map

- `CLAUDE.md` — operating contract and gates
- `MISSION.md` — challenge and learning goals
- `PRODUCT.md` — audience, loop, scope, and acceptance criteria
- `ARCHITECTURE.md` — state, rendering, accessibility, audio, and export
- `RESEARCH.md` — 30-minute research plan and evidence rules
- `SPRINT.md` — exact four-hour schedule and phase gates
- `art-direction/` — visual, interaction, motion, sensory, emotional, and editorial craft
- `research/` — extraction, mathematics, and design-DNA transfer
- `production/` — build log, critique, quality, and shipping records

`src/` holds the React + TypeScript + Vite app (`npm install`, `npm run dev`, `npm run build`). `scripts/verify.ts` runs the pure checks (`npm run verify`), and `scripts/browser/` holds the headless-Chrome checks used in `production/BUILD_LOG.md`. `public/` is intentionally empty: no fonts, images or reference assets ship with the app.

