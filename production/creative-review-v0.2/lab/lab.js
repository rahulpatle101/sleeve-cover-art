// MATERIAL, WAVE & TYPOGRAPHY LAB — static study only (not app code). Runs inside the dev server page and only
// READS the app's geometry/composition modules. Every treatment is driven by the recipe:
//   Form/Rhythm → silhouette · Density → build-up / signal intensity · Phase → separation · seed → texture.
const { traces, boundingBox } = await import('/src/artwork/geometry.ts');
const { registration, artPlacement } = await import('/src/artwork/composition.ts');
const { validateRecipe } = await import('/src/instrument/recipe.ts');

// ---------- fonts (OFL, bundled in lab/fonts) ----------
const FD = '/production/creative-review-v0.2/lab/fonts/';
for (const [fam, file, desc] of [
  ['Anton', 'Anton-Regular.ttf', {}],
  ['Plex Mono', 'IBMPlexMono-Regular.ttf', { weight: '400' }],
  ['Plex Mono', 'IBMPlexMono-Medium.ttf', { weight: '500' }],
  ['Plex Sans', 'IBMPlexSans-VF.ttf', { weight: '100 700', stretch: '85% 100%' }],
  ['Inter', 'Inter-VF.ttf', { weight: '100 900' }],
  ['Archivo', 'Archivo-VF.ttf', { weight: '100 900', stretch: '62% 125%' }],
]) { const f = new FontFace(fam, `url(${FD}${file})`, desc); await f.load(); document.fonts.add(f); }
await document.fonts.ready;

// ---------- recipes ----------
const BASE = { seed: 0x01352905, artist: 'Mira Okafor', track: 'Tidewater', phase: 45, density: 10, palette: 0 };
const RH = validateRecipe({ ...BASE, mode: 'harmonic', form: 3, rhythm: 4 });
const RR = validateRecipe({ ...BASE, mode: 'radial', form: 3, rhythm: 2 });

// ---------- utilities ----------
const mk = (S) => { const c = document.createElement('canvas'); c.width = c.height = S; return c; };
const rng = (s) => () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hash2 = (x, y, s) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 2246822519); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (A, B, t) => A.map((v, i) => Math.round(lerp(v, B[i], t)));
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
// approved Spectrum ramp: ultramarine (outer) → neutral → amber (inner)
const ULTRA = [52, 92, 255], NEUT = [226, 228, 234], AMBER = [255, 168, 52];
const ramp = (t) => (t < 0.5 ? mix(ULTRA, NEUT, t * 2) : mix(NEUT, AMBER, (t - 0.5) * 2));

function geom(r, S) { const trs = traces(r, 4096); return { r, S, trs, box: boundingBox(trs), reg: registration(r, S), N: trs.length }; }
const onPlate = (k, i) => (k === 0 ? i % 2 === 0 : i % 2 === 1 || i === 0);
// plate transform: channel B carries the Phase-driven registration (scaled per material)
function plateXf(x, g, k, regScale = 1) { if (k !== 1) return; const S = g.S; x.translate(S / 2 + g.reg.dx * regScale, S / 2 + g.reg.dy * regScale); x.rotate(g.reg.rot * regScale); x.translate(-S / 2, -S / 2); }
function path(x, tr, p) { x.beginPath(); for (let j = 0; j < tr.length; j += 2) { const X = tr[j] * p.scale + p.tx, Y = tr[j + 1] * p.scale + p.ty; j ? x.lineTo(X, Y) : x.moveTo(X, Y); } }
const fall = (g, i, a, b) => a - (a - b) * i / Math.max(1, g.N - 1);

// smooth seeded 1-D noise along arc length (sum of 3 sines with seeded phases) → ink pressure
function pressure(seed) { const r = rng(seed); const ph = [r() * 6.28, r() * 6.28, r() * 6.28], fr = [3 + r() * 3, 11 + r() * 7, 31 + r() * 13];
  return (t) => 0.5 + 0.28 * Math.sin(fr[0] * 6.283 * t + ph[0]) + 0.14 * Math.sin(fr[1] * 6.283 * t + ph[1]) + 0.08 * Math.sin(fr[2] * 6.283 * t + ph[2]); }

// paper tooth: binary hole mask tile (seeded), drawn crisp so it reads as fibre/tooth and stays compressible
function toothTile(seed, density, T = 256) { const c = mk(T), x = c.getContext('2d'), im = x.createImageData(T, T); const r = rng(seed);
  for (let i = 0; i < T * T; i++) { const on = r() < density; im.data[i * 4 + 3] = on ? 255 : 0; } x.putImageData(im, 0, 0); return c; }
function tile(x, img, S, cells) { x.imageSmoothingEnabled = false; const step = S / cells; for (let i = 0; i < cells; i++) for (let j = 0; j < cells; j++) x.drawImage(img, i * step, j * step, step + 0.5, step + 0.5); x.imageSmoothingEnabled = true; }
function grain(x, S, amt, seed) { const im = x.getImageData(0, 0, S, S), d = im.data; for (let i = 0, p = 0; i < d.length; i += 4, p++) { const q = hash2(p % S, (p / S) | 0, seed); const n = q < 0.2 ? -amt : q > 0.8 ? amt : 0; d[i] += n; d[i + 1] += n; d[i + 2] += n; } x.putImageData(im, 0, 0); }

