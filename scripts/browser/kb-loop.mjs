// Strict keyboard-only loop: Tab/Shift+Tab, arrows, Space/Enter and typed text only. No mouse, no DOM actions.
import { launch } from './cdp.mjs';
import { readdirSync, rmSync, mkdirSync } from 'node:fs';
const [url, rm = '0'] = process.argv.slice(2);
const out = (process.env.CDP_OUT || '/tmp/kb'); rmSync(out, { recursive: true, force: true });
const b = await launch(out, 9394); const dl = out + '/dl'; mkdirSync(dl, { recursive: true });
await b.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
if (rm === '1') await b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await b.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dl });
if (process.env.TRACE) await b.send('Page.addScriptToEvaluateOnNewDocument', { source: `
  window.__tr = []; const T = (m) => window.__tr.push(Math.round(performance.now()) + ' ' + m);
  const tb = HTMLCanvasElement.prototype.toBlob; HTMLCanvasElement.prototype.toBlob = function (cb, ...a) { T('toBlob start ' + this.width); return tb.call(this, (blob) => { T('toBlob done ' + (blob && blob.size)); cb(blob); }, ...a); };
  const ac = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { T('a.click start'); ac.call(this); T('a.click end'); };
  document.addEventListener('keydown', (e) => T('keydown ' + e.key), true); document.addEventListener('click', (e) => T('click ' + (e.target.className || e.target.tagName)), true);
` });
await b.send('Page.navigate', { url }); await b.sleep(1300);
const active = () => b.ev(`(() => { const a = document.activeElement; return (a.getAttribute('aria-label') || a.textContent.trim() || a.id) + (a.value !== undefined && a.type !== 'button' ? '=' + a.value : ''); })()`);
const tab = async (n = 1) => { for (let i = 0; i < n; i++) await b.key('Tab'); return active(); };
const selectAllType = async (text) => { await b.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, modifiers: 4, commands: ['selectAll'] }); await b.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, modifiers: 4 }); await b.send('Input.insertText', { text }); };
const steps = [];
steps.push('Tab → ' + await tab()); await selectAllType('Kofi Lindqvist'); steps.push('typed artist → ' + await active());
steps.push('Tab → ' + await tab()); await selectAllType('Salt Lines'); steps.push('typed track → ' + await active());
steps.push('Tab → ' + await tab()); await b.key('ArrowRight'); steps.push('Engine ArrowRight → ' + await b.ev(`document.querySelector('input[name=mode]:checked').value`));
steps.push('Tab → ' + await tab()); for (let i = 0; i < 2; i++) await b.key('ArrowUp'); steps.push('Form ↑↑ → ' + await active());
steps.push('Tab → ' + await tab()); await b.key('End'); steps.push('Rhythm End → ' + await active());
steps.push('Tab → ' + await tab()); await b.key('PageUp'); await b.key('ArrowUp', 8); steps.push('Phase PgUp, Shift↑ → ' + await active());
steps.push('Tab → ' + await tab()); await b.key('Home'); for (let i = 0; i < 5; i++) await b.key('ArrowUp'); steps.push('Density Home, ↑×5 → ' + await active());
steps.push('Tab → ' + await tab()); await b.key('ArrowUp'); await b.key('ArrowUp'); steps.push('Palette ↑↑ → ' + await active());
steps.push('Tab → ' + await tab()); const seed0 = await b.ev(`document.querySelector('.meta .mono').textContent`); await b.key('Enter'); await b.sleep(300); steps.push(`Remix Enter → seed ${seed0} → ${await b.ev(`document.querySelector('.meta .mono').textContent`)}; artist kept: ${await b.ev(`document.getElementById('artist').value`)}`);
await b.key(' '); await b.sleep(300); steps.push('Remix Space → seed ' + await b.ev(`document.querySelector('.meta .mono').textContent`));
steps.push('Tab → ' + await tab(2)); await b.key('Enter');
let f; for (let i = 0; i < 40 && !f; i++) { await b.sleep(150); f = readdirSync(dl).find((n) => n.endsWith('.png')); }
await b.sleep(200); steps.push('Export Enter → file ' + f + ' | status "' + await b.ev(`document.querySelector('[role=status]').innerText.replace(/\\n/g, ' | ')`) + '"');
steps.push('focus still on: ' + await active() + ' | focus ring visible: ' + await b.ev(`getComputedStyle(document.activeElement).outlineStyle !== 'none' || getComputedStyle(document.activeElement, ':focus-visible').outlineWidth`));
steps.push('Shift+Tab ×3 → ' + await (async () => { for (let i = 0; i < 3; i++) await b.key('Tab', 8); return active(); })());
console.log((rm === '1' ? '[reduced motion] ' : '') + steps.join('\n'));
if (process.env.TRACE) console.log('TRACE (tail):\n' + (await b.ev('window.__tr.slice(-14).join("\\n")')));
console.log('ERRORS', b.errors.length ? b.errors : 'none'); b.close(); process.exit(0);
