// Temporary panel-style comparison. Usage: node theme-studies.mjs <url> <outdir>
// Every capture reloads the same default recipe; only the development URL theme differs.
import { launch } from './cdp.mjs';
import { mkdirSync } from 'node:fs';

const [url, out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await launch(out + '/.chrome-theme-studies-r2', 9398);
const themes = ['braun', 'buchla', 'nagra'];

const waitSettled = async () => {
  for (let i = 0; i < 200; i++) {
    if ((await browser.ev(`document.querySelector('canvas')?.dataset.settled`)) === 'true') return;
    await browser.sleep(25);
  }
  throw new Error('Artwork did not settle');
};

for (const theme of themes) {
  await browser.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false });
  await browser.send('Page.navigate', { url: `${url}?theme=${theme}` });
  await browser.sleep(900);
  await waitSettled();
  await browser.shot(`${out}/${theme}-desktop-1440.png`);

  await browser.send('Emulation.setDeviceMetricsOverride', { width: 360, height: 780, deviceScaleFactor: 2, mobile: true });
  await browser.send('Page.navigate', { url: `${url}?theme=${theme}` });
  await browser.sleep(900);
  await waitSettled();
  const state = JSON.parse(await browser.ev(`JSON.stringify({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, theme: document.querySelector('.app')?.dataset.theme, seed: document.querySelector('.seed')?.textContent })`));
  if (state.width !== 360 || state.theme !== theme || state.seed !== '01352905') throw new Error(`State mismatch for ${theme}: ${JSON.stringify(state)}`);
  await browser.send('Emulation.setDeviceMetricsOverride', { width: 360, height: state.height, deviceScaleFactor: 1, mobile: true });
  await browser.sleep(250);
  await browser.shot(`${out}/${theme}-mobile-360.png`);
  console.log(theme, JSON.stringify(state));
}

console.log('errors', browser.errors.length ? browser.errors : 'none');
browser.close();
process.exit(browser.errors.length ? 1 : 0);
