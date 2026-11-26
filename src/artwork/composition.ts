// Pure v0.2 composition rules: registration, family Density meanings, placements and catalog text.
// No DOM. Lengths are fractions of the cover side S, so preview and export compose identically.
import type { ArtworkRecipeV1 } from '../instrument/recipe.ts';
import type { Box } from './geometry.ts';
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

/** Seed-driven composition (deterministic, bounded): rotation, asymmetric scale, framing type, offset, curve emphasis. */
export const FRAMES = ['full', 'offset', 'tight', 'corner'] as const;
export type Frame = (typeof FRAMES)[number];
export type Compose = { rot: number; aniso: number; zoom: number; ox: number; oy: number; emphStart: number; emphLen: number; frame: Frame; pick: number; side: number };
export const COMPOSE_BOUNDS = { rot: 0.38, aniso: [0.9, 1.1], zoom: [0, 1], emphLen: [0.12, 0.28] } as const;
export function compose(r: ArtworkRecipeV1): Compose {
  let st = (r.seed ^ 0xc0de5eed) >>> 0;
  const u = () => { st = (st + 0x6d2b79f5) >>> 0; let t = st; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const base = { rot: (u() * 2 - 1) * COMPOSE_BOUNDS.rot, aniso: 0.9 + u() * 0.2, zoom: u(), ox: u() * 2 - 1, oy: u() * 2 - 1, emphStart: u(), emphLen: 0.12 + u() * 0.16 };
  const f = u(); // full 25 % · offset 30 % · tight 25 % · corner 20 %
  const frame: Frame = f < 0.25 ? 'full' : f < 0.55 ? 'offset' : f < 0.8 ? 'tight' : 'corner';
  return { ...base, frame, pick: u(), side: u() < 0.5 ? -1 : 1 };
}

/** Placement: `size` = fraction of S for the figure's larger side; either the figure centre or a curve feature
 *  (`anchor`, for tight / corner frames) lands at (fx, fy). The type zones (bottom) stay clear of anchors. */
export type Place = { size: number; fx: number; fy: number; anchor?: boolean; focus?: { x: number; y: number } };
export function placement(set: PressSet, r: ArtworkRecipeV1, c: Compose = compose(r)): Place {
  const base = set.family === 'ink' ? { s: 1.12, fy: 0.38 } : set.family === 'light' ? (set.horizon ? { s: 0.58, fy: 0.4 } : { s: 0.62, fy: 0.42 }) : set.macro ? { s: 2.3, fy: 0.4 } : { s: 0.74, fy: 0.44 };
  const z = 1 + 0.15 * c.zoom;
  // the macro set is always a material crop: its "full" and "offset" frames become feature-anchored crops
  const frame: Frame = set.macro && (c.frame === 'full' || c.frame === 'offset') ? (c.frame === 'full' ? 'tight' : 'corner') : c.frame;
  // Ink is already a cropped family (1.12 S), so its extra zoom is gentler; otherwise corner crops go empty
  const k = set.macro ? { tight: 1.25, corner: 1.1 } : set.family === 'ink' ? { tight: 1.45, corner: 1.2 } : { tight: 2.0, corner: 1.6 };
  switch (frame) {
    case 'full': return { size: base.s * 0.95 * z, fx: 0.5 + 0.05 * c.ox, fy: base.fy + 0.02 * c.oy };
    case 'offset': return { size: base.s * 1.3 * z, fx: 0.5 + 0.2 * c.side, fy: base.fy + 0.06 * c.oy };
    case 'tight': return { size: base.s * k.tight * z, fx: 0.5 + 0.1 * c.ox, fy: 0.36 + 0.06 * c.oy, anchor: true };
    case 'corner': return { size: base.s * k.corner * z, fx: 0.5 + 0.22 * c.side, fy: 0.3 + 0.03 * c.oy, anchor: true };
  }
}
export function fitPlace(box: Box, S: number, p: Place) {
  const sc = Math.min((p.size * S) / Math.max(1e-9, box.maxX - box.minX), (p.size * S) / Math.max(1e-9, box.maxY - box.minY));
  const fx = p.focus ? p.focus.x : (box.minX + box.maxX) / 2, fy = p.focus ? p.focus.y : (box.minY + box.maxY) / 2;
  return { scale: sc, tx: p.fx * S - fx * sc, ty: p.fy * S - fy * sc };
}

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
