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

const btn = `[...document.querySelectorAll('button')].find(b => /sound/i.test(b.textContent))`;
log('AUDIO initial', await ev(`${btn}.textContent.trim() + ' ' + ${btn}.textContent + ' ctxCreatedBeforeGesture=' + (typeof window.__noop)`));
await ev(`${btn}.focus()`); await key('Enter'); await sleep(400);
log('AUDIO after Enter', await ev(`${btn}.textContent.trim() + ' | ' + ${btn}.textContent + ' | status=' + document.querySelector('[role=status]').textContent`));
await ev(`document.querySelectorAll('.dial-input')[0].focus()`); for (let i=0;i<5;i++) await key('ArrowUp');
await ev(`${btn}.focus()`); await key(' '); await sleep(300);
log('AUDIO after Space (mute)', await ev(`${btn}.textContent.trim() + ' | ' + ${btn}.textContent`));
log('ERRORS', errors.length ? errors.join('\n') : 'none');
ws.close(); chrome.kill();
process.exit(0);
