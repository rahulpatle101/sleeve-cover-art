// Pure geometry: (recipe, resolution) -> normalized traces. No randomness, no DOM.
import type { ArtworkRecipeV1 } from '../instrument/recipe.ts';

export type Trace = Float64Array; // interleaved x,y
export type Box = { minX: number; minY: number; maxX: number; maxY: number };

export const MAX_SEGMENTS = 4096;

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** Scale step per layer: outer trace = 1, inner traces shrink toward ~0.42. */
function layerScale(i: number, density: number): number {
  return density <= 1 ? 1 : 1 - (0.58 * i) / (density - 1);
}

export function harmonicTraces(r: ArtworkRecipeV1, segments: number): Trace[] {
  const g = gcd(r.form, r.rhythm);
  const a = r.form / g;
  const b = r.rhythm / g;
  const delta = (r.phase * Math.PI) / 180;
  const n = Math.min(MAX_SEGMENTS, Math.max(64, Math.round(segments)));
  const out: Trace[] = [];
  for (let i = 0; i < r.density; i++) {
    const s = layerScale(i, r.density);
    // Phase drift between layers spans a fixed 0.5 rad whatever the Density (Radial already
    // normalises its rotation), so more layers = finer ribbon, not a tangle.
    const d = delta + (r.density <= 1 ? 0 : (0.5 * i) / (r.density - 1));
    const tr = new Float64Array((n + 1) * 2);
    for (let j = 0; j <= n; j++) {
      const t = (j / n) * Math.PI * 2;
      tr[j * 2] = s * Math.sin(a * t + d);
      tr[j * 2 + 1] = s * Math.sin(b * t);
    }
    out.push(tr);
  }
  return out;
}

export function radialTraces(r: ArtworkRecipeV1, segments: number): Trace[] {
  const g = gcd(r.form, r.rhythm);
  const P = r.form / g;
  const Q = r.rhythm / g;
  const k = P / Q;
  const span = (P * Q) % 2 === 1 ? Math.PI * Q : 2 * Math.PI * Q;
  const delta = (r.phase * Math.PI) / 180;
  // Longer spans need more samples to stay smooth, still capped.
  const n = Math.min(MAX_SEGMENTS, Math.max(64, Math.round(segments * Math.min(2, Q / 2 + 0.5))));
  const rotStep = Math.PI / (r.density * Math.max(1, P) * 2);
  const out: Trace[] = [];
  for (let i = 0; i < r.density; i++) {
    const s = layerScale(i, r.density);
    const rot = i * rotStep;
    const tr = new Float64Array((n + 1) * 2);
    for (let j = 0; j <= n; j++) {
      const th = (j / n) * span;
      const rad = s * Math.cos(k * th + delta);
      tr[j * 2] = rad * Math.cos(th + rot);
      tr[j * 2 + 1] = rad * Math.sin(th + rot);
    }
    out.push(tr);
  }
  return out;
}

export function traces(r: ArtworkRecipeV1, segments: number): Trace[] {
  return r.mode === 'radial' ? radialTraces(r, segments) : harmonicTraces(r, segments);
}

export function boundingBox(trs: Trace[]): Box {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const tr of trs) {
    for (let j = 0; j < tr.length; j += 2) {
      const x = tr[j], y = tr[j + 1];
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (!Number.isFinite(minX)) return { minX: -1, minY: -1, maxX: 1, maxY: 1 };
  return { minX, minY, maxX, maxY };
}

export type Fit = { scale: number; tx: number; ty: number };

/**
 * Uniformly fit a bounding box into a target rect, centred. Degenerate
 * (zero-extent) axes are handled so a flat line still centres cleanly.
 */
export function fitBox(b: Box, rect: { x: number; y: number; w: number; h: number }): Fit {
  const bw = b.maxX - b.minX;
  const bh = b.maxY - b.minY;
  const eps = 1e-9;
  const sx = bw > eps ? rect.w / bw : Infinity;
  const sy = bh > eps ? rect.h / bh : Infinity;
  let scale = Math.min(sx, sy);
  if (!Number.isFinite(scale)) scale = Math.min(rect.w, rect.h) / 2; // all points equal
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  return { scale, tx: rect.x + rect.w / 2 - cx * scale, ty: rect.y + rect.h / 2 - cy * scale };
}
