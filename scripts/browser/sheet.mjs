// Contact sheet of parameter extremes rendered by the app's own renderer. Usage: node sheet.mjs <url> <out.png> [cell]
import { launch } from './cdp.mjs';
const [url, outPng, cellArg] = process.argv.slice(2);
const b = await launch(process.env.CDP_OUT || '/tmp/sheet');
await b.send('Page.navigate', { url }); await b.sleep(1500);
const cell = Number(cellArg || 360);
const data = await b.ev(`(async () => {
  const { renderArtwork } = await import('/src/artwork/renderArtwork.ts');
  const { validateRecipe, DEFAULT_RECIPE } = await import('/src/instrument/recipe.ts');
  const cases = [[1,1,0,1],[8,8,360,24],[3,7,45,9],[4,4,180,12],[1,8,0,24],[8,1,360,1]];
  const cell = ${cell}, pad = 8;
  const c = document.createElement('canvas'); c.width = cases.length * (cell + pad) + pad; c.height = 2 * (cell + pad) + pad;
  const ctx = c.getContext('2d'); ctx.fillStyle = '#888'; ctx.fillRect(0,0,c.width,c.height);
  ['harmonic','radial'].forEach((mode, row) => cases.forEach(([form,rhythm,phase,density], col) => {
    const r = validateRecipe({ ...DEFAULT_RECIPE, mode, form, rhythm, phase, density, palette: (col + row) % 6 });
    ctx.save(); ctx.translate(pad + col * (cell + pad), pad + row * (cell + pad));
    renderArtwork(ctx, r, cell, cell); ctx.restore();
  }));
  return c.toDataURL();
})()`);
b.saveDataUrl(outPng, data);
console.log('errors', b.errors.length ? b.errors : 'none');
b.close(); process.exit(0);
