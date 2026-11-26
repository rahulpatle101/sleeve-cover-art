# Design DNA transfer ledger

**Status:** COMPLETE for Gate R · 2026-11-25 17:23 IST · awaiting operator approval

Primary source URL: `https://teenage.engineering/products/op-1` (OP-1 field product page)

Raw evidence: `extracted/DESIGN.md`. SHA-256 `ec140e44a42edf512419cd4b3e13e78a910433ece2b11235aa23800ac86e966b`, byte-identical to `extracted/run-20261125T171534+0530/teenage-design/DESIGN.md`. Provenance, contradictions and gaps: `extracted/PROVENANCE.md`.

## How to use

Every row cites a specific heading, token, component or capture in the preserved evidence. `VERIFIED` applies only to the source trait. The adaptation is always **PROPOSED — DIRECTION** until it appears in the running build.

Locators: `D§n` = `extracted/DESIGN.md` section n. `CSS` / `HTML` = `extracted/live-check-20261125T171852+0530/all.css` / `page.html` (supplementary reference capture). `PNG` = `extracted/run-…/teenage-design/screenshots/homepage.png`.

**Evidence limits (read first).** The default-mode extraction captured CSS tokens and one desktop first-viewport screenshot. It captured **no UI control components** (D§4 lists only Footer, Navigation, Button, Image, Icon, unstyled). Its role labels and its "dark theme" claim are **contradicted** by the page (PROVENANCE §Contradicted). The rows below therefore rely only on raw token values, CSS rules and what is visible in the PNG. They never rely on `DESIGN.md`'s role labels or boilerplate (D§3 rules, D§5 "Spacing as Meaning", D§7 guidelines, D§8 Do's/Don'ts, D§10).

## Verified source traits → SLEEVE adaptations