// ---------- placements per family composition ----------
function placeInk(g) { return artPlacement('bleed', { ...g.r, seed: 0 }, g.box, g.S); }
function placeLight(g, field = { x: 0.2, y: 0.26, w: 0.6, h: 0.46 }) { const S = g.S, b = g.box; const sc = Math.min(field.w * S / (b.maxX - b.minX), field.h * S / (b.maxY - b.minY));
  return { scale: sc, tx: (field.x + field.w / 2) * S - (b.minX + b.maxX) / 2 * sc, ty: (field.y + field.h / 2) * S - (b.minY + b.maxY) / 2 * sc }; }
function placeMatter(g) { return artPlacement('gate', g.r, g.box, g.S); }
const GATE = (S) => ({ x: 0.5 * S, y: 0.44 * S, r: 0.355 * S });
const LIGHT_DIR = [-0.7071, -0.7071];

// =====================================================================================================
// INK A — dry-ink ribbons: variable pressure width (seed), ink spread (blur under), paper tooth + broken edges
// (destination-out), two-plate multiply overprint, plate B misregistered by Phase. Density = ink build-up.
function inkRibbon(x, g, p, plateInks) {
  const S = g.S, base = Math.max(1, 0.0024 * S);
  plateInks.forEach((ink, k) => {
    const L = mk(S), lx = L.getContext('2d'); lx.save(); plateXf(lx, g, k); lx.lineCap = 'round';
    // ink spread: a soft halo under the ribbon (absorbed into the paper)
    lx.filter = `blur(${0.0016 * S}px)`; lx.strokeStyle = rgb(ink, 0.22);
    for (let i = g.N - 1; i >= 0; i--) if (onPlate(k, i)) { lx.lineWidth = base * 1.6; path(lx, g.trs[i], p); lx.stroke(); }
    lx.filter = 'none';
    for (let i = g.N - 1; i >= 0; i--) { if (!onPlate(k, i)) continue; const tr = g.trs[i], n = tr.length / 2, pr = pressure(g.r.seed + i * 977 + k * 31);
      const a = fall(g, i, 0.95, 0.55), w0 = base * (i === 0 ? 2.1 : 1.3) * (k === 1 ? 0.85 : 1);
      lx.strokeStyle = rgb(ink, a);
      for (let j = 0; j < n - 1; j += 2) { const t = j / n; lx.lineWidth = Math.max(0.6, w0 * (0.45 + 1.1 * pr(t)));
        lx.beginPath(); lx.moveTo(tr[j * 2] * p.scale + p.tx, tr[j * 2 + 1] * p.scale + p.ty); const jj = Math.min(n - 1, j + 2); lx.lineTo(tr[jj * 2] * p.scale + p.tx, tr[jj * 2 + 1] * p.scale + p.ty); lx.stroke(); } }
    lx.restore();
    // paper tooth shows through (fine holes) + broken edges (coarser dropout); seeded per plate
    lx.globalCompositeOperation = 'destination-out';
    tile(lx, toothTile(g.r.seed + 11 + k, 0.2), S, Math.round(S / 256)); // ≈1 px cells
    lx.globalAlpha = 0.7; tile(lx, toothTile(g.r.seed + 23 + k, 0.08, 128), S, Math.round(S / 384)); // ≈3 px cells: dry breaks
    lx.globalAlpha = 1; lx.globalCompositeOperation = 'source-over';
    x.save(); x.globalCompositeOperation = 'multiply'; x.drawImage(L, 0, 0); x.restore();
  });
}

// INK B — stochastic (FM) screening: each plate rendered as continuous tone, then thresholded per pixel against
// seeded noise → printed dots. Density raises tone → more dots (build-up). Plate B misregistered by Phase.
function inkScreen(x, g, p, plateInks) {
  const S = g.S, base = Math.max(1, 0.0024 * S), cell = Math.max(1, Math.round(S / 1500));
  plateInks.forEach((ink, k) => {
    const L = mk(S), lx = L.getContext('2d'); lx.save(); plateXf(lx, g, k); lx.lineCap = 'round'; lx.filter = `blur(${0.0011 * S}px)`;
    for (let i = g.N - 1; i >= 0; i--) { if (!onPlate(k, i)) continue; lx.strokeStyle = `rgba(0,0,0,${fall(g, i, 0.9, 0.45)})`; lx.lineWidth = base * (i === 0 ? 2.6 : 1.9); path(lx, g.trs[i], p); lx.stroke(); }
    lx.restore();
    const im = lx.getImageData(0, 0, S, S), d = im.data, seed = g.r.seed + 101 + k * 7;
    for (let y = 0, q = 0; y < S; y++) for (let X = 0; X < S; X++, q += 4) { const a = d[q + 3] / 255; const t = hash2((X / cell) | 0, (y / cell) | 0, seed) * 0.92 + 0.04;
      if (a > t) { d[q] = ink[0]; d[q + 1] = ink[1]; d[q + 2] = ink[2]; d[q + 3] = 255; } else d[q + 3] = 0; }
    lx.putImageData(im, 0, 0);
    x.save(); x.globalCompositeOperation = 'multiply'; x.drawImage(L, 0, 0); x.restore();
  });
}

