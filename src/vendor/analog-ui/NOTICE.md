# Vendored: Analog UI

- Source: https://github.com/TechSquidTV/Analog-UI, commit `fa43e9420034`, `packages/analog-ui/src` (shadcn-style registry distribution; the package is not on npm).
- Licence: MIT (© 2026 TechSquidTV). See `LICENSE` in this folder.
- Status in SLEEVE: PROPOSED inspiration and runtime dependency, **not** SkillUI extraction evidence.
- Local changes: none to component logic. A `// @ts-nocheck` header was added only to the files that fail SLEEVE's stricter `tsconfig` (unused parameters and strict null checks). The demo files (`App.tsx`, `main.tsx`, `demo.ts`, `ComponentShowcase.tsx`, `texture.png`) were not vendored.
- SLEEVE theming lives in `src/styles/sleeve.css`. It reduces bloom, foil, shadow, grain and bevel, uses one static light with no pointer or tilt lighting, and adds warm off-white hardware.
