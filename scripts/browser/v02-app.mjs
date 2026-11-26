// v0.2 renderer checkpoint, in the running app: settle behaviour, settled preview ≡ renderArtwork, real UI exports,
// export ≈ preview composition, desktop + mobile screenshots. Usage: node v02-app.mjs <url> <outdir>
import { launch } from './cdp.mjs';
import { readFileSync, readdirSync, rmSync, mkdirSync, statSync, copyFileSync } from 'node:fs';
const [url, out] = process.argv.slice(2);
const dl = out + '/.dl'; rmSync(dl, { recursive: true, force: true }); mkdirSync(dl, { recursive: true });
mkdirSync(out + '/exports', { recursive: true }); mkdirSync(out + '/screens', { recursive: true });
const b = await launch(out + '/.chrome-app', 9345);
const log = (...a) => console.log(...a);
const settled = () => b.ev(`document.querySelector('canvas').dataset.settled`);
const waitSettled = async (max = 5000) => { const t0 = Date.now(); while (Date.now() - t0 < max) { if ((await settled()) === 'true') return Date.now() - t0; await b.sleep(20); } return -1; };

await b.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 2, mobile: false });
await b.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dl });
await b.send('Page.navigate', { url }); await b.sleep(800);
log('initial settle ms', await waitSettled());
await b.shot(out + '/screens/desktop-1280-initial.png');

