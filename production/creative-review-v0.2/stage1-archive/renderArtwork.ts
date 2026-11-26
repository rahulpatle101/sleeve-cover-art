// The one renderer shared by preview and export: (recipe, width, height) -> drawing.
// v0.2 optical press: paper stock → deterministic paper texture → plate A (key) → plate B (second
// pass, carries Phase-driven misregistration) → imposition furniture → type. Everything is sized in
// fractions of the cover side S, so the preview and the 3000 × 3000 export compose identically.
import type { ArtworkRecipeV1 } from '../instrument/recipe.ts';
import { PALETTES, type PressSet } from './palettes.ts';
import { traces, boundingBox, MAX_SEGMENTS, type Trace } from './geometry.ts';
import { registration, artPlacement, typeLayout, colophonLines, GATE, FIELD, type Placement, type TextSlot } from './composition.ts';
import { mulberry32 } from '../instrument/remix.ts';

export const FONT_STACK = '"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif';

type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

const gcdInt = (a: number, b: number): number => (b === 0 ? a : gcdInt(b, a % b));

const pressSet = (r: ArtworkRecipeV1): PressSet => PALETTES[r.palette] ?? PALETTES[0];

function setFont(ctx: Ctx, weight: number, px: number) {
  ctx.font = `${weight} ${px}px ${FONT_STACK}`;
}

function setTracking(ctx: Ctx, px: number) {
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D).letterSpacing = `${px.toFixed(2)}px`;
}

/** Shrink to fit, then truncate with an ellipsis if still too wide. */
function fitText(ctx: Ctx, text: string, weight: number, size: number, min: number, maxW: number, tracking = 0) {
  setFont(ctx, weight, size);
  setTracking(ctx, tracking * size);
  let w = ctx.measureText(text).width;
  if (w > maxW) {
    size = Math.max(min, (size * maxW) / w);
    setFont(ctx, weight, size);
    setTracking(ctx, tracking * size);
    w = ctx.measureText(text).width;
  }
  let t = text;
  while (w > maxW && t.length > 1) {
    t = t.slice(0, -1);
    w = ctx.measureText(t.trimEnd() + '…').width;
  }
  return { text: t === text ? t : t.trimEnd() + '…', size };
}

/** Two balanced lines within [min, max] size, or null when one line fits or no split works. */
function wrapTwoLines(ctx: Ctx, text: string, slot: TextSlot, S: number) {
  if (!slot.wrap) return null;
  setFont(ctx, 300, slot.size * S);
  if (ctx.measureText(text).width <= slot.maxW * S) return null;
  const words = text.split(' ');
  if (words.length < 2) return null;
  let best: { lines: [string, string]; w: number } | null = null;
  for (let k = 1; k < words.length; k++) {
    const lines: [string, string] = [words.slice(0, k).join(' '), words.slice(k).join(' ')];
    const w = Math.max(ctx.measureText(lines[0]).width, ctx.measureText(lines[1]).width);
    if (!best || w < best.w) best = { lines, w };
  }
  if (!best) return null;
  const size = Math.min(slot.wrap[1] * S, (slot.size * S * slot.maxW * S) / best.w);
  return size >= slot.wrap[0] * S ? { lines: best.lines, size } : null;
}

/** Width of `text` at the slot's minimum size, in tracked capitals and in mixed case. */
function trackFits(ctx: Ctx, text: string, slot: TextSlot, S: number) {
  setFont(ctx, 600, slot.min * S);
  setTracking(ctx, 0.14 * slot.min * S);
  const caps = ctx.measureText(text.toUpperCase()).width <= slot.maxW * S;
  setTracking(ctx, 0.02 * slot.min * S);
  const mixed = ctx.measureText(text).width <= slot.maxW * S;
  setTracking(ctx, 0);
  return { caps, mixed };
}

/** Track label: tracked capitals when they fit; otherwise mixed case (narrower) before any ellipsis. */
function drawTrack(ctx: Ctx, text: string, slot: TextSlot, S: number, color: string) {
  const { caps } = trackFits(ctx, text, slot, S);
  if (caps) drawSlot(ctx, text.toUpperCase(), slot, S, 600, color, 0.14);
  else drawSlot(ctx, text, slot, S, 600, color, 0.02);
}

// ---------------------------------------------------------------------------------------------
// Paper texture: a deterministic noise tile from the recipe seed, tiled 6 × 6 across the sheet,
// so its grain scales with the cover exactly like the line work (preview ≡ export composition).

const TILE = 192;
let tileCache: { seed: number; canvas: AnyCanvas } | null = null;

