// Pure optical-press composition: registration, art placement and type layout per imposition.
// No DOM. All lengths are fractions of the cover side S, so preview and export scale identically.
import type { ArtworkRecipeV1 } from '../instrument/recipe.ts';
import type { Box } from './geometry.ts';
import type { Imposition } from './palettes.ts';

/** Maximum plate-B misregistration, as a fraction of S. */
export const REG_MAX = 0.009;

/**
 * Phase drives registration: |sin 2φ| is 0 at 0°, 90°, 180°, 270° (in register) and 1 at 45° multiples.
 * Plate B shifts along the phase angle and turns very slightly.
 */
export function registration(r: ArtworkRecipeV1, S: number) {
  const phi = (r.phase * Math.PI) / 180;
  const amount = Math.abs(Math.sin(2 * phi));
  return {
    amount, // 0 = in register … 1 = maximum misregistration
    dx: Math.cos(phi) * REG_MAX * S * amount,
    dy: Math.sin(phi) * REG_MAX * S * amount,
    rot: 0.0035 * Math.sin(2 * phi),
  };
}

/** Bleed corner is a deterministic property of the plate (seed), so proofs of one recipe agree. */
export function bleedSide(r: ArtworkRecipeV1): 'left' | 'right' {
  return (r.seed >>> 3) & 1 ? 'right' : 'left';
}

export const GATE = { cx: 0.5, cy: 0.44, r: 0.355 };
export const FIELD = { x: 0.1, y: 0.27, w: 0.8, h: 0.6 };
const BLEED_SIZE = 0.8;
const BLEED_OVER = 0.07; // how far the figure runs past the trim

export type Placement = { scale: number; tx: number; ty: number };

export function artPlacement(imp: Imposition, r: ArtworkRecipeV1, box: Box, S: number): Placement {
  const bw = Math.max(1e-9, box.maxX - box.minX);
  const bh = Math.max(1e-9, box.maxY - box.minY);
  const fit = (w: number, h: number) => Math.min(w / bw, h / bh);
  if (imp === 'bleed') {
    const scale = fit(BLEED_SIZE * S, BLEED_SIZE * S);
    const ty = -BLEED_OVER * S - box.minY * scale;
    const tx = bleedSide(r) === 'left' ? -BLEED_OVER * S - box.minX * scale : S + BLEED_OVER * S - box.maxX * scale;
    return { scale, tx, ty };
  }
  if (imp === 'gate') {
    // Fit larger than the gate so the aperture crops the figure, like a lens gate.
    const side = 0.9 * S;
    const scale = fit(side, side);
    const cx = (box.minX + box.maxX) / 2;
    const cy = (box.minY + box.maxY) / 2;
    return { scale, tx: GATE.cx * S - cx * scale, ty: GATE.cy * S - cy * scale };
  }
  const scale = fit(FIELD.w * S, FIELD.h * S);
  const cx = (box.minX + box.maxX) / 2;
  const cy = (box.minY + box.maxY) / 2;
  return { scale, tx: (FIELD.x + FIELD.w / 2) * S - cx * scale, ty: (FIELD.y + FIELD.h / 2) * S - cy * scale };
}

export type TextSlot = {
  x: number;
  baseline: number;
  align: 'left' | 'right' | 'center';
  size: number;
  min: number;
  maxW: number;
  /** Two-line wrap bounds (artist only). */
  wrap?: [number, number];
  /** 'up': lines stack above the baseline; 'down': first line sits at wrapBaseline, second below. */
  wrapDir?: 'up' | 'down';
  wrapBaseline?: number;
  /** Vertical slug: rotate the line (degrees) around (x, baseline). */
  rotate?: 0 | 90 | -90;
};

export type TypeLayout = {
  artist: TextSlot;
  track: TextSlot;
  colophon: TextSlot & { lines: number };
  /** Gate only: used when the track can't fit beside the artist — each gets its own full-width line. */
  stacked?: { artist: TextSlot; track: TextSlot };
  /** Position of the registration mark that accompanies the colophon (fractions of S). */
  mark?: { x: number; y: number };
};