| # | Source trait (VERIFIED — EXTRACTION) | Evidence location | Confidence | SLEEVE adaptation (PROPOSED — DIRECTION) | Why it serves the product | Acceptance check |
|---|---|---|---|---|---|---|
| 1 | Light neutral page; near-black ink; no dark theme | PNG (light grey field, black headline); HTML `--theme-body-bc: rgba(240,240,239,1)`; CSS `--te-black:#0f0e12`, `--te-white:#f5f5f5` | High | Quiet light-neutral instrument shell, so the **cover is the darkest/most saturated object** on screen. SLEEVE's own values below, not the source's. | ART_DIRECTION principle 1: "the artwork leads" | Squint test: cover reads first; shell ≠ source hex values |
| 2 | Graduated grey ramp carries most hierarchy; colour is scarce | CSS `--te-grey-100…1000` (9 steps); D§2 palette is mostly greys | High | 4-step neutral ramp for surface, line, secondary text and primary text. Hierarchy through value, not hue. | Keeps colour free to mean mode/state | Every text/grey pair ≥ 4.5:1 (body) or ≥ 3:1 (large/UI) — TESTED in build |
| 3 | Small set of saturated functional hues (blue, green, orange, red, yellow) | CSS `--te-blue:#0071bb`, `--te-green`, `--te-orange:#f05a24`, `--te-red:#b81d13`, `--te-yellow`; PNG red record dot, orange "DELAY", blue "FREQ" on the device screen | High | **Two** functional accents only: one for Harmonic, one for Radial, plus a focus colour. Always paired with a text label. Hues chosen for SLEEVE, not copied. | Mode legibility; respects "colour never the only indicator" | Mode readable in greyscale screenshot |
| 4 | Parameter **value shown large, label small and adjacent, label tinted by function** | PNG device screen: large "12" beside small "DELAY" (orange); "FREQ" (blue) beside a dial gauge | Medium (raster product photo, not UI) | Each rotary: compact uppercase label + large tabular-numeral value directly beside the dial. The value is the loudest element of the control. | Answers research Q3 (label/value grouping); trust through visible values | Value legible at 360 px; tabular numerals; no hover needed |
| 5 | Square/zero corner radius on fields, tiles and quantity steppers | D§2 vars `--field-border-radius: 0`, `--tile-border-radius: 0`, `--quantity-border-radius: 0` | High | Rectilinear panels and inputs (radius 0–2 px). Circles reserved for the dials, so roundness signals "turnable". | Research Q2: affordance by contrast of form | Only rotaries are circular |
| 6 | Black primary button that turns blue on state; grey when disabled | D§2 `--button-background: var(--te-black)` → `var(--te-blue)`; `--button-background-disabled: var(--te-grey-300)` | High | **Export PNG** = solid ink button (primary). Remix = secondary outline. The active state changes fill *and* label/text, not hue alone. | Q1: primary vs secondary action unmistakable | One solid-fill button on screen |
| 7 | Inset 2 px ring as a selection/state cue | D§6 `0 0 0 2px inset var(--te-blue)` | High (token); usage context unknown | Selected engine segment gets an inset 2 px ring **plus** filled indicator and `aria-pressed`/radio state | Clear selection without layout shift | Selected state visible without colour (shape + text) |
| 8 | Light/thin type weight as the base voice | CSS `html{…font-weight:var(--fw-light)}`, `--fw-light:300`, `--fw-thin:100`; PNG headline/nav light | High | Light-weight grotesk for large display (cover title, wordmark) only. **Labels/values/inputs at ≥ 400–500** for legibility. Licensed/system font, not the source's. | Precision voice without sacrificing readability | Body text ≥ 16 px inputs, ≥ 400 weight |
| 9 | Navigation = icon + lowercase word + 2–3 small sublines, in a strict row | PNG header ("products / instruments, audio, designs") | Medium (visual only) | Group = **title line + small subordinate lines**, used for the identity block (ARTIST / TRACK) and status text. No icon drawings copied. | Calm, scannable grouping | Layout differs from source header |
| 10 | Type and spacing scale fluidly with viewport width | D§2 `calc(.00306122*var(--client-width))` family; CSS `--fs-10…40`, `--space-sm…xl` as `calc(… * var(--client-width))` | High | Fluid `clamp()` scale for the stage and display type, with **fixed minimums** for controls (44 px targets, 16 px inputs). | One composition from 360 px to desktop | No target < 44 px at 360 px |
| 11 | Breakpoints at 480 / 768 / 1200 px; layout switches at 768 | CSS `@media (width>=768px)` ×32, `(width<=767px)`, `(width>=480px)`, `(width>=1200px)` | High | Stage-over-controls below 768 px; side-by-side at ≥ 768 px; widen the stage at ≥ 1200 px | Responsive baseline required by PRODUCT | No horizontal scroll at 360 px |
| 12 | Continuous marquee motion paused under reduced motion | CSS `@media (prefers-reduced-motion:reduce){._mrq-track…{animation-play-state:paused!important}}`; D§7 `@keyframes _mrq-scroll_1k63w_1` | High | Any ambient motion stops under `prefers-reduced-motion`; tuning still updates instantly | Contract §9 | TESTED in build with emulated reduced motion |
| 13 | No blur / backdrop-blur; flat surfaces | D§8 anti-patterns; PNG flat page | Medium (absence check) | No glassmorphism; depth through thin rules and one restrained shadow | ART_DIRECTION "avoid glassmorphism" | No `backdrop-filter` in CSS |

## Proposed hypotheses: outcome

| Hypothesis (from template) | Outcome |
|---|---|
| Strong primary/secondary control hierarchy | **Partly supported:** rows 6, 4. No UI controls were extracted. |
| Compact uppercase technical labels + legible values | **Supported only via product photo (row 4, medium).** Web UI labels are lowercase light (row 9). |
| Restrained neutral chassis, sparse functional accents | **Supported** (rows 1–3) |
| Generous spacing / physical affordance around controls | **Unknown.** Spacing tokens exist (D§5) but affordance around controls was not captured. Stays PROPOSED. |
| Precise alignment, quiet borders over cards | **Partly supported** (rows 5, 13). Cards were not observed. |

## Rejected traits

