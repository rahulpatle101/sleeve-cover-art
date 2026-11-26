// Sensory pass: OfflineAudioContext signal tests of the real Voice + live opt-in/mute check.
import { launch } from './cdp.mjs';
const [url] = process.argv.slice(2);
const b = await launch(process.env.CDP_OUT || '/tmp/audio', 9341);
const log = (...a) => console.log(...a);
// Instrument the page before it loads: count AudioContexts and tap anything routed to the destination.
await b.send('Page.addScriptToEvaluateOnNewDocument', { source: `
  window.__ac = 0; const AC = window.AudioContext;
  window.AudioContext = class extends AC { constructor(...a) { super(...a); window.__ac++; window.__ctx = this; this.__an = this.createAnalyser(); this.__an.fftSize = 2048; } };
  const conn = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (t, ...rest) { const r = conn.call(this, t, ...rest); if (t instanceof AudioDestinationNode && this.context.__an) conn.call(this, this.context.__an); return r; };
` });
await b.send('Page.navigate', { url }); await b.sleep(1500);

log('OFFLINE', await b.ev(`(async () => {
  const { Voice, PEAK, MASTER } = await import('/src/audio/audioEngine.ts');
  const { validateRecipe, DEFAULT_RECIPE } = await import('/src/instrument/recipe.ts');
  const sr = 48000, dur = 3;
  const stats = (x, a, z) => { let pk = 0, ss = 0, d1 = 0, d2 = 0; const i0 = Math.floor(a * sr), i1 = Math.floor(z * sr);
    for (let i = i0; i < i1; i++) { const v = Math.abs(x[i]); if (v > pk) pk = v; ss += x[i] * x[i];
      if (i > i0) d1 = Math.max(d1, Math.abs(x[i] - x[i-1])); if (i > i0 + 1) d2 = Math.max(d2, Math.abs(x[i] - 2*x[i-1] + x[i-2])); }
    return { peak: +pk.toFixed(4), rms: +Math.sqrt(ss / Math.max(1, i1 - i0)).toFixed(4), maxStep: +d1.toFixed(4), maxCurv: +d2.toFixed(5) }; };
  const render = async (script) => { const ctx = new OfflineAudioContext(2, sr * dur, sr); const v = new Voice(ctx, ctx.destination); script(ctx, v); const buf = await ctx.startRendering(); return [buf.getChannelData(0), buf.getChannelData(1)]; };
  const R = (p) => validateRecipe({ ...DEFAULT_RECIPE, ...p });
  const out = { bound: 'theoretical max ' + (2 * PEAK * MASTER * 1.0).toFixed(3) + ' FS (pre-pan)' };
  // A: single pluck
  let [L, Rr] = await render((c, v) => v.pluck(R({}), 0.1));
  out.silentBeforePluck = stats(L, 0, 0.09).peak; out.pluck = stats(L, 0.1, 0.6); out.tailAfter1_5s = stats(L, 1.6, 2.9).peak;
  // B: fast drag — 20 retriggers every 50 ms with changing params incl. mode flips
  [L, Rr] = await render((c, v) => { for (let i = 0; i < 20; i++) v.pluck(R({ phase: i * 18, density: 1 + i, form: 1 + (i % 8), rhythm: 8 - (i % 7), mode: i % 5 === 0 ? 'radial' : 'harmonic' }), 0.1 + i * 0.05); });
  const bl = stats(L, 0.1, 1.4), br = stats(Rr, 0.1, 1.4); out.drag = { L: bl, R: br };
  // C: mute (fadeOut) mid-note
  [L] = await render((c, v) => { v.pluck(R({}), 0.1); v.fadeOut(0.15); });
  out.muteMidNote = { during: stats(L, 0.1, 0.15), fadeWindow: stats(L, 0.15, 0.25), after: stats(L, 0.3, 2.9).peak };
  // D: muted before any pluck → silence
  [L] = await render((c, v) => { v.fadeOut(0); v.pluck(R({}), 0.2); });
  out.mutedThenPluck = stats(L, 0.15, 2.9).peak;
  // E: detector sanity — deliberately clicky hard cut of the same voice
  [L] = await render((c, v) => { v.pluck(R({}), 0.1); v.master.gain.setValueAtTime(0, 0.13); });
  out.referenceHardCutClick = stats(L, 0.12, 0.14);
  return JSON.stringify(out, null, 1);
})()`));

// Live: nothing before gesture; analyser after enable; silence after mute
const btn = `[...document.querySelectorAll('button')].find(b => /sound/i.test(b.textContent))`;
log('LIVE contexts before any gesture:', await b.ev('window.__ac'));
await b.ev(`${btn}.focus()`); await b.key('Enter'); await b.sleep(400);
log('LIVE after Enable: contexts', await b.ev('window.__ac'), 'state', await b.ev('window.__ctx && window.__ctx.state'), 'label', await b.ev(`${btn}.textContent.trim()`));
const level = () => b.ev(`(() => { const a = window.__ctx.__an; const d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let s = 0, p = 0; for (const v of d) { s += v*v; p = Math.max(p, Math.abs(v)); } return 'rms ' + Math.sqrt(s / d.length).toFixed(4) + ' peak ' + p.toFixed(4); })()`);
await b.ev(`document.querySelectorAll('.dial-input')[0].focus()`); await b.key('ArrowUp'); await b.sleep(60);
log('LIVE 60 ms after a Form change:', await level());
await b.sleep(1500); log('LIVE 1.5 s later (decayed):', await level());
await b.key('ArrowUp'); await b.sleep(40);
const ctxRef = await b.ev(`(window.__old = window.__ctx, 'ok')`);
await b.ev(`${btn}.focus()`); await b.key('Enter'); await b.sleep(20);
log('LIVE after Mute: label', await b.ev(`${btn}.textContent.trim()`), 'label', await b.ev(`${btn}.textContent.trim()`));
await b.sleep(300); log('LIVE context after mute:', await b.ev('window.__old.state'));
await b.ev(`document.querySelectorAll('.dial-input')[0].focus()`); await b.key('ArrowDown'); await b.sleep(100);
log('LIVE contexts after muted tuning (no new context):', await b.ev('window.__ac'));
await b.send('Page.reload'); await b.sleep(1200);
log('LIVE after reload: label', await b.ev(`${btn}.textContent.trim()`), 'contexts', await b.ev('window.__ac'), '(sound does not persist)');
log('ERRORS', b.errors.length ? b.errors : 'none');
b.close(); process.exit(0);
