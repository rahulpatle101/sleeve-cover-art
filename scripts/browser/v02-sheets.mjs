// v0.2 renderer checkpoint sheets, rendered by the app's own renderer in headless Chrome.
// Usage: node v02-sheets.mjs <url> <outdir> [which=grid,names,shared,holdout,timing]
import { launch } from './cdp.mjs';
import { writeFileSync } from 'node:fs';
const [url, out, which = 'grid,names,shared,holdout,timing'] = process.argv.slice(2);
const b = await launch(out + '/.chrome', 9341);
await b.send('Page.navigate', { url }); await b.sleep(1500);
const want = new Set(which.split(','));
const setup = `
  const { renderArtwork } = await import('/src/artwork/renderArtwork.ts');
  const { ensureFonts } = await import('/src/artwork/fonts.ts');
  const { validateRecipe, DEFAULT_RECIPE } = await import('/src/instrument/recipe.ts');
  const { remix, recipeFromSeed } = await import('/src/instrument/remix.ts');
  const { PALETTES, FAMILY_LABEL } = await import('/src/artwork/palettes.ts');
  const fontsOk = await ensureFonts();
  const sheet = (cols, rows, cell, label = 28, pad = 10) => { const c = document.createElement('canvas'); c.width = cols * (cell + pad) + pad; c.height = rows * (cell + pad + label) + pad; const x = c.getContext('2d'); x.fillStyle = '#9a9a9a'; x.fillRect(0, 0, c.width, c.height); return { c, x, at: (col, row) => [pad + col * (cell + pad), pad + row * (cell + pad + label) + label] }; };
  const cap = (x, t, X, Y) => { x.fillStyle = '#111'; x.font = '600 15px ui-monospace, Menlo, monospace'; x.fillText(t, X, Y - 9); };
  const name = (r) => FAMILY_LABEL[PALETTES[r.palette].family] + ' ' + PALETTES[r.palette].name;
  const draw = (sh, r, col, row, cell, t, q = 'full') => { const [X, Y] = sh.at(col, row); sh.x.save(); sh.x.translate(X, Y); renderArtwork(sh.x, r, cell, cell, q); sh.x.restore(); cap(sh.x, t, X, Y); };
`;
const run = async (file, body) => { const d = await b.ev(`(async () => { ${setup} ${body} })()`); if (typeof d === 'string') { b.saveDataUrl(`${out}/${file}`, d); console.log('wrote', file); } else console.log(file, JSON.stringify(d, null, 1)); };

if (want.has('grid')) for (const mode of ['harmonic', 'radial'])
  await run(`grid-${mode}.png`, `
    const cell = 460, sh = sheet(6, 3, cell);
    [2, 10, 24].forEach((density, row) => PALETTES.forEach((_, p) => draw(sh, validateRecipe({ ...DEFAULT_RECIPE, mode: '${mode}', density, palette: p }), p, row, cell, name({ palette: p }) + ' · ${mode[0].toUpperCase()} · d' + density)));
    return sh.c.toDataURL();`);

if (want.has('names'))
  await run('names.png', `
    const cell = 460, sh = sheet(6, 3, cell);
    const N = [['Night Office', 'Phase Garden', 'normal'], ['The Extraordinarily Long Weekend Ensemble', 'Songs For The Long Drive Home (Extended)', 'long'], ['KZXW', 'MMXXVI', 'upper']];
    N.forEach(([artist, track, k], row) => PALETTES.forEach((_, p) => draw(sh, validateRecipe({ ...DEFAULT_RECIPE, artist, track, mode: p % 2 ? 'radial' : 'harmonic', palette: p }), p, row, cell, name({ palette: p }) + ' · ' + k)));
    return sh.c.toDataURL();`);

if (want.has('shared'))
  await run('shared-recipe.png', `
    const cell = 640, sh = sheet(4, 3, cell);
    let i = 0; for (const p of [0, 1, 2, 3, 4, 5]) for (const mode of ['harmonic', 'radial']) { draw(sh, validateRecipe({ ...DEFAULT_RECIPE, mode, palette: p }), i % 4, (i / 4) | 0, cell, name({ palette: p }) + ' · ' + mode); i++; }
    return sh.c.toDataURL();`);

