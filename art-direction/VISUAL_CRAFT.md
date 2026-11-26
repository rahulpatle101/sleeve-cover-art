# Visual craft

**Status:** PROPOSED — DIRECTION

## Intent

Make SLEEVE feel like a precise creative instrument and make every generated frame feel authored enough to become an album cover.

## Composition

- Give the square artwork visual priority; controls support it.
- Use one disciplined grid with optical corrections for circular controls and text baselines.
- Keep a safe typography zone within the cover; geometry may approach it but must not destroy legibility.
- Offer one editorial layout, not a layout system. The title/artist arrangement may respond subtly to mode but must remain stable during tuning.
- Preserve deliberate negative space at both low and high Density.

## Typography

- Proposed direction: neutral grotesk or technical sans for interface; one compatible display treatment for cover text.
- Use licensed, bundled fonts or a deliberate system stack.
- Interface labels may be compact/uppercase, but values and text inputs must remain comfortably readable.
- Define long-title behavior: adaptive size down to a floor, then ellipsis or bounded wrap.
- Use tabular numerals for rapidly changing values.

## Color and materials

- Begin with a quiet neutral shell and a high-contrast artwork surface.
- Use separate functional accents for Harmonic and Radial only if contrast remains sufficient.
- Keep palette count small and curated; palette is an art parameter, not a full color picker.
- Prefer thin rules, surface changes, and restrained shadows over card stacks.
- Add grain/texture only if it is original, subtle, deterministic, and survives export cleanly.

Exact tokens must be derived after extraction in `research/DESIGN_DNA_TRANSFER.md`. Do not hard-code remembered reference colors and label them extracted.

## Rotary anatomy

Each rotary visually includes:

- persistent parameter label;
- dial with clear position indicator;
- visible current value and units where relevant;
- focus state independent of color alone;
- a hit target larger than the visible knob;
- consistent start/end angle if a circular track is used.

## Responsive behavior

- Desktop: artwork and controls can sit side by side.
- Mobile: artwork remains first; controls form a two-column or single-column grid without shrinking targets.
- Avoid horizontal scrolling at 360 CSS px.
- Keep Export reachable after tuning; sticky behavior is optional and must not obscure controls.

## Pass checklist (25 minutes)

- [ ] Squint test: artwork, identity fields, primary actions, then controls.
- [ ] Interface and cover typography have distinct roles.
- [ ] Low/high parameter extremes still look intentionally composed.
- [ ] Artist/track are legible across every palette.
- [ ] Labels and values align optically.
- [ ] Focus and selected states meet contrast needs.
- [ ] Mobile does not become a miniature desktop.
- [ ] No visual trait is falsely labeled extracted.

