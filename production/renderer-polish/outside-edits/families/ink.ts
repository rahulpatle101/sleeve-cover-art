// INK — contour & print (approved Ink A / Crop). Plate A prints the key contour; plate B prints the key contour
// misregistered by Phase + one secondary contour + ≤ 5 hairline echoes. Density = ink build-up, pressure, screened
// spread and edge breakup — never more complete curves. Artist and track are printed last in the shared type layer,
// fully above both plates, so Carbon and Newsprint have the same title-safe layer order.
import type { Ctx } from '../raster.ts';
import { makeCanvas, ctx2d, toPts, poly, pressure, mulberry, hash2, binTile, tile, softBlur, rgb, window } from '../raster.ts';
import { density } from '../composition.ts';
import { F } from '../fonts.ts';
import { setFont, fitSize, balance, setTracking } from '../text.ts';
import type { G, Quality } from './types.ts';

function paper(x: Ctx, G: G, q: Quality) {
  const { S, set } = G;
  x.fillStyle = set.stock;
  x.fillRect(0, 0, S, S);
  if (q === 'draft') return;
  const dark = set.blend !== 'multiply';
  const t = makeCanvas(256), tx = ctx2d(t);
  tx.fillStyle = dark ? '#3a3a3e' : '#6b6358';
  tx.fillRect(0, 0, 256, 256);
  tx.globalCompositeOperation = 'destination-in';
  tx.drawImage(binTile(G.r.seed, 0.35) as CanvasImageSource, 0, 0);
  x.save();
  x.globalAlpha = dark ? 0.35 : 0.06;
  x.globalCompositeOperation = dark ? 'source-over' : 'multiply';
  tile(x, t, S, Math.max(1, Math.round(S / 384)));
  x.restore();
}

/** Display: Big Shoulders Display Black, uppercase, bottom of the letters cropped by the trim (≈ 5 % of size). */
function displayName(x: Ctx, G: G) {
  const { S, r, set } = G;
  const txt = r.artist.trim().toUpperCase();
  if (!txt) return;
  const maxW = 0.94 * S;
  const L = balance(x, txt, 900, F.inkDisplay, 0.3 * S, maxW, 'normal', -0.01);
  const size = Math.min(...L.map((l) => fitSize(x, l, 900, F.inkDisplay, L.length > 1 ? 0.2 * S : 0.3 * S, 0.09 * S, maxW, 'normal', -0.01)));
  setFont(x, 900, size, F.inkDisplay, 'normal', -0.01);
  x.fillStyle = set.display;
  x.textAlign = 'left';
  x.textBaseline = 'alphabetic';
  L.forEach((l, i) => x.fillText(l, 0.035 * S, S + size * 0.05 - (L.length - 1 - i) * size * 0.9));
  setTracking(x, 0);
}

/** Track line only (no metadata on covers): Space Mono, right-aligned top-right, on a small clear panel. */
export function inkNotationLayout(x: Ctx, G: G) {
  const { S, r } = G;
  const t = r.track.trim().toUpperCase();
  const size = t ? fitSize(x, t, 400, F.inkNotation, 0.024 * S, 0.016 * S, 0.6 * S, 'normal', 0.06) : 0.024 * S;
  const lines = t ? [t] : [];
  setFont(x, 400, size, F.inkNotation, 'normal', 0.06);
  const w = lines.length ? Math.max(...lines.map((l) => x.measureText(l).width)) : 0;
  setTracking(x, 0);
  const right = 0.95 * S, top = 0.075 * S;
  return { lines, size, right, top, panel: lines.length ? { x: right - w - 0.014 * S, y: top - size * 1.2, w: w + 0.028 * S, h: size * 1.75 } : null };
}

