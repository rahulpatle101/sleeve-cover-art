// Pure-function checks: bounds, deterministic remix, geometry finiteness, fit, contrast.
// Run: node scripts/verify.ts  (Node ≥ 23 strips types natively)
import { validateRecipe, BOUNDS, DEFAULT_RECIPE, type NumericKey, type ArtworkRecipeV1 } from '../src/instrument/recipe.ts';
import { remix, recipeFromSeed } from '../src/instrument/remix.ts';
import { traces, boundingBox, MAX_SEGMENTS } from '../src/artwork/geometry.ts';
import { registration, REG_MAX, placement, fitPlace, density, catalog, compositionForSet, transformTrace, focusPoint, FRAMING_TREATMENTS } from '../src/artwork/composition.ts';
import { PALETTES } from '../src/artwork/palettes.ts';
import { exportFilename } from '../src/export/filename.ts';

let fails = 0;
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails++;
};
const keys = Object.keys(BOUNDS) as NumericKey[];
const inBounds = (r: ArtworkRecipeV1) => keys.every((k) => Number.isInteger(r[k]) && r[k] >= BOUNDS[k].min && r[k] <= BOUNDS[k].max);

// 1. Clamp boundary
const bad = validateRecipe({ form: NaN, rhythm: Infinity, phase: -5, density: 99, palette: 2.6, mode: 'x' as never, artist: 'a\u0007  b'.repeat(30) });
check('clamp NaN/∞/−5/99/2.6', bad.form === 1 && bad.rhythm === 8 && bad.phase === 0 && bad.density === 24 && bad.palette === 3, JSON.stringify([bad.form, bad.rhythm, bad.phase, bad.density, bad.palette]));
check('invalid mode → harmonic', bad.mode === 'harmonic');
check('text sanitized + capped', bad.artist.length <= 48 && !/[\u0000-\u001f]/.test(bad.artist), `${bad.artist.length} chars`);

// 2. Remix: bounds, determinism, identity preserved
let r = DEFAULT_RECIPE, out = 0;
const seeds = new Set<number>();
for (let i = 0; i < 10000; i++) {
  r = remix(r);
  if (!inBounds(r)) out++;
  seeds.add(r.seed);
}
check('10,000 chained remixes in bounds', out === 0, `${out} out of bounds`);
check('remix seeds do not cycle early', seeds.size === 10000, `${seeds.size} unique`);
check('remix never yields 1:1 Form:Rhythm', (() => { let q = DEFAULT_RECIPE; for (let i = 0; i < 10000; i++) { q = remix(q); if (q.form === q.rhythm) return false; } return true; })());
check('remix density respects complexity cap', (() => { let q = DEFAULT_RECIPE; for (let i = 0; i < 10000; i++) { q = remix(q); const g = (a: number, b: number): number => (b ? g(b, a % b) : a); const c = (q.form + q.rhythm) / g(q.form, q.rhythm); if (q.density > Math.min(18, Math.max(4, Math.floor(70 / c)))) return false; } return true; })());
{ const counts = new Array(6).fill(0); let q = DEFAULT_RECIPE; for (let i = 0; i < 6000; i++) { q = remix(q); counts[q.palette]++; } check('remix palette distribution roughly uniform', Math.min(...counts) > 800 && Math.max(...counts) < 1200, counts.join('/')); }
check('remix never repeats the previous palette', (() => { let q = DEFAULT_RECIPE; for (let i = 0; i < 10000; i++) { const n = remix(q); if (n.palette === q.palette) return false; q = n; } return true; })());
{ let q: ArtworkRecipeV1 = { ...DEFAULT_RECIPE, mode: 'harmonic' }, bad = 0; for (let i = 0; i < 10000; i++) { q = remix(q); const g = (a: number, b: number): number => (b ? g(b, a % b) : a); const d = g(q.form, q.rhythm); if (Math.max(q.form / d, q.rhythm / d) > 6 || (q.form + q.rhythm) / d > 9) bad++; } check('harmonic remix only yields figure-like ratios (P+Q ≤ 9, terms ≤ 6)', bad === 0, (100 * bad / 10000).toFixed(2) + '% of 10k'); }
check('remix preserves artist/track/mode', r.artist === DEFAULT_RECIPE.artist && r.track === DEFAULT_RECIPE.track && r.mode === DEFAULT_RECIPE.mode);
const a1 = remix(DEFAULT_RECIPE), a2 = remix(DEFAULT_RECIPE);
check('same recipe → same remix', JSON.stringify(a1) === JSON.stringify(a2), JSON.stringify(a1));
check('same seed → same recipe', JSON.stringify(recipeFromSeed(DEFAULT_RECIPE, 12345)) === JSON.stringify(recipeFromSeed(DEFAULT_RECIPE, 12345)));
const chain = [remix(DEFAULT_RECIPE)];
for (let i = 1; i < 3; i++) chain.push(remix(chain[i - 1]));
console.log('      first 3 remixes from default:', chain.map((c) => `${c.seed.toString(16)}:${c.form}/${c.rhythm}/${c.phase}/${c.density}/p${c.palette}`).join('  '));