// =====================================================================================================
// LIGHT A — spectral bands: broad low-energy bands stepped along the ramp + a hot core split into three
// wavelengths by the registration vector (aligned at 0/90/180/270 → white core; separated between).
function lightBands(x, g, p) {
  const S = g.S, base = Math.max(1, 0.0021 * S), sep = [g.reg.dx, g.reg.dy];
  x.save(); x.globalCompositeOperation = 'lighter';
  for (const k of [0, 1]) { x.save(); plateXf(x, g, k);
    x.filter = `blur(${0.006 * S}px)`; for (let i = g.N - 1; i >= 0; i--) if (onPlate(k, i)) { x.strokeStyle = rgb(ramp(i / (g.N - 1)), 0.075 * (0.6 + g.N / 30)); x.lineWidth = base * 7; path(x, g.trs[i], p); x.stroke(); }
    x.filter = `blur(${0.0014 * S}px)`; for (let i = g.N - 1; i >= 0; i--) if (onPlate(k, i)) { x.strokeStyle = rgb(ramp(i / (g.N - 1)), fall(g, i, 0.32, 0.12)); x.lineWidth = base * 1.6; path(x, g.trs[i], p); x.stroke(); }
    x.restore(); }
  x.filter = 'none';
  // hot core = key contour, three wavelengths; separation follows registration
  // wavelengths come from the approved ramp only (amber / neutral / ultramarine) — no green/cyan channel
  for (const [col, s] of [[AMBER, 1], [NEUT, 0], [ULTRA, -1]]) { x.save(); x.translate(sep[0] * s * 0.7, sep[1] * s * 0.7);
    x.strokeStyle = rgb(col, s === 0 ? 0.8 : 0.6); x.lineWidth = base * 0.9; path(x, g.trs[0], p); x.stroke(); x.restore(); }
  x.restore();
}

// LIGHT B — signal residue: thin cores + sparse seeded particles along each pass; warm/cool particles separate
// along the registration vector (wavelength separation); particle count rises with Density (signal intensity).
function lightResidue(x, g, p) {
  const S = g.S, base = Math.max(1, 0.0016 * S), r = rng(g.r.seed ^ 0x5eed);
  x.save(); x.globalCompositeOperation = 'lighter';
  for (const k of [0, 1]) { x.save(); plateXf(x, g, k); for (let i = g.N - 1; i >= 0; i--) if (onPlate(k, i)) { x.strokeStyle = rgb(ramp(i / (g.N - 1)), fall(g, i, 0.55, 0.18)); x.lineWidth = base * (i === 0 ? 1.2 : 0.6); path(x, g.trs[i], p); x.stroke(); } x.restore(); }
  const per = 40 + g.N * 14;
  for (let i = 0; i < g.N; i++) { const tr = g.trs[i], n = tr.length / 2, col = ramp(i / (g.N - 1)), warm = i / (g.N - 1) > 0.5 ? 1 : -1;
    for (let m = 0; m < per; m++) { const j = (r() * n) | 0, jx = (r() - 0.5) * 0.012 * S, jy = (r() - 0.5) * 0.012 * S;
      const X = tr[j * 2] * p.scale + p.tx + jx + g.reg.dx * warm * 0.9, Y = tr[j * 2 + 1] * p.scale + p.ty + jy + g.reg.dy * warm * 0.9;
      const rad = (0.0004 + r() * r() * 0.0016) * S; x.fillStyle = rgb(col, 0.25 + r() * 0.55); x.beginPath(); x.arc(X, Y, rad, 0, 6.283); x.fill(); } }
  x.restore();
}

// =====================================================================================================
// MATTER A — glass ribbons: translucent stacked bodies, one directional bright edge, darker opposite edge,
// restrained refraction (plate B at 55 % of the registration), cast depth, one caustic on the stock.
function matterGlass(x, g, p) {
  const S = g.S, G = GATE(S), LW = Math.max(1, 0.0021 * S), e = 0.0017 * S, L = LIGHT_DIR;
  const cg = x.createRadialGradient(0.66 * S, 0.78 * S, 0, 0.66 * S, 0.78 * S, 0.2 * S); cg.addColorStop(0, 'rgba(170,215,255,0.16)'); cg.addColorStop(1, 'rgba(120,170,255,0)');
  x.save(); x.translate(0.66 * S, 0.78 * S); x.scale(1.6, 0.55); x.rotate(-0.35); x.translate(-0.66 * S, -0.78 * S); x.fillStyle = cg; x.fillRect(0, 0, S, S); x.restore();
  x.save(); x.beginPath(); x.arc(G.x, G.y, G.r, 0, 7); x.clip();
  const disc = x.createLinearGradient(G.x - G.r, G.y - G.r, G.x + G.r, G.y + G.r); disc.addColorStop(0, '#2B54C4'); disc.addColorStop(1, '#10276E'); x.fillStyle = disc; x.fillRect(0, 0, S, S);
  const each = (k, off, style, rs = 1) => { x.save(); x.translate(off[0], off[1]); plateXf(x, g, k, rs); x.lineJoin = x.lineCap = 'round'; for (let i = g.N - 1; i >= 0; i--) if (onPlate(k, i)) { style(i); path(x, g.trs[i], p); x.stroke(); } x.restore(); };
  x.filter = `blur(${0.004 * S}px)`; each(0, [0.006 * S, 0.008 * S], (i) => { x.strokeStyle = `rgba(2,7,24,${fall(g, i, 0.42, 0.2)})`; x.lineWidth = LW * 3.4; }); x.filter = 'none';
  x.globalCompositeOperation = 'screen';
  each(0, [0, 0], (i) => { x.strokeStyle = `rgba(134,166,242,${fall(g, i, 0.24, 0.12)})`; x.lineWidth = LW * 4.2; });            // outer body
  each(0, [0, 0], (i) => { x.strokeStyle = `rgba(170,196,255,${fall(g, i, 0.14, 0.06)})`; x.lineWidth = LW * 1.8; });            // inner body (thickness)
  const dark = x.createLinearGradient(G.x - G.r, G.y - G.r, G.x + G.r, G.y + G.r); dark.addColorStop(0, 'rgba(10,22,64,0.15)'); dark.addColorStop(1, 'rgba(6,14,44,0.9)');
  x.globalCompositeOperation = 'multiply'; each(0, [-L[0] * e, -L[1] * e], (i) => { x.strokeStyle = dark; x.globalAlpha = fall(g, i, 0.9, 0.5); x.lineWidth = LW * 0.9; });
  const lit = x.createLinearGradient(G.x - G.r, G.y - G.r, G.x + G.r * 0.6, G.y + G.r * 0.6); lit.addColorStop(0, 'rgba(246,249,255,1)'); lit.addColorStop(0.55, 'rgba(210,225,255,0.45)'); lit.addColorStop(1, 'rgba(180,205,255,0)');
  x.globalCompositeOperation = 'screen'; each(0, [L[0] * e * 1.4, L[1] * e * 1.4], (i) => { x.strokeStyle = lit; x.globalAlpha = fall(g, i, 0.9, 0.35); x.lineWidth = LW * (i === 0 ? 0.75 : 0.5); });
  each(1, [0, 0], (i) => { x.strokeStyle = '#9FDCFF'; x.globalAlpha = fall(g, i, 0.3, 0.12); x.lineWidth = LW * 0.5; }, 0.55);
  x.restore(); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  x.lineWidth = 0.0016 * S; x.strokeStyle = 'rgba(220,232,255,0.6)'; x.beginPath(); x.arc(G.x, G.y, G.r, Math.PI * 0.95, Math.PI * 1.55); x.stroke();
  x.strokeStyle = 'rgba(4,10,34,0.65)'; x.beginPath(); x.arc(G.x, G.y, G.r, Math.PI * 1.95, Math.PI * 2.55); x.stroke();
}

