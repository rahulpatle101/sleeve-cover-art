// Critique run: fresh profile, production build, real input only; records network + screenshots per step.
import { launch } from './cdp.mjs';
import { readdirSync, rmSync, mkdirSync } from 'node:fs';
const [url, outDir, width = '1280'] = process.argv.slice(2);
const W = Number(width), mobile = W < 600;
const prof = (process.env.CDP_OUT || '/tmp/crit') + '-' + W; rmSync(prof, { recursive: true, force: true });
const b = await launch(prof, mobile ? 9391 : 9390); const dl = prof + '/dl'; mkdirSync(dl, { recursive: true });
const reqs = []; await b.send('Network.enable');
const origOn = null;
await b.send('Emulation.setDeviceMetricsOverride', { width: W, height: mobile ? 780 : 900, deviceScaleFactor: 2, mobile });
if (mobile) await b.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await b.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dl });
// capture network via performance entries afterwards (cdp helper only routes responses)
await b.send('Page.navigate', { url }); await b.sleep(1500);
const shot = (n) => b.shot(`${outDir}/critique-${W}-${n}.png`);
const rect = (sel, i = 0) => b.ev(`(() => { const e = document.querySelectorAll('${sel}')[${i}]; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
const tap = async (sel, i = 0) => { await b.sleep(150); const [x, y] = await rect(sel, i); await b.sleep(100);
  if (mobile) { await b.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await b.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
  else { await b.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }); await b.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 }); } await b.sleep(200); };
const drag = async (sel, i, dx, dy) => { const [x, y] = await rect(sel, i); await b.sleep(100);
  if (mobile) { await b.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); for (let k = 1; k <= 15; k++) { await b.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * k / 15, y: y + dy * k / 15 }] }); await b.sleep(16); } await b.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
  else { await b.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }); for (let k = 1; k <= 15; k++) await b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x + dx * k / 15, y: y + dy * k / 15, button: 'left', buttons: 1 }); await b.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x + dx, y: y + dy, button: 'left' }); } await b.sleep(400); };
const state = () => b.ev(`[...document.querySelectorAll('.dial-input')].map(i => i.value).join('/') + ' ' + document.querySelector('input[name=mode]:checked').value + ' seed ' + document.querySelector('.meta .mono').textContent`);
const t0 = Date.now(); const log = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);
await shot('01-first-load'); log('first load: ' + await state());
// Identity: select existing text with triple click / tap + select-all keys, then type
for (const [id, text] of [['artist', 'Mira Okafor'], ['track', 'Tidewater']]) {
  await tap('#' + id); await b.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, modifiers: 4, commands: ['selectAll'] }); await b.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, modifiers: 4 });
  await b.send('Input.insertText', { text }); }
await b.sleep(300); await shot('02-identity'); log('identity typed: ' + await b.ev(`document.getElementById('artist').value + ' / ' + document.getElementById('track').value`));
await drag('.dial-wrap', 0, mobile ? 50 : 0, mobile ? 0 : -50); log('dragged Form: ' + await state());
await drag('.dial-wrap', 2, mobile ? 60 : 0, mobile ? 0 : -60); log('dragged Phase: ' + await state());
await shot('03-tuned');
await tap('.segment-radial'); await b.sleep(400); log('Radial selected: ' + await state()); await shot('04-radial');
for (let k = 1; k <= 4; k++) { await tap('.btn-secondary'); await b.sleep(400); log(`Remix ${k}: ` + await state()); await shot(`05-remix-${k}`); }
await tap('.btn-primary'); let f; for (let i = 0; i < 40 && !f; i++) { await b.sleep(200); f = readdirSync(dl).find((n) => n.endsWith('.png')); }
await b.sleep(300); log('exported: ' + f + ' | status: ' + await b.ev(`document.querySelector('[role=status]').innerText.replace(/\\n/g, ' | ')`)); await shot('06-exported');
const net = await b.ev(`performance.getEntriesByType('resource').map(e => e.name).concat([location.href])`);
const foreign = net.filter((u) => !u.startsWith(url));
log(`network: ${net.length} requests, all same-origin: ${foreign.length === 0}${foreign.length ? ' FOREIGN: ' + foreign.join(', ') : ''}`);
log('downloaded file: ' + (f ? dl + '/' + f : 'NONE'));
console.log('ERRORS', b.errors.length ? b.errors : 'none'); b.close(); process.exit(0);
