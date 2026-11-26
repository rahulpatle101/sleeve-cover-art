// Pure v0.2 composition rules: registration, family Density meanings, placements and catalog text.
// No DOM. Lengths are fractions of the cover side S, so preview and export compose identically.
import type { ArtworkRecipeV1 } from '../instrument/recipe.ts';
import type { Box, Trace } from './geometry.ts';
import { PALETTES, FAMILY_LABEL, type PressSet } from './palettes.ts';

/** Maximum channel separation, as a fraction of S. */
export const REG_MAX = 0.009;

/** Phase law (unchanged): |sin 2φ| is 0 at 0°/90°/180°/270° (in register), 1 at 45° multiples. */
export function registration(r: ArtworkRecipeV1, S: number) {
  const phi = (r.phase * Math.PI) / 180;
  const amount = Math.abs(Math.sin(2 * phi));
  return { amount, dx: Math.cos(phi) * REG_MAX * S * amount, dy: Math.sin(phi) * REG_MAX * S * amount, rot: 0.0035 * Math.sin(2 * phi) };
}

export const pressSet = (r: ArtworkRecipeV1): PressSet => PALETTES[r.palette] ?? PALETTES[0];

/** Density meanings (approved). Never "more complete curves" beyond the capped echoes. */
export const density = {
  ink: (d: number) => ({
    echoes: Math.min(5, Math.floor((d - 1) / 4)), // ≤ 5 hairline echoes
    impressions: 1 + Math.floor(d / 6), // build-up: the same contour pressed again (1…5)
    pressureRange: 0.35 + d / 40,
    spread: 0.6 + d / 9, // ink spread (screened), in base units
    breakup: 0.05 + d * 0.004, // edge breakup probability
  }),
  light: (d: number) => ({
    bandWidth: 2.2 + d * 0.32, // half-width in base units
    intensity: 0.55 + d / 40,
    filaments: Math.floor(d / 4), // inside the band, same path
    residue: d * 28, // particles shed from the band
  }),
  matter: (d: number) => ({
    ridgeWidth: 4.5 + d * 0.3, // base units
    depth: 1.1 + d * 0.06,
    undulations: Math.min(4, Math.floor(d / 5)), // shallow surface frequency, not visible curves
    brush: 0.0025 * (1 + d / 12),
  }),
};

export const FRAMING_TREATMENTS = [
  'full-figure',
  'asymmetric-offset',
  'edge-bleed',
  'rotated-crop',
  'extreme-macro',
  'intersection-detail',
  'high-curvature-detail',
] as const;
export type FramingTreatment = (typeof FRAMING_TREATMENTS)[number];

/**
 * Seed-derived camera/deformation recipe. It is deliberately not stored as new product state:
 * the existing recipe seed is its complete, serializable source of truth.
 */
