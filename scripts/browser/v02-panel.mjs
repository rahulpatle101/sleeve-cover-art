// v0.2 panel: function, keyboard, screen-reader structure, layout widths. Usage: node v02-panel.mjs <url> <outdir>
import { launch } from './cdp.mjs';
import { readdirSync, rmSync, mkdirSync, readFileSync } from 'node:fs';
const [url, out] = process.argv.slice(2);
const dl = out + '/.dl'; rmSync(dl, { recursive: true, force: true }); mkdirSync(dl, { recursive: true });
const b = await launch(out + '/.chrome-panel', 9381);
const log = (...a) => console.log(...a);
let pass = 0, fail = 0; const ok = (name, cond, detail = '') => { cond ? pass++ : fail++; log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`); };
const settled = async () => { for (let i = 0; i < 150; i++) { if ((await b.ev(`document.querySelector('canvas').dataset.settled`)) === 'true') return; await b.sleep(20); } };
// visible value: per-dial readout (Registration), central ratio readout (Form/Rhythm) or the Passes caption
const dial = (i) => b.ev(`(() => { const d = document.querySelectorAll('.dial-input')[${i}]; const r = d.closest('.rotary').querySelector('.rotary-value'); const ratio = document.querySelector('.ratio-value').textContent.split(':');
  const shown = r ? r.textContent : ${i} === 0 ? ratio[0] : ${i} === 1 ? ratio[1] : document.querySelector('.passes-caption').textContent;
  return { v: +d.value, shown, vt: d.getAttribute('aria-valuetext'), label: d.labels[0].textContent }; })()`);
const recipe = () => b.ev(`document.querySelector('canvas').getAttribute('aria-label')`);
const seed = () => b.ev(`document.querySelector('.press-line .seed').textContent`);
const focusDial = (i) => b.ev(`document.querySelectorAll('.dial-input')[${i}].focus()`);

await b.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await b.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dl });
await b.send('Page.navigate', { url }); await b.sleep(1500); await settled();

// --- tab order = signal path
await b.ev('document.activeElement.blur()');
const order = [];
for (let i = 0; i < 12; i++) { await b.key('Tab'); order.push(await b.ev(`(() => { const a = document.activeElement; return (a.type || a.tagName) + ':' + (a.getAttribute('aria-label') || a.labels?.[0]?.textContent?.trim() || a.textContent.replace('↻', '').trim()).replace(/\\s+/g, ' ').slice(0, 24); })()`)); }
log('TAB ORDER', order.join(' | '));
ok('tab order follows the signal path 01→07', JSON.stringify(order.slice(0, 10).map((s) => s.split(':')[1])) === JSON.stringify(['Artist', 'Track', 'HarmonicLissajous', 'Form', 'Rhythm', 'Registration', 'Passes', 'Newsprint', 'New Proof', 'Sound Off']) && order[10].endsWith('Print Sleeve'), order.slice(0, 11).join(' > '));

// --- text inputs
await b.ev(`document.getElementById('artist').focus(); document.getElementById('artist').select()`); await b.send('Input.insertText', { text: 'Ada Vélo' });
await b.ev(`document.getElementById('track').focus(); document.getElementById('track').select()`); await b.send('Input.insertText', { text: 'Low Tide' });
ok('artist / track typing reaches the recipe', (await recipe()).includes('Artist: Ada Vélo. Track: Low Tide.'));

// --- rotaries: keyboard model preserved
const kb = async (i, name, coarse, max, min) => {
  await focusDial(i); const s0 = (await dial(i)).v;
  await b.key('ArrowUp'); const a = (await dial(i)).v; await b.key('ArrowRight'); const r = (await dial(i)).v; await b.key('ArrowDown'); const d = (await dial(i)).v;
  await b.key('ArrowUp', 8); const sh = (await dial(i)).v; await b.key('PageDown'); const pd = (await dial(i)).v;
  await b.key('End'); const e = (await dial(i)).v; await b.key('ArrowUp'); const e2 = (await dial(i)).v; await b.key('Home'); const h = (await dial(i)).v;
  const st = await dial(i);
  ok(`${name}: Arrow ±1, Shift/Page ±${coarse}, Home/End, clamps; visible value tracks`, a === Math.min(max, s0 + 1) && r === Math.min(max, a + 1) && d === r - 1 && sh === Math.min(max, d + coarse) && pd === sh - coarse && e === max && e2 === max && h === min && parseInt(st.shown, 10) === min, `${s0}→${a},${r},${d},${sh},${pd},${e},${e2},${h} shown "${st.shown}" label "${st.label}"`);
};
await kb(0, 'Form', 2, 8, 1); await kb(1, 'Rhythm', 2, 8, 1); await kb(2, 'Registration', 15, 360, 0); await kb(3, 'Passes', 4, 24, 1);
await focusDial(2); await b.key('End'); for (let i = 0; i < 315; i++) await b.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37 });
let reg = await dial(2); ok('Registration readout + valuetext report register state', reg.v === 45 && reg.vt === '45 degrees, off register' && (await b.ev(`document.querySelector('.rotary-hero .rotary-caption').textContent`)).startsWith('Off register') && (await b.ev(`document.querySelector('.rotary-hero .rotary-value').textContent`)) === '045°', JSON.stringify(reg));
await b.key('PageUp'); await b.key('PageUp'); await b.key('PageUp'); reg = await dial(2);
ok('Registration at 90° says "In register" (text, not colour)', reg.v === 90 && reg.vt === '90 degrees, in register' && (await b.ev(`document.querySelector('.rotary-hero .rotary-caption').textContent`)) === 'In register' && (await recipe()).includes('registration 90 degrees in register'), reg.vt);
await focusDial(0); await b.key('Home'); for (let i = 0; i < 1; i++) await b.key('ArrowUp'); await focusDial(1); await b.key('Home'); for (let i = 0; i < 3; i++) await b.key('ArrowUp');
ok('Ratio reads as one relationship (central readout) with the reduced relation beneath', (await b.ev(`document.querySelector('.ratio-value').textContent`)) === '2:4' && (await b.ev(`document.querySelector('.ratio-read').textContent`)) === 'plays as 1 : 2 · octave' && (await recipe()).includes('ratio 2 to 4'), await b.ev(`document.querySelector('.ratio-value').textContent + ' / ' + document.querySelector('.ratio-read').textContent`));

// --- engine radios
await b.ev(`document.querySelector('input[value=harmonic]').focus()`); await b.key('ArrowRight');
ok('Engine: Arrow selects Radial', (await recipe()).includes('Radial engine') && (await b.ev(`document.querySelector('.app').dataset.mode`)) === 'radial');
await b.key('ArrowLeft'); ok('Engine: Arrow back to Harmonic', (await recipe()).includes('Harmonic engine'));

// --- press set radios (six in one group)
await b.ev(`document.querySelector('input[name=press-set]:checked').focus()`);
const sets = [];
for (let i = 0; i < 6; i++) { await b.key('ArrowDown'); sets.push(await b.ev(`(() => { const r = document.querySelector('input[name=press-set]:checked'); return r.value + ':' + r.closest('label').textContent; })()`)); }
log('PRESS SET cycle', sets.join(' | '));
ok('Press Set: Arrow keys cycle all six sets and wrap', sets.map((s) => s.split(':')[0]).join('') === '123450', sets.join(' '));
await b.key('ArrowDown'); await b.key('ArrowDown'); await b.key('ArrowDown'); await b.key('ArrowDown'); await b.key('ArrowDown'); // → 5 Macro Relief
ok('Press Set selection reaches the recipe + stage label', (await recipe()).includes('matter Macro Relief press set'));
await b.key('ArrowDown'); // back to Newsprint

// --- pointer drag on hero + passes
const drag = async (i, dy) => { const c = await b.ev(`(() => { const r = document.querySelectorAll('.dial-wrap')[${i}].getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
  await b.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c[0], y: c[1], button: 'left', clickCount: 1 });
  for (let k = 0; k <= Math.abs(dy); k += 6) await b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: c[0], y: c[1] - Math.sign(dy) * k, button: 'left', buttons: 1 });
  await b.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c[0], y: c[1] - dy, button: 'left', clickCount: 1 }); };