// MATTER B — anisotropic brushed metal: each segment's brightness depends on its tangent vs the light
// (streaks appear where the brush direction is perpendicular to the light), plus fine striations along the
// stroke, bevel edges and a cast shadow. Brass channel B (registered) is the single accent.
function matterMetal(x, g, p) {
  const S = g.S, G = GATE(S), LW = Math.max(1, 0.0021 * S), e = 0.0017 * S, L = LIGHT_DIR, thL = Math.atan2(L[1], L[0]);
  x.save(); x.beginPath(); x.arc(G.x, G.y, G.r, 0, 7); x.clip();
  const disc = x.createRadialGradient(G.x - 0.1 * S, G.y - 0.12 * S, 0, G.x, G.y, G.r); disc.addColorStop(0, '#3A3C41'); disc.addColorStop(1, '#232428'); x.fillStyle = disc; x.fillRect(0, 0, S, S);
  const each = (k, off, style, rs = 1) => { x.save(); x.translate(off[0], off[1]); plateXf(x, g, k, rs); x.lineJoin = x.lineCap = 'round'; for (let i = g.N - 1; i >= 0; i--) if (onPlate(k, i)) { style(i); path(x, g.trs[i], p); x.stroke(); } x.restore(); };
  x.filter = `blur(${0.0035 * S}px)`; each(0, [0.007 * S, 0.009 * S], (i) => { x.strokeStyle = `rgba(11,11,13,${fall(g, i, 0.6, 0.3)})`; x.lineWidth = LW * 2.8; }); x.filter = 'none';
  const DARK = [58, 61, 66], HI = [244, 245, 247];
  for (let i = g.N - 1; i >= 0; i--) { if (!onPlate(0, i)) continue; const tr = g.trs[i], n = tr.length / 2, w = LW * (i === 0 ? 2.4 : 1.7), a = fall(g, i, 1, 0.6);
    for (const [off, ww, bias] of [[0, w, 0], [w * 0.22, w * 0.25, 0.08], [-w * 0.22, w * 0.25, -0.1]]) { // body + two brush striations
      for (let j = 0; j < n - 1; j += 2) { const x0 = tr[j * 2] * p.scale + p.tx, y0 = tr[j * 2 + 1] * p.scale + p.ty, jj = Math.min(n - 1, j + 2), x1 = tr[jj * 2] * p.scale + p.tx, y1 = tr[jj * 2 + 1] * p.scale + p.ty;
        const th = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(th), ny = Math.cos(th); const b = Math.min(1, Math.max(0, Math.pow(Math.abs(Math.sin(th - thL)), 7) * 0.95 + 0.08 + bias));
        x.strokeStyle = rgb(mix(DARK, HI, b), a); x.lineWidth = ww; x.beginPath(); x.moveTo(x0 + nx * off, y0 + ny * off); x.lineTo(x1 + nx * off, y1 + ny * off); x.stroke(); } } }
  each(0, [-L[0] * e, -L[1] * e], (i) => { x.strokeStyle = `rgba(20,20,23,${fall(g, i, 0.5, 0.22)})`; x.lineWidth = LW * 0.5; });
  each(1, [0, 0], (i) => { x.strokeStyle = `rgba(200,161,90,${fall(g, i, 0.75, 0.3)})`; x.lineWidth = LW * 0.55; });
  x.restore();
  x.lineWidth = 0.0022 * S; x.strokeStyle = 'rgba(232,234,238,0.55)'; x.beginPath(); x.arc(G.x, G.y, G.r, Math.PI * 0.95, Math.PI * 1.55); x.stroke();
  x.strokeStyle = 'rgba(8,8,10,0.75)'; x.beginPath(); x.arc(G.x, G.y, G.r, Math.PI * 1.95, Math.PI * 2.55); x.stroke();
}

