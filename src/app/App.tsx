// SLEEVE instrument (v0.2). Tactile controls: Analog UI (MIT, © 2026 TechSquidTV, vendored in src/vendor/analog-ui),
// recoloured and restrained for SLEEVE — PROPOSED inspiration, not extraction evidence (see production/analog-bench/).
// Accessibility model: every continuous control is a native <input type="range"> over Analog's visual dial (aria-hidden,
// out of the tab order, pointer-inert; SLEEVE's relative drag); Engine is two native radios over an inert rocker.
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { AnalogLightingProvider, Dial, Toggle, Meter, PushButton, PushToggle } from '../vendor/analog-ui/src/index.ts';
import { DEFAULT_RECIPE, BOUNDS, TEXT_MAX, validateRecipe, type ArtworkRecipeV1 } from '../instrument/recipe.ts';
import { remix } from '../instrument/remix.ts';
import { namesFor } from '../instrument/names.ts';
import { PressSetPicker } from '../instrument/PressSetPicker.tsx';
import { ArtworkStage } from '../artwork/ArtworkStage.tsx';
import { PALETTES, FAMILY_LABEL } from '../artwork/palettes.ts';
import { REG_MAX } from '../artwork/composition.ts';
import { exportPng, EXPORT_SIZE } from '../export/exportPng.ts';
import { AudioEngine } from '../audio/audioEngine.ts';

const LIGHT = { baseAngle: 135, power: 0.6 }; // one static shared light; no pointer / tilt lighting
const IN_REGISTER = [0, 90, 180, 270, 360];
const SLEEVE_MM = 304.8; // 12-inch sleeve; channel offset = |sin 2φ| · REG_MAX · side
const FAMILY_TONE = { ink: 'oklch(0.62 0.19 35)', light: 'oklch(0.55 0.17 262)', matter: 'oklch(0.72 0.11 80)' } as const;

type DialSpec = { hideLabel?: boolean; pointerClassName?: string; label: string; value: number; min: number; max: number; coarse: number; size: number; variant: 'chrome' | 'black'; onChange: (v: number) => void; valueText?: string; detents?: number[]; sweep?: number; start?: number };

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DIAL_RESPONSE = 0.32; // s — critically damped (damping ratio 1.0): settles without overshoot

/**
 * The knob's drawn angle as a critically damped spring toward `target`. Retargeting keeps the live position and
 * velocity, so a keypress or New Proof mid-flight redirects the knob instead of restarting it. `immediate` = 1:1
 * (drag in progress) or reduced motion: the knob is placed exactly, no spring.
 */
function useDialSpring(target: number, immediate: boolean, span: number) {
  const [shown, setShown] = useState(target);
  const s = useRef({ x: target, v: 0, raf: 0 });
  useEffect(() => {
    const st = s.current;
    cancelAnimationFrame(st.raf);
    if (immediate || reducedMotion() || st.x === target) { st.x = target; st.v = 0; setShown(target); return; }
    const w = (2 * Math.PI) / DIAL_RESPONSE, eps = span * 0.0004;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000); last = now;
      st.v += (-w * w * (st.x - target) - 2 * w * st.v) * dt; st.x += st.v * dt;
      if (Math.abs(st.x - target) < eps && Math.abs(st.v) < eps * 10) { st.x = target; st.v = 0; setShown(target); return; }
      setShown(st.x); st.raf = requestAnimationFrame(tick);
    };
    st.raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(st.raf);
  }, [target, immediate, span]);
  return shown;
}

