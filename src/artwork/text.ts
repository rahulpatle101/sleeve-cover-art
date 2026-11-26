// Shared text helpers for cover typography (fit, two-line balance, tracking).
import type { Ctx } from './raster.ts';
import { font } from './fonts.ts';

export function setTracking(x: Ctx, px: number) {
  if ('letterSpacing' in x) (x as CanvasRenderingContext2D).letterSpacing = `${px.toFixed(2)}px`;
}
export function setFont(x: Ctx, weight: number | string, px: number, family: string, style = 'normal', trackEm = 0) {
  x.font = font(weight, px, family, style);
  if ('fontKerning' in x) (x as CanvasRenderingContext2D).fontKerning = 'normal'; // apply the faces' kern pairs
  setTracking(x, trackEm * px);
}
/** Largest size ≤ `size` (≥ `min`) at which `text` fits `maxW`. */
export function fitSize(x: Ctx, text: string, weight: number | string, family: string, size: number, min: number, maxW: number, style = 'normal', trackEm = 0) {
  let s = size;
  for (;;) {
    setFont(x, weight, s, family, style, trackEm);
    if (x.measureText(text).width <= maxW || s <= min) return s;
    s = Math.max(min, s * 0.95);
  }
}
/** One line if it fits at `size`, else the most balanced two-line split by words. */
export function balance(x: Ctx, text: string, weight: number | string, family: string, size: number, maxW: number, style = 'normal', trackEm = 0): string[] {
  setFont(x, weight, size, family, style, trackEm);
  if (x.measureText(text).width <= maxW) return [text];
  const w = text.split(' ');
  if (w.length < 2) return [text];
  let best: { L: string[]; m: number } | null = null;
  for (let k = 1; k < w.length; k++) {
    const L = [w.slice(0, k).join(' '), w.slice(k).join(' ')];
    const m = Math.max(...L.map((l) => x.measureText(l).width));
    if (!best || m < best.m) best = { L, m };
  }
  return best!.L;
}
/** Truncate with an ellipsis only as a last resort. */
export function clip(x: Ctx, text: string, maxW: number) {
  if (x.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && x.measureText(t + '…').width > maxW) t = t.slice(0, -1);
  return t.trimEnd() + '…';
}