let before = (await dial(2)).v; await drag(2, 60); let after = (await dial(2)).v;
ok('Registration wheel drags (up = increase) and keeps focus', after > before && (await b.ev(`document.activeElement === document.querySelectorAll('.dial-input')[2]`)), `${before}→${after}`);
before = (await dial(3)).v; await drag(3, 48); after = (await dial(3)).v; ok('Passes drags', after > before, `${before}→${after}`);
await settled();

// --- New Proof determinism
await b.send('Page.navigate', { url }); await b.sleep(1200); await settled();
const clickText = (t) => b.ev(`[...document.querySelectorAll('button')].find((x) => x.textContent.includes('${t}')).click()`);
const chainA = []; for (let i = 0; i < 3; i++) { await clickText('New Proof'); await b.sleep(80); chainA.push(await seed()); }
await b.send('Page.navigate', { url }); await b.sleep(1200); await settled();
const chainB = []; for (let i = 0; i < 3; i++) { await clickText('New Proof'); await b.sleep(80); chainB.push(await seed()); }
ok('New Proof is deterministic across reloads (same chain as Remix)', chainA.join() === chainB.join() && chainA.join() === '7bf706a0,9a3e097f,b6c508d2', chainA.join());

// --- Sound toggle
await clickText('Sound'); await b.sleep(300);
const sOn = await b.ev(`(() => { const t = document.querySelector('.btn-toggle'); return t.getAttribute('aria-pressed') + ' ' + t.textContent.trim(); })()`);
await clickText('Sound'); await b.sleep(200);
const sOff = await b.ev(`(() => { const t = document.querySelector('.btn-toggle'); return t.getAttribute('aria-pressed') + ' ' + t.textContent.trim(); })()`);
ok('Sound toggles with aria-pressed + visible On/Off word, muted by default', sOn === 'true Sound On' && sOff === 'false Sound Off', `${sOn} / ${sOff}`);