// 3. Geometry: finite, non-degenerate and bounded.
const S3 = 3000;
let nonFinite = 0, degenerate = 0, combos = 0, maxPts = 0;
for (const mode of ['harmonic', 'radial'] as const)
  for (let f = 1; f <= 8; f++)
    for (let h = 1; h <= 8; h++)
      for (let p = 0; p <= 360; p += 15)
        for (const d of [1, 12, 24]) {
          const rec = validateRecipe({ ...DEFAULT_RECIPE, mode, form: f, rhythm: h, phase: p, density: d });
          const trs = traces(rec, MAX_SEGMENTS);
          const b = boundingBox(trs);
          combos++;
          let pts = 0;
          for (const tr of trs) { pts += tr.length / 2; for (let j = 0; j < tr.length; j++) if (!Number.isFinite(tr[j])) nonFinite++; }
          maxPts = Math.max(maxPts, pts);
          if (b.maxX - b.minX < 1e-6 && b.maxY - b.minY < 1e-6) degenerate++;
        }
check(`geometry finite across ${combos} combos`, nonFinite === 0, `${nonFinite} non-finite`);
check('no all-point-equal output', degenerate === 0, `${degenerate}`);

// The camera is allowed to crop the figure deliberately. The invariant is that its selected real curve event remains
// visible in the protected composition field; typography is painted in the final layer and is browser-regression tested.
{
  let seed = 0x91e10da5, badCamera = 0, badFocus = 0, deterministic = 0, scaleDrift = 0;
  const treatments = new Set<string>();
  for (let i = 0; i < 50; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const base = recipeFromSeed(DEFAULT_RECIPE, seed);
    for (const mode of ['harmonic', 'radial'] as const) for (let palette = 0; palette < 6; palette++) {
      const rec = validateRecipe({ ...base, mode, palette }), c = compositionForSet(PALETTES[palette], rec), c2 = compositionForSet(PALETTES[palette], rec);
      treatments.add(c.treatment);
      if (JSON.stringify(c) !== JSON.stringify(c2)) deterministic++;
      const key = transformTrace(traces(rec, MAX_SEGMENTS)[0], c), box = boundingBox([key]), f = focusPoint(key, c, box);
      const p = placement(PALETTES[palette], rec, c); p.focus = f;
      const fit = fitPlace(box, S3, p), preview = fitPlace(box, 600, p), X = (f.x * fit.scale + fit.tx) / S3, Y = (f.y * fit.scale + fit.ty) / S3;
      if (![...Object.values(c), fit.scale, fit.tx, fit.ty].filter((v): v is number => typeof v === 'number').every(Number.isFinite) || fit.scale <= 0) badCamera++;
      if (X < 0.08 || X > 0.92 || Y < 0.08 || Y > 0.68) badFocus++;
      if (Math.abs(fit.scale / S3 - preview.scale / 600) > 1e-12 || Math.abs(fit.tx / S3 - preview.tx / 600) > 1e-12 || Math.abs(fit.ty / S3 - preview.ty / 600) > 1e-12) scaleDrift++;
    }
  }
  check('50 unseen seeds × 2 engines × 6 sets: camera finite and positively scaled', badCamera === 0, `${badCamera} failures`);
  check('camera keeps its selected intersection/curvature event in the protected field', badFocus === 0, `${badFocus} failures`);
  check('seed-derived camera is deterministic', deterministic === 0, `${deterministic} mismatches`);
  check('camera is scale-identical at preview and 3000px export sizes', scaleDrift === 0, `${scaleDrift} mismatches`);
  check('hold-out seeds exercise every bounded framing treatment', treatments.size === FRAMING_TREATMENTS.length, [...treatments].join(', '));
}
// Registration: in register at 0/90/180/270, maximal at 45° multiples, bounded by REG_MAX.
{ const at = (phase: number) => Math.hypot(registration({ ...DEFAULT_RECIPE, phase }, 3000).dx, registration({ ...DEFAULT_RECIPE, phase }, 3000).dy);
  check('plates in register at 0°, 90°, 180°, 270°, 360°', [0, 90, 180, 270, 360].every((p) => at(p) < 1e-9), [0, 90, 180, 270, 360].map(at).map((v) => v.toFixed(3)).join('/'));
  check('maximum misregistration at 45° = REG_MAX·S', Math.abs(at(45) - REG_MAX * 3000) < 1e-6 && Math.abs(at(135) - REG_MAX * 3000) < 1e-6, at(45).toFixed(2) + ' px');
  let mx = 0; for (let p = 0; p <= 360; p++) mx = Math.max(mx, at(p)); check('misregistration bounded for every phase', mx <= REG_MAX * 3000 + 1e-9, mx.toFixed(2)); }