function makeCanvas(w: number, h: number): AnyCanvas {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function paperTile(seed: number): AnyCanvas {
  if (tileCache && tileCache.seed === seed) return tileCache.canvas;
  const rnd = mulberry32(seed ^ 0x9e3779b9);
  const c = makeCanvas(TILE, TILE);
  const x = c.getContext('2d') as Ctx;
  const img = x.createImageData(TILE, TILE);
  // Fine tooth + a few fibres, centred on mid-grey so 'overlay' leaves paper colour intact.
  // Quantised to three levels and drawn as crisp cells: reads as paper, compresses as PNG.
  for (let i = 0; i < TILE * TILE; i++) {
    const q = rnd();
    const v = q < 0.22 ? 104 : q > 0.78 ? 152 : 128;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  for (let f = 0; f < 46; f++) {
    let px = rnd() * TILE, py = rnd() * TILE;
    const ang = rnd() * Math.PI, len = 6 + rnd() * 18, tone = rnd() < 0.5 ? -26 : 22;
    for (let s = 0; s < len; s++) {
      const ix = ((Math.round(px) % TILE) + TILE) % TILE, iy = ((Math.round(py) % TILE) + TILE) % TILE;
      const k = (iy * TILE + ix) * 4;
      img.data[k] = img.data[k + 1] = img.data[k + 2] = tone < 0 ? 92 : 164;
      px += Math.cos(ang);
      py += Math.sin(ang);
    }
  }
  x.putImageData(img, 0, 0);
  tileCache = { seed, canvas: c };
  return c;
}

function drawPaper(ctx: Ctx, set: PressSet, seed: number, S: number) {
  ctx.fillStyle = set.paper;
  ctx.fillRect(0, 0, S, S);
  const tile = paperTile(seed);
  const n = 6, step = S / n;
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = set.grain;
  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) ctx.drawImage(tile as CanvasImageSource, i * step, j * step, step + 0.5, step + 0.5);
  ctx.restore();
}

// ---------------------------------------------------------------------------------------------
// Plates. Passes = Density layers. Plate A (key) prints the even passes, heavier. Plate B prints the
// key contour plus the odd passes, finer, misregistered by Phase. Ink thins and fades as passes and
// curve complexity build, so maxima read as texture, not mass.

function strokePass(ctx: Ctx, tr: Trace, p: Placement) {
  ctx.beginPath();
  for (let j = 0; j < tr.length; j += 2) {
    const x = tr[j] * p.scale + p.tx;
    const y = tr[j + 1] * p.scale + p.ty;
    if (j === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawPlates(ctx: Ctx, recipe: ArtworkRecipeV1, set: PressSet, trs: Trace[], p: Placement, S: number) {
  const g = gcdInt(recipe.form, recipe.rhythm);
  const load = trs.length * (recipe.form / g + recipe.rhythm / g);
  const thin = Math.max(0.4, Math.sqrt(Math.min(1, 64 / load)));
  const fade = Math.max(0.55, Math.sqrt(Math.min(1, 96 / load)));
  const base = Math.max(1, 0.0021 * S * thin);
  const n = trs.length;
  const alphaOf = (i: number) => (0.95 - (0.6 * i) / Math.max(1, n - 1)) * (i === 0 ? 1 : fade);
  const reg = registration(recipe, S);
  const cx = S / 2, cy = S / 2;

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  set.plates.forEach((plate, k) => {
    ctx.save();
    ctx.globalCompositeOperation = plate.blend;
    ctx.strokeStyle = plate.ink;
    if (k === 1) {
      ctx.translate(cx + reg.dx, cy + reg.dy);
      ctx.rotate(reg.rot);
      ctx.translate(-cx, -cy);
    }
    for (let i = n - 1; i >= 0; i--) {
      const onPlate = k === 0 ? i % 2 === 0 : i % 2 === 1 || i === 0;
      if (!onPlate) continue;
      ctx.globalAlpha = alphaOf(i) * (k === 1 && i === 0 ? 0.9 : 1);
      ctx.lineWidth = k === 0 ? base * (i === 0 ? 2 : 1.25) : base * (i === 0 ? 1.15 : 0.85);
      strokePass(ctx, trs[i], p);
    }
    ctx.restore();
  });
}

function registrationMark(ctx: Ctx, x: number, y: number, r: number, color: string, lw: number) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.moveTo(x - r * 1.7, y);
  ctx.lineTo(x + r * 1.7, y);
  ctx.moveTo(x, y - r * 1.7);
  ctx.lineTo(x, y + r * 1.7);
  ctx.stroke();
  ctx.restore();
}

/** The full cover = art layer + type layer. Export and the settled preview use exactly this. */
export function renderArtwork(ctx: Ctx, recipe: ArtworkRecipeV1, width: number, height: number) {
  renderArtLayer(ctx, recipe, width, height);
  renderTypeLayer(ctx, recipe, width, height);
}

/** Paper, plates and imposition furniture. The preview crossfades only this layer. */
export function renderArtLayer(ctx: Ctx, recipe: ArtworkRecipeV1, width: number, height: number) {
  const S = Math.min(width, height);
  const set = pressSet(recipe);
  const imp = set.imposition;
  ctx.save();
  ctx.translate((width - S) / 2, (height - S) / 2);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  // Trim: bleed runs past the edge of the sheet, never past the cover square.
  ctx.beginPath();
  ctx.rect(0, 0, S, S);
  ctx.clip();
  drawPaper(ctx, set, recipe.seed, S);

  const trs = traces(recipe, MAX_SEGMENTS);
  const placement = artPlacement(imp, recipe, boundingBox(trs), S);
  const lw = Math.max(1, 0.0013 * S);

  if (imp === 'gate') {
    ctx.save();
    ctx.beginPath();
    ctx.arc(GATE.cx * S, GATE.cy * S, GATE.r * S, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = set.gateFill ?? set.paper;
    ctx.fillRect(0, 0, S, S);
    drawPlates(ctx, recipe, set, trs, placement, S);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = set.mark;
    ctx.lineWidth = lw * 1.2;
    ctx.beginPath();
    ctx.arc(GATE.cx * S, GATE.cy * S, GATE.r * S, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    registrationMark(ctx, 0.07 * S, 0.065 * S, 0.012 * S, set.mark, lw);
    registrationMark(ctx, 0.93 * S, 0.065 * S, 0.012 * S, set.mark, lw);
  } else {
    drawPlates(ctx, recipe, set, trs, placement, S);
  }

  if (imp === 'field') {
    // Signal banding across the field: fine, deterministic, paper-coloured scan lines.
    ctx.save();
    ctx.globalAlpha = 0.24;
    ctx.fillStyle = set.paper;
    const pitch = 0.006 * S, band = Math.max(1, 0.0022 * S);
    for (let y = (FIELD.y - 0.02) * S; y < (FIELD.y + FIELD.h + 0.02) * S; y += pitch) ctx.fillRect(0, y, S, band);
    ctx.restore();
  }
  if (imp === 'bleed') {
    const m = typeLayout(imp, recipe).mark!;
    registrationMark(ctx, m.x * S, m.y * S, 0.0095 * S, set.mark, lw);
  }
  ctx.restore();
}

function drawSlot(ctx: Ctx, text: string, slot: TextSlot, S: number, weight: number, color: string, tracking = 0) {
  const f = fitText(ctx, text, weight, slot.size * S, slot.min * S, slot.maxW * S, tracking);
  setFont(ctx, weight, f.size);
  setTracking(ctx, tracking * f.size);
  ctx.fillStyle = color;
  ctx.textAlign = slot.align;
  if (slot.rotate) {
    ctx.save();
    ctx.translate(slot.x * S, slot.baseline * S);
    ctx.rotate((slot.rotate * Math.PI) / 180);
    ctx.fillText(f.text, 0, 0);
    ctx.restore();
  } else {
    ctx.fillText(f.text, slot.x * S, slot.baseline * S);
  }
  setTracking(ctx, 0);
}

function drawArtist(ctx: Ctx, text: string, slot: TextSlot, S: number, color: string) {
  const wrapped = wrapTwoLines(ctx, text, slot, S);
  if (!wrapped) return drawSlot(ctx, text, slot, S, 300, color);
  setFont(ctx, 300, wrapped.size);
  setTracking(ctx, 0);
  ctx.fillStyle = color;
  ctx.textAlign = slot.align;
  const lead = wrapped.size * 1.04;
  const first = slot.wrapDir === 'down' ? (slot.wrapBaseline ?? slot.baseline) * S : slot.baseline * S - lead;
  ctx.fillText(wrapped.lines[0], slot.x * S, first);
  ctx.fillText(wrapped.lines[1], slot.x * S, first + lead);
}

/** Artist, track and colophon, always drawn crisply for the current recipe. Type sits on paper only. */
export function renderTypeLayer(ctx: Ctx, recipe: ArtworkRecipeV1, width: number, height: number) {
  const S = Math.min(width, height);
  const set = pressSet(recipe);
  const L = typeLayout(set.imposition, recipe);
  ctx.save();
  ctx.translate((width - S) / 2, (height - S) / 2);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.textBaseline = 'alphabetic';

  const artist = recipe.artist.trim();
  const track = recipe.track.trim();
  let aSlot = L.artist, tSlot = L.track;
  // Gate: if the track can't sit beside the artist even in mixed case, give each its own line.
  if (L.stacked && track && !trackFits(ctx, track, L.track, S).mixed) ({ artist: aSlot, track: tSlot } = L.stacked);
  if (artist) drawArtist(ctx, artist, aSlot, S, set.text);
  if (track) drawTrack(ctx, track, tSlot, S, set.track);

  const lines = colophonLines(recipe, L.colophon.lines);
  lines.forEach((line, i) => {
    const slot = { ...L.colophon, baseline: L.colophon.baseline + i * L.colophon.size * 1.45 };
    drawSlot(ctx, line, slot, S, 500, set.colophon, 0.12);
  });
  ctx.restore();
}

/** Kept for the panel's accessible description. */
export function ratioLabel(r: ArtworkRecipeV1) {
  return `${r.form}:${r.rhythm} · ${String(r.phase).padStart(3, '0')}°`;
}
