// Minimal CDP helper shared by browser scripts. Launches headless Chrome.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
export async function launch(out, port = 9334) {
  mkdirSync(out, { recursive: true });
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${out}/profile`, '--no-first-run', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let ws;
  for (let i = 0; i < 50; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const p = l.find((t) => t.type === 'page'); if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); break; } } catch {} await sleep(200); }
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const pending = new Map(); const errors = [];
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
    if (d.method === 'Runtime.exceptionThrown') errors.push('EXC ' + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text));
    if (d.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(d.params.type)) errors.push(d.params.type + ' ' + d.params.args.map((a) => a.value ?? a.description).join(' ')); };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, (d) => r(d.result ?? d)); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400)); return r.result?.value; };
  const keyCodes = { ArrowUp: 38, ArrowDown: 40, ArrowRight: 39, ArrowLeft: 37, Home: 36, End: 35, PageUp: 33, PageDown: 34, Tab: 9, ' ': 32, Enter: 13 };
  const key = async (k, mods = 0) => { const base = { key: k, code: k === ' ' ? 'Space' : k, windowsVirtualKeyCode: keyCodes[k], modifiers: mods };
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...base });
    if (k === ' ' || k === 'Enter') await send('Input.dispatchKeyEvent', { type: 'char', text: k === ' ' ? ' ' : '\r', ...base });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base }); await sleep(30); };
  const shot = async (path, clip) => { const r = await send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip: { ...clip, scale: 1 } } : {}) }); writeFileSync(path, Buffer.from(r.data, 'base64')); };
  const saveDataUrl = (path, url) => writeFileSync(path, Buffer.from(url.split(',')[1], 'base64'));
  await send('Runtime.enable'); await send('Page.enable');
  return { send, ev, key, shot, sleep, errors, saveDataUrl, close: () => { ws.close(); chrome.kill(); } };
}