// =====================================================================================================
// stocks
function stockInk(x, S, seed, carbon = false) { x.fillStyle = carbon ? '#18181A' : '#ECE5D6'; x.fillRect(0, 0, S, S); grain(x, S, carbon ? 8 : 10, seed); }
function stockLight(x, S) { x.fillStyle = '#08080B'; x.fillRect(0, 0, S, S); }
function stockGlass(x, S) { const g = x.createRadialGradient(0.45 * S, 0.38 * S, 0, 0.5 * S, 0.44 * S, 0.85 * S); g.addColorStop(0, '#1D3A98'); g.addColorStop(1, '#060D26'); x.fillStyle = g; x.fillRect(0, 0, S, S); }
function stockMetal(x, S) { const g = x.createLinearGradient(0, 0, 0, S); g.addColorStop(0, '#2C2D31'); g.addColorStop(1, '#1E1F22'); x.fillStyle = g; x.fillRect(0, 0, S, S); }

const TREAT = {
  inkRibbon: (x, g) => { stockInk(x, g.S, 1); inkRibbon(x, g, placeInk(g), [[226, 70, 42], [27, 26, 30]]); },
  inkScreen: (x, g) => { stockInk(x, g.S, 1); inkScreen(x, g, placeInk(g), [[226, 70, 42], [27, 26, 30]]); },
  lightBands: (x, g) => { stockLight(x, g.S); lightBands(x, g, placeLight(g)); grain(x, g.S, 4, 5); },
  lightResidue: (x, g) => { stockLight(x, g.S); lightResidue(x, g, placeLight(g, { x: 0.26, y: 0.3, w: 0.48, h: 0.38 })); grain(x, g.S, 4, 5); },
  matterGlass: (x, g) => { stockGlass(x, g.S); matterGlass(x, g, placeMatter(g)); grain(x, g.S, 5, 17); },
  matterMetal: (x, g) => { stockMetal(x, g.S); matterMetal(x, g, placeMatter(g)); grain(x, g.S, 5, 29); },
};

// =====================================================================================================
// TYPOGRAPHY — three family pairings, two faces per cover; catalog microcopy untreated.
function setF(x, css, stretch = 'normal') { x.font = css; x.fontStretch = stretch; x.fontKerning = 'normal'; }
function fit(x, text, css, size, min, maxW, stretch, track = 0) { let s = size; for (;;) { setF(x, css.replace('$', s), stretch); x.letterSpacing = `${track * s}px`; if (x.measureText(text).width <= maxW || s <= min) break; s = Math.max(min, s * 0.94); }
  let t = text; while (x.measureText(t).width > maxW && t.length > 1) t = t.slice(0, -1); return { text: t === text ? t : t.trimEnd() + '…', size: s }; }
function wrap2(x, text, css, size, maxW, stretch, track = 0) { setF(x, css.replace('$', size), stretch); x.letterSpacing = `${track * size}px`; if (x.measureText(text).width <= maxW) return null;
  const w = text.split(' '); if (w.length < 2) return null; let best = null; for (let k = 1; k < w.length; k++) { const L = [w.slice(0, k).join(' '), w.slice(k).join(' ')]; const m = Math.max(...L.map((l) => x.measureText(l).width)); if (!best || m < best.m) best = { L, m }; }
  return { lines: best.L, size: Math.min(size, size * maxW / best.m) }; }
const CAT = (r, fam) => [`${fam}`, `PLATE ${r.seed.toString(16).padStart(8, '0').toUpperCase()}`, `${r.mode.toUpperCase()} ${r.form}:${r.rhythm}`, `Φ ${String(r.phase).padStart(3, '0')}° · ${Math.abs(Math.sin(2 * r.phase * Math.PI / 180)) < 1e-6 ? 'IN' : 'OFF'} REGISTER`, `${r.density} PASSES`];
function catalog(x, lines, X, Y, size, color, align) { setF(x, `400 ${size}px "Plex Mono"`); x.letterSpacing = `${0.04 * size}px`; x.fillStyle = color; x.textAlign = align; lines.forEach((l, i) => x.fillText(l, X, Y + i * size * 1.45)); x.letterSpacing = '0px'; }

