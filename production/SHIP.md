# Shipping record

**Status:** RELEASE CANDIDATE — NOT DEPLOYED (public deployment not authorized)

Complete during the final five minutes. Shipping means the artifact is reproducible, honestly described, and ready at the authorized destination. Deployment is not authorized by this starter kit alone.

## Release identity

- Project: SLEEVE — Day 003
- Version/commit: no git repository; build identified by bundle hashes in `release/dist.sha256` (`index-DMBWh0uM.js` SHA-256 `2dbbc17d…16add16`)
- Date/time/timezone: 2026-11-25, ≈ 21:12 IST (UTC+05:30)
- Target: local release candidate folder `release/` (static, host-agnostic `base: './'`)
- URL (if deployed): none. Not deployed, not pushed; public deployment not authorized.
- Operator: project owner (approvals and human checks) + Claude Code (execution)

## Gate results

- Gate R — Research: PASS (limited-evidence), operator-approved
- Gate B — Build: PASS, operator-approved
- Gate C — Craft: deferred once, then APPROVED on demonstrated outcomes (≈ 67 of 120 min used; ≈ 53 min unused, not transferred)
- Gate S — Ship: PASS for release-candidate handoff (see `BUILD_LOG.md`), pending operator approval; no deployment

## Verified release statement

> SLEEVE is a client-side visual instrument that uses Harmonic (Lissajous) and Radial (rose) mathematics to create square album artwork with your artist and track names. It includes keyboard-, pointer- and touch-operable rotary controls built on native sliders, a deterministic Remix, optional original synthesized feedback that is off by default, reduced-motion support, and an exact 3000 × 3000 PNG export rendered by the same code as the preview.

Every clause was tested. See `QUALITY_CHECKLIST.md`.

## Required evidence

- [x] Production build result recorded: `vite build` → 248 kB total; JS 240.2 kB (75.5 kB gzip); CSS 7.1 kB (2.2 kB gzip).
- [x] Quality checklist completed (`QUALITY_CHECKLIST.md`, all items checked with evidence).
- [x] Export files inspected and pixel dimensions recorded: `release/exports/sleeve-night-office-phase-garden-harmonic-01352905.png` (SHA-256 `8b44100f…cae1adef6`) and `release/exports/sleeve-mira-okafor-tidewater-radial-01352905.png` (SHA-256 `72386e39…3c150698`), both 3000 × 3000; 100% crops in `release/crops/`.
- [x] Preserved extraction path and hash recorded: `research/extracted/DESIGN.md`, SHA-256 `ec140e44a42edf512419cd4b3e13e78a910433ece2b11235aa23800ac86e966b`; `INTEGRITY.sha256` 25/25 OK.
- [x] Known limitations listed (below).
- [x] License/attribution checked: runtime deps react 19.3.1, react-dom 19.3.1, scheduler 0.28.0 (all MIT). No fonts, images or audio samples are bundled; typography is the user's system fonts. Proprietary extracted fonts are excluded (scan clean).
- [x] No external publish action taken; deployment not requested.

<!-- original template checklist retained below for traceability -->

- [ ] Production build result recorded.
- [ ] Quality checklist completed.
- [ ] Export file inspected and pixel dimensions recorded.
- [ ] Preserved extraction path and hash recorded.
- [ ] Known limitations listed.
- [ ] License/attribution obligations checked for fonts and dependencies.
- [ ] Deployment requested/authorized if an external publish action was taken.

## Artifacts

- Source/commit:
- Preserved extraction:
- Extraction hash:
- Test export:
- Screenshots:
- Live URL:

## Known limitations

- **Extraction disclosure (from `research/extracted/PROVENANCE.md`):** SkillUI 1.3.4 default mode sent the public target URL to the third-party service `api.microlink.io` for the screenshot. It also auto-installed a global skill (quarantined) and downloaded the source's proprietary webfonts. Those fonts are preserved as evidence only and are not bundled or used.
- **Typography is a system-font stack** (`Helvetica Neue → Helvetica → Arial → system-ui`). No webfont is bundled, so cover typography and exported PNGs can vary across machines. Verified on macOS (Helvetica Neue) only.
- **Phone cause-and-effect (critique S2-1):** at 360 px, Remix, Export and the lower dials sit below the cover, so the art change from Remix happens off-screen until you scroll up. Recorded, not fixed (a fix would change layout or focus order).
- **Browsers:** Chrome automated; Safari (macOS) and one physical phone checked manually by the operator; **Firefox untested** (headless smoke attempt produced no screenshot). Screen readers other than VoiceOver untested.
- **No volume control** (operator constraint). Density changes audio brightness only subtly.
- **Remix quality:** 47/49 audited outcomes judged worth keeping; Harmonic 4:3 (busy) and 4:5 (boxy) remain weaker.
- **Motion recordings** (`release/motion/*.webm`) were captured at ≈ 14 fps via sequential screenshots and show choreography, not true smoothness. They were captured before the final S1 export fixes, which don't affect motion.
- **Status line** keeps the last export message after further edits (S3-2).
- **Extraction limits:** default mode captured no UI control components and one desktop first-viewport screenshot. Its "dark theme" and role labels are contradicted by the live page. Control design, spacing and tactile behaviour are PROPOSED — DIRECTION, not extracted.

## Deferred ideas (not v1 promises)

- Compact sticky preview or in-view Remix echo on narrow screens (from S2-1).
- Remix undo/history.
- Volume control.
- Bundled, redistribution-licensed font for identical exports across machines.
- Third modes, animated export, saved recipes, galleries, uploads and sharing remain out of scope.

## Rollback/recovery

- Last known-good build/commit: `release/dist/` (hashes in `release/dist.sha256`); rebuild with `npm ci && npm run build` from this folder.
- How to remove or replace the deployed release: not deployed. To replace the candidate, rebuild and re-run `npm run verify` and `scripts/browser/*` before copying a new `dist/`.
- Owner: project owner.

