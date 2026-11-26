// STATIC STUDY ONLY (not app code). Six sets, ONE recipe. Reads the app's geometry/composition; changes nothing.
const { traces, boundingBox } = await import('/src/artwork/geometry.ts');
const { registration, artPlacement } = await import('/src/artwork/composition.ts');
const { validateRecipe } = await import('/src/instrument/recipe.ts');
const R = validateRecipe({ seed: 0x01352905, mode: 'harmonic', artist: 'Mira Okafor', track: 'Tidewater', form: 3, rhythm: 4, phase: 45, density: 10, palette: 0 });
const S = 3000, FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const trs = traces(R, 4096), box = boundingBox(trs), reg = registration(R, S), N = trs.length;
const mk = () => { const c = document.createElement('canvas'); c.width = c.height = S; return c; };
const rng = (s) => () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
function grain(x, amt, seed) { const r = rng(seed); const im = x.getImageData(0, 0, S, S), d = im.data; for (let i = 0; i < d.length; i += 4) { const q = r(); const n = q < 0.22 ? -amt : q > 0.78 ? amt : 0; d[i] += n; d[i + 1] += n; d[i + 2] += n; } x.putImageData(im, 0, 0); }
function path(x, tr, p) { x.beginPath(); for (let j = 0; j < tr.length; j += 2) { const px = tr[j] * p.scale + p.tx, py = tr[j + 1] * p.scale + p.ty; j ? x.lineTo(px, py) : x.moveTo(px, py); } }
// Channel k: 0 = key (even passes + key contour), 1 = registered (odd passes + key). off = extra [dx,dy] (bevels, shadows).
function channel(x, p, k, style, off = [0, 0], regScale = 1) { x.save(); x.translate(off[0], off[1]);
  if (k === 1) { x.translate(S / 2 + reg.dx * regScale, S / 2 + reg.dy * regScale); x.rotate(reg.rot * regScale); x.translate(-S / 2, -S / 2); }
  x.lineJoin = x.lineCap = 'round';
  for (let i = N - 1; i >= 0; i--) { const on = k === 0 ? i % 2 === 0 : i % 2 === 1 || i === 0; if (!on) continue; style(x, i); path(x, trs[i], p); x.stroke(); }
  x.restore(); x.globalAlpha = 1; }
const fall = (i, a, b) => a - (a - b) * i / (N - 1); // per-pass falloff
function text(x, s, X, Y, size, weight, color, align = 'left', track = 0) { x.font = `${weight} ${size}px ${FONT}`; x.fillStyle = color; x.textAlign = align; x.letterSpacing = `${track * size}px`; x.fillText(s, X, Y); x.letterSpacing = '0px'; }
function mark(x, X, Y, r, c, lw) { x.save(); x.strokeStyle = c; x.lineWidth = lw; x.beginPath(); x.arc(X, Y, r, 0, 7); x.moveTo(X - r * 1.7, Y); x.lineTo(X + r * 1.7, Y); x.moveTo(X, Y - r * 1.7); x.lineTo(X, Y + r * 1.7); x.stroke(); x.restore(); }
// Shared catalog grammar: FAMILY · NN / PLATE / ENGINE F:R / Φ · REGISTER / PASSES
const cat = (fam) => [fam, 'PLATE 01352905', 'HARMONIC 3:4', 'Φ 045° · OFF REGISTER', '10 PASSES'];
function column(x, lines, X, Y, size, color, align = 'right') { lines.forEach((l, i) => text(x, l, X, Y + i * size * 1.5, size, 500, color, align, 0.12)); }
const LW = 0.0021 * S;
const out = {};