// Density meanings (approved): bounded, monotonic, never "more complete curves" beyond the caps.
{ const ds = Array.from({ length: 24 }, (_, i) => i + 1);
  const mono = (fn: (d: number) => number) => ds.every((d, i) => i === 0 || fn(d) >= fn(ds[i - 1]));
  check('Ink: echoes ≤ 5, impressions 1–5, all Ink meanings monotonic', ds.every((d) => density.ink(d).echoes <= 5 && density.ink(d).impressions >= 1 && density.ink(d).impressions <= 5) && (['echoes', 'impressions', 'pressureRange', 'spread', 'breakup'] as const).every((k) => mono((d) => density.ink(d)[k])), `d24 ${JSON.stringify(density.ink(24))}`);
  check('Light: band width / intensity / filaments / residue monotonic, intensity ≤ 1.15', (['bandWidth', 'intensity', 'filaments', 'residue'] as const).every((k) => mono((d) => density.light(d)[k])) && density.light(24).intensity <= 1.15, `d24 ${JSON.stringify(density.light(24))}`);
  check('Matter: ≤ 4 undulations, depth/ridge/brush monotonic', ds.every((d) => density.matter(d).undulations <= 4) && (['ridgeWidth', 'depth', 'undulations', 'brush'] as const).every((k) => mono((d) => density.matter(d)[k])), `d24 ${JSON.stringify(density.matter(24))}`); }
check('catalog derived from recipe only (deterministic, no brand mark)', JSON.stringify(catalog(DEFAULT_RECIPE)) === JSON.stringify(catalog({ ...DEFAULT_RECIPE })) && !catalog(DEFAULT_RECIPE).join(' ').includes('SLEEVE'), catalog(DEFAULT_RECIPE).join(' | '));
check('catalog reports register state', catalog({ ...DEFAULT_RECIPE, phase: 90 })[3].endsWith('IN REGISTER') && catalog({ ...DEFAULT_RECIPE, phase: 45 })[3].endsWith('OFF REGISTER'));
check('point budget bounded', maxPts <= 24 * (MAX_SEGMENTS + 1), `max ${maxPts} points`);

// 4. Determinism of geometry
const g1 = traces({ ...DEFAULT_RECIPE, mode: 'radial' }, MAX_SEGMENTS);
const g2 = traces({ ...DEFAULT_RECIPE, mode: 'radial' }, MAX_SEGMENTS);
check('same recipe → identical geometry', g1.every((t, i) => t.every((v, j) => v === g2[i][j])));