// INK — Anton (condensed display) + IBM Plex Mono. Large type receives restrained ink treatment: tooth
// dropout + a vermilion overprint plate offset by the registration (half strength). Metadata stays crisp.
function typeInk(x, g, carbon = false, artist = g.r.artist, track = g.r.track) {
  const S = g.S, ink = carbon ? '#EDEAE3' : '#1B1A1E', acc = carbon ? '#FF4E1C' : '#E2462A', maxW = 0.86 * S;
  const L = mk(S), lx = L.getContext('2d'); lx.textAlign = 'right'; lx.textBaseline = 'alphabetic';
  const w2 = wrap2(lx, artist, '400 $px "Anton"', 0.17 * S, maxW, 'normal', 0.005);
  const lines = w2 ? w2.lines : [fit(lx, artist, '400 $px "Anton"', 0.17 * S, 0.07 * S, maxW, 'normal', 0.005).text];
  const size = w2 ? w2.size : fit(lx, artist, '400 $px "Anton"', 0.17 * S, 0.07 * S, maxW, 'normal', 0.005).size;
  const base = 0.935 * S;
  const draw = (ctx, color, dx, dy) => { setF(ctx, `400 ${size}px "Anton"`); ctx.letterSpacing = `${0.005 * size}px`; ctx.fillStyle = color; ctx.textAlign = 'right';
    lines.forEach((l, i) => ctx.fillText(l, 0.93 * S + dx, base - (lines.length - 1 - i) * size * 0.98 + dy)); };
  draw(lx, acc, g.reg.dx * 0.5, g.reg.dy * 0.5);                 // overprint plate (registration-driven)
  lx.globalCompositeOperation = carbon ? 'source-over' : 'multiply'; draw(lx, ink, 0, 0);
  lx.globalCompositeOperation = 'destination-out'; lx.globalAlpha = 0.55; tile(lx, toothTile(g.r.seed + 77, 0.07), S, Math.round(S / 256));
  x.drawImage(L, 0, 0);
  const tTop = base - lines.length * size * 0.98 - 0.012 * S;
  const tr = fit(x, track.toUpperCase(), '500 $px "Plex Mono"', 0.03 * S, 0.022 * S, maxW, 'normal', 0.08);
  setF(x, `500 ${tr.size}px "Plex Mono"`); x.letterSpacing = `${0.08 * tr.size}px`; x.fillStyle = ink; x.textAlign = 'right'; x.fillText(tr.text, 0.93 * S, tTop); x.letterSpacing = '0px';
  setF(x, `400 ${0.075 * S}px "Anton"`); x.fillStyle = acc; x.textAlign = 'right'; x.fillText(carbon ? '02' : '01', 0.93 * S, 0.11 * S);
  catalog(x, CAT(g.r, 'INK'), 0.93 * S, 0.15 * S, 0.0165 * S, carbon ? '#B9B7B0' : '#4A4842', 'right');
}

// LIGHT — Inter (display, light) + IBM Plex Mono. Optical treatment on the large name only: three-wavelength
// separation following the registration vector (zero at the detents). No glow around type.
function typeLight(x, g, artist = g.r.artist, track = g.r.track) {
  const S = g.S, maxW = 0.86 * S, sep = [g.reg.dx * 0.15, g.reg.dy * 0.15];
  x.textAlign = 'left'; x.textBaseline = 'alphabetic';
  const w2 = wrap2(x, artist, '300 $px "Inter"', 0.095 * S, maxW, 'normal', -0.02);
  const lines = w2 ? w2.lines : [fit(x, artist, '300 $px "Inter"', 0.095 * S, 0.05 * S, maxW, 'normal', -0.02).text];
  const size = w2 ? w2.size : fit(x, artist, '300 $px "Inter"', 0.095 * S, 0.05 * S, maxW, 'normal', -0.02).size;
  const base = 0.925 * S;
  x.save(); x.globalCompositeOperation = 'lighter';
  // neutral body + faint amber / ultramarine fringes that exist only off register
  for (const [c, s, a] of [[AMBER, 1, 0.55], [ULTRA, -1, 0.55], [[238, 240, 244], 0, 1]]) { setF(x, `300 ${size}px "Inter"`); x.letterSpacing = `${-0.02 * size}px`; x.fillStyle = rgb(c, a);
    lines.forEach((l, i) => x.fillText(l, 0.07 * S + sep[0] * s, base - (lines.length - 1 - i) * size * 1.02 + sep[1] * s)); }
  x.restore(); x.letterSpacing = '0px';
  // track lives in its own column (left of the catalog); long titles wrap to two lines instead of colliding
  const tW = 0.56 * S, tw2 = wrap2(x, track.toUpperCase(), '500 $px "Inter"', 0.03 * S, tW, 'normal', 0.16);
  const tLines = tw2 ? tw2.lines : [fit(x, track.toUpperCase(), '500 $px "Inter"', 0.03 * S, 0.022 * S, tW, 'normal', 0.16).text];
  const tSize = tw2 ? Math.max(0.022 * S, tw2.size) : fit(x, track.toUpperCase(), '500 $px "Inter"', 0.03 * S, 0.022 * S, tW, 'normal', 0.16).size;
  setF(x, `500 ${tSize}px "Inter"`); x.letterSpacing = `${0.16 * tSize}px`; x.fillStyle = '#FFC27A'; x.textAlign = 'left'; tLines.forEach((l, i) => x.fillText(l, 0.07 * S, 0.1 * S + i * tSize * 1.35)); x.letterSpacing = '0px';
  catalog(x, CAT(g.r, 'LIGHT · 03'), 0.93 * S, 0.075 * S, 0.0165 * S, '#8C8F9C', 'right');
}

