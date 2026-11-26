// Records a short motion sample via CDP screencast; writes frames + an ffconcat file with real timings.
import { launch } from './cdp.mjs';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
const [url, outDir, reduced = '0'] = process.argv.slice(2);
rmSync(outDir, { recursive: true, force: true }); mkdirSync(outDir, { recursive: true });
const b = await launch(process.env.CDP_OUT || '/tmp/rec', 9355);
await b.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
if (reduced === '1') await b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await b.send('Page.navigate', { url }); await b.sleep(1500);
const frames = [];
// Patch our ws handler to capture screencast frames
const origSend = b.send;
let n = 0;
const ws = (await import('./cdp.mjs')); // noop import for clarity
await b.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
const collect = setInterval(() => {}, 1000);
// cdp.mjs routes only id responses; poll frames via a page-side recorder instead is not possible, so use DOM.screenshot fallback:
clearInterval(collect);
await b.send('Page.stopScreencast');
// Fallback: timed screenshots (~15 fps) while a scripted sequence runs in parallel.
let recording = true; const t0 = Date.now();
const shooter = (async () => { while (recording) { const t = Date.now() - t0; const r = await b.send('Page.captureScreenshot', { format: 'jpeg', quality: 85, clip: { x: 0, y: 0, width: 1280, height: 800, scale: 1 } }); frames.push([t, r.data]); } })();
const act = async () => {
  await b.sleep(500);
  await b.ev(`document.querySelectorAll('.dial-input')[2].focus()`);
  for (let i = 0; i < 12; i++) { await b.key('ArrowUp', 8); await b.sleep(60); }          // Phase sweeps in 15° steps
  await b.sleep(300);
  const [x, y] = await b.ev(`(() => { const r = document.querySelectorAll('.dial-wrap')[3].getBoundingClientRect(); return [r.x + r.width/2, r.y + r.height/2]; })()`);
  await b.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  for (let i = 1; i <= 40; i++) { await b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y: y - i * 2, button: 'left', buttons: 1 }); await b.sleep(20); }
  await b.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y: y - 80, button: 'left' });
  await b.sleep(500);
  await b.ev(`document.querySelector('input[name=mode]:not(:checked)').click()`); await b.sleep(900);
  await b.ev(`document.querySelector('input[name=mode]:not(:checked)').click()`); await b.sleep(900);
  for (let i = 0; i < 3; i++) { await b.ev(`[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Remix').click()`); await b.sleep(900); }
  await b.ev(`document.querySelector('.btn-primary').click()`); await b.sleep(2200);
};
await act(); recording = false; await shooter;
let concat = 'ffconcat version 1.0\n';
frames.forEach(([t, d], i) => { const f = `f${String(i).padStart(4, '0')}.jpg`; writeFileSync(`${outDir}/${f}`, Buffer.from(d, 'base64')); const next = frames[i + 1] ? frames[i + 1][0] : t + 66; concat += `file ${f}\nduration ${((next - t) / 1000).toFixed(3)}\n`; });
concat += `file f${String(frames.length - 1).padStart(4, '0')}.jpg\n`;
writeFileSync(`${outDir}/frames.ffconcat`, concat);
const dur = frames[frames.length - 1][0] / 1000;
console.log(`frames ${frames.length} over ${dur.toFixed(1)} s ≈ ${(frames.length / dur).toFixed(1)} fps capture`, 'ERRORS', b.errors.length ? b.errors : 'none');
b.close(); process.exit(0);
