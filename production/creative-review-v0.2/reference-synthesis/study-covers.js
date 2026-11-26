// STATIC STUDY ONLY (not app code). Same recipe, three materials. Reads the app's geometry/composition, changes nothing.
const { traces, boundingBox } = await import('/src/artwork/geometry.ts');
const { registration, artPlacement } = await import('/src/artwork/composition.ts');
const { validateRecipe } = await import('/src/instrument/recipe.ts');
const R = validateRecipe({ seed: 0x01352905, mode: 'harmonic', artist: 'Mira Okafor', track: 'Tidewater', form: 3, rhythm: 4, phase: 45, density: 10, palette: 0 });
const S = 1500, FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const trs = traces(R, 4096), box = boundingBox(trs), reg = registration(R, S);
const mk = () => { const c = document.createElement('canvas'); c.width = c.height = S; return c; };
const rng = (s) => () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
function grain(x, amt, seed) { const r = rng(seed); const im = x.getImageData(0, 0, S, S), d = im.data; for (let i = 0; i < d.length; i += 4) { const q = r(); const n = q < 0.22 ? -amt : q > 0.78 ? amt : 0; d[i] += n; d[i + 1] += n; d[i + 2] += n; } x.putImageData(im, 0, 0); }
function path(x, tr, p) { x.beginPath(); for (let j = 0; j < tr.length; j += 2) { const px = tr[j] * p.scale + p.tx, py = tr[j + 1] * p.scale + p.ty; j ? x.lineTo(px, py) : x.moveTo(px, py); } }
// plate(k): 0 = key (even passes + key contour), 1 = second channel (odd passes + key), offset by registration
function plate(x, p, k, style) { x.save(); if (k === 1) { x.translate(S / 2 + reg.dx, S / 2 + reg.dy); x.rotate(reg.rot); x.translate(-S / 2, -S / 2); }
  x.lineJoin = x.lineCap = 'round'; const n = trs.length;
  for (let i = n - 1; i >= 0; i--) { const on = k === 0 ? i % 2 === 0 : i % 2 === 1 || i === 0; if (!on) continue; style(x, i, n); path(x, trs[i], p); x.stroke(); }
  x.restore(); x.globalAlpha = 1; }
function text(x, s, X, Y, size, weight, color, align = 'left', track = 0) { x.font = `${weight} ${size}px ${FONT}`; x.fillStyle = color; x.textAlign = align; x.letterSpacing = `${track * size}px`; x.fillText(s, X, Y); x.letterSpacing = '0px'; }
function mark(x, X, Y, r, c, lw) { x.save(); x.strokeStyle = c; x.lineWidth = lw; x.beginPath(); x.arc(X, Y, r, 0, 7); x.moveTo(X - r * 1.7, Y); x.lineTo(X + r * 1.7, Y); x.moveTo(X, Y - r * 1.7); x.lineTo(X, Y + r * 1.7); x.stroke(); x.restore(); }
function catalog(x, lines, X, Y, size, color, align = 'left') { lines.forEach((l, i) => text(x, l, X, Y + i * size * 1.5, size, 500, color, align, 0.12)); }
const CAT = ['PLATE 01352905', 'HARMONIC 3:4', 'Φ 045° · OFF REGISTER', '10 PASSES'];
const out = {};