// MATTER — Archivo (extra-expanded display) + IBM Plex Sans. Large name gets a restrained physical bevel
// (lit edge toward the light, shade opposite) — no chrome fill. Catalog untreated.
function typeMatter(x, g, metal = false, artist = g.r.artist, track = g.r.track) {
  const S = g.S, maxW = 0.86 * S, face = metal ? '#ECEAE5' : '#F1F4FB';
  x.textAlign = 'left'; x.textBaseline = 'alphabetic';
  const css = '500 $px "Archivo"', st = 'extra-expanded';
  const w2 = wrap2(x, artist, css, 0.064 * S, maxW, st, 0.01);
  const lines = w2 ? w2.lines : [fit(x, artist, css, 0.064 * S, 0.034 * S, maxW, st, 0.01).text];
  const size = w2 ? w2.size : fit(x, artist, css, 0.064 * S, 0.034 * S, maxW, st, 0.01).size;
  const base = 0.935 * S, d = Math.max(1, 0.0012 * S);
  const draw = (color, dx, dy) => { setF(x, `500 ${size}px "Archivo"`, st); x.letterSpacing = `${0.01 * size}px`; x.fillStyle = color; lines.forEach((l, i) => x.fillText(l, 0.07 * S + dx, base - (lines.length - 1 - i) * size * 1.08 + dy)); };
  draw('rgba(0,0,0,0.55)', d, d); draw('rgba(255,255,255,0.55)', -d * 0.6, -d * 0.6); draw(face, 0, 0); x.letterSpacing = '0px';
  const trTop = base - lines.length * size * 1.08 - 0.008 * S;
  const tr = fit(x, track.toUpperCase(), '500 $px "Plex Sans"', 0.028 * S, 0.02 * S, maxW, 'normal', 0.14);
  setF(x, `500 ${tr.size}px "Plex Sans"`); x.letterSpacing = `${0.14 * tr.size}px`; x.fillStyle = metal ? '#C8A15A' : '#A9C6FF'; x.fillText(tr.text, 0.07 * S, trTop); x.letterSpacing = '0px';
  setF(x, `400 ${0.0165 * S}px "Plex Sans"`); x.letterSpacing = `${0.12 * 0.0165 * S}px`; x.fillStyle = metal ? '#9A9DA4' : '#A9BCEB'; x.textAlign = 'center';
  x.fillText(CAT(g.r, metal ? 'MATTER · 06' : 'MATTER · 05').join('  ·  ').replace(/ · /g, ' '), 0.5 * S, 0.058 * S); x.letterSpacing = '0px'; x.textAlign = 'left';
}

// =====================================================================================================
const out = {}, perf = {};
const save = (k, c) => { out[k] = c.toDataURL('image/png'); };
const crop = (c, sx, sy, w, h) => { const t = mk(w); t.height = h; t.getContext('2d').drawImage(c, sx, sy, w, h, 0, 0, w, h); return t; };
const time = (k, S, fn) => { const t0 = performance.now(); fn(); const ms = performance.now() - t0; perf[k] = perf[k] || {}; perf[k][S] = Math.round(ms); };

// 1+2+4: six treatments × Harmonic/Radial at 3000; true 1:1 crops from the Harmonic renders
const full = {};
for (const [name, fn] of Object.entries(TREAT)) for (const [mode, r] of [['H', RH], ['R', RR]]) {
  const S = 3000, c = mk(S), x = c.getContext('2d'), g = geom(r, S); time(name, 3000, () => { fn(x, g); x.getImageData(0, 0, 1, 1); }); full[name + mode] = c; }
for (const name of Object.keys(TREAT)) { const S = 1468, c = mk(S), x = c.getContext('2d'), g = geom(RH, S); time(name, 1468, () => { TREAT[name](x, g); x.getImageData(0, 0, 1, 1); }); }
const cropAt = { inkRibbon: [900, 1050], inkScreen: [900, 1050], lightBands: [1100, 900], lightResidue: [1100, 950], matterGlass: [1100, 800], matterMetal: [1100, 800] };
for (const [k, [sx, sy]] of Object.entries(cropAt)) save('crop-100pct-' + k, crop(full[k + 'H'], sx, sy, 800, 800));
{ const cell = 520, pad = 18, head = 64, lab = 30; const fams = [['INK', ['inkRibbon', 'Dry-ink ribbon'], ['inkScreen', 'Stochastic screen']], ['LIGHT', ['lightBands', 'Spectral bands'], ['lightResidue', 'Signal residue']], ['MATTER', ['matterGlass', 'Glass ribbon'], ['matterMetal', 'Brushed metal']]];
  const sh = mk(1); sh.width = 4 * cell + 5 * pad; sh.height = head + 3 * (cell + lab + pad) + 40; const x = sh.getContext('2d'); x.fillStyle = '#ECEBE7'; x.fillRect(0, 0, sh.width, sh.height); x.imageSmoothingQuality = 'high';
  setF(x, '600 15px "Plex Mono"'); x.fillStyle = '#5A5A60'; ['A · Harmonic 3:4', 'A · Radial 3:2', 'B · Harmonic 3:4', 'B · Radial 3:2'].forEach((t, i) => x.fillText(t, pad + i * (cell + pad), 44));
  fams.forEach(([fam, a, b], ri) => { const Y = head + ri * (cell + lab + pad); [[a, 'H'], [a, 'R'], [b, 'H'], [b, 'R']].forEach(([[k, nm], m], ci) => { const X = pad + ci * (cell + pad); x.drawImage(full[k + m], X, Y, cell, cell);
    setF(x, '600 14px "Plex Mono"'); x.fillStyle = '#141416'; x.fillText(`${fam} · ${nm}`, X, Y + cell + 20); }); });
  setF(x, '500 13px "Plex Mono"'); x.fillStyle = '#5A5A60'; x.fillText('Same recipe family: Φ 045° · 10 passes · seed 01352905. Harmonic 3:4 / Radial 3:2. No type on treatment tests.', pad, sh.height - 14);
  save('family-treatments-sheet', sh); }

