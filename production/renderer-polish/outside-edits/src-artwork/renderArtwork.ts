// The one renderer shared by settled preview and export: (recipe, width, height, quality) -> drawing.
// v0.2: three approved families (Ink A / Crop, Light B / Lit Name, Matter Alt 1 + Alt 2), six production sets.
// Everything is sized in fractions of the cover side S, so the preview and the 3000 × 3000 export compose identically.
// 'draft' is a simplified version used only while the user is actively tuning; settled preview and export are 'full'.
import type { ArtworkRecipeV1 } from '../instrument/recipe.ts';
import { traces, boundingBox, MAX_SEGMENTS } from './geometry.ts';
import { registration, pressSet, placement, fitPlace, compose, compositionForSet, transformTrace, focusPoint } from './composition.ts';
import type { Ctx } from './raster.ts';
import type { G, Quality } from './families/types.ts';
import { inkArt, inkType } from './families/ink.ts';
import { lightArt, lightType } from './families/light.ts';
import { matterArt, matterType } from './families/matter.ts';

export type { Quality };

function prepare(r: ArtworkRecipeV1, S: number): G {
  const set = pressSet(r);
  const c = compositionForSet(set, r, compose(r));
  // The seed is the sole source of the bounded camera/deformation; no render-time randomness.
  const trs = traces(r, MAX_SEGMENTS).map((t) => transformTrace(t, c));
  // fit on the key contour only, so Density never re-frames the figure
  const box = boundingBox([trs[0]]);
  const p = placement(set, r, c);
  p.focus = focusPoint(trs[0], c, box);
  const place = fitPlace(box, S, p);
  return { r, set, S, trs, N: trs.length, reg: registration(r, S), place, emph: { start: c.emphStart, len: c.emphLen } };
}

function frame(ctx: Ctx, width: number, height: number, draw: (S: number) => void) {
  const S = Math.min(width, height);
  ctx.save();
  ctx.translate((width - S) / 2, (height - S) / 2);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.beginPath();
  ctx.rect(0, 0, S, S);
  ctx.clip();
  draw(Math.round(S));
  ctx.restore();
}

/** Stock, material and any display type that must interact with it (Ink overprint, Lit Name). Crossfaded in preview. */
export function renderArtLayer(ctx: Ctx, r: ArtworkRecipeV1, width: number, height: number, quality: Quality = 'full') {
  frame(ctx, width, height, (S) => {
    const g = prepare(r, S);
    if (g.set.family === 'ink') inkArt(ctx, g, quality);
    else if (g.set.family === 'light') lightArt(ctx, g, quality);
    else matterArt(ctx, g, quality);
  });
}

/** Crisp notation, track and catalog for the current recipe. Never crossfaded. */
export function renderTypeLayer(ctx: Ctx, r: ArtworkRecipeV1, width: number, height: number) {
  frame(ctx, width, height, (S) => {
    const g = prepare(r, S);
    if (g.set.family === 'ink') inkType(ctx, g);
    else if (g.set.family === 'light') lightType(ctx, g);
    else matterType(ctx, g);
  });
}

/** The full cover. Export and the settled preview use exactly this. */
export function renderArtwork(ctx: Ctx, r: ArtworkRecipeV1, width: number, height: number, quality: Quality = 'full') {
  renderArtLayer(ctx, r, width, height, quality);
  renderTypeLayer(ctx, r, width, height);
}

/** Kept for the panel's accessible description. */
export function ratioLabel(r: ArtworkRecipeV1) {
  return `${r.form}:${r.rhythm} · ${String(r.phase).padStart(3, '0')}°`;
}