// ── INK · 01 NEWSPRINT — warm stock; vermilion + black overprint (multiply); bleed crop; index numeral as display mark.
{ const c = mk(), x = c.getContext('2d'); x.fillStyle = '#ECE5D6'; x.fillRect(0, 0, S, S); grain(x, 10, 1);
  const p = artPlacement('bleed', { ...R, seed: 0 }, box, S); x.globalCompositeOperation = 'multiply';
  channel(x, p, 0, (x, i) => { x.strokeStyle = '#E2462A'; x.globalAlpha = fall(i, 0.95, 0.4); x.lineWidth = LW * (i === 0 ? 2 : 1.25); });
  channel(x, p, 1, (x, i) => { x.strokeStyle = '#1B1A1E'; x.globalAlpha = fall(i, 0.9, 0.35); x.lineWidth = LW * (i === 0 ? 1.1 : 0.8); });
  x.globalCompositeOperation = 'source-over';
  text(x, '01', 0.93 * S, 0.105 * S, 0.075 * S, 300, '#E2462A', 'right'); column(x, cat('INK'), 0.93 * S, 0.15 * S, 0.0175 * S, '#4A4842');
  text(x, 'TIDEWATER', 0.93 * S, 0.80 * S, 0.034 * S, 600, '#1B1A1E', 'right', 0.16); text(x, 'Mira Okafor', 0.935 * S, 0.93 * S, 0.12 * S, 300, '#1B1A1E', 'right', -0.01);
  mark(x, 0.075 * S, 0.925 * S, 0.01 * S, '#E2462A', 0.0013 * S); out.newsprint = c; }

// ── INK · 02 CARBON — charcoal stock; gloss-black key plate (varnish); one fluorescent channel. (Approved study, unchanged.)
{ const c = mk(), x = c.getContext('2d'); x.fillStyle = '#18181A'; x.fillRect(0, 0, S, S); grain(x, 9, 3);
  const p = artPlacement('bleed', { ...R, seed: 0 }, box, S);
  channel(x, p, 0, (x, i) => { x.strokeStyle = '#3A3A3F'; x.globalAlpha = fall(i, 0.95, 0.45); x.lineWidth = LW * (i === 0 ? 2.2 : 1.35); });
  channel(x, p, 1, (x, i) => { x.strokeStyle = '#FF4E1C'; x.globalAlpha = fall(i, 0.95, 0.35) * (i === 0 ? 1 : 0.85); x.lineWidth = LW * (i === 0 ? 1.1 : 0.8); });
  text(x, '02', 0.93 * S, 0.105 * S, 0.075 * S, 300, '#FF4E1C', 'right'); column(x, cat('INK'), 0.93 * S, 0.15 * S, 0.0175 * S, '#B9B7B0');
  text(x, 'TIDEWATER', 0.93 * S, 0.80 * S, 0.034 * S, 600, '#EDEAE3', 'right', 0.16); text(x, 'Mira Okafor', 0.935 * S, 0.93 * S, 0.12 * S, 300, '#EDEAE3', 'right', -0.01);
  mark(x, 0.075 * S, 0.925 * S, 0.01 * S, '#FF4E1C', 0.0013 * S); out.carbon = c; }

