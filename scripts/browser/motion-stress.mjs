// Motion stress: repeated / interrupted transitions; settled preview must equal a fresh full render.
import { launch } from './cdp.mjs';
const [url, outDir] = process.argv.slice(2);
const b = await launch(process.env.CDP_OUT || '/tmp/mstress', 9349);
const log = (...a) => console.log(...a);
await b.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 2, mobile: false });
await b.send('Page.navigate', { url }); await b.sleep(1500);
const settledEqualsFresh = () => b.ev(`(async () => {
  const { renderArtwork } = await import('/src/artwork/renderArtwork.ts');
  const st = document.querySelector('canvas'); const W = st.width;
  const s = document.createElement('canvas'); s.width = s.height = W; s.getContext('2d').drawImage(st, 0, 0);
  // Rebuild the recipe from the UI state
  const v = [...document.querySelectorAll('.dial-input')].map(i => +i.value);
  const { validateRecipe } = await import('/src/instrument/recipe.ts');
  const seed = parseInt(document.querySelector('.meta .mono').textContent, 16);
  const r = validateRecipe({ seed, mode: document.querySelector('input[name=mode]:checked').value, artist: document.getElementById('artist').value, track: document.getElementById('track').value, form: v[0], rhythm: v[1], phase: v[2], density: v[3], palette: v[4] - 1 });
  // Same canvas (same rasteriser backend): draw the fresh full render over the stage and compare.
  const sx = st.getContext('2d'); sx.setTransform(1, 0, 0, 1, 0, 0); sx.globalAlpha = 1; renderArtwork(sx, r, W, W);
  const f = document.createElement('canvas'); f.width = f.height = W; f.getContext('2d').drawImage(st, 0, 0);
  const a = s.getContext('2d').getImageData(0, 0, W, W).data, c = f.getContext('2d').getImageData(0, 0, W, W).data;
  let diff = 0; for (let i = 0; i < a.length; i++) if (a[i] !== c[i]) diff++;
  return diff === 0 ? 'IDENTICAL' : diff + ' bytes differ';
})()`);
const remix = `[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Remix').click()`;
log('Settled initial == fresh renderArtwork:', await settledEqualsFresh());
// 10 Remixes at 50 ms, then measure settle and compare
let t0 = Date.now(); for (let i = 0; i < 10; i++) { await b.ev(remix); await b.sleep(50); }
const tl = await b.ev(`(async () => { const c = document.querySelector('canvas'); const s = document.createElement('canvas'); s.width = s.height = 16; const x = s.getContext('2d', { willReadFrequently: true });
  const fp = () => { x.drawImage(c, 0, 0, 16, 16); return x.getImageData(0, 0, 16, 16).data.join(','); }; const out = []; const t = performance.now();
  await new Promise(done => { const tick = (n) => { out.push([n - t, fp()]); n - t < 600 ? requestAnimationFrame(tick) : done(); }; requestAnimationFrame(tick); });
  const last = out[out.length - 1][1]; const i = out.findIndex((_, k) => out.slice(k).every(o => o[1] === last)); return Math.round(out[i][0]); })()`);
log(`10 Remixes @50 ms: settled ${tl} ms after the last click (≤ ${140 + 20} expected)`);
log('Settled after Remix burst == fresh renderArtwork:', await settledEqualsFresh());
// Alternating engine 12× at 30 ms + tuning mid-fade
for (let i = 0; i < 12; i++) { await b.ev(`document.querySelector('input[name=mode]:not(:checked)').click()`); await b.sleep(30); }
await b.ev(`(() => { const el = document.querySelectorAll('.dial-input')[2]; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, '200'); el.dispatchEvent(new Event('input', { bubbles: true })); })()`);
await b.sleep(500);
log('Settled after 12 engine flips + mid-fade tuning == fresh renderArtwork:', await settledEqualsFresh());
// Type crispness mid-fade: meta label region must match the final label exactly during a fade
await b.ev(`document.querySelector('input[name=mode]:not(:checked)').click()`); await b.sleep(90);
const metaMid = await b.ev(`(() => { const c = document.querySelector('canvas'); const W = c.width; const x = c.getContext('2d').getImageData(Math.round(W*0.075), Math.round(W*0.07), Math.round(W*0.3), Math.round(W*0.045)).data; let h = 0; for (let i = 0; i < x.length; i++) h = (h * 31 + x[i]) >>> 0; return h; })()`);
if (outDir) await b.shot(`${outDir}/motion-midfade-after.png`, { x: 16, y: 56, width: 734, height: 734 });
await b.sleep(500);
const metaEnd = await b.ev(`(() => { const c = document.querySelector('canvas'); const W = c.width; const x = c.getContext('2d').getImageData(Math.round(W*0.075), Math.round(W*0.07), Math.round(W*0.3), Math.round(W*0.045)).data; let h = 0; for (let i = 0; i < x.length; i++) h = (h * 31 + x[i]) >>> 0; return h; })()`);
log('Meta label region mid-fade (90 ms) identical to settled:', metaMid === metaEnd);
log('ERRORS', b.errors.length ? b.errors : 'none'); b.close(); process.exit(0);
