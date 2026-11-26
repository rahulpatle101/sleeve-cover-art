// CONCEPT ONLY (not app code). Proposed v0.2 "optical press" covers from the SAME recipe, using the app's unchanged geometry.
const { traces, boundingBox, fitBox } = await import('/src/artwork/geometry.ts');
const { renderArtwork } = await import('/src/artwork/renderArtwork.ts');
const { validateRecipe } = await import('/src/instrument/recipe.ts');
const R = validateRecipe({ seed: 0x01352905, mode: 'harmonic', artist: 'Mira Okafor', track: 'Tidewater', form: 3, rhythm: 4, phase: 45, density: 10, palette: 0 });
const S = 1500, FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const mk = () => { const c = document.createElement('canvas'); c.width = c.height = S; return c; };
const rng = (s) => () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const trs = traces(R, 4096), box = boundingBox(trs);
// Two ink plates = two passes of the same figure; Phase drives misregistration (direction + amount).
const regAngle = (R.phase * Math.PI) / 180, regAmt = 0.0065 * S;
function plate(ctx, rect, ink, lw, dx, dy, rot, alphaFrom = 0.95, alphaTo = 0.35) {
  const fit = fitBox(box, rect); const cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2;
  ctx.save(); ctx.translate(cx + dx, cy + dy); ctx.rotate(rot); ctx.translate(-cx, -cy);
  ctx.strokeStyle = ink; ctx.lineJoin = ctx.lineCap = 'round';
  trs.forEach((tr, i) => { ctx.globalAlpha = alphaFrom - ((alphaFrom - alphaTo) * i) / Math.max(1, trs.length - 1); ctx.lineWidth = i === 0 ? lw * 1.7 : lw;
    ctx.beginPath(); for (let j = 0; j < tr.length; j += 2) { const x = tr[j] * fit.scale + fit.tx, y = tr[j + 1] * fit.scale + fit.ty; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); });
  ctx.restore(); ctx.globalAlpha = 1; }
