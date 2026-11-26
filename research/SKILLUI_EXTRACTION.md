# SkillUI extraction workflow

**Status:** REQUIRED WORKFLOW · not yet run

## Goal

Create one preserved, traceable design-system extraction before implementation. The raw output is evidence; SLEEVE-specific art direction lives elsewhere.

## 1. Select and record the source

- Choose one canonical page URL, not a search result or collage.
- Prefer the page most relevant to controls and interface hierarchy.
- Record why it was chosen, the timestamp with timezone, viewport, theme, authentication state, and any consent/banner state.
- If the page cannot be accessed consistently, select a stable alternative and record the reason.

## 2. Run SkillUI

- Use the installed SkillUI workflow and its documented command or interface; do not invent flags.
- Capture the page at desktop and, if supported within the timebox, mobile width.
- Ask extraction to identify observable tokens, component patterns, typography, color, spacing, hierarchy, and interaction cues.
- Do not ask SkillUI to redesign SLEEVE during extraction.
- Record the tool/version and exact invocation or UI steps in `PROVENANCE.md`.

## 3. Preserve raw output

Save the returned files exactly as generated:

```text
research/extracted/
  DESIGN.md
  SKILL.md           # only if generated
  PROVENANCE.md
  INTEGRITY.sha256
  captures/...
```

- Do not rename headings, normalize spelling, reorder tokens, or insert SLEEVE decisions into raw files.
- If rerunning, archive each run in a timestamped subfolder; never silently replace evidence.
- Generate SHA-256 hashes after files are in their final preserved location.
- Treat a changed hash as a new extraction requiring explanation.

## 4. Verify the extraction

Quickly compare the extraction with the captured page:

- Are claimed colors and type roles visibly present?
- Are interactive patterns based on observable UI, not guesswork?
- Are responsive conclusions supported by a relevant capture?
- Are confidence gaps or dynamic states called out?

Mark contradictions and unknowns in `PROVENANCE.md`; do not “fix” `DESIGN.md`.

## 5. Translate, do not copy

Complete `../DESIGN_DNA_TRANSFER.md` using this chain:

```text
verified source trait → product principle → SLEEVE adaptation → acceptance check
```

Examples of legitimate transfer: dense labels become clear parameter/value pairs; functional accent colors become mode/status cues; hardware spacing becomes generous control targets.

Examples to reject: logos, proprietary typefaces without licenses, source copy, exact product colors used as brand mimicry, distinctive device silhouette, one-to-one layout.

## 6. Pass/fail

**Pass:** `DESIGN.md` exists, is preserved, has provenance and hash, visually plausible claims have been checked, and the transfer document clearly separates verified facts from proposed adaptations.

**Fail:** the page or tool was unavailable, output is incomplete/corrupt, provenance is missing, or the team is tempted to fabricate extracted facts.

On failure, record it and stop at Gate R. Do not create a hand-written file named `DESIGN.md`.

