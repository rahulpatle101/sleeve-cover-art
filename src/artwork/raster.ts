// Shared raster helpers for the v0.2 renderer. Cross-browser by design: no ctx.filter (blur is done by
// downsample/upsample or float box blurs), crisp seeded tiles (compressible), deterministic noise.
export type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
export type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;
export type Pts = { X: Float32Array; Y: Float32Array; n: number };

export function makeCanvas(w: number, h = w): AnyCanvas {
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }
  return new OffscreenCanvas(w, h);
}
export const ctx2d = (c: AnyCanvas) => c.getContext('2d', { willReadFrequently: false }) as Ctx;

export function mulberry(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function hash2(x: number, y: number, s: number) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const rgb = (c: number[], a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

export function toPts(tr: Float64Array, p: { scale: number; tx: number; ty: number }): Pts {
  const n = tr.length / 2, X = new Float32Array(n), Y = new Float32Array(n);
  for (let j = 0; j < n; j++) { X[j] = tr[j * 2] * p.scale + p.tx; Y[j] = tr[j * 2 + 1] * p.scale + p.ty; }
  return { X, Y, n };
}
export function poly(x: Ctx, P: Pts, ox = 0, oy = 0) {
  x.beginPath();
  x.moveTo(P.X[0] + ox, P.Y[0] + oy);
  for (let j = 1; j < P.n; j++) x.lineTo(P.X[j] + ox, P.Y[j] + oy);
}
export function normals(P: Pts) {
  const NX = new Float32Array(P.n), NY = new Float32Array(P.n);
  for (let j = 0; j < P.n; j++) {
    const a = Math.max(0, j - 2), b = Math.min(P.n - 1, j + 2);
    const tx = P.X[b] - P.X[a], ty = P.Y[b] - P.Y[a], l = Math.hypot(tx, ty) || 1;
    NX[j] = -ty / l; NY[j] = tx / l;
  }
  return { NX, NY };
}
/** Smooth seeded pressure profile along arc length, 0…1. */
export function pressure(seed: number) {
  const r = mulberry(seed), ph = [r() * 6.28, r() * 6.28, r() * 6.28], fr = [2 + r() * 2, 7 + r() * 5, 23 + r() * 11];
  return (t: number) => clamp(0.5 + 0.3 * Math.sin(fr[0] * 6.283 * t + ph[0]) + 0.15 * Math.sin(fr[1] * 6.283 * t + ph[1]) + 0.07 * Math.sin(fr[2] * 6.283 * t + ph[2]), 0, 1);
}

/** Soft blur without ctx.filter: draw down to a smaller canvas and back up with smoothing. */
export function softBlur(src: AnyCanvas, radius: number): AnyCanvas {
  const w = src.width, h = src.height;
  if (radius < 1.5) return src;
  const f = Math.max(1, radius / 1.6), sw = Math.max(1, Math.round(w / f)), sh = Math.max(1, Math.round(h / f));
  const small = makeCanvas(sw, sh), sx = ctx2d(small);
  sx.imageSmoothingEnabled = true; (sx as CanvasRenderingContext2D).imageSmoothingQuality = 'high';
  sx.drawImage(src as CanvasImageSource, 0, 0, sw, sh);
  const out = makeCanvas(w, h), ox = ctx2d(out);
  ox.imageSmoothingEnabled = true; (ox as CanvasRenderingContext2D).imageSmoothingQuality = 'high';
  ox.drawImage(small as CanvasImageSource, 0, 0, w, h);
  return out;
}

const tileCache = new Map<string, AnyCanvas>();
/** Crisp binary tile (alpha), seeded. Used for paper tooth and edge breakup. */
export function binTile(seed: number, density: number, T = 256): AnyCanvas {
  const key = `${seed}:${density.toFixed(4)}:${T}`;
  const hit = tileCache.get(key);
  if (hit) return hit;
  const c = makeCanvas(T), x = ctx2d(c), im = x.createImageData(T, T), r = mulberry(seed);
  for (let i = 0; i < T * T; i++) im.data[i * 4 + 3] = r() < density ? 255 : 0;
  x.putImageData(im, 0, 0);
  if (tileCache.size > 32) tileCache.clear();
  tileCache.set(key, c);
  return c;
}
export function tile(x: Ctx, img: AnyCanvas, S: number, cells: number) {
  x.imageSmoothingEnabled = false;
  const st = S / cells;
  for (let i = 0; i < cells; i++) for (let j = 0; j < cells; j++) x.drawImage(img as CanvasImageSource, i * st, j * st, st + 0.5, st + 0.5);
  x.imageSmoothingEnabled = true;
}

/** Canvas red×alpha → float field (avoids 8-bit terracing once smoothed). */
export function toField(c: AnyCanvas, S: number): Float32Array {
  const D = ctx2d(c).getImageData(0, 0, S, S).data, F = new Float32Array(S * S);
  for (let i = 0; i < S * S; i++) F[i] = D[i * 4 + 3] ? (D[i * 4] / 255) * (D[i * 4 + 3] / 255) : 0;
  return F;
}
/** Separable box blur on a float field (in place). Two passes ≈ triangular, three ≈ Gaussian. */
export function boxBlur(F: Float32Array, S: number, r: number): Float32Array {
  r = Math.max(1, Math.round(r));
  const T = new Float32Array(S * S), n = 2 * r + 1;
  for (let y = 0; y < S; y++) {
    let a = 0; const o = y * S;
    for (let X = -r; X <= r; X++) a += F[o + clamp(X, 0, S - 1)];
    for (let X = 0; X < S; X++) { T[o + X] = a / n; a += F[o + Math.min(S - 1, X + r + 1)] - F[o + Math.max(0, X - r)]; }
  }
  for (let X = 0; X < S; X++) {
    let a = 0;
    for (let y = -r; y <= r; y++) a += T[clamp(y, 0, S - 1) * S + X];
    for (let y = 0; y < S; y++) { F[y * S + X] = a / n; a += T[Math.min(S - 1, y + r + 1) * S + X] - T[Math.max(0, y - r) * S + X]; }
  }
  return F;
}
export const smoothField = (F: Float32Array, S: number, r: number) => boxBlur(boxBlur(boxBlur(F, S, r), S, r), S, r);

/** Sub-path of P covering [start, start+len) of its length (wraps around closed curves). */
export function window(P: Pts, start: number, len: number): Pts {
  const n = Math.max(2, Math.round(P.n * len)), a = Math.floor(P.n * start), X = new Float32Array(n), Y = new Float32Array(n);
  for (let k = 0; k < n; k++) { const j = (a + k) % P.n; X[k] = P.X[j]; Y[k] = P.Y[j]; }
  return { X, Y, n };
}
