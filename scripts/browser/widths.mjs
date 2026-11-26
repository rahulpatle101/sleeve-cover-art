// Screenshot the app at several viewport widths. Usage: node widths.mjs <url> <prefix> [w,w,...]
import { launch } from './cdp.mjs';
const [url, prefix, list = '360,768,1024,1280'] = process.argv.slice(2);
const b = await launch(process.env.CDP_OUT || '/tmp/widths', 9347);
for (const w of list.split(',').map(Number)) {
  await b.send('Emulation.setDeviceMetricsOverride', { width: w, height: w < 600 ? 780 : w < 1100 ? 1024 : 900, deviceScaleFactor: 1, mobile: w < 600 });
  await b.send('Page.navigate', { url }); await b.sleep(1200);
  const info = await b.ev(`(() => { const c = document.querySelector('canvas').getBoundingClientRect(); const p = document.querySelector('.panel').getBoundingClientRect(); const e = document.querySelector('.btn-primary').getBoundingClientRect();
    return { scrollW: document.documentElement.scrollWidth, cover: Math.round(c.width), side: p.left > c.right - 1, exportBottom: Math.round(e.bottom), viewportH: innerHeight, docH: document.documentElement.scrollHeight,
      overflow: [...document.querySelectorAll('.btn, .rotary-value, .rotary-caption, .segment-name, .field-head label')].filter(x => x.scrollWidth > x.clientWidth + 1).map(x => x.textContent).join('|') || 'none' }; })()`);
  console.log(w, JSON.stringify(info));
  await b.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }).then((r) => import('node:fs').then((fs) => fs.writeFileSync(`${prefix}-${w}.png`, Buffer.from(r.data, 'base64'))));
}
console.log('ERRORS', b.errors.length ? b.errors : 'none'); b.close(); process.exit(0);