| Verified source trait | Evidence | Reject/adapt | Reason |
|---|---|---|---|
| Proprietary webfonts (te-20/te-40 "UniversTE", TechnoType, riddim, swingus, franxurter) | D§3 `@font-face`; `run…/fonts/*.woff2` | **Reject** | Licensed brand assets. Never bundle or reference them. Use a licensed/system grotesk. |
| Exact brand hexes (`#0071bb`, `#f05a24`, `#0f0e12`, `#f5f5f5`, …) | CSS `--te-*` | **Adapt** | Using them 1:1 reads as brand mimicry. SLEEVE uses its own values in the same roles. |
| `outline: none` on focused inputs; focus shown only by border colour change | CSS `input:focus{outline:none}` / `{border-color:var(--te-grey-400)}` | **Reject** | Weak focus indication fails contract §9. SLEEVE uses a visible 2–3 px focus ring on all surfaces. |
| Very small body/caption sizes (D§3 table: 10 px / 9 px) | D§3 | **Reject** | Illegible. Minimum 12 px labels, 16 px inputs. |
| Device silhouette, keycap grid, speaker grille, product photography | PNG | **Reject** | Distinctive product silhouette; also implies hardware behaviour SLEEVE lacks. |
| Logo, wordmark, line-icon set, Japanese mission text, "the beauty of evolution." | PNG | **Reject** | Brand identifiers and copy |
| Header layout (wordmark + four icon-led nav groups) | PNG | **Reject as layout**; principle kept in row 9 | One-to-one layout is excluded |
| `DESIGN.md` "dark theme / `#000000` background" and its role table | D header, D§2 | **Reject as evidence** | Contradicted by page (PROVENANCE) |
| `DESIGN.md` boilerplate rules (D§3 rules, D§5 meaning table, D§7 durations, D§8, D§10) | D§3, D§5, D§7, D§8, D§10 | **Not evidence** | Generic tool output, not source-specific |

## Approved token derivation (PROPOSED — DIRECTION; values are SLEEVE's own; contrast to be TESTED in build)

```text
--surface-canvas:  #ECEBE7   /* row 1: light neutral shell, warmer than source */
--surface-panel:   #F7F6F3   /* row 2: one step lighter for the instrument panel */
--text-primary:    #141416   /* row 1: near-black ink */
--text-secondary:  #5A5A60   /* row 2: ≥ 4.5:1 on both surfaces (verify) */
--line-subtle:     #C9C8C3   /* row 13: thin rules instead of cards */
--accent-mode-a:   #2B4FD8   /* row 3: Harmonic — always with label */
--accent-mode-b:   #D9481C   /* row 3: Radial — always with label */
--focus-ring:      #141416 with 2px #F7F6F3 offset  /* rejection of outline:none; works on both surfaces and on art */
--space-control:   max(44px, …)  /* row 10: fluid, floored at target size */
--radius-control:  0 (panels/inputs/buttons), 50% (dials only)  /* row 5 */
--shadow-lift:     0 1px 0 rgba(20,20,22,.08), 0 6px 16px -8px rgba(20,20,22,.25)  /* row 13: single restrained lift for dials */
```

Contrast pre-check (TESTED — PASS for stated use, WCAG formula, 17:21 IST) on canvas/panel:
- `--text-primary`: 15.4 / 17.0
- `--text-secondary`: 5.7 / 6.3
- `--accent-mode-a`: 5.5 / 6.1
- `--accent-mode-b`: 3.6 / 4.0 → **non-text indicators and large text only**; mode labels stay `--text-primary`.
- `--line-subtle`: 1.4 / 1.6 → decorative rules only, never a control boundary or focus.

Breakpoints: 480 / 768 / 1200 (row 11). Type: licensed or system grotesk. Light weight for display only; ≥ 400 for UI (rows 8, rejection).

## Impersonation check

SLEEVE's product, name, copy, palette values, typefaces, layout and controls are original. Only abstract principles transfer: value-first labelling, scarce functional colour, rectilinear surfaces with circular dials, flat depth, reduced-motion pausing. No logo, font, icon, product image, copy or composition from the source is used.

## Sign-off

- [x] Raw extraction exists and hash matches (`shasum -a 256 -c INTEGRITY.sha256`).
- [x] Every verified claim has a locator.
- [x] Proposed choices are labeled.
- [x] Original brand assets/copy/layout are excluded.
- [x] Accessibility overrides are documented (focus ring, minimum sizes, weights, colour + text).
- [ ] Gate R approved by: _operator — pending_
