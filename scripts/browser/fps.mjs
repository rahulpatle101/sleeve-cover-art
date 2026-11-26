// Live frame intervals while a control changes every frame (no readback).
import { launch } from './cdp.mjs';
const [url] = process.argv.slice(2);
const b = await launch(process.env.CDP_OUT || '/tmp/fps', 9339);
await b.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 2, mobile: false });
await b.send('Page.navigate', { url }); await b.sleep(1500);
for (const [mode, form, rhythm] of [['harmonic', 7, 8], ['radial', 7, 8]]) {
  console.log(mode, await b.ev(`(async () => {
    document.querySelector('input[value=${mode}]').click(); await new Promise(r => setTimeout(r, 500));
    const set = (i, v) => { const el = document.querySelectorAll('.dial-input')[i]; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(v)); el.dispatchEvent(new Event('input', { bubbles: true })); };
    set(0, ${form}); set(1, ${rhythm}); await new Promise(r => setTimeout(r, 300));
    const iv = []; let last = performance.now();
    await new Promise((done) => { let n = 0; const tick = (now) => { iv.push(now - last); last = now; set(2, (n * 7) % 361); set(3, n % 2 ? 24 : 23); if (++n < 90) requestAnimationFrame(tick); else done(); }; requestAnimationFrame(tick); });
    iv.shift(); iv.sort((a, b) => a - b);
    return 'Density 23↔24 + Phase sweep, 90 frames: median ' + iv[45].toFixed(1) + ' ms, p90 ' + iv[81].toFixed(1) + ' ms (≈' + (1000 / iv[45]).toFixed(0) + ' fps)';
  })()`));
}
console.log('ERRORS', b.errors.length ? b.errors : 'none');
b.close(); process.exit(0);
