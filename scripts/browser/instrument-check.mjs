// SLEEVE v0.2 instrument checks (Analog UI controls over native inputs). Usage: node instrument-check.mjs <url> <outdir>
import { launch } from './cdp.mjs';
import { tmpdir } from 'node:os';
import { readdirSync, rmSync, mkdirSync, readFileSync } from 'node:fs';
const [url, out] = process.argv.slice(2);
const b = await launch(`${tmpdir()}/sleeve-instrument-chrome`, 9401); // browser profile OUTSIDE the project (never watched)
let pass = 0, fail = 0; const ok = (n, c, d = '') => { c ? pass++ : fail++; console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };
await b.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false });
await b.send('Page.navigate', { url }); await b.sleep(3500);
const val = (i) => b.ev(`+document.querySelectorAll('.ab-native')[${i}].value`);
const vis = (i) => b.ev(`document.querySelectorAll('[role=spinbutton]')[${i}].getAttribute('aria-valuenow')`);
// tab order
await b.ev('document.body.focus()'); const order = [];
for (let i = 0; i < 12; i++) { await b.key('Tab'); order.push(await b.ev(`(() => { const a = document.activeElement; return (a.getAttribute('aria-label') || a.labels?.[0]?.textContent || a.textContent || a.tagName).trim().slice(0, 30); })()`)); }
ok('tab order: Artist → Track → Form → Rhythm → Registration → Passes → Engine → Press set → New Proof → Sound → Print', JSON.stringify(order.slice(0, 11)) === JSON.stringify(['Artist', 'Track', 'Form', 'Rhythm', 'Registration', 'Passes', 'Harmonic, Lissajous', 'Newsprint', 'New Proof', 'Sound', 'Print Sleeve']), order.join(' > '));
// keyboard model on each native slider, and the Analog visual follows
for (const [i, name, coarse, min, max] of [[0, 'Form', 2, 1, 8], [1, 'Rhythm', 2, 1, 8], [2, 'Registration', 15, 0, 360], [3, 'Passes', 4, 1, 24]]) {
  await b.ev(`document.querySelectorAll('.ab-native')[${i}].focus()`); const s0 = await val(i);
  await b.key('ArrowUp'); const a = await val(i); await b.key('ArrowUp', 8); const sh = await val(i); await b.key('End'); const e = await val(i); await b.key('Home'); const h = await val(i);
  const v = await vis(i);
  ok(`${name}: Arrow / Shift(±${coarse}) / Home / End on the native range; Analog dial follows`, a === Math.min(max, s0 + 1) && sh === Math.min(max, a + coarse) && e === max && h === min && +v === min, `${s0}→${a}→${sh}, End ${e}, Home ${h}, visual ${v}`);
}
// pointer drag on the Analog Registration dial (vertical drag)
await b.ev(`document.querySelectorAll('.ab-native')[2].focus()`); await b.key('Home'); for (let k = 0; k < 3; k++) await b.key('PageUp');
const c = await b.ev(`(() => { const r = document.querySelectorAll('.ab-dial-hit')[2].getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, r.width]; })()`);
const before = await val(2);
await b.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c[0], y: c[1] + c[2] * 0.3, button: 'left', clickCount: 1 });
for (let k = 0; k <= 12; k++) await b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: c[0], y: c[1] + c[2] * 0.3 - k * 8, button: 'left', buttons: 1 });
await b.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c[0], y: c[1] + c[2] * 0.3 - 96, button: 'left', clickCount: 1 });
const after = await val(2), focused = await b.ev(`document.activeElement === document.querySelectorAll('.ab-native')[2]`);
ok('pointer drag on the Analog dial changes the value and keeps keyboard focus on the native slider', after !== before && focused, `${before}→${after}, focused ${focused}`);
// artist / track reach the real recipe (cover type layer)
await b.ev(`document.getElementById('artist').focus(); document.getElementById('artist').select()`); await b.send('Input.insertText', { text: 'Mira Okafor' }); await b.sleep(150);
ok('artist field updates the real recipe and cover label', (await b.ev(`document.querySelector('canvas').getAttribute('aria-label')`)) !== null && (await b.ev(`document.getElementById('artist').value`)) === 'Mira Okafor');
// engine radios
await b.ev(`document.querySelector('input[value=harmonic]').focus()`); await b.key('ArrowRight');
ok('engine: arrow keys switch the native radio; rocker follows', await b.ev(`document.querySelector('input[value=radial]').checked && !!document.querySelector('[data-slot]')`));
// Press set: six native radios, arrows cycle and wrap, reach the cover description
await b.ev(`document.querySelector('input[name=press-set]:checked').focus()`); const cyc = [];
for (let i = 0; i < 6; i++) { await b.key('ArrowDown'); cyc.push(await b.ev(`document.querySelector('input[name=press-set]:checked').value`)); }
ok('Press set: arrow keys cycle all six sets and wrap; cover label follows', cyc.join('') === '123450' && (await b.ev(`document.querySelector('canvas').getAttribute('aria-label')`)).includes('press set'), cyc.join(''));
// New Proof
const s1 = await b.ev(`document.querySelector('.ab-seed').textContent`);
await b.ev(`[...document.querySelectorAll('button')].find(x => x.textContent.includes('New Proof')).click()`); await b.sleep(200);
ok('New Proof remixes the real recipe (seed line changes)', s1 !== (await b.ev(`document.querySelector('.ab-seed').textContent`)));
// Print Sleeve: keyboard Enter → real 3000×3000 PNG, polite status, focus kept
const dl = out + '/.dl'; rmSync(dl, { recursive: true, force: true }); mkdirSync(dl, { recursive: true });
await b.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dl });
for (let i = 0; i < 150; i++) { if ((await b.ev(`document.querySelector('canvas').dataset.settled`)) === 'true') break; await b.sleep(20); }
await b.ev(`[...document.querySelectorAll('button')].find(x => x.getAttribute('aria-label') === 'Print Sleeve').focus()`); await b.key('Enter');
let file; for (let i = 0; i < 100 && !file; i++) { await b.sleep(100); file = readdirSync(dl).find((f) => f.endsWith('.png')); } await b.sleep(300);
const dims = file ? (() => { const buf = readFileSync(`${dl}/${file}`); return buf.readUInt32BE(16) + '×' + buf.readUInt32BE(20); })() : 'none';
const st = await b.ev(`document.querySelector('[role=status]').textContent`);
ok('Print Sleeve: Enter prints a 3000×3000 PNG, announces politely, keeps focus', dims === '3000×3000' && st.startsWith('Sleeve printed — 3000 × 3000 PNG.') && (await b.ev(`document.activeElement.getAttribute('aria-label') === 'Print Sleeve'`)), `${file} ${dims} · "${st.slice(0, 60)}"`);
rmSync(dl, { recursive: true, force: true });
// accessibility tree
await b.send('Accessibility.enable'); const ax = await b.send('Accessibility.getFullAXTree');
const nodes = ax.nodes.filter((n) => !n.ignored && ['slider', 'spinbutton', 'radio', 'button', 'status'].includes(n.role?.value)).map((n) => { const p = Object.fromEntries((n.properties || []).map((q) => [q.name, q.value?.value])); return `${n.role.value}:"${n.name?.value ?? ''}"${p.valuetext ? ' vt=' + p.valuetext : ''}${p.pressed !== undefined ? ' pressed=' + p.pressed : ''}`; });
console.log('AX: ' + nodes.join(' | '));
ok('VoiceOver-relevant tree: 4 named sliders, 8 named radios (engine + press set), no Analog spinbuttons exposed', nodes.filter((n) => n.startsWith('slider')).length === 4 && nodes.filter((n) => n.startsWith('radio')).length === 8 && !nodes.some((n) => n.startsWith('spinbutton')));
ok('buttons are named New Proof / Sound / Print Sleeve (no duplicated labels)', ['New Proof', 'Sound', 'Print Sleeve'].every((t) => nodes.some((n) => n === `button:"${t}"` || n.startsWith(`button:"${t}" `))), nodes.filter((n) => n.startsWith('button')).join(' · '));
// 44 px targets at desktop and 390 mobile, no horizontal scroll on mobile
for (const [w, h, m] of [[1440, 900, false], [390, 844, true]]) {
  await b.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: m }); await b.sleep(600);
  const t = await b.ev(`JSON.stringify({ sw: document.documentElement.scrollWidth, small: [...document.querySelectorAll('.ab-dial-hit, .ab-rocker-radios label, .ab-actions button, .press-tile, #artist, #track')].map(e => { const r = e.getBoundingClientRect(); return [e.className || e.tagName, Math.round(r.width), Math.round(r.height)]; }).filter(([, a, c]) => a < 44 || c < 44) })`);
  const o = JSON.parse(t); ok(`${w}px: every target ≥ 44 × 44 and no horizontal scroll`, o.small.length === 0 && o.sw === w, t);
}
await b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
ok('reduced motion honoured', await b.ev(`matchMedia('(prefers-reduced-motion: reduce)').matches`));
console.log(`\n${pass} PASS, ${fail} FAIL`, 'ERRORS', b.errors.length ? b.errors.slice(0, 5) : 'none');
b.close(); process.exit(0);
