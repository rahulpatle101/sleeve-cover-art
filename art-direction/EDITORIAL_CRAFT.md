# Editorial craft

**Status:** PROPOSED — DIRECTION

## Voice

Concise, assured, precise, and lightly evocative. Use the language of instruments and publishing without cosplay or jargon overload.

## Naming system

- Product: **SLEEVE**
- Descriptor: **Visual synthesizer / 003** or **Generative artwork instrument**
- Promise: **Play your next album cover.**
- Engines: **Harmonic** and **Radial**
- Parameters: **Form**, **Rhythm**, **Phase**, **Density**
- Variation action: **Remix**
- Output action: **Export PNG** or **Capture artwork**; choose one after a comprehension check and use it consistently.

Names are evocative labels for deterministic graphics. Do not imply the app analyzes a track or generates art with AI.

## Proposed interface copy

```text
SLEEVE / 003
Play your next album cover.

ARTIST
TRACK

ENGINE
Harmonic  Radial

FORM
RHYTHM
PHASE
DENSITY

Remix
Enable sound
Export PNG
```

## Status and errors

- Preparing: “Rendering 3000 × 3000 artwork…”
- Success: “Artwork exported — 3000 × 3000 PNG.”
- Failure: “The artwork couldn’t be exported. Your composition is safe; try again.”
- Audio unavailable: “Sound isn’t available here. The visual instrument still works.”
- Empty identity, if blocked: “Add an artist and track name to finish the sleeve.”

## Export naming

Proposed pattern:

```text
sleeve-{sanitized-artist}-{sanitized-track}-{seed}.png
```

Use lowercase safe characters, collapse repeated separators, limit length, and fall back to `sleeve-003-{seed}.png`. Do not place private metadata in the filename.

## Editorial rules

- Use sentence case for guidance and uppercase only for compact instrument labels if legible.
- Prefer verbs that name the result: Remix, Enable sound, Export PNG.
- Avoid “magic,” “AI-powered,” “unique,” “professional,” and unverified superlatives.
- Do not use inaccessible symbols as the only label.
- Keep helper copy close to the decision it supports.
- Make limitations honest: sound-inspired, not audio-reactive unless that feature truly exists.

## Pass checklist (10 minutes)

- [ ] One term per concept across UI and docs.
- [ ] Buttons say what will happen.
- [ ] Errors preserve confidence and offer recovery.
- [ ] Export filename is useful and safe.
- [ ] No claim exceeds the implementation.
- [ ] Labels remain understandable without icons or color.