// --- Print Sleeve (keyboard activation)
await settled(); for (const f of readdirSync(dl)) rmSync(`${dl}/${f}`, { force: true });
await b.ev(`document.querySelector('.btn-primary').focus()`); const t0 = Date.now(); await b.key('Enter');
const mid = await b.ev(`document.querySelector('.btn-primary').getAttribute('aria-disabled') + ' ' + document.querySelector('.btn-primary').textContent`);
let file; for (let i = 0; i < 100 && !file; i++) { await b.sleep(100); file = readdirSync(dl).find((f) => f.endsWith('.png')); }
await b.sleep(300);
const st = await b.ev(`document.querySelector('.status').textContent`);
const dims = file ? (() => { const buf = readFileSync(`${dl}/${file}`); return buf.readUInt32BE(16) + '×' + buf.readUInt32BE(20); })() : 'none';
ok('Print Sleeve: keyboard Enter prints a 3000×3000 PNG, announces in the live region, keeps focus', dims === '3000×3000' && st.startsWith('Sleeve printed — 3000 × 3000 PNG.') && (await b.ev(`document.activeElement === document.querySelector('.btn-primary')`)), `${file} ${dims} in ${Date.now() - t0} ms; during: "${mid}"; status "${st}"`);
ok('status region is polite', (await b.ev(`document.querySelector('.status').getAttribute('aria-live') + document.querySelector('.status').getAttribute('role')`)) === 'politestatus');

// --- reduced motion
await b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
ok('reduced motion honoured (media query active)', await b.ev(`matchMedia('(prefers-reduced-motion: reduce)').matches`));
await b.send('Emulation.setEmulatedMedia', { features: [] });

