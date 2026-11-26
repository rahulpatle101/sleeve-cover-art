// Editorial review in context: every visible string at 360 and 1280, plus post-export and long-input states.
import { launch } from './cdp.mjs';
const [url, outDir] = process.argv.slice(2);
const b = await launch(process.env.CDP_OUT || '/tmp/copy', 9357);
await b.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: (process.env.CDP_OUT || '/tmp/copy') + '/dl' });
for (const w of [360, 1280]) {
  await b.send('Emulation.setDeviceMetricsOverride', { width: w, height: w < 600 ? 780 : 900, deviceScaleFactor: 2, mobile: w < 600 });
  await b.send('Page.navigate', { url }); await b.sleep(1200);
  // Long input to show the counter, then export to show completion copy
  await b.ev(`(() => { const i = document.getElementById('track'); i.focus(); i.select(); })()`);
  await b.send('Input.insertText', { text: 'Songs For The Long Drive Home (Extended)' });
  await b.ev(`document.querySelector('.btn-primary').click()`); await b.sleep(1600);
  const lines = await b.ev(`(() => {
    const out = []; const walk = (el) => { for (const n of el.childNodes) { if (n.nodeType === 3 && n.textContent.trim()) { const r = document.createRange(); r.selectNodeContents(n); const rects = r.getClientRects(); out.push(n.textContent.trim().replace(/\\s+/g, ' ') + '  [' + rects.length + ' line' + (rects.length > 1 ? 's' : '') + ']'); } else if (n.nodeType === 1 && getComputedStyle(n).display !== 'none') walk(n); } };
    walk(document.body); return out.join('\\n'); })()`);
  console.log(`--- ${w}px visible copy (line count per text node)\n` + lines);
  console.log('placeholders:', await b.ev(`[...document.querySelectorAll('input[placeholder]')].map(i => i.placeholder).join(' | ')`));
  await b.ev('window.scrollTo(0, 99999)'); await b.sleep(200);
  if (outDir) await b.shot(`${outDir}/editorial-after-${w}-exported.png`);
}
console.log('ERRORS', b.errors.length ? b.errors : 'none'); b.close(); process.exit(0);
