// Desktop 1280 + phone 360 screenshots of the running app. Usage: node views.mjs <url> <prefix>
import { launch } from './cdp.mjs';
const [url, prefix] = process.argv.slice(2);
const b = await launch(process.env.CDP_OUT || '/tmp/views');
await b.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 2, mobile: false });
await b.send('Page.navigate', { url }); await b.sleep(1500);
await b.shot(`${prefix}-desktop.png`);
await b.send('Emulation.setDeviceMetricsOverride', { width: 360, height: 780, deviceScaleFactor: 2, mobile: true });
await b.sleep(500);
await b.shot(`${prefix}-360-top.png`);
await b.ev('window.scrollTo(0, 99999)'); await b.sleep(200);
await b.shot(`${prefix}-360-bottom.png`);
console.log('scrollWidth@360', await b.ev('document.documentElement.scrollWidth'), 'cover css px', await b.ev(`document.querySelector('canvas').clientWidth`), 'errors', b.errors.length ? b.errors : 'none');
b.close(); process.exit(0);
