// Optional, original Web Audio synthesis. No samples. Created only from an explicit user action.
import type { ArtworkRecipeV1 } from '../instrument/recipe.ts';

/** Envelope peak per voice and fixed master level. Worst case: 2 osc × PEAK × MASTER ≈ 0.14 FS. */
export const PEAK = 0.12;
export const MASTER = 0.6;
const GLIDE = 0.025; // s, time constant for pitch/filter/pan changes (click-free)
const DECAY = 0.16; // s, envelope release time constant

export type SoundParams = { f1: number; f2: number; cutoff: number; pan: number; radial: boolean };

/** Pure mapping, recipe → safe musical ranges. Interval follows Form:Rhythm folded into one octave. */
export function soundParams(r: ArtworkRecipeV1): SoundParams {
  let ratio = r.form / r.rhythm;
  while (ratio < 1) ratio *= 2;
  while (ratio >= 2) ratio /= 2;
  // A unison (1:1, 8:8, 1:8, 8:1 …) would double one pitch coherently (+3 dB, the loudest case in the
  // balance audit). Voice it as an octave instead: same harmony, even level.
  if (ratio === 1) ratio = 2;
  const f1 = 196 * Math.pow(2, r.palette / 12); // G3 .. C4-ish
  return {
    f1,
    f2: f1 * ratio, // ≤ 2·f1 < 600 Hz
    cutoff: 700 + r.density * 120, // 820 .. 3580 Hz: brightness, not loudness
    pan: Math.sin((r.phase * Math.PI) / 180) * 0.35,
    radial: r.mode === 'radial',
  };
}

/** One persistent voice. Retriggers never stack, so output stays bounded. */
export class Voice {
  readonly master: GainNode;
  private a: OscillatorNode;
  private b: OscillatorNode;
  private filter: BiquadFilterNode;
  private pan: StereoPannerNode;
  private env: GainNode;
  private ctx: BaseAudioContext;

  constructor(ctx: BaseAudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.a = ctx.createOscillator();
    this.b = ctx.createOscillator();
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.Q.value = 0.7;
    this.pan = ctx.createStereoPanner();
    this.env = ctx.createGain();
    this.env.gain.value = 0;
    this.master = ctx.createGain();
    this.master.gain.value = MASTER;
    const mixA = ctx.createGain();
    const mixB = ctx.createGain();
    mixA.gain.value = 1;
    mixB.gain.value = 0.7;
    this.a.connect(mixA).connect(this.filter);
    this.b.connect(mixB).connect(this.filter);
    this.filter.connect(this.pan).connect(this.env).connect(this.master).connect(destination);
    this.a.start();
    this.b.start();
  }

  /** Glide to the recipe's sound and re-strike the envelope at `when`. */
  pluck(r: ArtworkRecipeV1, when = this.ctx.currentTime): void {
    const p = soundParams(r);
    const wantA: OscillatorType = p.radial ? 'triangle' : 'sine';
    if (this.a.type !== wantA) this.a.type = wantA; // Harmonic = clean sine pair; Radial = slightly richer
    this.a.frequency.setTargetAtTime(p.f1, when, GLIDE);
    this.b.frequency.setTargetAtTime(p.f2, when, GLIDE);
    this.filter.frequency.setTargetAtTime(p.cutoff, when, GLIDE);
    this.pan.pan.setTargetAtTime(p.pan, when, GLIDE);
    const g = this.env.gain;
    g.cancelScheduledValues(when);
    g.setTargetAtTime(PEAK, when, 0.006); // ~20 ms soft attack from wherever it is
    g.setTargetAtTime(0, when + 0.03, DECAY);
  }

  /** Short, quiet confirmation (export finished): an octave lift of the current pair. */
  chime(r: ArtworkRecipeV1, when = this.ctx.currentTime): void {
    const up = { ...r, palette: Math.min(5, r.palette) };
    this.pluck(up, when);
    const p = soundParams(up);
    this.a.frequency.setTargetAtTime(p.f1 * 2, when + 0.12, GLIDE);
    this.b.frequency.setTargetAtTime(p.f2 * 2, when + 0.12, GLIDE);
    this.env.gain.setTargetAtTime(PEAK * 0.8, when + 0.12, 0.006);
    this.env.gain.setTargetAtTime(0, when + 0.15, DECAY * 1.5);
  }

  /** Fade to silence without a click. */
  fadeOut(when = this.ctx.currentTime, tau = 0.008): void {
    this.master.gain.cancelScheduledValues(when);
    this.master.gain.setTargetAtTime(0, when, tau);
  }

  stop(when: number): void {
    this.a.stop(when);
    this.b.stop(when);
  }
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private voice: Voice | null = null;
  private lastPluck = -1;
  private pending: { r: ArtworkRecipeV1; timer: ReturnType<typeof setTimeout> } | null = null;
  private onVisibility = () => {
    if (!this.ctx) return;
    if (document.hidden) void this.ctx.suspend();
    else void this.ctx.resume();
  };

  async enable(): Promise<void> {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.voice = new Voice(this.ctx, this.ctx.destination);
      document.addEventListener('visibilitychange', this.onVisibility);
    }
    await this.ctx.resume();
  }

  /** Mute: immediate ~30 ms fade, then release every node. */
  async disable(): Promise<void> {
    const ctx = this.ctx;
    const voice = this.voice;
    this.ctx = null;
    this.voice = null;
    if (this.pending) clearTimeout(this.pending.timer);
    this.pending = null;
    document.removeEventListener('visibilitychange', this.onVisibility);
    if (!ctx || !voice) return;
    voice.fadeOut(ctx.currentTime);
    voice.stop(ctx.currentTime + 0.06);
    await new Promise((r) => setTimeout(r, 70));
    await ctx.close().catch(() => {});
  }

  pluck(r: ArtworkRecipeV1): void {
    const ctx = this.ctx;
    if (!ctx || !this.voice || ctx.state !== 'running') return;
    const since = ctx.currentTime - this.lastPluck;
    if (since < 0.05) {
      // Coalesce raw drag events, but always finish on the latest recipe (trailing pluck).
      if (this.pending) this.pending.r = r;
      else this.pending = { r, timer: setTimeout(() => { const p = this.pending; this.pending = null; if (p) this.pluck(p.r); }, (0.05 - since) * 1000 + 5) };
      return;
    }
    this.lastPluck = ctx.currentTime;
    this.voice.pluck(r);
  }

  chime(r: ArtworkRecipeV1): void {
    if (this.ctx?.state === 'running' && this.voice) this.voice.chime(r);
  }
}
