// Headless Chrome driver via CDP (Node global WebSocket). Usage: node drive.mjs <url> <outdir>
import { spawn } from 'node:child_process';
import { writeFileSync, readdirSync, statSync, mkdirSync, rmSync } from 'node:fs';
const [url, out] = process.argv.slice(2);
const dl = out + '/dl';
rmSync(dl, { recursive: true, force: true }); mkdirSync(dl, { recursive: true });
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', '--remote-debugging-port=9333', `--user-data-dir=${out}/profile`, '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
for (let i = 0; i < 50; i++) { try { const l = await (await fetch('http://127.0.0.1:9333/json/list')).json(); const p = l.find((t) => t.type === 'page'); if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); break; } } catch {} await sleep(200); }
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map(); const errors = [];
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
  if (d.method === 'Runtime.exceptionThrown') errors.push('EXC ' + d.params.exceptionDetails.exception?.description);
  if (d.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(d.params.type)) errors.push(d.params.type + ' ' + d.params.args.map((a) => a.value ?? a.description).join(' ')); };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, (d) => r(d.result ?? d)); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.value;
const key = async (k, mods = 0) => { const map = { ArrowUp: 38, ArrowDown: 40, ArrowRight: 39, ArrowLeft: 37, Home: 36, End: 35, PageUp: 33, PageDown: 34, Tab: 9, ' ': 32, Enter: 13 };
  const base = { key: k, code: k === ' ' ? 'Space' : k, windowsVirtualKeyCode: map[k], modifiers: mods };
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...base }); if (k === ' ' || k === 'Enter') await send('Input.dispatchKeyEvent', { type: 'char', text: k === ' ' ? ' ' : '\r', ...base }); await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base }); await sleep(30); };
const shot = async (name) => { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${out}/${name}.png`, Buffer.from(r.data, 'base64')); };
const state = () => ev(`(() => { const v = [...document.querySelectorAll('.rotary')].map(r => r.querySelector('.rotary-label').textContent + '=' + r.querySelector('input').value); return { mode: document.querySelector('input[name=mode]:checked').value, v: v.join(' '), seed: document.querySelector('.meta .mono').textContent, active: document.activeElement?.id || document.activeElement?.textContent?.trim() || document.activeElement?.tagName }; })()`);
const log = (...a) => console.log(...a);

await send('Runtime.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 2, mobile: false });
await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dl, eventsEnabled: true });
await send('Page.navigate', { url }); await sleep(1500);
log('INITIAL', JSON.stringify(await state()));
log('canvas', await ev(`(() => { const c = document.querySelector('canvas'); return c.width + 'x' + c.height + ' css ' + c.clientWidth; })()`));
await shot('desktop-initial');

// Tab order
const order = [];
await ev('document.activeElement.blur(); document.body.focus()');
for (let i = 0; i < 12; i++) { await key('Tab'); const s = await ev(`(() => { const a = document.activeElement; const l = a.labels?.[0]?.textContent || a.getAttribute('aria-label') || a.textContent; return a.tagName + ':' + (a.type||'') + ':' + (l||'').trim().slice(0,20); })()`); order.push(s); }
log('TAB ORDER', order.join(' | '));

// Keyboard on text
await ev(`document.getElementById('artist').focus(); document.getElementById('artist').select()`);
await send('Input.insertText', { text: 'Ada Vélo' });
await ev(`document.getElementById('track').focus(); document.getElementById('track').select()`);
await send('Input.insertText', { text: 'A Very Long Track Title That Should Shrink To Fit Nicely' });
await sleep(100);
await shot('desktop-longtext'); log('TEXT', await ev(`document.getElementById('artist').value + ' / ' + document.getElementById('track').value`));

// Keyboard on rotaries (Form)
const focusRot = (i) => ev(`document.querySelectorAll('.dial-input')[${i}].focus()`);
const val = (i) => ev(`document.querySelectorAll('.dial-input')[${i}].value + ' shown ' + document.querySelectorAll('.rotary-value')[${i}].textContent`);
await focusRot(0); log('Form start', await val(0));
await key('ArrowUp'); log('Form ArrowUp', await val(0));
await key('ArrowRight'); log('Form ArrowRight', await val(0));
await key('ArrowDown'); log('Form ArrowDown', await val(0));
await key('ArrowUp', 8); log('Form Shift+ArrowUp', await val(0));
await key('End'); log('Form End', await val(0));
await key('ArrowUp'); log('Form ArrowUp at max', await val(0));
await key('Home'); log('Form Home', await val(0));
await key('PageUp'); log('Form PageUp', await val(0));
await focusRot(2); await key('PageUp'); log('Phase PageUp', await val(2)); await key('ArrowLeft'); log('Phase ArrowLeft', await val(2));
log('Phase aria-valuetext', await ev(`document.querySelectorAll('.dial-input')[2].getAttribute('aria-valuetext')`));
await focusRot(4); await key('ArrowUp'); log('Palette ArrowUp', await val(4), await ev(`document.querySelectorAll('.dial-input')[4].getAttribute('aria-valuetext')`));
log('Range a11y', await ev(`[...document.querySelectorAll('.dial-input')].map(i => i.labels[0].textContent + '[' + i.min + '-' + i.max + ']').join(' ')`));
await focusRot(3); await shot('desktop-focus-density');

// Mode via keyboard
await ev(`document.querySelector('input[value=harmonic]').focus()`); await key('ArrowRight'); log('MODE after ArrowRight', (await state()).mode);
await sleep(150); await shot('desktop-radial');
await key('ArrowLeft'); log('MODE after ArrowLeft', (await state()).mode);

// Pointer drag on Density dial
const rect = await ev(`(() => { const r = document.querySelectorAll('.dial-wrap')[3].getBoundingClientRect(); return [r.x + r.width/2, r.y + r.height/2]; })()`);
log('Density before drag', await val(3));
await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect[0], y: rect[1], button: 'left', clickCount: 1 });
for (let dy = 0; dy <= 60; dy += 6) await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect[0], y: rect[1] - dy, button: 'left', buttons: 1 });
await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect[0], y: rect[1] - 60, button: 'left', clickCount: 1 });
log('Density after drag up 60px', await val(3), 'focused:', await ev(`document.activeElement === document.querySelectorAll('.dial-input')[3]`));
await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect[0], y: rect[1], button: 'left', clickCount: 1 });
for (let dy = 0; dy <= 200; dy += 20) await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect[0], y: rect[1] + dy, button: 'left', buttons: 1 });
await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect[0], y: rect[1] + 200, button: 'left' });
log('Density after drag down 200px (clamp)', await val(3));

// Remix determinism across reloads
const remixSeq = async () => { const r = []; for (let i = 0; i < 3; i++) { await ev(`[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Remix').click()`); await sleep(60); r.push((await state()).seed + ' ' + (await state()).v); } return r; };
await send('Page.reload'); await sleep(1200);
const seqA = await remixSeq();
await sleep(500); const pixA = await ev(`document.querySelector('canvas').toDataURL()`);
await send('Page.reload'); await sleep(1200);
const seqB = await remixSeq();
await sleep(500); const pixB = await ev(`document.querySelector('canvas').toDataURL()`);
log('REMIX A', seqA.join(' || ')); log('REMIX B', seqB.join(' || '));
log('REMIX deterministic across reloads:', JSON.stringify(seqA) === JSON.stringify(seqB), 'canvas pixels identical:', pixA === pixB);
await shot('desktop-remix3');

// Export (download) + live region
await ev(`document.querySelector('.btn-primary').click()`);
let file; for (let i = 0; i < 60; i++) { await sleep(250); const f = readdirSync(dl).filter((n) => n.endsWith('.png')); if (f.length) { file = f[0]; break; } }
await sleep(300);
log('EXPORT file', file, file && statSync(`${dl}/${file}`).size + ' bytes');
log('EXPORT status', await ev(`document.querySelector('[role=status]').textContent`));
writeFileSync(`${out}/preview-at-export.png`, Buffer.from(pixB.split(',')[1], 'base64'));

// Radial export too
await ev(`document.querySelector('input[value=radial]').click()`); await sleep(100);
await ev(`document.querySelector('.btn-primary').click()`);
await sleep(2500);
log('EXPORT files', readdirSync(dl).join(', '));
writeFileSync(`${out}/preview-radial.png`, Buffer.from((await ev(`document.querySelector('canvas').toDataURL()`)).split(',')[1], 'base64'));

// Targets ≥ 44px
log('SMALL TARGETS', await ev(`[...document.querySelectorAll('input, button, .dial-wrap, .segment')].filter(e => getComputedStyle(e).opacity !== '0' || e.classList.contains('dial-wrap')).map(e => { const r = e.getBoundingClientRect(); return [e.id || e.className || e.tagName, Math.round(r.width), Math.round(r.height)]; }).filter(([, w, h]) => w < 44 || h < 44).map(x => x.join(':')).join(' ') || 'none'`));

// 360 px + reduced motion
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 780, deviceScaleFactor: 2, mobile: true });
await sleep(600);
log('360 scrollWidth', await ev('document.documentElement.scrollWidth'), 'reduced-motion matches', await ev(`matchMedia('(prefers-reduced-motion: reduce)').matches`));
await shot('mobile-360-top');
await ev('window.scrollTo(0, 99999)'); await sleep(200); await shot('mobile-360-bottom');
log('ERRORS', errors.length ? errors.join('\n') : 'none');
ws.close(); chrome.kill();
process.exit(0);
