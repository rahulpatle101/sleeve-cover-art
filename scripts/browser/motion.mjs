// Motion pass: crossfade timeline, no-queue under rapid changes, reduced motion cut, render cost.
import { launch } from './cdp.mjs';
const [url, outDir] = process.argv.slice(2);
const b = await launch(process.env.CDP_OUT || '/tmp/motion', 9336);
const log = (...a) => console.log(...a);
await b.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 2, mobile: false });
await b.send('Page.navigate', { url }); await b.sleep(1500);
// Records a per-frame fingerprint after running `action`.
const timeline = (action, ms = 700) => b.ev(`(async () => {
  const c = document.querySelector('canvas'); const s = document.createElement('canvas'); s.width = s.height = 24; const sx = s.getContext('2d', { willReadFrequently: true });
  const fp = () => { sx.drawImage(c, 0, 0, 24, 24); const d = sx.getImageData(0, 0, 24, 24).data; let h = 0; for (let i = 0; i < d.length; i += 4) h += d[i] * 3 + d[i+1] * 5 + d[i+2] * 7; return h; };
  const t0 = performance.now(); const out = [[0, fp()]];
  ${action}
  await new Promise((done) => { const tick = (now) => { out.push([Math.round(now - t0), fp()]); if (now - t0 < ${ms}) requestAnimationFrame(tick); else done(); }; requestAnimationFrame(tick); });
  return out;
})()`);
const summarize = (name, tl) => {
  const first = tl[0][1], last = tl[tl.length - 1][1];
  let settled = tl.findIndex(([, h], i) => tl.slice(i).every(([, x]) => x === last));
  const distinct = new Set(tl.map(([, h]) => h)).size;
  const intermediate = tl.filter(([, h]) => h !== first && h !== last).length;
  log(`${name}: frames=${tl.length} distinct=${distinct} intermediate(blend) frames=${intermediate} settled at ${tl[settled][0]} ms`); return tl;
};
const clickRadio = (m) => `document.querySelector('input[value=${m}]').click();`;
summarize('MODE switch (normal)', await timeline(`document.querySelector('input[name=mode]:not(:checked)').click();`));
await b.sleep(400);
// Mid-fade screenshot for evidence
if (outDir) { await b.ev(clickRadio('harmonic')); await b.sleep(110); await b.shot(`${outDir}/motion-midfade.png`, { x: 0, y: 0, width: 760, height: 800 }); await b.sleep(500); }
summarize('REMIX (normal)', await timeline(`[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Remix').click();`));
await b.sleep(400);
summarize('RAPID 5 mode switches in ~200 ms', await timeline(`for (let i = 0; i < 5; i++) { document.querySelector('input[value=' + (i % 2 ? 'harmonic' : 'radial') + ']').click(); await new Promise(r => setTimeout(r, 40)); }`, 900));
await b.sleep(400);
summarize('TUNE Phase +1 (normal, should be immediate)', await timeline(`(() => { const i = document.querySelectorAll('.dial-input')[2]; i.focus(); i.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true })); })();`, 300));
await b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await b.sleep(200);
summarize('MODE switch (reduced motion)', await timeline(`document.querySelector('input[name=mode]:not(:checked)').click();`));
summarize('REMIX (reduced motion)', await timeline(`[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Remix').click();`));
log('REDUCED button transition-duration:', await b.ev(`getComputedStyle(document.querySelector('.btn')).transitionDuration`));
await b.send('Emulation.setEmulatedMedia', { features: [] });
// Render cost at maximum density, preview size and export size
log('ERRORS', b.errors.length ? b.errors : 'none');
b.close(); process.exit(0);
