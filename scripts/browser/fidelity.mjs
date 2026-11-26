// Export fidelity: real downloaded 3000² PNG vs the live preview canvas, same recipe.
import { launch } from './cdp.mjs';
import { readFileSync, readdirSync, rmSync, mkdirSync } from 'node:fs';
const [url, outDir] = process.argv.slice(2);
const dl = (process.env.CDP_OUT || '/tmp/fid') + '/dl'; rmSync(dl, { recursive: true, force: true }); mkdirSync(dl, { recursive: true });
const b = await launch(process.env.CDP_OUT || '/tmp/fid', 9344);
await b.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 2, mobile: false });
await b.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dl });
await b.send('Page.navigate', { url }); await b.sleep(1500);
for (const mode of ['harmonic', 'radial']) {
  await b.ev(`document.querySelector('input[value=${mode}]').click()`);
  await b.ev(`[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Remix').click()`); await b.sleep(700);
  const before = new Set(readdirSync(dl));
  await b.ev(`document.querySelector('.btn-primary').click()`);
  let file; for (let i = 0; i < 60 && !file; i++) { await b.sleep(200); file = readdirSync(dl).find((f) => f.endsWith('.png') && !before.has(f)); }
  await b.sleep(300);
  const b64 = readFileSync(`${dl}/${file}`).toString('base64');
  const res = await b.ev(`(async () => {
    const img = new Image(); img.src = 'data:image/png;base64,${b64}'; await img.decode();
    const stage = document.querySelector('canvas'); const W = stage.width;
    const a = document.createElement('canvas'); a.width = a.height = W; const ax = a.getContext('2d'); ax.imageSmoothingQuality = 'high'; ax.drawImage(img, 0, 0, W, W);
    const s = document.createElement('canvas'); s.width = s.height = W; s.getContext('2d').drawImage(stage, 0, 0);
    const da = ax.getImageData(0, 0, W, W).data, ds = s.getContext('2d').getImageData(0, 0, W, W).data;
    let sum = 0, big = 0; for (let i = 0; i < da.length; i += 4) { const d = (Math.abs(da[i]-ds[i]) + Math.abs(da[i+1]-ds[i+1]) + Math.abs(da[i+2]-ds[i+2])) / 3; sum += d; if (d > 48) big++; }
    // Coarse composition check: true 12×12 block means computed from full arrays (area average).
    const N = 12, bs = W / N; let bmax = 0;
    for (let by = 0; by < N; by++) for (let bx = 0; bx < N; bx++) {
      const m = [0,0,0,0,0,0]; let n = 0;
      for (let y = Math.floor(by*bs); y < Math.floor((by+1)*bs); y++) for (let x = Math.floor(bx*bs); x < Math.floor((bx+1)*bs); x++) { const i = (y*W + x)*4; for (let c = 0; c < 3; c++) { m[c] += da[i+c]; m[c+3] += ds[i+c]; } n++; }
      for (let c = 0; c < 3; c++) bmax = Math.max(bmax, Math.abs(m[c] - m[c+3]) / n);
    }
    return { size: img.naturalWidth + '×' + img.naturalHeight, previewPx: W, meanAbsDiff: +(sum / (W * W)).toFixed(2), pctPixelsOver48: +(100 * big / (W * W)).toFixed(2), maxBlockMeanDiff12x12: +bmax.toFixed(2) };
  })()`);
  console.log(`FIDELITY ${mode} ${file}`, JSON.stringify(res));
}
console.log('ERRORS', b.errors.length ? b.errors : 'none');
b.close(); process.exit(0);
