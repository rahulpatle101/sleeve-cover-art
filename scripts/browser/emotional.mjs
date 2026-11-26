// Emotional pass: weak-state recovery, empty identity, export completion and failure.
import { launch } from './cdp.mjs';
import { readdirSync } from 'node:fs';
const [url, outDir] = process.argv.slice(2);
const b = await launch(process.env.CDP_OUT || '/tmp/emo', 9342);
const log = (...a) => console.log(...a);
await b.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await b.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: (process.env.CDP_OUT || '/tmp/emo') + '/dl' });
await b.send('Page.navigate', { url }); await b.sleep(1500);
const set = (i, v) => b.ev(`(() => { const el = document.querySelectorAll('.dial-input')[${i}]; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, '${v}'); el.dispatchEvent(new Event('input', { bubbles: true })); })()`);
const clip = { x: 16, y: 56, width: 734, height: 734 };
// Weak state → Remix recovery
await set(0, 1); await set(1, 1); await set(2, 0); await set(3, 1); await b.sleep(300);
await b.shot(`${outDir}/emotional-weak-state.png`, clip);
await b.ev(`[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Remix').click()`); await b.sleep(500);
log('REMIX from weak 1/1/0/1 →', await b.ev(`[...document.querySelectorAll('.dial-input')].map(i => i.value).join('/')`), 'mode kept:', await b.ev(`document.querySelector('input[name=mode]:checked').value`), 'artist kept:', await b.ev(`document.getElementById('artist').value`));
await b.shot(`${outDir}/emotional-remix-recovery.png`, clip);
// Empty identity
for (const id of ['artist', 'track']) { await b.ev(`(() => { const i = document.getElementById('${id}'); i.focus(); i.select(); })()`); await b.key('Tab'); await b.ev(`(() => { const i = document.getElementById('${id}'); i.focus(); i.select(); document.execCommand('delete'); })()`); }
await b.sleep(300);
log('EMPTY placeholders:', await b.ev(`document.getElementById('artist').placeholder + ' / ' + document.getElementById('track').placeholder`), 'values:', JSON.stringify(await b.ev(`document.getElementById('artist').value + '|' + document.getElementById('track').value`)));
await b.shot(`${outDir}/emotional-empty-identity.png`);
const exportBtn = `[...document.querySelectorAll('.btn-primary')][0]`;
await b.ev(`${exportBtn}.click()`);
const seen = new Set(); for (let i = 0; i < 40; i++) { seen.add(await b.ev(`${exportBtn}.textContent + ' || ' + document.querySelector('[role=status]').textContent`)); await b.sleep(50); }
log('EXPORT (unnamed) states seen:\n  ' + [...seen].join('\n  '));
await b.sleep(2600); log('EXPORT button after 2.6 s:', await b.ev(`${exportBtn}.textContent`));
// Named export
await b.ev(`(() => { const i = document.getElementById('artist'); i.focus(); })()`); await b.send('Input.insertText', { text: 'Night Office' });
await b.ev(`(() => { const i = document.getElementById('track'); i.focus(); })()`); await b.send('Input.insertText', { text: 'Phase Garden' });
await b.ev(`${exportBtn}.click()`); await b.sleep(1500);
log('EXPORT (named) status:', await b.ev(`document.querySelector('[role=status]').textContent`), '| button:', await b.ev(`${exportBtn}.textContent`), '| accessible name has no glyph:', await b.ev(`${exportBtn}.innerText`));
if (outDir) await b.shot(`${outDir}/emotional-export-complete.png`, { x: 770, y: 560, width: 500, height: 220 });
// Failure path: browser refuses to encode
await b.ev(`HTMLCanvasElement.prototype.toDataURL = function () { return 'data:,'; }`); // browser refuses to encode
const before = await b.ev(`[...document.querySelectorAll('.dial-input')].map(i => i.value).join('/') + ' ' + document.getElementById('artist').value`);
await b.ev(`${exportBtn}.click()`); await b.sleep(800);
log('EXPORT failure status:', await b.ev(`document.querySelector('[role=status]').textContent`), '| button:', await b.ev(`${exportBtn}.textContent`), '| disabled:', await b.ev(`${exportBtn}.disabled`));
log('EXPORT failure keeps recipe:', before === await b.ev(`[...document.querySelectorAll('.dial-input')].map(i => i.value).join('/') + ' ' + document.getElementById('artist').value`));
log('DOWNLOADS', readdirSync((process.env.CDP_OUT || '/tmp/emo') + '/dl').join(', '));
log('ERRORS', b.errors.length ? b.errors : 'none');
b.close(); process.exit(0);
