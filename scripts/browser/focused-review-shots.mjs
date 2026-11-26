// Focused-pass review states. Usage: node focused-review-shots.mjs <url> <outdir>
import { launch } from './cdp.mjs';
import { mkdirSync } from 'node:fs';

const [url, out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await launch(out + '/.chrome-review-r2', 9394);
const waitSettled = async () => { for (let i = 0; i < 180; i++) { if ((await b.ev(`document.querySelector('canvas')?.dataset.settled`)) === 'true') return; await b.sleep(25); } };
const load = async (width, height, dpr, mobile) => {
  await b.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
  await b.send('Page.navigate', { url }); await b.sleep(900); await waitSettled();
};
const choose = async (palette, artist, track, mode = 'harmonic') => {
  await b.ev(`(()=>{document.querySelector('input[value=${mode}]').click(); document.querySelectorAll('input[name=press-set]')[${palette}].click();
    const a=document.getElementById('artist'),t=document.getElementById('track');
    const set=(e,v)=>{const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));};
    set(a,${JSON.stringify(artist)});set(t,${JSON.stringify(track)});})()`);
  await waitSettled(); await b.sleep(100);
};

await load(1440, 900, 2, false);
await choose(2, 'Lumen Archive', 'Second Light', 'harmonic'); await b.shot(out + '/desktop-1440-spectrum.png');
await choose(1, 'Night Office', 'Phase Garden', 'radial'); await b.shot(out + '/desktop-1440-carbon.png');

await load(390, 844, 3, true);
await choose(3, 'Mira Okafor', 'Tidewater', 'radial'); await b.shot(out + '/phone-390-horizon.png');
const sh = await b.ev(`document.documentElement.scrollHeight`);
await b.send('Emulation.setDeviceMetricsOverride', { width: 390, height: sh, deviceScaleFactor: 1, mobile: true });
await b.sleep(250); await b.shot(out + '/phone-390-horizon-full.png');

console.log('errors', b.errors.length ? b.errors : 'none');
b.close();
process.exit(b.errors.length ? 1 : 0);
