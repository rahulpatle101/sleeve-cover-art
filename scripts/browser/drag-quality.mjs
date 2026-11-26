// Drag quality on the Phase dial: slow, fast, imprecise (wobble), click-without-move, touch wobble.
import { launch } from './cdp.mjs';
const [url] = process.argv.slice(2);
const b = await launch(process.env.CDP_OUT || '/tmp/dragq', 9348);
const log = (...a) => console.log(...a);
await b.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await b.send('Page.navigate', { url }); await b.sleep(1500);
const I = 2; // Phase
const center = () => b.ev(`(() => { const r = document.querySelectorAll('.dial-wrap')[${I}].getBoundingClientRect(); return [r.x + r.width/2, r.y + r.height/2]; })()`);
const val = () => b.ev(`+document.querySelectorAll('.dial-input')[${I}].value`);
const reset = async (v) => { await b.ev(`(() => { const el = document.querySelectorAll('.dial-input')[${I}]; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, '${v}'); el.dispatchEvent(new Event('input', { bubbles: true })); })()`); await b.sleep(50); };
// path: array of [dx, dy]; records value after every move
const mouse = async (path, mods = 0) => { const [x, y] = await center(); const seen = [await val()];
  await b.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1, modifiers: mods }); seen.push(await val());
  for (const [dx, dy] of path) { await b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x + dx, y: y + dy, button: 'left', buttons: 1, modifiers: mods }); seen.push(await val()); }
  const [lx, ly] = path.length ? path[path.length - 1] : [0, 0];
  await b.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x + lx, y: y + ly, button: 'left', modifiers: mods }); return seen; };
const reversals = (s) => { let r = 0, dir = 0; for (let i = 1; i < s.length; i++) { const d = Math.sign(s[i] - s[i-1]); if (d && dir && d !== dir) r++; if (d) dir = d; } return r; };
const summary = (name, s) => log(`${name}: start ${s[0]} → end ${s[s.length-1]}; on press ${s[1] - s[0] === 0 ? 'no change' : 'JUMP ' + (s[1]-s[0])}; direction reversals ${reversals(s)}; max single-event step ${Math.max(...s.slice(1).map((v, i) => Math.abs(v - s[i])))}`);

await reset(180); summary('SLOW up 60px, 1px/event', await mouse(Array.from({ length: 60 }, (_, i) => [0, -(i + 1)])));
await reset(180); summary('FAST up 120px in 2 events', await mouse([[0, -60], [0, -120]]));
await reset(180); summary('FAST overshoot up 600px (clamp)', await mouse([[0, -600]]));
// Imprecise: mostly upward with sideways wobble ±4px each event
await reset(180); summary('IMPRECISE up 60px with ±4px sideways wobble', await mouse(Array.from({ length: 30 }, (_, i) => [(i % 2 ? 4 : -4), -(i + 1) * 2])));
// Imprecise horizontal: rightward with vertical wobble ±4px
await reset(180); summary('IMPRECISE right 60px with ±4px vertical wobble', await mouse(Array.from({ length: 30 }, (_, i) => [(i + 1) * 2, (i % 2 ? 4 : -4)])));
await reset(180); summary('CLICK with 2px jitter (no intent)', await mouse([[1, 1], [2, -1], [0, 2]]));
await reset(180); summary('FINE Shift up 40px', await mouse(Array.from({ length: 40 }, (_, i) => [0, -(i + 1)]), 8));
// Reverse mid-drag: up 30 then down 30 → should return to start
await reset(180); summary('REVERSE up 30 then back down 30', await mouse([...Array.from({ length: 30 }, (_, i) => [0, -(i + 1)]), ...Array.from({ length: 30 }, (_, i) => [0, -29 + i])]));

// Shift pressed mid-drag: 30px normal then 40px with Shift → expect +30 +10, no jump at the toggle
await reset(180); {
  const [x, y] = await center(); await b.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  for (let i = 1; i <= 30; i++) await b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y: y - i, button: 'left', buttons: 1 });
  const mid = await val();
  await b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y: y - 31, button: 'left', buttons: 1, modifiers: 8 }); const afterToggle = await val();
  for (let i = 32; i <= 70; i++) await b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y: y - i, button: 'left', buttons: 1, modifiers: 8 });
  await b.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y: y - 70, button: 'left', modifiers: 8 });
  log(`SHIFT mid-drag: 180 → ${mid} after 30px → ${afterToggle} right after Shift (no jump expected) → ${await val()} after 40px fine (expect ≈ 220)`);
}
// Touch with vertical wobble while dragging sideways
await b.send('Emulation.setDeviceMetricsOverride', { width: 360, height: 780, deviceScaleFactor: 2, mobile: true });
await b.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await b.send('Page.reload'); await b.sleep(1500);
await b.ev(`document.querySelectorAll('.dial-wrap')[${I}].scrollIntoView({ block: 'center' })`); await b.sleep(200);
const touch = async (path) => { const [x, y] = await center(); const seen = [await val()]; const sy0 = await b.ev('scrollY');
  await b.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (const [dx, dy] of path) { await b.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx, y: y + dy }] }); await b.sleep(16); seen.push(await val()); }
  await b.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await b.sleep(250); return [seen, (await b.ev('scrollY')) - sy0]; };
await reset(180); let [s, sc] = await touch(Array.from({ length: 30 }, (_, i) => [(i + 1) * 2, (i % 2 ? 3 : -3)])); summary(`TOUCH right 60px, ±3px vertical wobble (page scrolled ${sc}px)`, s);
await reset(180); [s, sc] = await touch(Array.from({ length: 30 }, (_, i) => [(i % 2 ? 3 : -3), -(i + 1) * 5])); summary(`TOUCH vertical swipe 150px, ±3px wobble (page scrolled ${sc}px)`, s);
log('ERRORS', b.errors.length ? b.errors : 'none'); b.close(); process.exit(0);