if (want.has('six'))
  await run('six-covers.png', `
    // one cover per production set; seeds from one Remix chain so composition varies; names exercise wrapping
    const cell = 900, sh = sheet(3, 2, cell, 32, 16);
    const names = [['Night Office', 'Phase Garden'], ['Mira Okafor', 'Tidewater'], ['The Extraordinarily Long Weekend Ensemble', 'Low Light'], ['Halden', 'Second Light (Extended)'], ['Quiet Meridian', 'Lowland'], ['KZXW', 'MMXXVI']];
    let r = DEFAULT_RECIPE;
    for (let p = 0; p < 6; p++) { r = remix(r); const rr = validateRecipe({ ...r, artist: names[p][0], track: names[p][1], palette: p, mode: p % 2 ? 'radial' : 'harmonic' });
      draw(sh, rr, p % 3, (p / 3) | 0, cell, name(rr) + ' · ' + rr.mode + ' ' + rr.form + ':' + rr.rhythm + ' ' + rr.phase + '° d' + rr.density); }
    return sh.c.toDataURL();`);

if (want.has('lightfonts'))
  await run('light-type-candidates.png', `
    // Light / Horizon name faces in the real layout. Candidates load from production/font-candidates (not bundled).
    const { LIGHT_FACES } = await import('/src/artwork/families/light.ts');
    const load = async (fam, file) => { const f = new FontFace(fam, 'url(/production/font-candidates/' + file + ')', { weight: '100 900' }); await f.load(); document.fonts.add(f); };
    await load('CAND Schibsted', 'SchibstedGrotesk-VF.ttf'); await load('CAND Familjen', 'FamiljenGrotesk-VF.ttf'); await load('CAND Darker', 'DarkerGrotesque-VF.ttf');
    const cur = JSON.parse(JSON.stringify(LIGHT_FACES));
    const rows = [
      ['Current · Anybody Expanded / Instrument Serif It.', cur.spectrum, cur.horizon],
      ['Schibsted Grotesk · 600 / 400', { family: 'CAND Schibsted', weight: 600, style: 'normal', track: -0.02, upper: false, scale: 1 }, { family: 'CAND Schibsted', weight: 400, style: 'normal', track: -0.015, upper: false, scale: 1 }],
      ['Familjen Grotesk · 600 / 400', { family: 'CAND Familjen', weight: 600, style: 'normal', track: -0.02, upper: false, scale: 1 }, { family: 'CAND Familjen', weight: 400, style: 'normal', track: -0.01, upper: false, scale: 1 }],
      ['Darker Grotesque · 700 / 500', { family: 'CAND Darker', weight: 700, style: 'normal', track: -0.01, upper: false, scale: 1.3 }, { family: 'CAND Darker', weight: 500, style: 'normal', track: 0, upper: false, scale: 1.3 }],
    ];
    const cell = 520, sh = sheet(4, 4, cell, 30, 12);
    const names = [['Night Office', 'Phase Garden'], ['The Extraordinarily Long Weekend Ensemble', 'Songs For The Long Drive Home']];
    rows.forEach(([label, sp, hz], row) => {
      Object.assign(LIGHT_FACES.spectrum, sp); Object.assign(LIGHT_FACES.horizon, hz);
      [[2, 0], [2, 1], [3, 0], [3, 1]].forEach(([p, k], col) => draw(sh, validateRecipe({ ...DEFAULT_RECIPE, palette: p, mode: col % 2 ? 'radial' : 'harmonic', artist: names[k][0], track: names[k][1] }), col, row, cell, (col === 0 ? label + ' — ' : '') + (p === 2 ? 'Spectrum' : 'Horizon')));
    });
    Object.assign(LIGHT_FACES.spectrum, cur.spectrum); Object.assign(LIGHT_FACES.horizon, cur.horizon);
    return sh.c.toDataURL();`);