// ── LIGHT · 03 SPECTRUM — near-black stock; passes step through ONE controlled ramp: ultramarine (outer) → neutral → amber (inner).
// Signal energy = thin bright core + faint wide energy band, per pass; channel B carries the odd passes, registered.
{ const c = mk(), x = c.getContext('2d'); x.fillStyle = '#0B0B0E'; x.fillRect(0, 0, S, S);
  const lerp = (a, b, t) => a + (b - a) * t; const A = [52, 92, 255], M = [222, 226, 232], B = [255, 168, 52];
  const ramp = (t) => { const [p, q, u] = t < 0.5 ? [A, M, t * 2] : [M, B, (t - 0.5) * 2]; return `rgb(${p.map((v, j) => Math.round(lerp(v, q[j], u))).join(',')})`; };
  const field = { x: 0.2, y: 0.3, w: 0.6, h: 0.44 }; const sc = Math.min(field.w * S / (box.maxX - box.minX), field.h * S / (box.maxY - box.minY));
  const p = { scale: sc, tx: S / 2 - (box.minX + box.maxX) / 2 * sc, ty: (field.y + field.h / 2) * S - (box.minY + box.maxY) / 2 * sc };
  x.globalCompositeOperation = 'screen';
  for (const k of [0, 1]) { channel(x, p, k, (x, i) => { x.strokeStyle = ramp(i / (N - 1)); x.globalAlpha = fall(i, 0.1, 0.05); x.lineWidth = LW * 4.5; });  // energy band
    channel(x, p, k, (x, i) => { x.strokeStyle = ramp(i / (N - 1)); x.globalAlpha = fall(i, 0.95, 0.55) * (k ? 0.85 : 1); x.lineWidth = LW * (i === 0 ? 1.3 : 0.85); }); } // core
  x.globalCompositeOperation = 'source-over'; grain(x, 5, 5);
  // calibration: axis ticks at the margins through the figure's centre line (no drawn baseline)
  const cy = (field.y + field.h / 2) * S; x.strokeStyle = '#5E6170'; x.lineWidth = 0.0013 * S;
  for (const X of [0.07, 0.93]) { x.beginPath(); x.moveTo(X * S - (X < 0.5 ? 0 : 0.02 * S), cy); x.lineTo(X * S + (X < 0.5 ? 0.02 * S : 0), cy); x.stroke();
    for (let t = -3; t <= 3; t++) { if (!t) continue; x.beginPath(); const xx = X < 0.5 ? X * S : X * S - 0.008 * S; x.moveTo(xx, cy + t * 0.03 * S); x.lineTo(xx + 0.008 * S, cy + t * 0.03 * S); x.stroke(); } }
  text(x, '03', 0.07 * S, 0.105 * S, 0.075 * S, 300, '#FFA834'); column(x, cat('LIGHT'), 0.93 * S, 0.065 * S, 0.0175 * S, '#8C8F9C');
  text(x, 'TIDEWATER', 0.07 * S, 0.865 * S, 0.034 * S, 600, '#FFC27A', 'left', 0.16); text(x, 'Mira Okafor', 0.065 * S, 0.94 * S, 0.072 * S, 300, '#EEF0F4');
  out.spectrum = c; }