/** Minimum readable sizes: artist ≥ 0.046·S, track ≥ 0.028·S (≈ 9.4 CSS px on a 336 px phone cover). */
export function typeLayout(imp: Imposition, r: ArtworkRecipeV1): TypeLayout {
  if (imp === 'bleed') {
    const left = bleedSide(r) === 'left'; // figure bleeds off the top-left; title sits right
    const tx = left ? 0.93 : 0.07;
    const ta = left ? 'right' : 'left';
    return {
      artist: { x: tx, baseline: 0.86, align: ta, size: 0.088, min: 0.046, maxW: 0.86, wrap: [0.046, 0.056], wrapDir: 'up' }, // wrapped cap top ≥ 0.762, clear of art ≤ 0.739
      track: { x: tx, baseline: 0.935, align: ta, size: 0.034, min: 0.028, maxW: 0.86 },
      // Vertical slug along the free edge opposite the bleed (the art stops at ≤ 0.74·S across).
      colophon: left
        ? { x: 0.93, baseline: 0.075, align: 'left', size: 0.02, min: 0.016, maxW: 0.64, lines: 1, rotate: 90 }
        : { x: 0.07, baseline: 0.715, align: 'left', size: 0.02, min: 0.016, maxW: 0.62, lines: 1, rotate: -90 }, // reads upward, ends ≥ 0.095
      mark: left ? { x: 0.918, y: 0.045 } : { x: 0.082, y: 0.045 }, // top corner on the free side, clear of the title
    };
  }
  if (imp === 'gate') {
    return {
      artist: { x: 0.07, baseline: 0.925, align: 'left', size: 0.07, min: 0.04, maxW: 0.52, wrap: [0.046, 0.056], wrapDir: 'up' },
      track: { x: 0.93, baseline: 0.925, align: 'right', size: 0.032, min: 0.028, maxW: 0.34 },
      colophon: { x: 0.5, baseline: 0.072, align: 'center', size: 0.021, min: 0.016, maxW: 0.74, lines: 1 },
      stacked: {
        artist: { x: 0.07, baseline: 0.88, align: 'left', size: 0.06, min: 0.04, maxW: 0.86 },
        track: { x: 0.07, baseline: 0.945, align: 'left', size: 0.03, min: 0.026, maxW: 0.86 },
      },
    };
  }
  return {
    artist: { x: 0.07, baseline: 0.205, align: 'left', size: 0.1, min: 0.05, maxW: 0.86, wrap: [0.046, 0.056], wrapDir: 'down', wrapBaseline: 0.178 },
    track: { x: 0.075, baseline: 0.105, align: 'left', size: 0.032, min: 0.028, maxW: 0.86 },
    colophon: { x: 0.075, baseline: 0.952, align: 'left', size: 0.021, min: 0.016, maxW: 0.86, lines: 1 },
  };
}

/** Print slug, derived only from the recipe (no counters, no brand watermark). */
export function colophonLines(r: ArtworkRecipeV1, lines: number): string[] {
  const plate = `PLATE ${r.seed.toString(16).padStart(8, '0').toUpperCase()}`;
  const engine = r.mode === 'radial' ? 'RADIAL' : 'HARMONIC';
  const spec = `${r.form}:${r.rhythm} · Φ ${String(r.phase).padStart(3, '0')}° · ${r.density} ${r.density === 1 ? 'PASS' : 'PASSES'}`;
  return lines === 2 ? [`${plate} · ${engine}`, spec] : [`${plate} · ${engine} ${spec}`];
}

/** Type-safe zones (fractions of S) that the art must never enter, per imposition. Used by tests. */
export function artLimits(imp: Imposition): { top: number; bottom: number } {
  if (imp === 'bleed') return { top: -1, bottom: BLEED_SIZE - BLEED_OVER + REG_MAX }; // ≤ 0.739
  if (imp === 'gate') return { top: GATE.cy - GATE.r, bottom: GATE.cy + GATE.r }; // clipped to the gate
  return { top: FIELD.y - REG_MAX, bottom: FIELD.y + FIELD.h + REG_MAX };
}