// 5. Cover text contrast (WCAG) against each set's stock / flat surface. Measured renders are checked separately.
const parse = (c: string): [number, number, number, number] => {
  if (c.startsWith('#')) return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)).concat(1) as never;
  const m = c.match(/[\d.]+/g)!.map(Number); return [m[0], m[1], m[2], m[3] ?? 1];
};
const over = (fg: string, bg: number[]) => { const f = parse(fg); return [0, 1, 2].map((i) => f[i] * f[3] + bg[i] * (1 - f[3])); };
const lumC = (c: number[]) => { const v = c.map((x) => x / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const ratioC = (a: number[], b: number[]) => { const [h, l] = [lumC(a), lumC(b)].sort((x, y) => y - x); return (h + 0.05) / (l + 0.05); };
const lum = (hex: string) => lumC(parse(hex).slice(0, 3));
const ratio = (a: string, b: string) => { const [h, l] = [lum(a), lum(b)].sort((x, y) => y - x); return (h + 0.05) / (l + 0.05); };
// Matter flat surface under the one light (normal = +z): alb·(0.22 + 1.1·L.z) + spec·(H.z^34)·0.55
const Lz = 0.42 / Math.hypot(0.6, 0.62, 0.42), Hz = (Lz + 1) / Math.hypot(-0.6 / Math.hypot(0.6, 0.62, 0.42), -0.62 / Math.hypot(0.6, 0.62, 0.42), Lz + 1);
for (const p of PALETTES) {
  const ground = p.family === 'matter' ? p.albedo!.map((a, i) => a * (0.22 + 1.1 * Lz) + [232, 234, 238][i] * Hz ** 34 * 0.55) : parse(p.stock).slice(0, 3);
  const fg = [p.display, p.notation, ...(p.accent ? [p.accent] : [])];
  const cr = Math.min(...fg.map((c) => ratioC(over(c, ground), ground)));
  check(`${p.family} ${p.name}: display/notation/accent on ${p.family === 'matter' ? 'flat surface' : 'stock'} ≥ 4.5`, cr >= 4.5, `min ${cr.toFixed(2)}`);
}
check('six sets = two per family', (['ink', 'light', 'matter'] as const).every((f) => PALETTES.filter((p) => p.family === f).length === 2));
const ui = [['text-secondary on canvas', '#5A5A60', '#ECEBE7'], ['text-secondary on panel', '#5A5A60', '#F7F6F3'], ['line-control on white', '#8A8A90', '#FFFFFF'], ['line-control on panel', '#8A8A90', '#F7F6F3']];
for (const [n, a, b] of ui) check(`UI ${n}`, ratio(a, b) >= (n.startsWith('line') ? 3 : 4.5), ratio(a, b).toFixed(2));

// 6. Filename
check('filename', exportFilename(DEFAULT_RECIPE) === 'sleeve-night-office-phase-garden-harmonic-01352905.png', exportFilename(DEFAULT_RECIPE));
check('filename cuts at a word boundary', exportFilename({ ...DEFAULT_RECIPE, track: 'Songs For The Long Drive Home (Extended)' }) === 'sleeve-night-office-songs-for-the-long-drive-home-harmonic-01352905.png', exportFilename({ ...DEFAULT_RECIPE, track: 'Songs For The Long Drive Home (Extended)' }));
check('filename fallback (no names)', exportFilename({ ...DEFAULT_RECIPE, artist: ' ', track: '' }) === 'sleeve-003-harmonic-01352905.png', exportFilename({ ...DEFAULT_RECIPE, artist: ' ', track: '' }));
const odd = exportFilename({ ...DEFAULT_RECIPE, artist: 'Ada Vélo', track: '../../etc/パス?*:"<>|' + 'x'.repeat(48) });
check('filename safe (diacritics, traversal, symbols, length)', /^[a-z0-9-]+\.png$/.test(odd) && odd.length <= 96 && odd.includes('ada-velo'), odd);

console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exit(fails ? 1 : 0);
