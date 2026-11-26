// Focused renderer pass: 50 unseen seeds × 2 engines × 6 press sets, typography states,
// deterministic camera checks, and Ink title-layer regression. Usage: node composition-pass.mjs <url> <outdir>
import { launch } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';

const [url, out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await launch(out + '/.chrome-composition', 9392);
await b.send('Page.navigate', { url });
await b.sleep(1400);

const result = await b.ev(`(async () => {
  const { renderArtwork, renderArtLayer, renderTypeLayer } = await import('/src/artwork/renderArtwork.ts');
  const { ensureFonts } = await import('/src/artwork/fonts.ts');
  const { validateRecipe, DEFAULT_RECIPE } = await import('/src/instrument/recipe.ts');
  const { recipeFromSeed } = await import('/src/instrument/remix.ts');
  const { compose, FRAMING_TREATMENTS } = await import('/src/artwork/composition.ts');
  const { PALETTES } = await import('/src/artwork/palettes.ts');
  const fontsOk = await ensureFonts();

  const label = (x, text, X, Y) => { x.fillStyle = '#111'; x.font = '600 9px ui-monospace, Menlo, monospace'; x.fillText(text, X, Y); };
  const cell = 116, gap = 5, head = 18, cols = 12, rows = 50;
  const sheet = document.createElement('canvas');
  sheet.width = gap + cols * (cell + gap);
  sheet.height = gap + rows * (cell + head + gap);
  const sx = sheet.getContext('2d'); sx.fillStyle = '#aaa8a2'; sx.fillRect(0, 0, sheet.width, sheet.height);

  const start = 0x91e10da5; // hold-out start, not used by the shipped default/remix chain
  const cases = [], treatmentCounts = Object.fromEntries(FRAMING_TREATMENTS.map((t) => [t, 0]));
  let seed = start >>> 0;
  for (let row = 0; row < rows; row++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const base = recipeFromSeed({ ...DEFAULT_RECIPE, artist: 'Lumen Archive', track: 'Second Light' }, seed);
    const camera = compose(base); treatmentCounts[camera.treatment]++;
    for (let p = 0; p < 6; p++) for (let mi = 0; mi < 2; mi++) {
      const mode = mi ? 'radial' : 'harmonic', col = p * 2 + mi;
      const r = validateRecipe({ ...base, mode, palette: p });
      const X = gap + col * (cell + gap), Y = gap + row * (cell + head + gap);
      label(sx, row.toString().padStart(2, '0') + ' ' + PALETTES[p].name.slice(0, 8) + ' ' + mode[0].toUpperCase(), X, Y + 10);
      sx.save(); sx.translate(X, Y + head); renderArtwork(sx, r, cell, cell, 'full'); sx.restore();
      cases.push({ seed: r.seed, mode, palette: p, treatment: camera.treatment, camera: compose(r) });
    }
  }

  // Typography: short, long, mixed case and uppercase on Spectrum/Horizon.
  const names = [
    ['Mira', 'Tide'],
    ['The Extraordinarily Long Weekend Ensemble', 'Songs For The Long Drive Home (Extended)'],
    ['Lumen Archive', 'Second Light'],
    ['KZXW SIGNAL DIVISION', 'MMXXVI'],
  ];
  const tc = 430, tg = 10, th = 24;
  const typeSheet = document.createElement('canvas'); typeSheet.width = 2 * (tc + tg) + tg; typeSheet.height = 4 * (tc + th + tg) + tg;
  const tx = typeSheet.getContext('2d'); tx.fillStyle = '#999'; tx.fillRect(0, 0, typeSheet.width, typeSheet.height);
  names.forEach(([artist, track], row) => [2, 3].forEach((palette, col) => {
    const X = tg + col * (tc + tg), Y = tg + row * (tc + th + tg);
    label(tx, PALETTES[palette].name + ' · ' + artist, X, Y + 12);
    const r = validateRecipe({ ...DEFAULT_RECIPE, seed: (start + row * 101 + palette) >>> 0, palette, mode: row % 2 ? 'radial' : 'harmonic', artist, track });
    tx.save(); tx.translate(X, Y + th); renderArtwork(tx, r, tc, tc, 'full'); tx.restore();
  }));

  const diff = (a, z, W, zoneTop = 0) => { let channels = 0, max = 0; const begin = Math.floor(zoneTop * W) * W * 4;
    for (let i = begin; i < a.length; i++) { const d = Math.abs(a[i] - z[i]); if (d) channels++; if (d > max) max = d; } return { channels, max }; };
  const inkLayering = [];
  for (const size of [620, 3000]) for (const palette of [0, 1]) {
    const r = validateRecipe({ ...DEFAULT_RECIPE, palette, artist: 'NIGHT OFFICE', track: 'PHASE GARDEN', seed: 0x6f31a2c9 });
    const make = () => { const c = document.createElement('canvas'); c.width = c.height = size; return c; };
    const actual = make(), expected = make(), wrong = make();
    renderArtwork(actual.getContext('2d'), r, size, size, 'full');
    renderArtLayer(expected.getContext('2d'), r, size, size, 'full'); renderTypeLayer(expected.getContext('2d'), r, size, size);
    renderTypeLayer(wrong.getContext('2d'), r, size, size); renderArtLayer(wrong.getContext('2d'), r, size, size, 'full');
    const A = actual.getContext('2d').getImageData(0, 0, size, size).data;
    const E = expected.getContext('2d').getImageData(0, 0, size, size).data;
    const W = wrong.getContext('2d').getImageData(0, 0, size, size).data;
    inkLayering.push({ size, palette, actualVsExpected: diff(A, E, size), actualVsWrongTitleZone: diff(A, W, size, 0.52) });
  }

  const deterministic = cases.every((q) => JSON.stringify(q.camera) === JSON.stringify(compose(validateRecipe({ ...DEFAULT_RECIPE, seed: q.seed, mode: q.mode, palette: q.palette }))));
  return { fontsOk, contact: sheet.toDataURL('image/png'), typography: typeSheet.toDataURL('image/png'), treatmentCounts, cases: cases.length, deterministic, inkLayering };
})()`);

b.saveDataUrl(out + '/framing-50-seeds.png', result.contact);
b.saveDataUrl(out + '/typography-stress.png', result.typography);
delete result.contact; delete result.typography;
writeFileSync(out + '/results.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
console.log('errors', b.errors.length ? b.errors : 'none');
b.close();
// Chrome can vary a few GPU-rasterised edge channels at 3000 px; ≤100 of 36M channels is the established visual-zero tolerance.
process.exit(result.fontsOk && result.deterministic && result.cases === 600 && result.inkLayering.every((q) => q.actualVsExpected.channels <= (q.size === 3000 ? 100 : 0) && q.actualVsWrongTitleZone.channels > 1000) ? 0 : 1);