// --- settle behaviour: keyboard tuning → draft immediately, full after idle
await b.ev(`document.querySelectorAll('.dial-input')[3].focus()`);
await b.key('ArrowUp');
const afterKey = await settled();
log('keyboard tune: settled right after key =', afterKey, '; full arrives after ms =', await waitSettled());
// --- pointer drag held still for 500 ms: must stay draft until release
const c = await b.ev(`(() => { const r = document.querySelectorAll('.dial-wrap')[3].getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
await b.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c[0], y: c[1], button: 'left', clickCount: 1 });
for (let dy = 0; dy <= 48; dy += 6) await b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: c[0], y: c[1] - dy, button: 'left', buttons: 1 });
await b.sleep(500);
const held = await settled();
await b.shot(out + '/screens/desktop-dragging-draft.png');
await b.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c[0], y: c[1] - 48, button: 'left', clickCount: 1 });
log('pointer held still 500 ms: settled =', held, '; after release full arrives in ms =', await waitSettled());

// --- per set × engine: identity, real export, composition match
const results = [];
for (const mode of ['harmonic', 'radial'])
  for (let p = 0; p < 6; p++) {
    await b.ev(`document.querySelector('input[value=${mode}]').click()`);
    await b.ev(`document.querySelectorAll('.dial-input')[4].focus()`);
    await b.key('Home'); for (let i = 0; i < p; i++) await b.key('ArrowUp');
    const settleMs = await waitSettled(); await b.sleep(50);
    const ident = await b.ev(`(async () => {
      const { renderArtwork } = await import('/src/artwork/renderArtwork.ts');
      const { validateRecipe } = await import('/src/instrument/recipe.ts');
      const stage = document.querySelector('canvas'), W = stage.width;
      const v = [...document.querySelectorAll('.dial-input')].map((i) => +i.value);
      const r = validateRecipe({ mode: document.querySelector('input[name=mode]:checked').value, artist: document.getElementById('artist').value, track: document.getElementById('track').value, form: v[0], rhythm: v[1], phase: v[2], density: v[3], palette: v[4] - +document.querySelectorAll('.dial-input')[4].min, seed: parseInt(document.querySelector('.meta .mono').textContent.replace(/[^0-9a-f]/gi, ''), 16) });
      // Same canvas, same renderer: snapshot the settled stage, redraw renderArtwork(full) onto the stage itself, compare.
      // (An off-page canvas rasterises small text slightly differently in Chrome, so it is not a fair reference.)
      const s = document.createElement('canvas'); s.width = s.height = W; s.getContext('2d').drawImage(stage, 0, 0);
      const snap = () => { const f = document.createElement('canvas'); f.width = f.height = W; f.getContext('2d').drawImage(stage, 0, 0); return f.getContext('2d').getImageData(0, 0, W, W).data; };
      const c = s.getContext('2d').getImageData(0, 0, W, W).data;
      const cmp = (a) => { let n = 0, mx = 0, x0 = W, y0 = W, x1 = 0, y1 = 0; for (let i = 0; i < a.length; i++) { const d = Math.abs(a[i] - c[i]); if (d) { n++; const q = (i / 4) | 0; x0 = Math.min(x0, q % W); x1 = Math.max(x1, q % W); y0 = Math.min(y0, (q / W) | 0); y1 = Math.max(y1, (q / W) | 0); } if (d > mx) mx = d; } return { n, mx, box: n ? [x0, y0, x1, y1].map((v) => +(v / W).toFixed(2)) : null }; };
      // (1) the stage pipeline reproduced from scratch: renderArtLayer(full) into an off-page buffer, blit, renderTypeLayer
      const { renderArtLayer, renderTypeLayer } = await import('/src/artwork/renderArtwork.ts');
      const art = document.createElement('canvas'); art.width = art.height = W; renderArtLayer(art.getContext('2d'), r, W, W, 'full');
      const sx = stage.getContext('2d'); sx.drawImage(art, 0, 0); renderTypeLayer(sx, r, W, W);
      const pipe = cmp(snap());
      // (2) renderArtwork(full) drawn directly onto the on-page stage canvas
      renderArtwork(sx, r, W, W, 'full');
      const direct = cmp(snap());
      sx.drawImage(s, 0, 0); // restore the settled frame
      const diff = pipe.n, mx = pipe.mx;
      return { W, recipe: r, diffChannels: diff, maxChannelDiff: mx, direct };
    })()`);
    for (const f of readdirSync(dl)) rmSync(`${dl}/${f}`, { force: true });
    const before = new Set(); const t0 = Date.now();
    await b.ev(`document.querySelector('.btn-primary').click()`);
    let file; for (let i = 0; i < 150 && !file; i++) { await b.sleep(100); file = readdirSync(dl).find((f) => f.endsWith('.png') && !before.has(f)); }
    if (!file) { log('NO DOWNLOAD', mode, p); continue; }
    const exportMs = Date.now() - t0; await b.sleep(400);
    const dest = `${out}/exports/${String(results.length + 1).padStart(2, '0')}-${mode}-p${p}-${file}`; copyFileSync(`${dl}/${file}`, dest);
    const status = await b.ev(`document.querySelector('.status').textContent`);
    const b64 = readFileSync(dest).toString('base64');
    const comp = await b.ev(`(async () => {
      const img = new Image(); img.src = 'data:image/png;base64,${b64}'; await img.decode();
      const stage = document.querySelector('canvas'), W = stage.width;
      const a = document.createElement('canvas'); a.width = a.height = W; const ax = a.getContext('2d'); ax.imageSmoothingQuality = 'high'; ax.drawImage(img, 0, 0, W, W);
      const s = document.createElement('canvas'); s.width = s.height = W; s.getContext('2d').drawImage(stage, 0, 0);
      const da = ax.getImageData(0, 0, W, W).data, ds = s.getContext('2d').getImageData(0, 0, W, W).data;
      const N = 12, bs = W / N; let bmax = 0, sum = 0;
      for (let i = 0; i < da.length; i += 4) sum += (Math.abs(da[i] - ds[i]) + Math.abs(da[i + 1] - ds[i + 1]) + Math.abs(da[i + 2] - ds[i + 2])) / 3;
      for (let by = 0; by < N; by++) for (let bx = 0; bx < N; bx++) { const m = [0, 0, 0, 0, 0, 0]; let n = 0;
        for (let y = Math.floor(by * bs); y < Math.floor((by + 1) * bs); y++) for (let x = Math.floor(bx * bs); x < Math.floor((bx + 1) * bs); x++) { const i = (y * W + x) * 4; for (let c = 0; c < 3; c++) { m[c] += da[i + c]; m[c + 3] += ds[i + c]; } n++; }
        for (let c = 0; c < 3; c++) bmax = Math.max(bmax, Math.abs(m[c] - m[c + 3]) / n); }
      return { size: img.naturalWidth + '×' + img.naturalHeight, meanAbsDiff: +(sum / (W * W)).toFixed(2), maxBlockMeanDiff12: +bmax.toFixed(2) };
    })()`);
    const row = { mode, palette: p, settleMs, previewPx: ident.W, identityDiffChannels: ident.diffChannels, identityMax: ident.maxChannelDiff, directOnStage: ident.direct, file: dest.split('/').pop(), exportMs, MB: +(statSync(dest).size / 1e6).toFixed(2), ...comp, status: status.trim() };
    results.push(row); log(JSON.stringify(row));
  }

// --- mobile
await b.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await b.send('Page.navigate', { url }); await b.sleep(800); await waitSettled();
await b.shot(out + '/screens/mobile-390-initial.png');
await b.ev(`document.querySelectorAll('.dial-input')[4].focus(); document.querySelectorAll('.dial-input')[4].blur(); window.scrollTo(0, 0)`);
for (const p of [2, 5]) { await b.ev(`(() => { const i = document.querySelectorAll('.dial-input')[4]; i.focus(); })()`); await b.key('Home'); for (let i = 0; i < p; i++) await b.key('ArrowUp'); await waitSettled(); await b.ev('window.scrollTo(0,0)'); await b.shot(`${out}/screens/mobile-390-p${p}.png`); }
await b.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 2, mobile: false });
await b.send('Page.navigate', { url }); await b.sleep(800); await waitSettled();
for (const p of [2, 4, 5]) { await b.ev(`document.querySelectorAll('.dial-input')[4].focus()`); await b.key('Home'); for (let i = 0; i < p; i++) await b.key('ArrowUp'); await waitSettled(); await b.shot(`${out}/screens/desktop-1280-p${p}.png`); }
log('ERRORS', b.errors.length ? b.errors : 'none');
b.close(); process.exit(0);