/** Native range (keyboard, VoiceOver, focus) layered over Analog's Dial (visual + pointer drag). */
function AnalogDial({ hideLabel, pointerClassName = 'ab-ink-pointer', label, value, min, max, coarse, size, variant, onChange, valueText, detents, sweep = 300, start = 210 }: DialSpec) {
  const input = useRef<HTMLInputElement>(null);
  // While dragging, the knob follows the hand continuously (fractional), and the value commits in whole steps.
  // On release it springs onto the committed detent.
  const [handle, setHandle] = useState<number | null>(null);
  const handleRaf = useRef(0);
  const follow = (v: number) => { cancelAnimationFrame(handleRaf.current); handleRaf.current = requestAnimationFrame(() => setHandle(v)); };
  useEffect(() => () => cancelAnimationFrame(handleRaf.current), []);
  const shown = useDialSpring(handle ?? value, handle !== null, max - min);
  const set = (v: number) => { const n = Math.min(max, Math.max(min, Math.round(v))); if (n !== value) onChange(n); };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const up = e.key === 'ArrowUp' || e.key === 'ArrowRight', down = e.key === 'ArrowDown' || e.key === 'ArrowLeft';
    let n: number | null = null;
    if (e.key === 'PageUp' || (e.shiftKey && up)) n = value + coarse; else if (e.key === 'PageDown' || (e.shiftKey && down)) n = value - coarse;
    else if (e.key === 'Home') n = min; else if (e.key === 'End') n = max;
    if (n !== null) { e.preventDefault(); set(n); }
  };
  // SLEEVE's relative drag (dead zone, axis lock, Shift = fine) — Analog's own absolute-angle drag would jump the value.
  const drag = useRef<{ x: number; y: number; start: number; acc: number; axis: 'x' | 'y' | 'none' | null } | null>(null);
  const span = max - min, pxPerStep = Math.min(22, Math.max(1, 160 / Math.max(1, span)));
  const down = (e: PointerEvent<HTMLDivElement>) => { if (e.button !== 0) return; e.preventDefault(); input.current?.focus({ preventScroll: true }); e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, start: value, acc: 0, axis: null }; };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current; if (!d) return; const dx = e.clientX - d.x, dy = e.clientY - d.y, touch = e.pointerType === 'touch';
    if (d.axis === null) { if (Math.max(Math.abs(dx), Math.abs(dy)) < (touch ? 10 : 6)) return; d.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : touch ? 'none' : 'y'; }
    if (d.axis === 'none') return; const mv = d.axis === 'x' ? dx : -dy; d.x = e.clientX; d.y = e.clientY;
    d.acc += (mv * (e.shiftKey ? 0.25 : 1)) / pxPerStep;
    d.acc = Math.min(max - d.start, Math.max(min - d.start, d.acc)); // reversing after the end stop responds at once
    follow(d.start + d.acc); set(d.start + d.acc);
  };
  const end = () => { drag.current = null; cancelAnimationFrame(handleRaf.current); setHandle(null); };
  const id = `ab-${label.toLowerCase()}`;
  return (
    <div className="ab-dial">
      <div className={`ab-dial-hit${handle !== null ? ' is-dragging' : ''}`} data-drag-surface style={{ width: size, height: size, touchAction: 'pan-y' }} onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
        <input ref={input} id={id} aria-label={label} className="ab-native" type="range" min={min} max={max} step={1} value={value} aria-valuetext={valueText}
          onChange={(e) => set(Number(e.currentTarget.value))} onKeyDown={onKey} />
        <Dial mode="knob" variant={variant} value={shown} min={min} max={max} step={0.001} startAngle={start} sweepAngle={sweep}
          tabIndex={-1} aria-hidden="true" style={{ width: size, height: size, pointerEvents: 'none' }} pointerClassName={pointerClassName} />
        {detents && (
          <svg className="ab-detents" viewBox="-60 -60 120 120" aria-hidden="true">
            {detents.map((d) => { const a = ((start + (sweep * (d - min)) / (max - min) - 90) * Math.PI) / 180; return <line key={d} x1={Math.cos(a) * 54} y1={Math.sin(a) * 54} x2={Math.cos(a) * 59} y2={Math.sin(a) * 59} stroke="currentColor" strokeWidth="1.6" />; })}
          </svg>
        )}
      </div>
      {!hideLabel && <label htmlFor={id}>{label}</label>}
    </div>
  );
}

/** Module heading on the printed sheet: the designator is decoration (hidden from AT); the name is the heading, and
 *  for a dial without its own caption it is also the control's visible <label>. */
function ModHead({ des, name, htmlFor, id }: { des: string; name: string; htmlFor?: string; id?: string }) {
  return (
    <h2 className="ab-ref" id={id}>
      <span aria-hidden="true">{des} </span>
      <em><span aria-hidden="true">· </span>{htmlFor ? <label htmlFor={htmlFor}>{name}</label> : name}</em>
    </h2>
  );
}