export type Compose = {
  treatment: FramingTreatment;
  rot: number;
  scaleX: number;
  scaleY: number;
  shear: number;
  bendX: number;
  bendY: number;
  zoom: number;
  ox: number;
  oy: number;
  focusBias: number;
  emphStart: number;
  emphLen: number;
};
export const COMPOSE_BOUNDS = {
  rot: 0.52,
  scale: [0.78, 1.24],
  shear: 0.16,
  bend: 0.075,
  zoom: [0, 1],
  emphLen: [0.12, 0.28],
} as const;
export function compose(r: ArtworkRecipeV1): Compose {
  let st = (r.seed ^ 0xc0de5eed) >>> 0;
  const u = () => { st = (st + 0x6d2b79f5) >>> 0; let t = st; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const treatment = FRAMING_TREATMENTS[Math.min(FRAMING_TREATMENTS.length - 1, Math.floor(u() * FRAMING_TREATMENTS.length))];
  return {
    treatment,
    rot: (u() * 2 - 1) * COMPOSE_BOUNDS.rot,
    scaleX: COMPOSE_BOUNDS.scale[0] + u() * (COMPOSE_BOUNDS.scale[1] - COMPOSE_BOUNDS.scale[0]),
    scaleY: COMPOSE_BOUNDS.scale[0] + u() * (COMPOSE_BOUNDS.scale[1] - COMPOSE_BOUNDS.scale[0]),
    shear: (u() * 2 - 1) * COMPOSE_BOUNDS.shear,
    bendX: (u() * 2 - 1) * COMPOSE_BOUNDS.bend,
    bendY: (u() * 2 - 1) * COMPOSE_BOUNDS.bend,
    zoom: u(),
    ox: u() * 2 - 1,
    oy: u() * 2 - 1,
    focusBias: u(),
    emphStart: u(),
    emphLen: COMPOSE_BOUNDS.emphLen[0] + u() * (COMPOSE_BOUNDS.emphLen[1] - COMPOSE_BOUNDS.emphLen[0]),
  };
}

/**
 * Keep Light's radial figures expansive rather than optically squeezed. The
 * camera remains seed-driven; only the most extreme affine anisotropy is
 * damped for this family/engine combination.
 */
export function compositionForSet(set: PressSet, r: ArtworkRecipeV1, c: Compose = compose(r)): Compose {
  if (set.family !== 'light' || r.mode !== 'radial') return c;
  const mean = Math.sqrt(c.scaleX * c.scaleY);
  return {
    ...c,
    scaleX: mean + (c.scaleX - mean) * 0.22,
    scaleY: mean + (c.scaleY - mean) * 0.22,
    shear: c.shear * 0.55,
    bendX: c.bendX * 0.72,
    bendY: c.bendY * 0.72,
  };
}

/** Apply the bounded affine + gentle quadratic deformation in figure space. */
export function transformTrace(t: Trace, c: Compose): Trace {
  const out = new Float64Array(t.length), cs = Math.cos(c.rot), sn = Math.sin(c.rot);
  for (let j = 0; j < t.length; j += 2) {
    const x = t[j], y = t[j + 1];
    const xr = x * cs - y * sn, yr = x * sn + y * cs;
    out[j] = xr * c.scaleX + c.shear * yr + c.bendX * (yr * yr - 0.35);
    out[j + 1] = yr * c.scaleY + c.bendY * xr * yr;
  }
  return out;
}

type Point = { x: number; y: number };
const at = (t: Trace, i: number): Point => ({ x: t[i * 2], y: t[i * 2 + 1] });

/** Strongest turning event, sampled along the actual deformed key contour. */
export function highCurvaturePoint(t: Trace, bias = 0.5): Point {
  const n = t.length / 2, step = Math.max(2, Math.floor(n / 320)), reach = Math.max(3, step * 2);
  let best = at(t, Math.floor(bias * Math.max(1, n - 1))), score = -Infinity;
  for (let i = reach; i < n - reach; i += step) {
    const a = at(t, i - reach), b = at(t, i), d = at(t, i + reach);
    const ux = b.x - a.x, uy = b.y - a.y, vx = d.x - b.x, vy = d.y - b.y;
    const den = Math.hypot(ux, uy) * Math.hypot(vx, vy) || 1;
    const turn = 1 - (ux * vx + uy * vy) / den;
    // Bias only breaks near-ties, keeping the target a genuine high-curvature event.
    const s = turn + 0.025 * (1 - Math.abs(i / n - bias));
    if (s > score) { score = s; best = b; }
  }
  return best;
}

/** Nearest non-neighbouring pair on a coarse contour: a stable proxy for a real intersection. */
export function intersectionPoint(t: Trace, bias = 0.5): Point | null {
  const n = t.length / 2, step = Math.max(1, Math.ceil(n / 240)), pts: { p: Point; i: number }[] = [];
  for (let i = 0; i < n; i += step) pts.push({ p: at(t, i), i });
  let best: Point | null = null, score = Infinity;
  const separation = Math.max(step * 12, Math.floor(n * 0.07));
  for (let a = 0; a < pts.length; a++) for (let b = a + 1; b < pts.length; b++) {
    const di = Math.abs(pts[a].i - pts[b].i), wrapped = Math.min(di, n - di);
    if (wrapped < separation) continue;
    const dx = pts[a].p.x - pts[b].p.x, dy = pts[a].p.y - pts[b].p.y;
    const d2 = dx * dx + dy * dy;
    const tie = 1e-5 * Math.abs((a + b) / (2 * pts.length) - bias);
    if (d2 + tie < score) { score = d2 + tie; best = { x: (pts[a].p.x + pts[b].p.x) / 2, y: (pts[a].p.y + pts[b].p.y) / 2 }; }
  }
  return best;
}

export function focusPoint(t: Trace, c: Compose, box: Box): Point {
  if (c.treatment === 'intersection-detail' || c.treatment === 'extreme-macro')
    return intersectionPoint(t, c.focusBias) ?? highCurvaturePoint(t, c.focusBias);
  if (c.treatment === 'high-curvature-detail') return highCurvaturePoint(t, c.focusBias);
  return { x: (box.minX + box.maxX) / 2, y: (box.minY + box.maxY) / 2 };
}

export type Place = { size: number; fx: number; fy: number; focus?: Point; treatment?: FramingTreatment };
const treatmentScale: Record<FramingTreatment, number> = {
  'full-figure': 0.78,
  'asymmetric-offset': 0.96,
  'edge-bleed': 1.18,
  'rotated-crop': 1.38,
  'extreme-macro': 2.25,
  'intersection-detail': 1.85,
  'high-curvature-detail': 1.68,
};

/** Family-aware camera: the treatment varies, but Ink bleeds, Light floats, and Matter remains a lit surface. */
export function placement(set: PressSet, r: ArtworkRecipeV1, c: Compose = compose(r)): Place {
  // Light now shares Ink's assertive crop envelope instead of floating a small,
  // fully visible figure in the middle of the sleeve.
  const base = set.family === 'ink' || set.family === 'light' ? 1.04 : set.macro ? 1.28 : 0.78;
  let size = base * treatmentScale[c.treatment] * (0.9 + 0.22 * c.zoom);
  // Keep the two quieter treatments genuinely whole; keep extreme treatments bounded per material.
  if (c.treatment === 'full-figure') size = base * (0.7 + 0.1 * c.zoom);
  size = Math.min(set.family === 'ink' || set.family === 'light' ? 2.45 : set.macro ? 3.15 : 1.82, size);

  let fx = 0.5, fy = set.family === 'ink' ? 0.39 : set.family === 'light' ? (set.horizon ? 0.4 : 0.43) : 0.4;
  if (c.treatment === 'asymmetric-offset') { fx = 0.5 + 0.2 * c.ox; fy += 0.1 * c.oy; }
  else if (c.treatment === 'edge-bleed') { fx = c.ox < 0 ? 0.18 : 0.82; fy = 0.36 + 0.12 * c.oy; }
  else if (c.treatment === 'rotated-crop') { fx = 0.48 + 0.18 * c.ox; fy = 0.36 + 0.12 * c.oy; }
  else if (c.treatment.includes('detail') || c.treatment === 'extreme-macro') { fx = 0.5 + 0.2 * c.ox; fy = 0.36 + 0.13 * c.oy; }
  return { size, fx, fy, treatment: c.treatment };
}
export function fitPlace(box: Box, S: number, p: Place) {
  const sc = Math.min((p.size * S) / Math.max(1e-9, box.maxX - box.minX), (p.size * S) / Math.max(1e-9, box.maxY - box.minY));
  const f = p.focus ?? { x: (box.minX + box.maxX) / 2, y: (box.minY + box.maxY) / 2 };
  return { scale: sc, tx: p.fx * S - f.x * sc, ty: p.fy * S - f.y * sc };
}

/** Catalog lines, from the recipe only (no counter, no brand watermark). "PHASE" is spelled out: no bundled face has Φ. */
export function catalog(r: ArtworkRecipeV1): string[] {
  const set = pressSet(r);
  const reg = Math.abs(Math.sin((2 * r.phase * Math.PI) / 180)) < 1e-9 ? 'IN REGISTER' : 'OFF REGISTER';
  return [
    `${FAMILY_LABEL[set.family]} · ${String(set.index).padStart(2, '0')}`,
    `PLATE ${r.seed.toString(16).padStart(8, '0').toUpperCase()}`,
    `${r.mode === 'radial' ? 'RADIAL' : 'HARMONIC'} ${r.form}:${r.rhythm}`,
    `PHASE ${String(r.phase).padStart(3, '0')}° ${reg}`,
    `${r.density} ${r.density === 1 ? 'PASS' : 'PASSES'}`,
  ];
}
