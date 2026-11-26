// Interaction pass: pointer sensitivity, touch emulation, accessibility tree, text limit.
import { launch } from './cdp.mjs';
const [url, outDir] = process.argv.slice(2);
const b = await launch(process.env.CDP_OUT || '/tmp/inter');
const log = (...a) => console.log(...a);
await b.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await b.send('Page.navigate', { url }); await b.sleep(1500);
const center = (i) => b.ev(`(() => { const r = document.querySelectorAll('.dial-wrap')[${i}].getBoundingClientRect(); return [r.x + r.width/2, r.y + r.height/2]; })()`);
const val = (i) => b.ev(`+document.querySelectorAll('.dial-input')[${i}].value`);
const mouseDrag = async (i, dx, dy, mods = 0) => { const [x, y] = await center(i);
  await b.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1, modifiers: mods });
  const n = 10; for (let k = 1; k <= n; k++) await b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x + dx * k / n, y: y + dy * k / n, button: 'left', buttons: 1, modifiers: mods });
  const cls = await b.ev(`document.querySelectorAll('.dial-wrap')[${i}].className`);
  await b.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x + dx, y: y + dy, button: 'left', modifiers: mods }); return cls; };

// Pointer sensitivity per control
for (const [i, name] of [[0, 'Form'], [2, 'Phase'], [3, 'Density'], [4, 'Palette']]) {
  const before = await val(i); const cls = await mouseDrag(i, 0, -44); const after = await val(i);
  log(`POINTER ${name}: up 44px ${before}→${after} (Δ${after - before}); class during drag: "${cls}"`);
}
let p0 = await val(2); await mouseDrag(2, 0, -40, 8); log(`POINTER Phase Shift-drag up 40px: ${p0}→${await val(2)} (fine ¼)`);
p0 = await val(2); await mouseDrag(2, 40, 0); log(`POINTER Phase drag right 40px: ${p0}→${await val(2)}`);
log('POINTER class after release:', await b.ev(`document.querySelectorAll('.dial-wrap')[2].className`));

// Text limit counter
await b.ev(`(() => { const i = document.getElementById('artist'); i.focus(); i.select(); })()`);
await b.send('Input.insertText', { text: 'x'.repeat(40) });
log('COUNT at 40 chars:', JSON.stringify(await b.ev(`document.getElementById('artist-count').textContent`)));
await b.send('Input.insertText', { text: 'y'.repeat(20) });
log('COUNT after 60 typed:', await b.ev(`document.getElementById('artist').value.length + ' chars, counter ' + document.getElementById('artist-count').textContent`));
await b.send('Page.reload'); await b.sleep(1200);

// Accessibility tree
const ax = await b.send('Accessibility.getFullAXTree');
const interesting = ax.nodes.filter((n) => !n.ignored && ['slider', 'radio', 'button', 'textbox', 'image', 'status', 'group', 'radiogroup', 'region'].includes(n.role?.value));
for (const n of interesting) {
  const props = Object.fromEntries((n.properties || []).map((p) => [p.name, p.value.value]));
  log(`AX ${n.role.value.padEnd(8)} name="${n.name?.value ?? ''}"` + (n.value ? ` value="${n.value.value}"` : '') +
    (props.valuemin !== undefined ? ` min=${props.valuemin} max=${props.valuemax}` : '') + (props.valuetext ? ` valuetext="${props.valuetext}"` : '') +
    (props.checked !== undefined ? ` checked=${props.checked}` : '') + (props.pressed !== undefined ? ` pressed=${props.pressed}` : '') + (n.description?.value ? ` desc="${n.description.value}"` : ''));
}

// Touch emulation (phone)
await b.send('Emulation.setDeviceMetricsOverride', { width: 360, height: 780, deviceScaleFactor: 2, mobile: true });
await b.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await b.send('Emulation.setEmitTouchEventsForMouse', { enabled: true, configuration: 'mobile' });
await b.send('Page.reload'); await b.sleep(1500);
await b.ev(`document.querySelectorAll('.dial-wrap')[3].scrollIntoView({ block: 'center' })`); await b.sleep(200);
const touchDrag = async (i, dx, dy) => { const [x, y] = await center(i);
  await b.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  const n = 12; for (let k = 1; k <= n; k++) { await b.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * k / n, y: y + dy * k / n }] }); await b.sleep(16); }
  await b.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await b.sleep(300); };
let v = await val(3); let sy = await b.ev('scrollY');
await touchDrag(3, 60, 0);
log(`TOUCH Density sideways +60px: ${v}→${await val(3)}; scrollY ${sy}→${await b.ev('scrollY')}`);
v = await val(3); sy = await b.ev('scrollY');
await touchDrag(3, 0, -150);
log(`TOUCH Density vertical swipe −150px: ${v}→${await val(3)}; scrollY ${sy}→${await b.ev('scrollY')} (page should scroll, value should not)`);
v = await val(0); await b.ev(`document.querySelectorAll('.dial-wrap')[0].scrollIntoView({ block: 'center' })`); await b.sleep(200);
const [tx, ty] = await center(0);
await b.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: tx, y: ty }] }); await b.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await b.sleep(200);
log(`TOUCH tap Form: value ${v}→${await val(0)}, focused=${await b.ev(`document.activeElement === document.querySelectorAll('.dial-input')[0]`)}`);
const remixBtn = await b.ev(`(() => { const r = [...document.querySelectorAll('button')].find(b => b.textContent.trim()==='Remix'); r.scrollIntoView({block:'center'}); const q = r.getBoundingClientRect(); return [q.x + q.width/2, q.y + q.height/2]; })()`);
const s0 = await b.ev(`document.querySelector('.meta .mono').textContent`);
await b.sleep(150);
await b.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: remixBtn[0], y: remixBtn[1] }] }); await b.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await b.sleep(300);
log(`TOUCH tap Remix: seed ${s0}→${await b.ev(`document.querySelector('.meta .mono').textContent`)}`);
if (outDir) await b.shot(`${outDir}/interaction-after-360-touch.png`);
log('ERRORS', b.errors.length ? b.errors : 'none');
b.close(); process.exit(0);