// 5: registration sequence 0→90° (strongest treatment per family), with 1:1 detail strip
const SEQ = [0, 22, 45, 67, 90];
{ const S = 1000, cell = 360, pad = 14, rows = [['INK · dry ribbon (misregistration)', 'inkRibbon'], ['LIGHT · spectral bands (wavelength separation)', 'lightBands'], ['MATTER · glass (refraction)', 'matterGlass']];
  const sh = mk(1); sh.width = SEQ.length * (cell + pad) + pad; sh.height = rows.length * (cell * 2 + 60 + pad) + 20; const x = sh.getContext('2d'); x.fillStyle = '#ECEBE7'; x.fillRect(0, 0, sh.width, sh.height);
  rows.forEach(([title, k], ri) => { const Y0 = 10 + ri * (cell * 2 + 60 + pad); setF(x, '600 15px "Plex Mono"'); x.fillStyle = '#141416'; x.fillText(title, pad, Y0 + 18);
    SEQ.forEach((ph, ci) => { const r = validateRecipe({ ...RH, phase: ph }), g = geom(r, S), c = mk(S), cx = c.getContext('2d'); TREAT[k](cx, g); const X = pad + ci * (cell + pad);
      x.drawImage(c, X, Y0 + 30, cell, cell); x.drawImage(c, 330, 380, cell, cell, X, Y0 + 40 + cell, cell, cell);
      setF(x, '500 12px "Plex Mono"'); x.fillStyle = '#5A5A60'; const off = Math.hypot(g.reg.dx, g.reg.dy) * 3; x.fillText(`Φ ${ph}° · ${off < 0.01 ? 'IN REGISTER' : 'offset ' + off.toFixed(1) + ' px @3000'}`, X, Y0 + 54 + cell * 2); }); });
  save('registration-sequence', sh); }

// 3: typography specimen — three pairings × (normal / long / uppercase), on their family stock
{ const cases = [['Mira Okafor', 'Tidewater'], ['The Extraordinarily Long Artist Collective', 'Songs For The Long Drive Home (Extended Mix)'], ['NIGHT OFFICE', 'PHASE GARDEN']];
  const rows = [['INK · Anton + IBM Plex Mono', (x, g, a, t) => { stockInk(x, g.S, 1); typeInk(x, g, false, a, t); }],
                ['LIGHT · Inter + IBM Plex Mono', (x, g, a, t) => { stockLight(x, g.S); typeLight(x, g, a, t); }],
                ['MATTER · Archivo Expanded + IBM Plex Sans', (x, g, a, t) => { stockMetal(x, g.S); typeMatter(x, g, true, a, t); }]];
  const S = 1200, cell = 600, pad = 18; const sh = mk(1); sh.width = 3 * (cell + pad) + pad; sh.height = rows.length * (cell + 46 + pad) + 20; const x = sh.getContext('2d'); x.fillStyle = '#ECEBE7'; x.fillRect(0, 0, sh.width, sh.height);
  rows.forEach(([title, fn], ri) => { const Y = 10 + ri * (cell + 46 + pad); setF(x, '600 15px "Plex Mono"'); x.fillStyle = '#141416'; x.fillText(title, pad, Y + 20);
    cases.forEach(([a, t], ci) => { const g = geom({ ...RH, artist: a, track: t }, S), c = mk(S), cx = c.getContext('2d'); fn(cx, g, a, t); x.drawImage(c, pad + ci * (cell + pad), Y + 34, cell, cell); }); });
  save('typography-specimen', sh);
  // 1:1 type crops at 3000 (ink distress + crisp catalog; light separation)
  { const g = geom(RH, 3000), c = mk(3000), cx = c.getContext('2d'); stockInk(cx, 3000, 1); typeInk(cx, g); save('crop-100pct-type-ink', crop(c, 1500, 2350, 1400, 600)); save('crop-100pct-catalog-ink', crop(c, 2150, 230, 650, 450)); }
  { const g = geom(RH, 3000), c = mk(3000), cx = c.getContext('2d'); stockLight(cx, 3000); typeLight(cx, g); save('crop-100pct-type-light', crop(c, 150, 2450, 1400, 450)); } }

// 6: integrated cover per family (strongest wave × material × type)
{ const S = 3000;
  { const g = geom(RH, S), c = mk(S), x = c.getContext('2d'); stockInk(x, S, 1); inkRibbon(x, g, placeInk(g), [[226, 70, 42], [27, 26, 30]]); typeInk(x, g); save('integrated-ink', c); }
  { const g = geom(RH, S), c = mk(S), x = c.getContext('2d'); stockLight(x, S); lightBands(x, g, placeLight(g, { x: 0.2, y: 0.2, w: 0.6, h: 0.46 })); grain(x, S, 4, 5); typeLight(x, g); save('integrated-light', c); }
  { const g = geom(RH, S), c = mk(S), x = c.getContext('2d'); stockGlass(x, S); matterGlass(x, g, placeMatter(g)); grain(x, S, 5, 17); typeMatter(x, g, false); save('integrated-matter', c); }
  { const g = geom(RH, S), c = mk(S), x = c.getContext('2d'); stockMetal(x, S); matterMetal(x, g, placeMatter(g)); grain(x, S, 5, 29); typeMatter(x, g, true); save('integrated-matter-metal', c); } }

out.__perf = JSON.stringify(perf);
return out;