export function inkArt(x: Ctx, G: G, q: Quality) {
  const { S, r, set, trs, place } = G, d = r.density, D = density.ink(d), base = Math.max(1, 0.0026 * S);
  paper(x, G, q);
  const key = toPts(trs[0], place);
  const second = G.N > 1 ? toPts(trs[Math.min(G.N - 1, Math.max(1, Math.round(G.N * 0.35)))], place) : null;
  const echoes = Array.from({ length: D.echoes }, (_, e) => toPts(trs[Math.round(1 + ((e + 1) * (G.N - 2)) / (D.echoes + 1))], place));
  const plates = [
    { col: set.plates![0], paths: [key], echoes: [] as typeof echoes, k: 0 },
    { col: set.plates![1], paths: second ? [key, second] : [key], echoes, k: 1 },
  ];
  const note = inkNotationLayout(x, G);
  for (const [pi, pl] of plates.entries()) {
    const L = makeCanvas(S), lx = ctx2d(L);
    lx.save();
    if (pl.k === 1) lx.translate(G.reg.dx, G.reg.dy);
    lx.lineCap = lx.lineJoin = 'round';
    if (q === 'draft') {
      lx.strokeStyle = rgb(pl.col);
      pl.paths.forEach((P, ci) => { lx.lineWidth = base * (ci === 0 ? (pi === 0 ? 2.2 : 1.5) : 0.9); poly(lx, P); lx.stroke(); });
      pl.echoes.forEach((P) => { lx.lineWidth = base * 0.45; lx.globalAlpha = 0.5; poly(lx, P); lx.stroke(); lx.globalAlpha = 1; });
      if (pi === 0) { lx.lineWidth = base * 4.2; poly(lx, window(key, G.emph.start, G.emph.len)); lx.stroke(); }
      lx.restore();
    } else {
      // ink spread: an absorbed halo that becomes a screened tint
      const spread = base * D.spread;
      const H = makeCanvas(S), hx = ctx2d(H);
      hx.save(); if (pl.k === 1) hx.translate(G.reg.dx, G.reg.dy);
      hx.lineCap = hx.lineJoin = 'round'; hx.strokeStyle = 'rgba(0,0,0,0.42)'; hx.lineWidth = base * 1.4 + spread;
      pl.paths.forEach((P) => { poly(hx, P); hx.stroke(); }); hx.restore();
      lx.restore();
      lx.drawImage(softBlur(H, spread * 0.55) as CanvasImageSource, 0, 0);
      lx.save(); if (pl.k === 1) lx.translate(G.reg.dx, G.reg.dy); lx.lineCap = 'round';
      // impressions: the same contour pressed 1…5 times (seeded jitter + pressure) → build-up
      pl.paths.forEach((P, ci) => {
        const w0 = base * (ci === 0 ? (pi === 0 ? 2.2 : 1.5) : 0.9);
        for (let m = 0; m < D.impressions; m++) {
          const rr = mulberry(r.seed + pi * 131 + ci * 17 + m * 7), jx = (rr() - 0.5) * 0.0014 * S, jy = (rr() - 0.5) * 0.0014 * S, pr = pressure(r.seed + pi * 31 + ci * 5 + m);
          lx.strokeStyle = `rgba(0,0,0,${m === 0 ? 1 : 0.55})`;
          for (let j = 0; j < P.n - 2; j += 2) {
            lx.lineWidth = Math.max(0.6, w0 * (1 - D.pressureRange + 2 * D.pressureRange * pr(j / P.n)));
            lx.beginPath(); lx.moveTo(P.X[j] + jx, P.Y[j] + jy); lx.lineTo(P.X[j + 2] + jx, P.Y[j + 2] + jy); lx.stroke();
          }
        }
      });
      pl.echoes.forEach((P, e) => { lx.strokeStyle = `rgba(0,0,0,${0.55 - e * 0.06})`; lx.lineWidth = base * 0.45; poly(lx, P); lx.stroke(); });
      // curve emphasis: a seeded stretch of the key contour pressed hard (plate A)
      if (pi === 0) { lx.strokeStyle = '#000'; lx.lineWidth = base * 4.2; poly(lx, window(key, G.emph.start, G.emph.len)); lx.stroke(); }
      lx.restore();
      // stochastic screen: solids stay solid, tints become dots
      const im = lx.getImageData(0, 0, S, S), Dd = im.data, cell = Math.max(1, Math.round(S / 2000)), seed = r.seed + 501 + pi;
      for (let y = 0, qq = 0; y < S; y++) for (let X = 0; X < S; X++, qq += 4) {
        const a = Dd[qq + 3] / 255; if (!a) continue;
        if (a > hash2((X / cell) | 0, (y / cell) | 0, seed) * 0.94 + 0.03) { Dd[qq] = pl.col[0]; Dd[qq + 1] = pl.col[1]; Dd[qq + 2] = pl.col[2]; Dd[qq + 3] = 255; } else Dd[qq + 3] = 0;
      }
      lx.putImageData(im, 0, 0);
      // paper tooth + edge breakup (grows with Density)
      lx.globalCompositeOperation = 'destination-out';
      tile(lx, binTile(r.seed + 77 + pi, 0.12), S, Math.max(1, Math.round(S / 256)));
      lx.globalAlpha = 0.85; tile(lx, binTile(r.seed + 91 + pi, D.breakup, 128), S, Math.max(1, Math.round(S / 384))); lx.globalAlpha = 1;
      lx.globalCompositeOperation = 'source-over';
    }
    // clear panel behind the notation (metadata stays crisp); never behind the display name
    if (note.panel) { lx.save(); lx.globalCompositeOperation = 'destination-out'; lx.fillStyle = '#000'; lx.fillRect(note.panel.x, note.panel.y, note.panel.w, note.panel.h); lx.restore(); }
    x.save(); x.globalCompositeOperation = set.blend === 'multiply' ? 'multiply' : 'source-over'; x.drawImage(L as CanvasImageSource, 0, 0); x.restore();
  }
}

export function inkType(x: Ctx, G: G) {
  displayName(x, G);
  const n = inkNotationLayout(x, G);
  setFont(x, 400, n.size, F.inkNotation, 'normal', 0.06);
  x.fillStyle = G.set.notation; x.textAlign = 'right'; x.textBaseline = 'alphabetic';
  n.lines.forEach((l, i) => x.fillText(l, n.right, n.top + i * n.size * 1.45));
  setTracking(x, 0); x.textAlign = 'left';
}