if (want.has('holdout'))
  await run('holdout-remix.png', `
    // Hold-out: a start seed never used during labs or tuning; 12 chained remixes in both engines.
    const cell = 460, sh = sheet(6, 4, cell);
    let r = recipeFromSeed({ ...DEFAULT_RECIPE, artist: 'Lumen Archive', track: 'Second Light' }, 0x7e57a11e);
    for (let i = 0; i < 24; i++) { r = remix(r); const rr = { ...r, mode: i % 2 ? 'radial' : 'harmonic' }; draw(sh, rr, i % 6, (i / 6) | 0, cell, '#' + (i + 1) + ' ' + name(rr) + ' ' + rr.form + ':' + rr.rhythm + ' ' + rr.phase + '° d' + rr.density); }
    return sh.c.toDataURL();`);

if (want.has('holdout2'))
  await run('holdout-unseen.png', `
    // Unseen chain (start seed never used before), 24 proofs, alternating engines; frame type shown in the caption.
    const { compose } = await import('/src/artwork/composition.ts');
    const cell = 460, sh = sheet(6, 4, cell);
    let r = recipeFromSeed({ ...DEFAULT_RECIPE, artist: 'Avery Lune', track: 'Salt Hours' }, 0x2b7e1516);
    for (let i = 0; i < 24; i++) { r = remix(r); const rr = { ...r, mode: i % 2 ? 'radial' : 'harmonic' }; draw(sh, rr, i % 6, (i / 6) | 0, cell, '#' + (i + 1) + ' ' + name(rr) + ' ' + rr.form + ':' + rr.rhythm + ' · ' + compose(rr).frame); }
    return sh.c.toDataURL();`);

if (want.has('lightnames'))
  await run('light-names.png', `
    // Spectrum + Horizon type: normal / long / short names, both engines.
    const cell = 460, sh = sheet(6, 2, cell);
    const N = [['Night Office', 'Phase Garden'], ['The Extraordinarily Long Weekend Ensemble', 'Songs For The Long Drive Home (Extended)'], ['KZXW', 'MMXXVI']];
    [2, 3].forEach((p, row) => N.forEach(([artist, track], k) => ['harmonic', 'radial'].forEach((mode, m) => draw(sh, validateRecipe({ ...DEFAULT_RECIPE, artist, track, mode, palette: p }), k * 2 + m, row, cell, name({ palette: p }) + ' · ' + ['normal', 'long', 'short'][k] + ' · ' + mode))));
    return sh.c.toDataURL();`);

if (want.has('macro'))
  await run((process.env.MACRO_TAG || 'macro') + '-passes.png', `
    // Macro Relief across Passes 2 / 8 / 14 / 24, both engines, fixed seed.
    const cell = 520, sh = sheet(4, 2, cell);
    ['harmonic', 'radial'].forEach((mode, row) => [2, 8, 14, 24].forEach((density, col) => draw(sh, validateRecipe({ ...DEFAULT_RECIPE, mode, density, palette: 5 }), col, row, cell, 'Macro Relief · ' + mode + ' · ' + density + ' passes')));
    return sh.c.toDataURL();`);

if (want.has('timing'))
  await run('timing', `
    const res = { fontsOk }, c = document.createElement('canvas'), x = c.getContext('2d');
    const time = (fn, n = 3) => { const t = []; for (let i = 0; i < n; i++) { const t0 = performance.now(); fn(); x.getImageData(0, 0, 1, 1); t.push(performance.now() - t0); } t.sort((a, b) => a - b); return Math.round(t[(t.length / 2) | 0]); };
    for (const mode of ['harmonic', 'radial']) for (let p = 0; p < 6; p++) for (const d of [2, 24]) {
      const r = validateRecipe({ ...DEFAULT_RECIPE, mode, palette: p, density: d });
      c.width = c.height = 1468;
      const draft = time(() => renderArtwork(x, r, 1468, 1468, 'draft'));
      const full = time(() => renderArtwork(x, r, 1468, 1468, 'full'));
      c.width = c.height = 3000;
      const exp = time(() => renderArtwork(x, r, 3000, 3000, 'full'), 1);
      const t0 = performance.now(); const u = c.toDataURL('image/png'); const enc = Math.round(performance.now() - t0);
      res[name(r) + ' ' + mode[0].toUpperCase() + ' d' + d] = { draft1468: draft, full1468: full, render3000: exp, encode3000: enc, pngMB: +(u.length * 0.75 / 1e6).toFixed(2) };
    }
    return res;`);

console.log('errors', b.errors.length ? b.errors : 'none');
b.close(); process.exit(0);
