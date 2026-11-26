import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { DEFAULT_RECIPE, TEXT_MAX, validateRecipe, BOUNDS, type ArtworkRecipeV1, type Mode, type NumericKey } from '../instrument/recipe.ts';
import { remix } from '../instrument/remix.ts';
import { RotaryControl } from '../instrument/RotaryControl.tsx';
import { PressSetPicker } from '../instrument/PressSetPicker.tsx';
import { ArtworkStage } from '../artwork/ArtworkStage.tsx';
import { PALETTES, FAMILY_LABEL } from '../artwork/palettes.ts';
import { REG_MAX } from '../artwork/composition.ts';
import { exportPng, EXPORT_SIZE } from '../export/exportPng.ts';
import { AudioEngine } from '../audio/audioEngine.ts';

const MODES: { id: Mode; name: string; hint: string }[] = [
  { id: 'harmonic', name: 'Harmonic', hint: 'Lissajous' },
  { id: 'radial', name: 'Radial', hint: 'Rose' },
];

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const IN_REGISTER = [0, 90, 180, 270, 360];

/** Section head: "n · LABEL" with a right-aligned technical alias (the panel reads as a signal path). */
function Head({ n, children, alias, id }: { n: number; children: ReactNode; alias?: string; id?: string }) {
  return (
    <h2 className="sec-head" id={id}>
      <span className="sec-title">
        <span aria-hidden="true">{n} · </span>
        {children}
      </span>
      {alias && <span className="sec-alias" aria-hidden="true">{alias}</span>}
    </h2>
  );
}

/** Musical name of a reduced plate ratio (smaller:larger), when it has a common one. */
const INTERVAL: Record<string, string> = { '1:1': 'unison', '1:2': 'octave', '2:3': 'perfect fifth', '3:4': 'perfect fourth', '4:5': 'major third', '5:6': 'minor third', '3:5': 'major sixth', '5:8': 'minor sixth', '1:3': 'twelfth', '1:4': 'double octave', '7:8': 'septimal tone' };
const PASS_MEANING = { ink: 'ink builds, edges break up', light: 'band widens and brightens', matter: 'relief deepens' } as const;
const SLEEVE_MM = 304.8; // 12-inch sleeve; channel offset = |sin 2φ| · REG_MAX · side
const STUDY_THEMES = ['braun', 'buchla', 'nagra'] as const;
type StudyTheme = (typeof STUDY_THEMES)[number];

/** Development-only styling studies. Production never exposes or retains a theme switch. */
function studyTheme(): StudyTheme | undefined {
  if (!import.meta.env.DEV) return undefined;
  const candidate = new URLSearchParams(window.location.search).get('theme');
  return STUDY_THEMES.includes(candidate as StudyTheme) ? (candidate as StudyTheme) : undefined;
}

/** Two crosshairs (plate A ink, plate B vermilion) offset by the current registration. */
function RegMark({ phase }: { phase: number }) {
  const phi = (phase * Math.PI) / 180, amt = Math.abs(Math.sin(2 * phi)), dx = Math.cos(phi) * 5 * amt, dy = Math.sin(phi) * 5 * amt;
  const mark = (x: number, y: number, c: string) => (
    <g stroke={c} strokeWidth="1.4" fill="none">
      <circle cx={x} cy={y} r="7" />
      <line x1={x - 11} y1={y} x2={x + 11} y2={y} />
      <line x1={x} y1={y - 11} x2={x} y2={y + 11} />
    </g>
  );
  return (
    <svg className="reg-mark" viewBox="0 0 36 36" aria-hidden="true">
      {mark(16, 16, '#141416')}
      {mark(16 + dx, 16 + dy, 'var(--signal)')}
    </svg>
  );
}

/** Shown only near the limit, so truncation never surprises. */
function CharCount({ id, length }: { id: string; length: number }) {
  const near = length >= TEXT_MAX - 12;
  return (
    <span id={id} className="field-count">
      {near ? `${length}/${TEXT_MAX}` : ''}
    </span>
  );
}

