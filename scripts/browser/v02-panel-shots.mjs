// Panel screenshots at phone / tablet / desktop widths. Usage: node v02-panel-shots.mjs <url> <outdir>
import { launch } from './cdp.mjs';
const [url, out] = process.argv.slice(2);
const b = await launch(out + '/.chrome-shots', 9380);
const sizes = [['phone-360', 360, 780, 3, true], ['phone-390', 390, 844, 3, true], ['tablet-768', 768, 1024, 2, true], ['desktop-1280', 1280, 900, 2, false], ['desktop-1440', 1440, 900, 2, false], ['desktop-1440-concept', 1440, 900, 2, false]];
for (const [name, w, h, dpr, mobile] of sizes) {
  await b.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile });
  await b.send('Page.navigate', { url }); await b.sleep(1600);
  await b.shot(`${out}/${name}.png`);
  const full = await b.ev(`JSON.stringify({ sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight })`);
  const { sh } = JSON.parse(full);
  await b.send('Emulation.setDeviceMetricsOverride', { width: w, height: sh, deviceScaleFactor: 1, mobile });
  await b.sleep(400); await b.shot(`${out}/${name}-full.png`);
  console.log(name, full);
}
b.close(); process.exit(0);