const SIZE_TEXT = `${EXPORT_SIZE} × ${EXPORT_SIZE}`; // never breaks across lines
const GRID = 48; // page ruling pitch (px); must match the background-size in sleeve.css

/** Snap every rule on the sheet onto the page ruling: [data-snap] = px from the element's top to its rule line;
 *  [data-snap-bottom] = the element's bottom border sits on a line. Columns are processed top-down so earlier
 *  nudges are accounted for. Re-runs on resize and once fonts have loaded. */
function useBaselineSnap(root: React.RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const el = root.current; if (!el) return;
    let raf = 0;
    const snap = () => {
      const origin = el.getBoundingClientRect().top;
      const nodes = [...el.querySelectorAll<HTMLElement>('[data-snap], [data-snap-bottom]')];
      nodes.forEach((n) => { n.style.marginTop = ''; });
      for (const n of nodes) {
        if (getComputedStyle(n).position === 'sticky') continue; // a floating bar moves with scroll; never snapped
        const r = n.getBoundingClientRect();
        const y = n.hasAttribute('data-snap-bottom') ? r.bottom - origin - 1 : r.top - origin + Number(n.dataset.snap || 0);
        const d = ((GRID - (y % GRID)) % GRID + GRID) % GRID;
        if (d > 0.5) n.style.marginTop = `${(parseFloat(getComputedStyle(n).marginTop) || 0) + d}px`;
      }
    };
    const run = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(snap); };
    run(); document.fonts?.ready.then(run);
    const ro = new ResizeObserver(run); ro.observe(el); // content that changes the sheet's height re-snaps via resize
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [root]); // once, not on every render: per-keystroke layout reads were forcing a reflow per rule
}