// --- screen-reader structure (Chrome accessibility tree)
await b.send('Accessibility.enable');
const ax = await b.send('Accessibility.getFullAXTree');
const nodes = ax.nodes.filter((n) => !n.ignored && ['heading', 'group', 'radiogroup', 'slider', 'radio', 'button', 'textbox', 'status', 'img', 'region', 'main', 'banner'].includes(n.role?.value));
const lines = nodes.map((n) => { const p = Object.fromEntries((n.properties || []).map((q) => [q.name, q.value?.value])); return `${n.role.value}: "${n.name?.value ?? ''}"${n.value?.value !== undefined ? ' value=' + n.value.value : ''}${p.valuetext ? ' valuetext="' + p.valuetext + '"' : ''}${p.checked !== undefined ? ' checked=' + p.checked : ''}${p.pressed !== undefined ? ' pressed=' + p.pressed : ''}${p.level ? ' level=' + p.level : ''}`; });
log('\nAX TREE (filtered)\n  ' + lines.join('\n  '));
const sliders = lines.filter((l) => l.startsWith('slider')).map((l) => l.split('"')[1]);
ok('four named sliders: Form, Rhythm, Registration, Passes', [...sliders].sort().join() === 'Form,Passes,Registration,Rhythm', sliders.join());
ok('names are natural case (CSS caps not leaked into accessible names)', !lines.some((l) => /^(group|textbox|region): "[A-Z &]{4,}"/.test(l)), lines.filter((l) => /^(group|textbox|region)/.test(l)).join(' · '));
ok('six named Press Set radios + two Engine radios', lines.filter((l) => l.startsWith('radio')).length === 8);
ok('no unnamed buttons, sliders, radios or textboxes', !lines.some((l) => /^(button|slider|radio|textbox): ""/.test(l)));

// --- widths: no horizontal scroll, targets ≥ 44, sticky bar never hides the focused control
for (const [w, h, mobile] of [[360, 780, true], [768, 1024, true], [1280, 900, false]]) {
  await b.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
  await b.send('Page.navigate', { url }); await b.sleep(1200); await settled();
  const m = await b.ev(`(() => {
    const small = [...document.querySelectorAll('button, input[type=text], .segment, .press-tile, .dial-wrap')].filter((e) => { const r = e.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).map((e) => e.className || e.id);
    const bar = document.querySelector('.action-bar').getBoundingClientRect();
    const reg = document.querySelector('.sec-registration').getBoundingClientRect();
    return { sw: document.documentElement.scrollWidth, small, barTop: Math.round(bar.top), barH: Math.round(bar.height), regTop: Math.round(reg.top), docH: document.documentElement.scrollHeight };
  })()`);
  // tab through everything; the focused control must be fully above the sticky bar
  await b.ev('document.activeElement.blur(); window.scrollTo(0,0)'); let hidden = [];
  for (let i = 0; i < 11; i++) { await b.key('Tab'); await b.sleep(60); const r = await b.ev(`(() => { const a = document.activeElement; if (a === document.body) return { bad: false }; const t = a.closest('.press-tile, .segment, .dial-wrap') || a; const r = t.getBoundingClientRect(); const bar = document.querySelector('.action-bar'); const inBar = bar.contains(a); const bt = bar.getBoundingClientRect().top; return { n: a.labels?.[0]?.textContent || a.textContent.trim().slice(0, 14), bad: !inBar && r.bottom > bt + 1 }; })()`); if (r.bad) hidden.push(r.n); }
  ok(`${w}px: no horizontal scroll, all targets ≥ 44 px, focus never under the sticky bar`, m.sw === w && m.small.length === 0 && hidden.length === 0, JSON.stringify({ ...m, hidden }));
  if (w < 768) ok(`${w}px: action bar pinned to the viewport bottom on load; Registration head at ${m.regTop}px (viewport ${h})`, Math.abs(m.barTop + m.barH - h) <= 1, `bar ${m.barTop}–${m.barTop + m.barH}`);
}
log(`\n${pass} PASS, ${fail} FAIL`, 'ERRORS', b.errors.length ? b.errors : 'none');
b.close(); rmSync(dl, { recursive: true, force: true }); process.exit(0);
