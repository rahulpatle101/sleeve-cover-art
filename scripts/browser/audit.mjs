// Recipe-quality audit: render a labelled grid of deterministic recipes with the app's renderer.
// Usage: node audit.mjs <devUrl> <out.png> <set>   set = remix | stress
import { launch } from './cdp.mjs';
const [url, outPng, set = 'remix', cellArg = '300'] = process.argv.slice(2);
const b = await launch(process.env.CDP_OUT || '/tmp/audit', 9345);
await b.send('Page.navigate', { url }); await b.sleep(1500);
const data = await b.ev(`(async () => {
  const { renderArtwork } = await import('/src/artwork/renderArtwork.ts');
  const { validateRecipe, DEFAULT_RECIPE } = await import('/src/instrument/recipe.ts');
  const { remix } = await import('/src/instrument/remix.ts');
  const list = [];
  if ('${set}' === 'long') {
    const LA = 'The Extraordinarily Long Artist Collective', LT = 'Songs For The Long Drive Home (Extended Mix)';
    for (const mode of ['harmonic', 'radial']) for (let p = 0; p < 6; p++) list.push([mode[0].toUpperCase() + ' long p' + (p + 1), validateRecipe({ ...DEFAULT_RECIPE, mode, palette: p, seed: p % 2 ? 0x8 : 0, artist: LA, track: LT })]);
  } else if ('${set}' === 'holdout') {
    for (const mode of ['harmonic', 'radial']) { let r = validateRecipe({ ...DEFAULT_RECIPE, mode, seed: 0xC0FFEE, palette: 3 }); for (let i = 1; i <= 12; i++) { r = remix(r); list.push([mode[0].toUpperCase() + 'h' + i, r]); } }
  } else if ('${set}' === 'remix') {
    list.push(['default', DEFAULT_RECIPE]);
    for (const mode of ['harmonic', 'radial']) { let r = validateRecipe({ ...DEFAULT_RECIPE, mode }); for (let i = 1; i <= 12; i++) { r = remix(r); list.push([mode[0].toUpperCase() + i, r]); } }
  } else {
    const L = 'A Very Long Track Title That Should Shrink To Fit', LA = 'The Extraordinarily Long Artist Collective';
    const cases = [
      ['min', { form: 1, rhythm: 1, phase: 0, density: 1 }], ['max', { form: 8, rhythm: 8, phase: 360, density: 24 }],
      ['asym', { form: 3, rhythm: 7, phase: 45, density: 9 }], ['sym', { form: 4, rhythm: 4, phase: 180, density: 12 }],
      ['1:8 d24', { form: 1, rhythm: 8, phase: 0, density: 24 }], ['8:1 d1', { form: 8, rhythm: 1, phase: 360, density: 1 }],
      ['5:7 d24', { form: 5, rhythm: 7, phase: 90, density: 24 }], ['2:3 d6', { form: 2, rhythm: 3, phase: 30, density: 6 }],
      ['long', { form: 3, rhythm: 5, phase: 60, density: 12, artist: LA, track: L }], ['empty', { form: 3, rhythm: 5, phase: 60, density: 12, artist: '', track: '' }],
      ['artist only', { form: 3, rhythm: 5, phase: 60, density: 12, track: '' }], ['caps/num', { form: 4, rhythm: 7, phase: 15, density: 8, artist: 'MXR-2049', track: 'ii / 04' }],
    ];
    for (const mode of ['harmonic', 'radial']) cases.forEach(([n, p], i) => list.push([mode[0].toUpperCase() + ' ' + n, validateRecipe({ ...DEFAULT_RECIPE, mode, palette: i % 6, ...p })]));
  }
  const cell = ${cellArg}, pad = 6, cols = 6, lab = 22, rows = Math.ceil(list.length / cols);
  const c = document.createElement('canvas'); c.width = cols * (cell + pad) + pad; c.height = rows * (cell + pad + lab) + pad;
  const ctx = c.getContext('2d'); ctx.fillStyle = '#777'; ctx.fillRect(0, 0, c.width, c.height);
  list.forEach(([name, r], k) => { const x = pad + (k % cols) * (cell + pad), y = pad + Math.floor(k / cols) * (cell + pad + lab);
    ctx.save(); ctx.translate(x, y + lab); renderArtwork(ctx, r, cell, cell); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.font = '600 13px system-ui'; ctx.textAlign = 'left'; ctx.fillText(name + '  ' + r.form + ':' + r.rhythm + ' ' + r.phase + '° d' + r.density + ' p' + (r.palette + 1), x + 2, y + 15); });
  return [c.toDataURL(), list.map(([n, r]) => n + ' ' + r.seed.toString(16) + ' ' + r.form + '/' + r.rhythm + '/' + r.phase + '/' + r.density + '/p' + (r.palette + 1)).join('\\n')];
})()`);
b.saveDataUrl(outPng, data[0]); console.log(data[1]);
console.log('errors', b.errors.length ? b.errors : 'none'); b.close(); process.exit(0);