function grain(ctx, amount, seed, light) { const r = rng(seed); const img = ctx.getImageData(0, 0, S, S); const d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * amount; d[i] += n; d[i + 1] += n; d[i + 2] += n; } ctx.putImageData(img, 0, 0); }
function text(ctx, s, x, y, size, weight, color, align = 'left', track = 0) { ctx.font = `${weight} ${size}px ${FONT}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.letterSpacing = `${track}px`; ctx.fillText(s, x, y); ctx.letterSpacing = '0px'; }
function regMark(ctx, x, y, r, color) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = S * 0.0012; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.moveTo(x - r * 1.6, y); ctx.lineTo(x + r * 1.6, y); ctx.moveTo(x, y - r * 1.6); ctx.lineTo(x, y + r * 1.6); ctx.stroke(); ctx.restore(); }
const colophon = 'PROOF 01 · HARMONIC 3:4 · Φ 045° · 10 PASSES';
const out = {};

// v0.1 — current release, same recipe, for comparison
{ const c = mk(); renderArtwork(c.getContext('2d'), R, S, S); out.v01 = c.toDataURL(); }

// A — "Newsprint": warm stock, black + vermilion overprint (multiply), figure bleeds off the top-left trim.
{ const c = mk(), x = c.getContext('2d'); x.fillStyle = '#ECE5D6'; x.fillRect(0, 0, S, S);
  const rect = { x: -0.12 * S, y: -0.12 * S, w: 0.8 * S, h: 0.8 * S }; // bleeds top-left, stops clear of the title zone
  x.globalCompositeOperation = 'multiply';
  plate(x, rect, '#E2462A', S * 0.0026, 0, 0, 0);
  plate(x, rect, '#1B1A1E', S * 0.0019, Math.cos(regAngle) * regAmt, Math.sin(regAngle) * regAmt, 0.004);
  x.globalCompositeOperation = 'source-over'; grain(x, 16, 7);
  text(x, 'Mira Okafor', 0.93 * S, 0.86 * S, 0.092 * S, 300, '#1B1A1E', 'right');
  text(x, 'TIDEWATER', 0.93 * S, 0.925 * S, 0.026 * S, 600, '#1B1A1E', 'right', 0.2 * 0.026 * S);
  text(x, colophon, 0.07 * S, 0.925 * S, 0.0145 * S, 500, '#1B1A1E', 'left', 0.15 * 0.0145 * S);
  regMark(x, 0.07 * S + 0.009 * S, 0.86 * S, 0.009 * S, '#E2462A');
  out.newsprint = c.toDataURL(); }

// B — "Cobalt gate": cool stock, cobalt + yellow overprint seen through a circular optical gate with registration marks.
{ const c = mk(), x = c.getContext('2d'); x.fillStyle = '#E8EBEE'; x.fillRect(0, 0, S, S);
  const gx = 0.5 * S, gy = 0.44 * S, gr = 0.355 * S;
  x.save(); x.beginPath(); x.arc(gx, gy, gr, 0, Math.PI * 2); x.clip();
  x.fillStyle = '#F4F1E8'; x.fillRect(0, 0, S, S);
  const rect = { x: gx - 0.5 * S, y: gy - 0.5 * S, w: 1.0 * S, h: 1.0 * S };
  x.globalCompositeOperation = 'multiply';
  plate(x, rect, '#F5C02A', S * 0.0026, 0, 0, 0, 0.85, 0.3);
  plate(x, rect, '#1F3FBF', S * 0.002, Math.cos(regAngle) * regAmt, Math.sin(regAngle) * regAmt, -0.006, 0.9, 0.28);
  x.restore(); x.globalCompositeOperation = 'source-over';
  x.strokeStyle = '#1F3FBF'; x.lineWidth = S * 0.0016; x.beginPath(); x.arc(gx, gy, gr, 0, Math.PI * 2); x.stroke();
  for (const [mx, my] of [[0.07, 0.07], [0.93, 0.07]]) regMark(x, mx * S, my * S, 0.012 * S, '#1F3FBF');
  grain(x, 10, 11);
  text(x, 'Mira Okafor', 0.07 * S, 0.915 * S, 0.07 * S, 300, '#16181D');
  text(x, 'TIDEWATER', 0.93 * S, 0.915 * S, 0.024 * S, 600, '#1F3FBF', 'right', 0.22 * 0.024 * S);
  text(x, colophon, 0.5 * S, 0.06 * S + 0.0145 * S * 0.35, 0.0145 * S, 500, '#16181D', 'center', 0.15 * 0.0145 * S);
  out.gate = c.toDataURL(); }

// C — "Night run": black stock, light instead of ink — two additive signal channels with faint scan banding.
{ const c = mk(), x = c.getContext('2d'); x.fillStyle = '#101113'; x.fillRect(0, 0, S, S);
  const rect = { x: 0.1 * S, y: 0.25 * S, w: 0.8 * S, h: 0.62 * S };
  x.globalCompositeOperation = 'lighter';
  plate(x, rect, '#FF6B3D', S * 0.0022, -Math.cos(regAngle) * regAmt * 0.6, -Math.sin(regAngle) * regAmt * 0.6, 0, 0.8, 0.22);
  plate(x, rect, '#38C7DA', S * 0.0022, Math.cos(regAngle) * regAmt * 0.6, Math.sin(regAngle) * regAmt * 0.6, 0, 0.8, 0.22);
  x.globalCompositeOperation = 'source-over'; x.fillStyle = 'rgba(16,17,19,0.22)';
  for (let y = rect.y; y < rect.y + rect.h; y += S * 0.006) x.fillRect(0, y, S, S * 0.0022);
  grain(x, 8, 23);
  text(x, 'TIDEWATER', 0.075 * S, 0.105 * S, 0.024 * S, 600, '#9EE6EF', 'left', 0.22 * 0.024 * S);
  text(x, 'Mira Okafor', 0.07 * S, 0.2 * S, 0.1 * S, 300, '#F3F1EC');
  text(x, colophon, 0.075 * S, 0.95 * S, 0.0145 * S, 500, '#8A8C92', 'left', 0.15 * 0.0145 * S);
  text(x, 'SLEEVE', 0.925 * S, 0.95 * S, 0.0145 * S, 700, '#8A8C92', 'right', 0.3 * 0.0145 * S);
  out.night = c.toDataURL(); }
return out;