// INK · CARBON — charcoal stock; key plate in gloss black (varnish), second channel in one fluorescent ink. Bleed crop.
{ const c = mk(), x = c.getContext('2d'); x.fillStyle = '#18181A'; x.fillRect(0, 0, S, S); grain(x, 9, 3);
  const p = artPlacement('bleed', { ...R, seed: 0 }, box, S); const lw = 0.0021 * S;
  plate(x, p, 0, (x, i, n) => { x.strokeStyle = '#3A3A3F'; x.globalAlpha = 0.95 - 0.5 * i / (n - 1); x.lineWidth = lw * (i === 0 ? 2.2 : 1.35); });
  plate(x, p, 1, (x, i, n) => { x.strokeStyle = '#FF4E1C'; x.globalAlpha = (0.95 - 0.6 * i / (n - 1)) * (i === 0 ? 1 : 0.85); x.lineWidth = lw * (i === 0 ? 1.1 : 0.8); });
  text(x, '02', 0.93 * S, 0.105 * S, 0.075 * S, 300, '#FF4E1C', 'right');
  catalog(x, ['INK', ...CAT], 0.93 * S, 0.15 * S, 0.0175 * S, '#B9B7B0', 'right');
  text(x, 'TIDEWATER', 0.93 * S, 0.80 * S, 0.034 * S, 600, '#EDEAE3', 'right', 0.16);
  text(x, 'Mira Okafor', 0.935 * S, 0.93 * S, 0.12 * S, 300, '#EDEAE3', 'right', -0.01);
  mark(x, 0.075 * S, 0.925 * S, 0.01 * S, '#FF4E1C', 0.0013 * S);
  out.ink = c.toDataURL(); }