export function App() {
  const theme = studyTheme();
  const [recipe, setRecipe] = useState<ArtworkRecipeV1>(DEFAULT_RECIPE);
  const [status, setStatus] = useState('');
  const [statusFile, setStatusFile] = useState(''); // exported filename, shown on its own quiet line
  const [exporting, setExporting] = useState(false);
  const exportingRef = useRef(false);
  const [exported, setExported] = useState(false); // brief, non-blocking completion state
  const exportedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(exportedTimer.current), []);
  const [soundOn, setSoundOn] = useState(false);
  const audio = useRef<AudioEngine | null>(null);

  const update = useCallback((patch: Partial<ArtworkRecipeV1>) => {
    setRecipe((r) => validateRecipe({ ...r, ...patch }));
  }, []);

  const setNum = (k: NumericKey) => (v: number) => update({ [k]: v });

  // Audio feedback follows recipe changes, only when explicitly enabled.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (soundOn) audio.current?.pluck(recipe);
  }, [recipe, soundOn]);

  useEffect(() => () => void audio.current?.disable(), []);

  const toggleSound = async () => {
    if (soundOn) {
      setSoundOn(false);
      await audio.current?.disable();
      audio.current = null;
      return;
    }
    try {
      audio.current = new AudioEngine();
      await audio.current.enable();
      setSoundOn(true);
      audio.current.pluck(recipe);
    } catch {
      audio.current = null;
      setStatus('Sound isn’t available here. The visual instrument still works.');
    }
  };

  const onExport = async () => {
    if (exportingRef.current) return; // aria-disabled guard: the button keeps focus instead of dropping it
    exportingRef.current = true;
    setExporting(true);
    setExported(false);
    clearTimeout(exportedTimer.current);
    setStatus(`Rendering ${EXPORT_SIZE} × ${EXPORT_SIZE} artwork…`);
    setStatusFile('');
    try {
      const name = await exportPng(recipe);
      if (soundOn) audio.current?.chime(recipe);
      const unnamed = !recipe.artist.trim() || !recipe.track.trim();
      setStatus(
        `Sleeve printed — ${EXPORT_SIZE} × ${EXPORT_SIZE} PNG.` +
          (unnamed ? ' Add an artist and track name to finish the sleeve.' : ''),
      );
      setStatusFile(name);
      setExported(true);
      exportedTimer.current = setTimeout(() => setExported(false), 2400);
    } catch {
      setStatus('The sleeve couldn’t be printed. Your composition is safe; try again.');
    } finally {
      exportingRef.current = false;
      setExporting(false);
    }
  };

  const pal = PALETTES[recipe.palette];
  const modeName = recipe.mode === 'radial' ? 'Radial' : 'Harmonic';
  const inRegister = IN_REGISTER.includes(recipe.phase);
  const g = gcd(recipe.form, recipe.rhythm);
  const rf = recipe.form / g, rr = recipe.rhythm / g;
  const interval = INTERVAL[`${Math.min(rf, rr)}:${Math.max(rf, rr)}`];
  const family = FAMILY_LABEL[pal.family].toLowerCase();
  const offsetMm = Math.abs(Math.sin((2 * recipe.phase * Math.PI) / 180)) * REG_MAX * SLEEVE_MM;
  const seedHex = recipe.seed.toString(16).padStart(8, '0');
  const stageLabel =
    `Album cover preview. ${modeName} engine, ratio ${recipe.form} to ${recipe.rhythm}, registration ${recipe.phase} degrees ${inRegister ? 'in register' : 'off register'}, ` +
    `${recipe.density} passes, ${family} ${pal.name} press set. Artist: ${recipe.artist.trim() || 'none'}. Track: ${recipe.track.trim() || 'none'}.`;

  return (
    <div className="app" data-mode={recipe.mode} data-theme={theme}>
      <header className="masthead">
        <h1 className="wordmark">SLEEVE</h1>
        <p className="tagline">Play your next album cover.</p>
        <p className="press-line">
          PRESS {String(pal.index).padStart(2, '0')} · {pal.name.toUpperCase()} · SEED <span className="seed">{seedHex}</span>
        </p>
      </header>

      <main className="layout">
        <section className="chassis" aria-label="Cover">
          <span className="crosshair tl" aria-hidden="true" />
          <span className="crosshair tr" aria-hidden="true" />
          <span className="crosshair bl" aria-hidden="true" />
          <span className="crosshair br" aria-hidden="true" />
          <ArtworkStage recipe={recipe} label={stageLabel} />
          <div className="identity" role="group" aria-label="Artist and track">
            <div className="field">
              <div className="field-head">
                <label htmlFor="artist">Artist · sleeve label</label>
                <CharCount id="artist-count" length={recipe.artist.length} />
              </div>
              <input id="artist" aria-label="Artist" aria-describedby="artist-count" type="text" value={recipe.artist} maxLength={TEXT_MAX} placeholder="Artist name"
                autoComplete="off" spellCheck={false} onChange={(e) => update({ artist: e.currentTarget.value })} />
            </div>
            <div className="field">
              <div className="field-head">
                <label htmlFor="track">Track</label>
                <CharCount id="track-count" length={recipe.track.length} />
              </div>
              <input id="track" aria-label="Track" aria-describedby="track-count" type="text" value={recipe.track} maxLength={TEXT_MAX} placeholder="Track title"
                autoComplete="off" spellCheck={false} onChange={(e) => update({ track: e.currentTarget.value })} />
            </div>
          </div>
        </section>

        <section className="panel" aria-labelledby="panel-title">
          <h2 id="panel-title" className="visually-hidden">Instrument</h2>

          <fieldset className="sec sec-engine" aria-label="Engine">
            <legend><Head n={1} alias="plate">Engine</Head></legend>
            <div className="segmented">
              {MODES.map((m) => (
                <label key={m.id} className={`segment segment-${m.id}`}>
                  <input type="radio" name="mode" value={m.id} checked={recipe.mode === m.id} onChange={() => update({ mode: m.id })} />
                  <span className="segment-mark" aria-hidden="true" />
                  <span className="segment-name">{m.name}</span>
                  <span className="segment-hint">{m.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="sec sec-ratio" role="group" aria-label="Ratio, Form to Rhythm" aria-describedby="ratio-read">
            <Head n={2} alias="form : rhythm">Ratio</Head>
            <div className="ratio">
              <RotaryControl label="Form" value={recipe.form} {...BOUNDS.form} coarse={2} onChange={setNum('form')} describedBy="dial-hint" hideReadout />
              <div className="ratio-readout" aria-hidden="true">
                <span className="ratio-value">{recipe.form}<span className="ratio-colon">:</span>{recipe.rhythm}</span>
              </div>
              <RotaryControl label="Rhythm" value={recipe.rhythm} {...BOUNDS.rhythm} coarse={2} onChange={setNum('rhythm')} describedBy="dial-hint" hideReadout />
              <p className="ratio-read" id="ratio-read">
                {g > 1 ? <>plays as {rf} : {rr}</> : <>plate ratio</>}
                {interval ? <> · {interval}</> : null}
              </p>
            </div>
          </div>

          <div className="sec sec-registration">
            <Head n={3} alias="phase · signature control">Registration</Head>
            <RotaryControl
              label="Registration"
              variant="hero"
              value={recipe.phase}
              {...BOUNDS.phase}
              coarse={15}
              ticks={[0, 90, 180, 270]}
              display={`${String(recipe.phase).padStart(3, '0')}°`}
              valueText={`${recipe.phase} degrees, ${inRegister ? 'in register' : 'off register'}`}
              onChange={setNum('phase')}
              describedBy="dial-hint"
            >
              <p className="reg-explain">Plate B offset from plate A. The plates register at 0°, 90°, 180° and 270°.</p>
              <p className="reg-state" aria-hidden="true">
                <RegMark phase={recipe.phase} />
                <span className="rotary-caption">{inRegister ? 'In register' : `Off register · ${offsetMm.toFixed(1)} mm`}</span>
              </p>
            </RotaryControl>
          </div>

          <div className="sec sec-passes">
            <Head n={4} alias="density">Passes</Head>
            <div className="passes">
              <RotaryControl label="Passes" value={recipe.density} {...BOUNDS.density} coarse={4} onChange={setNum('density')} describedBy="dial-hint" hideReadout />
              <div className="passes-read">
                <span className="meter" aria-hidden="true">
                  {Array.from({ length: BOUNDS.density.max }, (_, i) => (
                    <span key={i} className={`meter-bar${i < recipe.density ? ' is-on' : ''}`} style={{ height: `${100 - i * 3.4}%` }} />
                  ))}
                </span>
                <span className="passes-caption" aria-hidden="true">
                  {recipe.density} {recipe.density === 1 ? 'pass' : 'passes'} · {PASS_MEANING[pal.family]}
                </span>
              </div>
            </div>
          </div>
          <p className="hint" id="dial-hint">Drag a knob up or sideways (Shift for fine). Keys: Arrows, Page Up/Down, Home/End.</p>

          <fieldset className="sec sec-press" aria-label="Press set">
            <legend><Head n={5} alias="paper + two channels">Press set</Head></legend>
            <PressSetPicker value={recipe.palette} onChange={(v) => update({ palette: v })} />
          </fieldset>
        </section>

        <section className="action-bar" aria-label="Proof and print">
          <p className="status" role="status" aria-live="polite">
            {status}
            {statusFile && <span className="status-file">{statusFile}</span>}
          </p>
          <div className="actions">
            <button type="button" className="btn btn-secondary" onClick={() => setRecipe(remix(recipe))}>
              <span className="btn-glyph" aria-hidden="true">↻</span>New Proof
            </button>
            <button type="button" className={`btn btn-toggle${soundOn ? ' is-on' : ''}`} aria-pressed={soundOn} onClick={toggleSound}>
              <span className="toggle-mark" aria-hidden="true" />
              Sound <span className="toggle-state" aria-hidden="true">{soundOn ? 'On' : 'Off'}</span>
            </button>
            <button type="button" className="btn btn-primary" onClick={onExport} aria-disabled={exporting} aria-describedby="print-size">
              {exporting ? 'Printing…' : exported ? <>Printed <span aria-hidden="true">✓</span></> : 'Print Sleeve'}
            </button>
          </div>
          <span id="print-size" className="visually-hidden">3000 by 3000 pixel PNG</span>
        </section>
      </main>
    </div>
  );
}
