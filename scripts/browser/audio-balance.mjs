// Sensory balance: offline-render one pluck per recipe; measure RMS, peak, brightness, loudness proxy.
import { launch } from './cdp.mjs';
const [url] = process.argv.slice(2);
const b = await launch(process.env.CDP_OUT || '/tmp/abal', 9356);
await b.send('Page.navigate', { url }); await b.sleep(1500);
console.log(await b.ev(`(async () => {
  const { Voice } = await import('/src/audio/audioEngine.ts');
  const { validateRecipe, DEFAULT_RECIPE } = await import('/src/instrument/recipe.ts');
  const { remix } = await import('/src/instrument/remix.ts');
  const sr = 48000;
  const measure = async (r) => {
    const ctx = new OfflineAudioContext(1, sr * 0.6, sr); const v = new Voice(ctx, ctx.destination); v.pluck(r, 0.01);
    const x = (await ctx.startRendering()).getChannelData(0); const a = Math.floor(0.01 * sr), z = Math.floor(0.31 * sr);
    let ss = 0, sd = 0, pk = 0; for (let i = a; i < z; i++) { ss += x[i] * x[i]; const d = x[i] - x[i - 1]; sd += d * d; pk = Math.max(pk, Math.abs(x[i])); }
    const rms = Math.sqrt(ss / (z - a)), centroid = (sr / (2 * Math.PI)) * Math.sqrt(sd / ss);
    // Loudness proxy: rms weighted by a gentle equal-loudness slope (≈ +3 dB/octave from 200 Hz up to 3 kHz).
    const w = Math.sqrt(Math.min(3000, Math.max(200, centroid)) / 200);
    return { rms, pk, centroid, loud: rms * w };
  };
  const rows = [];
  const add = async (name, p) => { const r = validateRecipe({ ...DEFAULT_RECIPE, ...p }); rows.push([name, await measure(r)]); };
  for (const mode of ['harmonic', 'radial']) {
    await add(mode[0] + ' default', { mode });
    await add(mode[0] + ' min 1:1 d1 p1', { mode, form: 1, rhythm: 1, density: 1, palette: 0 });
    await add(mode[0] + ' max 8:8 d24 p6', { mode, form: 8, rhythm: 8, density: 24, palette: 5 });
    await add(mode[0] + ' 1:8 d24 p6', { mode, form: 1, rhythm: 8, density: 24, palette: 5 });
    await add(mode[0] + ' 8:1 d24 p6', { mode, form: 8, rhythm: 1, density: 24, palette: 5 });
    await add(mode[0] + ' 7:8 d24 p6', { mode, form: 7, rhythm: 8, density: 24, palette: 5 });
    await add(mode[0] + ' 7:8 d1 p1', { mode, form: 7, rhythm: 8, density: 1, palette: 0 });
    for (let p = 0; p < 6; p++) await add(mode[0] + ' palette ' + (p + 1), { mode, palette: p });
    let r = validateRecipe({ ...DEFAULT_RECIPE, mode }); for (let i = 1; i <= 12; i++) { r = remix(r); rows.push([mode[0] + ' remix ' + i, await measure(r)]); }
  }
  const louds = rows.map(([, m]) => m.loud), db = (x) => 20 * Math.log10(x);
  const ref = Math.max(...louds);
  let out = rows.map(([n, m]) => n.padEnd(20) + ' rms ' + m.rms.toFixed(4) + '  peak ' + m.pk.toFixed(3) + '  bright ' + Math.round(m.centroid).toString().padStart(4) + ' Hz  loud ' + (db(m.loud / ref)).toFixed(1).padStart(5) + ' dB').join('\\n');
  const spread = db(Math.max(...louds) / Math.min(...louds));
  const remixSteps = []; for (const mode of ['h', 'r']) { const seq = rows.filter(([n]) => n.startsWith(mode + ' remix')).map(([, m]) => m.loud); for (let i = 1; i < seq.length; i++) remixSteps.push(db(seq[i] / seq[i - 1])); }
  out += '\\nLOUDNESS SPREAD across all ' + rows.length + ' recipes: ' + spread.toFixed(1) + ' dB; max peak ' + Math.max(...rows.map(([, m]) => m.pk)).toFixed(3) + '; brightest ' + Math.round(Math.max(...rows.map(([, m]) => m.centroid))) + ' Hz';
  out += '\\nREMIX step-to-step loudness change: max +' + Math.max(...remixSteps).toFixed(1) + ' dB, max ' + Math.min(...remixSteps).toFixed(1) + ' dB';
  return out;
})()`));
console.log('ERRORS', b.errors.length ? b.errors : 'none'); b.close(); process.exit(0);