export function App() {
  const sheetRef = useRef<HTMLDivElement>(null);
  useBaselineSnap(sheetRef);
  const [r, setR] = useState<ArtworkRecipeV1>(DEFAULT_RECIPE);
  const [status, setStatus] = useState('');
  const [statusFile, setStatusFile] = useState(''); // printed filename, on its own quiet line
  const [exporting, setExporting] = useState(false);
  const exportingRef = useRef(false);
  const [exported, setExported] = useState(false);
  const exportedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [soundOn, setSoundOn] = useState(false);
  const [pressing, setPressing] = useState(false); // one press of the cover when a print lands
  const audio = useRef<AudioEngine | null>(null);
  const up = (p: Partial<ArtworkRecipeV1>) => setR((x) => validateRecipe({ ...x, ...p }));

  // Audio feedback follows the instrument's settings, only when explicitly enabled (never on first render, never
  // autoplay). Typing the sleeve label is silent: a note per keystroke is noise, not feedback.
  const rRef = useRef(r); rRef.current = r;
  const tuning = `${r.mode}|${r.form}|${r.rhythm}|${r.phase}|${r.density}|${r.palette}|${r.seed}`;
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } if (soundOn) audio.current?.pluck(rRef.current); }, [tuning, soundOn]);

  // New Proof deals invented names only into fields the person hasn't written themselves.
  const dealt = useRef({ artist: DEFAULT_RECIPE.artist, track: DEFAULT_RECIPE.track });
  const onNewProof = () => {
    const n = remix(r), names = namesFor(n.seed);
    const own = (k: 'artist' | 'track') => r[k].trim() !== '' && r[k] !== dealt.current[k];
    const artist = own('artist') ? r.artist : names.artist, track = own('track') ? r.track : names.track;
    dealt.current = { artist: own('artist') ? dealt.current.artist : artist, track: own('track') ? dealt.current.track : track };
    setR(validateRecipe({ ...n, artist, track }));
  };
  useEffect(() => () => { clearTimeout(exportedTimer.current); void audio.current?.disable(); }, []);

  const toggleSound = async () => {
    if (soundOn) { setSoundOn(false); await audio.current?.disable(); audio.current = null; return; }
    try { audio.current = new AudioEngine(); await audio.current.enable(); setSoundOn(true); audio.current.pluck(r); }
    catch { audio.current = null; setStatus('Sound isn’t available here. The visual instrument still works.'); }
  };
  const onPrint = async () => {
    if (exportingRef.current) return; // aria-disabled guard: the button keeps focus instead of dropping it
    exportingRef.current = true; setExporting(true); setExported(false); clearTimeout(exportedTimer.current);
    setStatus(`Rendering ${SIZE_TEXT} artwork…`); setStatusFile('');
    try {
      // Let "Printing…" and the status paint before the synchronous full-size render occupies the main thread.
      await new Promise<void>((res) => requestAnimationFrame(() => setTimeout(res, 0)));
      const name = await exportPng(r);
      if (soundOn) audio.current?.chime(r);
      if (!reducedMotion()) setPressing(true); // the cover answers the print on the same beat as the chime
      const unnamed = !r.artist.trim() || !r.track.trim();
      setStatus(`Sleeve printed — ${SIZE_TEXT} PNG.` + (unnamed ? ' Add an artist and track name to finish the sleeve.' : ''));
      setStatusFile(name); setExported(true);
      exportedTimer.current = setTimeout(() => setExported(false), 2400);
    } catch { setStatus('The sleeve couldn’t be printed. Your composition is safe; try again.'); }
    finally { exportingRef.current = false; setExporting(false); }
  };

  const pal = PALETTES[r.palette], inReg = IN_REGISTER.includes(r.phase);
  const offMm = (Math.abs(Math.sin((2 * r.phase * Math.PI) / 180)) * REG_MAX * SLEEVE_MM).toFixed(1);
  const seed = r.seed.toString(16).padStart(8, '0').toUpperCase();
  const stageLabel = `Album cover preview. ${r.mode === 'radial' ? 'Radial' : 'Harmonic'} engine, ratio ${r.form} to ${r.rhythm}, registration ${r.phase} degrees ${inReg ? 'in register' : 'off register'}, ` +
    `${r.density} passes, ${FAMILY_LABEL[pal.family].toLowerCase()} ${pal.name} press set. Artist: ${r.artist.trim() || 'none'}. Track: ${r.track.trim() || 'none'}.`;

  return (
    <AnalogLightingProvider baseAngle={LIGHT.baseAngle} power={LIGHT.power}>
      <div className="ab" ref={sheetRef} data-mode={r.mode}>
        <main className="ab-sheet">
          <header className="ab-mast" data-snap-bottom><h1 translate="no">SLEEVE</h1><span className="tag">Play your next album cover.</span></header>

          <div className="ab-left">
            <figure className={`ab-cover${pressing ? ' is-pressing' : ''}`} data-snap="0" onAnimationEnd={() => setPressing(false)}>
              <ArtworkStage recipe={r} label={stageLabel} />
              <figcaption>
                <span className="ab-family"><i style={{ background: FAMILY_TONE[pal.family] }} />{FAMILY_LABEL[pal.family]} · {pal.name}</span>
                <span className="ab-seed">Seed <span className="seed" translate="no">{seed}</span></span>
              </figcaption>
            </figure>
            <section className="ab-names ab-mod" data-snap="7">
              <ModHead des="IN1–IN2" name="sleeve label" />
              <div className="ab-names-row">
                <div className="ab-field">
                  <label htmlFor="artist">Artist</label>
                  <input id="artist" name="artist" type="text" value={r.artist} maxLength={TEXT_MAX} placeholder="Artist name…" autoComplete="off" spellCheck={false} onChange={(e) => up({ artist: e.currentTarget.value })} />
                </div>
                <div className="ab-field">
                  <label htmlFor="track">Track</label>
                  <input id="track" name="track" type="text" value={r.track} maxLength={TEXT_MAX} placeholder="Track title…" autoComplete="off" spellCheck={false} onChange={(e) => up({ track: e.currentTarget.value })} />
                </div>
              </div>
            </section>
          </div>

          <div className="ab-right">
            <section className="ab-mod" data-snap="7">
              <ModHead des="R1–R2" name="ratio" />
              <div className="ab-ratio-row">
                <AnalogDial label="Form" value={r.form} {...BOUNDS.form} coarse={2} size={76} variant="chrome" onChange={(v) => up({ form: v })} />
                <div className="ab-numeral ab-ratio-num" aria-hidden="true">{r.form}<span className="ab-colon">:</span>{r.rhythm}</div>
                <AnalogDial label="Rhythm" value={r.rhythm} {...BOUNDS.rhythm} coarse={2} size={76} variant="chrome" onChange={(v) => up({ rhythm: v })} />
              </div>
            </section>

            <section className="ab-mod" data-snap="7">
              <ModHead des="R3" name="registration" htmlFor="ab-registration" />
              <div className="ab-reg-row">
                <AnalogDial label="Registration" hideLabel value={r.phase} {...BOUNDS.phase} coarse={15} size={190} variant="black" start={0} sweep={360} detents={[0, 90, 180, 270]} pointerClassName="ab-signal-pointer"
                  valueText={`${r.phase} degrees, ${inReg ? 'in register' : 'off register'}`} onChange={(v) => up({ phase: v })} />
                <div>
                  <div className="ab-numeral ab-reg-num" aria-hidden="true">{String(r.phase).padStart(3, '0')}°</div>
                  <div className={`ab-state${inReg ? '' : ' off'}`} aria-hidden="true"><i />{inReg ? 'In register' : <><span className="ab-nw">Off register</span>{' · '}<span className="ab-nw">{offMm} mm</span></>}</div>
                  <div className="ab-note">Registers at <span className="ab-nw">0 · 90 · 180 · 270°</span></div>
                </div>
              </div>
            </section>

            <div className="ab-pair" data-snap="7">
              <section className="ab-mod">
                <ModHead des="R4" name="passes" htmlFor="ab-passes" />
                <div className="ab-passes-row">
                  <AnalogDial label="Passes" hideLabel value={r.density} {...BOUNDS.density} coarse={4} size={64} variant="chrome" onChange={(v) => up({ density: v })} />
                  <div aria-hidden="true" className="ab-passes-read">
                    <div className="ab-numeral ab-passes-num">{r.density}</div>
                    <Meter value={r.density} min={1} max={24} segments={24} tone="primary" orientation="horizontal" ballistics="none" showScale={false} style={{ width: '100%', maxWidth: 220 }} />
                  </div>
                </div>
              </section>
              <section className="ab-mod">
                <ModHead des="SW1" name="engine" id="engine-head" />
                <div className="ab-engine-row">
                  <span className={r.mode === 'harmonic' ? 'on' : 'off'} aria-hidden="true">Harmonic</span>
                  <div className="ab-rocker">
                    <div inert><Toggle variant="chrome" value={r.mode === 'harmonic' ? 'left' : 'right'} /></div>
                    <div className="ab-rocker-radios" role="radiogroup" aria-labelledby="engine-head">
                      <label><input type="radio" name="mode" value="harmonic" checked={r.mode === 'harmonic'} onChange={() => up({ mode: 'harmonic' })} aria-label="Harmonic, Lissajous" /></label>
                      <label><input type="radio" name="mode" value="radial" checked={r.mode === 'radial'} onChange={() => up({ mode: 'radial' })} aria-label="Radial, Rose" /></label>
                    </div>
                  </div>
                  <span className={r.mode === 'radial' ? 'on' : 'off'} aria-hidden="true">Radial</span>
                </div>
              </section>
            </div>

            <fieldset className="ab-mod ab-press" data-snap="7" aria-labelledby="press-head">
              <ModHead des="P1" name="press set" id="press-head" />
              <PressSetPicker value={r.palette} onChange={(v) => up({ palette: v })} />
            </fieldset>

            <section className="ab-out" data-snap="0" aria-label="Proof and print">
              <p className="ab-status" role="status" aria-live="polite">{status}{statusFile && <span className="ab-status-file">{statusFile}</span>}</p>
              <div className="ab-actions">
                <PushButton variant="chrome" height={56} onClick={onNewProof}>New Proof</PushButton>
                <PushToggle variant="chrome" height={56} indicatorTone="accent" pressed={soundOn} onPressedChange={toggleSound}>Sound</PushToggle>
                <PushButton variant="black" height={56} className="ab-print" aria-describedby="print-size" onClick={onPrint} aria-disabled={exporting}>
                  {exporting ? 'Printing…' : exported ? <>Printed <span aria-hidden="true">✓</span></> : 'Print Sleeve'}
                </PushButton>
                <span id="print-size" className="ab-vh">3000 by 3000 pixel PNG</span>
              </div>
            </section>
          </div>
        </main>
      </div>
    </AnalogLightingProvider>
  );
}
