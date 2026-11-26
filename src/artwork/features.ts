// Structural features of a curve (pure, deterministic, size-independent): self-crossings weighted by crossing strength
// and tight turns weighted by sharpness. Used by the seed-driven framing to aim crops at a real event of the waveform,
// never at empty space. (Adapted from the unadopted Macro crop study, production/creative-review-v0.2/macro-crop.)
import type { Trace, Box } from './geometry.ts';

export type FocusEvent = { x: number; y: number; w: number; kind: 'cross' | 'turn' };

const TURN_MIN = 6; // normalised curvature (E/2 · κ) that counts as a turn: radius ≤ 1/12 of the figure
const TURN_FULL = 24; // normalised curvature that earns full turn weight

function segX(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, dx: number, dy: number) {
  const rx = bx - ax, ry = by - ay, sx = dx - cx, sy = dy - cy, den = rx * sy - ry * sx;
  if (Math.abs(den) < 1e-12) return null;
  const t = ((cx - ax) * sy - (cy - ay) * sx) / den, u = ((cx - ax) * ry - (cy - ay) * rx) / den;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  const s = Math.abs(den) / (Math.hypot(rx, ry) * Math.hypot(sx, sy)); // |sin θ|
  return { x: ax + t * rx, y: ay + t * ry, s };
}

/** Structural events of one closed trace. `phaseDeg` gives the channel-B offset direction and amount. */
export function structuralEvents(tr: Trace, box: Box, phaseDeg: number): FocusEvent[] {
  const n = tr.length / 2 - 1; // segments (last point repeats the first)
  const E = Math.max(box.maxX - box.minX, box.maxY - box.minY) || 1;
  const phi = (phaseDeg * Math.PI) / 180, amt = Math.abs(Math.sin(2 * phi)), ux = Math.cos(phi), uy = Math.sin(phi);
  const channel = (tx: number, ty: number) => { const l = Math.hypot(tx, ty) || 1; return 1 + 0.5 * amt * Math.abs((tx * uy - ty * ux) / l); };
  const ev: FocusEvent[] = [];
  // crossings via a uniform grid
  const G = 48, gx = (v: number) => Math.min(G - 1, Math.max(0, Math.floor(((v - box.minX) / E) * G))), gy = (v: number) => Math.min(G - 1, Math.max(0, Math.floor(((v - box.minY) / E) * G)));
  const cells = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const x0 = gx(Math.min(tr[i * 2], tr[i * 2 + 2])), x1 = gx(Math.max(tr[i * 2], tr[i * 2 + 2])), y0 = gy(Math.min(tr[i * 2 + 1], tr[i * 2 + 3])), y1 = gy(Math.max(tr[i * 2 + 1], tr[i * 2 + 3]));
    for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) { const k = cy * G + cx; let a = cells.get(k); if (!a) cells.set(k, (a = [])); a.push(i); }
  }
  const seen = new Set<number>();
  for (const list of cells.values()) for (let p = 0; p < list.length; p++) for (let q = p + 1; q < list.length; q++) {
    const i = list[p], j = list[q], gap = Math.min(j - i, n - (j - i));
    if (gap < 3) continue;
    const key = i * n + j; if (seen.has(key)) continue; seen.add(key);
    const h = segX(tr[i * 2], tr[i * 2 + 1], tr[i * 2 + 2], tr[i * 2 + 3], tr[j * 2], tr[j * 2 + 1], tr[j * 2 + 2], tr[j * 2 + 3]);
    if (!h || h.s < 0.3) continue; // grazing / shallow / retraced overlaps are not events
    ev.push({ x: h.x, y: h.y, w: h.s * h.s * Math.max(channel(tr[i * 2 + 2] - tr[i * 2], tr[i * 2 + 3] - tr[i * 2 + 1]), channel(tr[j * 2 + 2] - tr[j * 2], tr[j * 2 + 3] - tr[j * 2 + 1])), kind: 'cross' });
  }
  // turns: curvature maxima (turning angle over arc length across ±K samples)
  const K = 8, kap = new Float64Array(n);
  for (let j = 0; j < n; j++) {
    const a = (j - K + n) % n, b = (j + K) % n;
    const t1x = tr[j * 2] - tr[a * 2], t1y = tr[j * 2 + 1] - tr[a * 2 + 1], t2x = tr[b * 2] - tr[j * 2], t2y = tr[b * 2 + 1] - tr[j * 2 + 1];
    const l1 = Math.hypot(t1x, t1y), l2 = Math.hypot(t2x, t2y);
    if (l1 < 1e-12 || l2 < 1e-12) continue;
    const ang = Math.acos(Math.max(-1, Math.min(1, (t1x * t2x + t1y * t2y) / (l1 * l2))));
    kap[j] = (ang / ((l1 + l2) / 2)) * (E / 2);
  }
  const R = 16;
  for (let j = 0; j < n; j++) {
    if (kap[j] < TURN_MIN) continue;
    let peak = true;
    for (let o = 1; o <= R && peak; o++) if (kap[(j + o) % n] > kap[j] || kap[(j - o + n) % n] >= kap[j]) peak = false;
    if (!peak) continue;
    const tx = tr[((j + 1) % n) * 2] - tr[((j - 1 + n) % n) * 2], ty = tr[((j + 1) % n) * 2 + 1] - tr[((j - 1 + n) % n) * 2 + 1];
    ev.push({ x: tr[j * 2], y: tr[j * 2 + 1], w: Math.min(1, kap[j] / TURN_FULL) * channel(tx, ty), kind: 'turn' });
  }
  return ev;
}


/** Deterministic pick among the strongest features: `pick` ∈ [0, 1) selects one of the top few. */
export function pickFeature(tr: Trace, box: Box, phaseDeg: number, pick: number, minEvents = 1): FocusEvent | null {
  const ev = structuralEvents(tr, box, phaseDeg).sort((a, b) => b.w - a.w || a.x - b.x || a.y - b.y);
  if (ev.length < Math.max(1, minEvents)) return null; // too simple a figure to crop into
  const k = Math.min(5, ev.length);
  return ev[Math.min(k - 1, Math.floor(pick * k))];
}
