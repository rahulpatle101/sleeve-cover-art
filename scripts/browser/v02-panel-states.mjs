// Panel state screenshots (focus / selected / dragging / register states). Usage: node v02-panel-states.mjs <url> <outdir>
import { launch } from './cdp.mjs';
const [url, out] = process.argv.slice(2);
const b = await launch(out + '/.chrome-states', 9384);
const settled = async () => { for (let i = 0; i < 150; i++) { if ((await b.ev(`document.querySelector('canvas').dataset.settled`)) === 'true') return; await b.sleep(20); } };
await b.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false });
await b.send('Page.navigate', { url }); await b.sleep(1500); await settled();
// focus the control BEFORE the target, then Tab (keyboard focus → :focus-visible ring), deterministic
const tabTo = async (prevSel) => { await b.ev(`document.querySelector(${JSON.stringify(prevSel)}).focus()`); await b.key('Tab'); await b.sleep(150); };
await tabTo('#track'); await b.shot(`${out}/state-1440-focus-engine.png`);
await tabTo('.sec-ratio .rotary:nth-child(3) .dial-input'); await b.key('PageUp'); await b.key('PageUp'); await b.key('PageUp'); await settled(); await b.shot(`${out}/state-1440-registration-090-in-register-focused.png`);
for (let i = 0; i < 45; i++) await b.key('ArrowRight'); await settled(); await b.shot(`${out}/state-1440-registration-135-off-register-focused.png`);
await tabTo('.sec-passes .dial-input'); await b.key('ArrowDown'); await b.key('ArrowDown'); await b.key('ArrowDown'); await settled(); await b.shot(`${out}/state-1440-pressset-horizon-selected-focused.png`);
await b.ev('document.activeElement.blur()');
const c = await b.ev(`(() => { const r = document.querySelectorAll('.dial-wrap')[0].getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
await b.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c[0], y: c[1], button: 'left', clickCount: 1 });
for (let dy = 0; dy <= 70; dy += 7) await b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: c[0], y: c[1] - dy, button: 'left', buttons: 1 });
await b.sleep(250); await b.shot(`${out}/state-1440-dragging-form-draft.png`);
await b.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c[0], y: c[1] - 70, button: 'left', clickCount: 1 }); await settled(); await b.shot(`${out}/state-1440-after-drag-release-full.png`);
await b.ev(`document.querySelector('input[value=radial]').click()`); await b.sleep(600); await settled(); await b.shot(`${out}/state-1440-radial-selected.png`);
await b.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await b.send('Page.navigate', { url }); await b.sleep(1500); await settled(); await b.ev('window.scrollTo(0, 470)'); await b.sleep(300); await b.shot(`${out}/state-390-scrolled-registration.png`);
b.close(); process.exit(0);