// ── LIGHT · 04 HORIZON — (approved study, unchanged).
{ const c = mk(), x = c.getContext('2d'); const H = 0.64 * S;
  const sky = x.createLinearGradient(0, 0, 0, S); sky.addColorStop(0, '#060A18'); sky.addColorStop(0.45, '#0E1D4A'); sky.addColorStop(0.62, '#2A4FA8'); sky.addColorStop(0.64, '#F6C36A'); sky.addColorStop(0.645, '#0B1330'); sky.addColorStop(1, '#04060E');
  x.fillStyle = sky; x.fillRect(0, 0, S, S);
  const glow = x.createRadialGradient(S / 2, H, 0, S / 2, H, 0.55 * S); glow.addColorStop(0, 'rgba(255,196,110,0.32)'); glow.addColorStop(1, 'rgba(255,196,110,0)'); x.fillStyle = glow; x.fillRect(0, 0, S, S);
  x.fillStyle = 'rgba(255,214,150,0.9)'; x.fillRect(0.08 * S, H - 0.0012 * S, 0.84 * S, 0.0024 * S);
  const field = { x: 0.16, y: 0.2, w: 0.68, h: 0.42 }; const sc = Math.min(field.w * S / (box.maxX - box.minX), field.h * S / (box.maxY - box.minY));
  const p = { scale: sc, tx: S / 2 - (box.minX + box.maxX) / 2 * sc, ty: H - 0.006 * S - box.maxY * sc };
  const lit = (a, b) => { const g = x.createLinearGradient(0, 0.18 * S, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const lw = 0.0018 * S; x.globalCompositeOperation = 'screen';
  channel(x, p, 0, (x, i) => { x.strokeStyle = lit('#3E6BFF', '#FFF1D6'); x.globalAlpha = fall(i, 0.9, 0.35); x.lineWidth = lw * (i === 0 ? 1.8 : 1.1); });
  channel(x, p, 1, (x, i) => { x.strokeStyle = lit('#2A3F8F', '#FFB35A'); x.globalAlpha = fall(i, 0.75, 0.25); x.lineWidth = lw * 0.85; });
  x.save(); x.translate(0, 2 * H); x.scale(1, -1); x.filter = `blur(${0.0025 * S}px)`;
  channel(x, p, 0, (x, i) => { x.strokeStyle = lit('#3E6BFF', '#FFE2B0'); x.globalAlpha = 0.18 * (1 - i / N); x.lineWidth = lw * 1.2; }); x.restore();
  x.globalCompositeOperation = 'source-over'; x.filter = 'none'; grain(x, 5, 9);
  text(x, 'TIDEWATER', 0.075 * S, 0.1 * S, 0.03 * S, 600, '#F4C877', 'left', 0.18); text(x, 'Mira Okafor', 0.075 * S, 0.9 * S, 0.072 * S, 300, '#F2EEE6');
  column(x, ['LIGHT · 04', ...cat('').slice(1)], 0.925 * S, 0.845 * S, 0.0165 * S, '#8E97B5');
  out.horizon = c; }

// Shared Matter aperture
const GX = 0.5 * S, GY = 0.44 * S, GR = 0.355 * S;
const L = [-0.7071, -0.7071]; // light from the top-left
const pM = artPlacement('gate', R, box, S);

// ── MATTER · 05 COBALT GLASS (revised) — translucent bodies, lit edge (top-left), dark edge (bottom-right), restrained refraction, one caustic, faint depth.
{ const c = mk(), x = c.getContext('2d'); const bg = x.createRadialGradient(0.45 * S, 0.38 * S, 0, 0.5 * S, 0.44 * S, 0.85 * S); bg.addColorStop(0, '#1D3A98'); bg.addColorStop(1, '#060D26'); x.fillStyle = bg; x.fillRect(0, 0, S, S);
  // one subtle caustic: light focused through the glass disc onto the stock, falling bottom-right
  const cg = x.createRadialGradient(0.66 * S, 0.78 * S, 0, 0.66 * S, 0.78 * S, 0.2 * S); cg.addColorStop(0, 'rgba(170,215,255,0.16)'); cg.addColorStop(0.5, 'rgba(120,170,255,0.06)'); cg.addColorStop(1, 'rgba(120,170,255,0)');
  x.save(); x.translate(0.66 * S, 0.78 * S); x.scale(1.6, 0.55); x.rotate(-0.35); x.translate(-0.66 * S, -0.78 * S); x.fillStyle = cg; x.fillRect(0, 0, S, S); x.restore();
  x.save(); x.beginPath(); x.arc(GX, GY, GR, 0, 7); x.clip();
  const disc = x.createLinearGradient(GX - GR, GY - GR, GX + GR, GY + GR); disc.addColorStop(0, '#2B54C4'); disc.addColorStop(1, '#10276E'); x.fillStyle = disc; x.fillRect(0, 0, S, S);
  const e = 0.0016 * S;
  // faint depth: blurred shadow under the glass (thickness), cast away from the light
  x.filter = `blur(${0.004 * S}px)`; channel(x, pM, 0, (x, i) => { x.strokeStyle = '#020718'; x.globalAlpha = fall(i, 0.42, 0.2); x.lineWidth = LW * 3; }, [0.006 * S, 0.008 * S]); x.filter = 'none';
  // translucent body: wide, soft, slightly lighter than the disc so overlaps read as stacked glass
  x.globalCompositeOperation = 'screen'; channel(x, pM, 0, (x, i) => { x.strokeStyle = '#86A6F2'; x.globalAlpha = fall(i, 0.3, 0.14); x.lineWidth = LW * 3.6; });
  // dark opposite edge — strengthens toward the bottom-right (away from the light)
  const dark = x.createLinearGradient(GX - GR, GY - GR, GX + GR, GY + GR); dark.addColorStop(0, 'rgba(10,22,64,0.15)'); dark.addColorStop(1, 'rgba(6,14,44,0.9)');
  x.globalCompositeOperation = 'multiply'; channel(x, pM, 0, (x, i) => { x.strokeStyle = dark; x.globalAlpha = fall(i, 0.9, 0.5); x.lineWidth = LW * 0.9; }, [-L[0] * e, -L[1] * e]);
  // one directional bright edge — full strength top-left, fading to nothing bottom-right (no equally bright outlines)
  const lit = x.createLinearGradient(GX - GR, GY - GR, GX + GR * 0.6, GY + GR * 0.6); lit.addColorStop(0, 'rgba(246,249,255,1)'); lit.addColorStop(0.55, 'rgba(210,225,255,0.45)'); lit.addColorStop(1, 'rgba(180,205,255,0)');
  x.globalCompositeOperation = 'screen'; channel(x, pM, 0, (x, i) => { x.strokeStyle = lit; x.globalAlpha = fall(i, 0.9, 0.35); x.lineWidth = LW * (i === 0 ? 0.75 : 0.5); }, [L[0] * e, L[1] * e]);
  // restrained channel-B refraction
  channel(x, pM, 1, (x, i) => { x.strokeStyle = '#9FDCFF'; x.globalAlpha = fall(i, 0.3, 0.12); x.lineWidth = LW * 0.5; }, [0, 0], 0.55);
  x.restore(); x.globalCompositeOperation = 'source-over';
  // rim: lit top-left arc, darker bottom-right arc (no bright full outline)
  x.lineWidth = 0.0016 * S; x.strokeStyle = 'rgba(220,232,255,0.6)'; x.beginPath(); x.arc(GX, GY, GR, Math.PI * 0.95, Math.PI * 1.55); x.stroke();
  x.strokeStyle = 'rgba(4,10,34,0.65)'; x.beginPath(); x.arc(GX, GY, GR, Math.PI * 1.95, Math.PI * 2.55); x.stroke();
  grain(x, 6, 17);
  text(x, 'MATTER · 05   PLATE 01352905 · HARMONIC 3:4 · Φ 045° · 10 PASSES', 0.5 * S, 0.058 * S, 0.0165 * S, 500, '#A9BCEB', 'center', 0.12);
  text(x, 'Mira Okafor', 0.07 * S, 0.925 * S, 0.072 * S, 300, '#F1F4FB'); text(x, 'TIDEWATER', 0.93 * S, 0.925 * S, 0.032 * S, 600, '#A9C6FF', 'right', 0.16);
  out.glass = c; }

// ── MATTER · 06 CHROME — graphite stock; strokes as polished metal with thickness; ONE specular band travels diagonally across all bodies; brass channel B as the single accent.
{ const c = mk(), x = c.getContext('2d'); const bg = x.createLinearGradient(0, 0, 0, S); bg.addColorStop(0, '#2C2D31'); bg.addColorStop(1, '#1E1F22'); x.fillStyle = bg; x.fillRect(0, 0, S, S);
  x.save(); x.beginPath(); x.arc(GX, GY, GR, 0, 7); x.clip();
  const disc = x.createRadialGradient(GX - 0.1 * S, GY - 0.12 * S, 0, GX, GY, GR); disc.addColorStop(0, '#3A3C41'); disc.addColorStop(1, '#232428'); x.fillStyle = disc; x.fillRect(0, 0, S, S);
  const e = 0.0017 * S;
  // thickness: cast shadow on the aperture floor
  x.filter = `blur(${0.0035 * S}px)`; channel(x, pM, 0, (x, i) => { x.strokeStyle = '#0B0B0D'; x.globalAlpha = fall(i, 0.6, 0.3); x.lineWidth = LW * 2.8; }, [0.007 * S, 0.009 * S]); x.filter = 'none';
  // metal body: environment gradient (dark ↔ mid) with ONE specular band crossing it diagonally
  const metal = x.createLinearGradient(0.12 * S, 0.06 * S, 0.88 * S, 0.82 * S);
  metal.addColorStop(0, '#6E727A'); metal.addColorStop(0.34, '#4A4D53'); metal.addColorStop(0.43, '#F4F5F7'); metal.addColorStop(0.47, '#C9CCD2'); metal.addColorStop(0.55, '#3C3F44'); metal.addColorStop(1, '#7D818A');
  channel(x, pM, 0, (x, i) => { x.strokeStyle = metal; x.globalAlpha = fall(i, 1, 0.55); x.lineWidth = LW * (i === 0 ? 2.4 : 1.7); });
  // bevel: dark lower-right edge, light upper-left edge (directional reflection)
  channel(x, pM, 0, (x, i) => { x.strokeStyle = '#141417'; x.globalAlpha = fall(i, 0.55, 0.25); x.lineWidth = LW * 0.55; }, [-L[0] * e, -L[1] * e]);
  channel(x, pM, 0, (x, i) => { x.strokeStyle = '#E9EBEF'; x.globalAlpha = fall(i, 0.55, 0.2); x.lineWidth = LW * 0.4; }, [L[0] * e * 0.8, L[1] * e * 0.8]);
  // the single accent: brass channel B, registered
  channel(x, pM, 1, (x, i) => { x.strokeStyle = '#C8A15A'; x.globalAlpha = fall(i, 0.75, 0.3); x.lineWidth = LW * 0.55; });
  x.restore();
  // machined rim: light top-left, dark bottom-right
  x.lineWidth = 0.0022 * S; x.strokeStyle = 'rgba(232,234,238,0.55)'; x.beginPath(); x.arc(GX, GY, GR, Math.PI * 0.95, Math.PI * 1.55); x.stroke();
  x.strokeStyle = 'rgba(8,8,10,0.75)'; x.beginPath(); x.arc(GX, GY, GR, Math.PI * 1.95, Math.PI * 2.55); x.stroke();
  grain(x, 5, 29);
  text(x, 'MATTER · 06   PLATE 01352905 · HARMONIC 3:4 · Φ 045° · 10 PASSES', 0.5 * S, 0.058 * S, 0.0165 * S, 500, '#9A9DA4', 'center', 0.12);
  text(x, 'Mira Okafor', 0.07 * S, 0.925 * S, 0.072 * S, 300, '#ECEAE5'); text(x, 'TIDEWATER', 0.93 * S, 0.925 * S, 0.032 * S, 600, '#C8A15A', 'right', 0.16);
  out.chrome = c; }

// Export: full 3000 PNGs + 1:1 material crops + a grouped contact sheet
const res = {};
for (const [k, cv] of Object.entries(out)) res['cover-' + k] = cv.toDataURL('image/png');
const crop = (cv, sx, sy, w, h) => { const t = document.createElement('canvas'); t.width = w; t.height = h; t.getContext('2d').drawImage(cv, sx, sy, w, h, 0, 0, w, h); return t.toDataURL('image/png'); };
res['crop-glass-100pct'] = crop(out.glass, 1150, 700, 900, 900);
res['crop-chrome-100pct'] = crop(out.chrome, 1150, 700, 900, 900);
{ const cell = 620, pad = 24, head = 70; const sh = document.createElement('canvas'); sh.width = 3 * cell + 4 * pad; sh.height = head + 2 * cell + 3 * pad + 40; const x = sh.getContext('2d');
  x.fillStyle = '#ECEBE7'; x.fillRect(0, 0, sh.width, sh.height); x.imageSmoothingQuality = 'high';
  const cols = [['INK', ['newsprint', 'Newsprint'], ['carbon', 'Carbon']], ['LIGHT', ['spectrum', 'Spectrum'], ['horizon', 'Horizon']], ['MATTER', ['glass', 'Cobalt Glass'], ['chrome', 'Chrome']]];
  cols.forEach(([fam, a, b], ci) => { const X = pad + ci * (cell + pad); text(x, fam, X, 46, 20, 700, '#141416', 'left', 0.18);
    [a, b].forEach(([k, name], ri) => { const Y = head + pad + ri * (cell + pad + 20); x.drawImage(out[k], X, Y, cell, cell); text(x, name, X, Y + cell + 17, 13, 600, '#5A5A60', 'left', 0.08); }); });
  text(x, 'Same recipe on all six: Harmonic 3:4 · Φ 045° · 10 passes · Mira Okafor / Tidewater', pad, sh.height - 12, 13, 500, '#5A5A60');
  res['family-contact-sheet'] = sh.toDataURL('image/png'); }
return res;