// LIGHT · HORIZON — deep night stock; the figure sits on a lit horizon and is coloured by distance to it; faint reflection.
{ const c = mk(), x = c.getContext('2d'); const H = 0.64 * S;
  const sky = x.createLinearGradient(0, 0, 0, S); sky.addColorStop(0, '#060A18'); sky.addColorStop(0.45, '#0E1D4A'); sky.addColorStop(0.62, '#2A4FA8'); sky.addColorStop(0.64, '#F6C36A'); sky.addColorStop(0.645, '#0B1330'); sky.addColorStop(1, '#04060E');
  x.fillStyle = sky; x.fillRect(0, 0, S, S);
  const glow = x.createRadialGradient(S / 2, H, 0, S / 2, H, 0.55 * S); glow.addColorStop(0, 'rgba(255,196,110,0.32)'); glow.addColorStop(1, 'rgba(255,196,110,0)'); x.fillStyle = glow; x.fillRect(0, 0, S, S); // full-sheet fill: no hard-edged box
  x.fillStyle = 'rgba(255,214,150,0.9)'; x.fillRect(0.08 * S, H - 0.0012 * S, 0.84 * S, 0.0024 * S);
  const field = { x: 0.16, y: 0.2, w: 0.68, h: 0.42 }; const sc = Math.min(field.w * S / (box.maxX - box.minX), field.h * S / (box.maxY - box.minY));
  const p = { scale: sc, tx: S / 2 - (box.minX + box.maxX) / 2 * sc, ty: H - 0.006 * S - box.maxY * sc };
  const lit = (a, b) => { const g = x.createLinearGradient(0, 0.18 * S, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const lw = 0.0018 * S; x.globalCompositeOperation = 'screen';
  plate(x, p, 0, (x, i, n) => { x.strokeStyle = lit('#3E6BFF', '#FFF1D6'); x.globalAlpha = 0.9 - 0.55 * i / (n - 1); x.lineWidth = lw * (i === 0 ? 1.8 : 1.1); });
  plate(x, p, 1, (x, i, n) => { x.strokeStyle = lit('#2A3F8F', '#FFB35A'); x.globalAlpha = 0.75 - 0.5 * i / (n - 1); x.lineWidth = lw * 0.85; });
  // reflection: mirrored, faint, below the horizon
  x.save(); x.translate(0, 2 * H); x.scale(1, -1); x.globalAlpha = 0.16; x.filter = `blur(${0.0025 * S}px)`;
  plate(x, p, 0, (x, i, n) => { x.strokeStyle = lit('#3E6BFF', '#FFE2B0'); x.globalAlpha = 0.18 * (1 - i / n); x.lineWidth = lw * 1.2; }); x.restore();
  x.globalCompositeOperation = 'source-over'; x.filter = 'none'; grain(x, 5, 9);
  text(x, 'TIDEWATER', 0.075 * S, 0.1 * S, 0.03 * S, 600, '#F4C877', 'left', 0.18);
  text(x, 'Mira Okafor', 0.075 * S, 0.9 * S, 0.072 * S, 300, '#F2EEE6');
  catalog(x, ['LIGHT · 04', ...CAT], 0.925 * S, 0.845 * S, 0.0165 * S, '#8E97B5', 'right');
  out.light = c.toDataURL(); }

// MATTER · COBALT GLASS — cobalt stock; lines rendered as glass (soft body + bright edge); channel B as refraction; aperture.
{ const c = mk(), x = c.getContext('2d'); const bg = x.createRadialGradient(0.5 * S, 0.44 * S, 0, 0.5 * S, 0.44 * S, 0.8 * S); bg.addColorStop(0, '#1C3A9E'); bg.addColorStop(1, '#070F2A'); x.fillStyle = bg; x.fillRect(0, 0, S, S);
  const gx = 0.5 * S, gy = 0.44 * S, gr = 0.355 * S;
  x.save(); x.beginPath(); x.arc(gx, gy, gr, 0, 7); x.clip(); const disc = x.createLinearGradient(0, gy - gr, 0, gy + gr); disc.addColorStop(0, '#2C55C9'); disc.addColorStop(1, '#122A78'); x.fillStyle = disc; x.fillRect(0, 0, S, S);
  const p = artPlacement('gate', R, box, S); const lw = 0.0021 * S;
  // depth: a soft shadow under the glass (thickness), then body, then a directionally lit edge, then refraction
  x.save(); x.translate(0.0035 * S, 0.0045 * S); x.filter = 'blur(' + (0.003 * S) + 'px)';
  plate(x, p, 0, (x, i, n) => { x.strokeStyle = '#030818'; x.globalAlpha = 0.5 - 0.25 * i / (n - 1); x.lineWidth = lw * 2.6; }); x.restore(); x.filter = 'none';
  const edge = x.createLinearGradient(0.15 * S, 0.1 * S, 0.85 * S, 0.8 * S); edge.addColorStop(0, '#FFFFFF'); edge.addColorStop(0.55, '#BFD2FF'); edge.addColorStop(1, '#5D7FD6');
  x.globalCompositeOperation = 'screen';
  plate(x, p, 0, (x, i, n) => { x.strokeStyle = '#6F95F2'; x.globalAlpha = 0.2 - 0.08 * i / (n - 1); x.lineWidth = lw * 3.4; });
  plate(x, p, 0, (x, i, n) => { x.strokeStyle = edge; x.globalAlpha = 0.95 - 0.5 * i / (n - 1); x.lineWidth = lw * (i === 0 ? 1.15 : 0.75); });
  plate(x, p, 1, (x, i, n) => { x.strokeStyle = '#8FE0FF'; x.globalAlpha = 0.4 - 0.2 * i / (n - 1); x.lineWidth = lw * 0.55; });
  x.restore(); x.globalCompositeOperation = 'source-over';
  x.strokeStyle = 'rgba(214,228,255,0.55)'; x.lineWidth = 0.0013 * S; x.beginPath(); x.arc(gx, gy, gr, 0, 7); x.stroke();
  x.strokeStyle = 'rgba(255,255,255,0.8)'; x.lineWidth = 0.0026 * S; x.beginPath(); x.arc(gx, gy, gr - 0.004 * S, Math.PI * 1.08, Math.PI * 1.32); x.stroke(); // single specular arc
  grain(x, 6, 17);
  text(x, 'MATTER · 05   PLATE 01352905 · HARMONIC 3:4 · Φ 045° · 10 PASSES', 0.5 * S, 0.058 * S, 0.0165 * S, 500, '#A9BCEB', 'center', 0.12);
  text(x, 'Mira Okafor', 0.07 * S, 0.925 * S, 0.072 * S, 300, '#F1F4FB');
  text(x, 'TIDEWATER', 0.93 * S, 0.925 * S, 0.032 * S, 600, '#A9C6FF', 'right', 0.16);
  out.matter = c.toDataURL(); }
return out;
