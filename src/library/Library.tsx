import { useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_RECIPE, type Mode } from '../instrument/recipe.ts';
import { ArtworkStage } from '../artwork/ArtworkStage.tsx';
import { F, ensureFonts } from '../artwork/fonts.ts';
import type { Family } from '../artwork/palettes.ts';
import { SectionHead, ChassisField, EngineSelector, RatioModule, RegistrationWheel, RegMark, PassesModule, PressSetPicker, ActionBar, RotaryControl } from '../ui/index.ts';

const GROUPS: [string, RegExp][] = [
  ['Surface', /^--surface/], ['Text', /^--text/], ['Signal', /^--signal/], ['Chassis', /^--(chassis|crosshair)/], ['Knob', /^--knob/],
  ['Wheel', /^--wheel/], ['Meter & swatch', /^--(meter|swatch)/], ['Shadow', /^--shadow/], ['Focus', /^--focus/],
  ['Size', /^--(target|rule)$/], ['Type', /^--(font|type|tracking)/], ['Space', /^--space/],
];

/** Read every custom property declared on :root, in source order, from the loaded stylesheets. */
function useTokens() {
  const [tokens, setTokens] = useState<[string, string][]>([]);
  useEffect(() => {
    const out: [string, string][] = [];
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList; try { rules = sheet.cssRules; } catch { continue; }
      for (const r of Array.from(rules)) if (r instanceof CSSStyleRule && r.selectorText === ':root') for (let i = 0; i < r.style.length; i++) { const n = r.style[i]; if (n.startsWith('--')) out.push([n, r.style.getPropertyValue(n).trim()]); }
    }
    setTokens(out);
  }, []);
  return tokens;
}

function Card({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <div className={`lib-card ${className}`}><span className="lib-label">{label}</span>{children}</div>;
}
function Section({ id, title, src, children }: { id: string; title: string; src: string; children: ReactNode }) {
  return <section className="lib-section" id={id}><h2>{title}</h2><p className="lib-src">{src}</p>{children}</section>;
}

function TokenRow({ name, value }: { name: string; value: string }) {
  const isColour = /^(#|rgba?\()/.test(value);
  const preview = isColour ? <span className="lib-chip" style={{ background: `var(${name})` }} />
    : name.startsWith('--shadow') ? <span className="lib-shadow" style={value.startsWith('drop-shadow') ? { filter: `var(${name})` } : { boxShadow: `var(${name})` }} />
    : name.startsWith('--space') || name === '--target' || name === '--rule' ? <span className="lib-space" style={{ width: `var(${name})`, height: name === '--rule' ? `var(${name})` : 14 }} />
    : <span />;
  return <div className="lib-token">{preview}<span><code>{name}</code><small>{value}</small></span></div>;
}

export function Library() {
  const tokens = useTokens();
  const [mode, setMode] = useState<Mode>('harmonic');
  const [form, setForm] = useState(3), [rhythm, setRhythm] = useState(4);
  const [phase, setPhase] = useState(45), [passes, setPasses] = useState(10), [press, setPress] = useState(0), [knob, setKnob] = useState(5);
  const [artist, setArtist] = useState('Night Office'), [track, setTrack] = useState('Phase Garden');
  const [fonts, setFonts] = useState(false);
  useEffect(() => { ensureFonts().then(() => setFonts(true)); }, []);
  const noop = () => {};

  return (
    <div className="app lib">
      <header className="lib-head">
        <h1>SLEEVE · DESIGN LIBRARY</h1>
        <p>Dev-only. Every swatch and component below is the real thing: tokens are read live from <code>src/styles/tokens.css</code>, components are imported from <code>src/ui/</code> and styled by <code>src/styles/app.css</code>. Change a token or component and this page and the app change together. Rules: <code>production/DESIGN_SYSTEM_V02.md</code>.</p>
        <nav className="lib-nav">{['tokens', 'type', 'cover-type', 'chassis', 'heads', 'engine', 'ratio', 'registration', 'knob', 'passes', 'press', 'actions'].map((a) => <a key={a} href={`#${a}`}>{a}</a>)}</nav>
      </header>

      <Section id="tokens" title="Tokens" src="src/styles/tokens.css — the only place interface values are defined">
        <div className="lib-grid">
          {GROUPS.map(([g, re]) => (
            <Card key={g} label={g}>{tokens.filter(([n]) => re.test(n)).map(([n, v]) => <TokenRow key={n} name={n} value={v} />)}</Card>
          ))}
        </div>
      </Section>

      <Section id="type" title="Interface type" src="--font-ui (system grotesk) · --font-mono · sizes in app.css">
        {[
          ['wordmark', <h1 className="wordmark" style={{ margin: 0 }}>SLEEVE</h1>, '19px · 700 · 0.2em'],
          ['press line (mono)', <span className="press-line" style={{ margin: 0 }}>PRESS 01 · NEWSPRINT · SEED 01352905</span>, 'mono 12px · 0.14em'],
          ['section head', <SectionHead n={3} alias="phase · signature control">Registration</SectionHead>, '13px · 700 · --tracking-label'],
          ['ratio readout', <span className="ratio-value">3<span className="ratio-colon">:</span>4</span>, '44–64px · 300 · tabular'],
          ['hero readout', <span className="rotary-value" style={{ fontSize: 64 }}>045°</span>, '48–68px · 300 · tabular'],
          ['caption / state', <span className="rotary-caption">Off register · 2.7 mm</span>, '12px · 700 · caps · 0.16em'],
          ['hint', <span className="hint" style={{ margin: 0 }}>Drag a knob up or sideways (Shift for fine).</span>, '--type-hint 13px'],
          ['body', <span>Plate B offset from plate A.</span>, '--type-body 16px'],
        ].map(([k, el, spec]) => <div className="lib-type-row" key={k as string}><code>{k as string}<br />{spec as string}</code><div>{el}</div></div>)}
      </Section>

      <Section id="cover-type" title="Cover typefaces (artwork, not interface)" src="src/artwork/fonts.ts — bundled OFL faces, licences in public/licenses/">
        <div className="lib-grid wide">
          {([['Ink — Big Shoulders Display Black', F.inkDisplay, 900, 'NIGHT OFFICE'], ['Ink notation — Space Mono', F.inkNotation, 400, 'PHASE GARDEN'], ['Spectrum — Schibsted Grotesk Black', F.spectrumDisplay, 900, 'Night Office'], ['Horizon — Funnel Display ExtraBold', F.horizonDisplay, 800, 'Night Office'], ['Matter — Bricolage Grotesque Condensed ExtraBold', F.matterDisplay, 800, 'NIGHT OFFICE'], ['Tracks — Martian Mono', F.mono, 500, 'PHASE GARDEN']] as const).map(([label, fam, w, sample]) => (
            <Card key={label} label={label}><div className="lib-cover-type" style={{ fontFamily: `"${fam}"`, fontWeight: w, fontSize: fam === F.mono || fam === F.inkNotation ? 18 : 44, lineHeight: 1, letterSpacing: fam === F.mono ? '0.14em' : undefined, opacity: fonts ? 1 : 0.3 }}>{sample}</div></Card>
          ))}
        </div>
      </Section>

      <Section id="chassis" title="Cover chassis + chassis fields" src="App.tsx chassis · src/ui/ChassisField.tsx · ArtworkStage (live renderer)">
        <div style={{ maxWidth: 520 }}>
          <section className="chassis" aria-label="Cover (library)">
            <span className="crosshair tl" aria-hidden="true" /><span className="crosshair tr" aria-hidden="true" /><span className="crosshair bl" aria-hidden="true" /><span className="crosshair br" aria-hidden="true" />
            <ArtworkStage recipe={{ ...DEFAULT_RECIPE, artist, track }} label="Library cover preview" />
            <div className="identity" role="group" aria-label="Artist and track">
              <ChassisField id="lib-artist" label="Artist · sleeve label" ariaLabel="Artist" value={artist} placeholder="Artist name" onChange={setArtist} />
              <ChassisField id="lib-track" label="Track" ariaLabel="Track" value={track} placeholder="Track title" onChange={setTrack} />
            </div>
          </section>
        </div>
      </Section>

      <div className="lib-panel">
        <Section id="heads" title="Section head" src="src/ui/SectionHead.tsx">
          <div className="sec"><SectionHead n={1} alias="plate">Engine</SectionHead></div>
        </Section>

        <Section id="engine" title="Engine selector — selected / unselected, keyboard: arrows" src="src/ui/EngineSelector.tsx (native radios)">
          <div className="sec"><EngineSelector name="lib-mode" value={mode} onChange={setMode} /></div>
        </Section>

        <Section id="ratio" title="Ratio module — try 2 : 4 to see the reduced relation" src="src/ui/RatioModule.tsx (two RotaryControl knobs + readout)">
          <div className="sec"><RatioModule form={form} rhythm={rhythm} onForm={setForm} onRhythm={setRhythm} readId="lib-ratio-read" /></div>
        </Section>

        <Section id="registration" title="Registration wheel — live, plus in-register (90°) and off-register (135°)" src="src/ui/Registration.tsx (hero RotaryControl, native range 0–360)">
          <div className="sec sec-registration"><RegistrationWheel phase={phase} onChange={setPhase} /></div>
          <div className="lib-grid" style={{ marginTop: 16 }}>
            <Card label="RegMark · 90° in register"><RegMark phase={90} /></Card>
            <Card label="RegMark · 135° off register"><RegMark phase={135} /></Card>
          </div>
        </Section>

        <Section id="knob" title="Ivory knob (RotaryControl, variant knob) — drag, or Tab + arrows" src="src/instrument/RotaryControl.tsx">
          <div className="sec"><RotaryControl label="Example" value={knob} min={1} max={8} coarse={2} onChange={setKnob} describedBy="dial-hint" /></div>
          <p className="hint" id="dial-hint">Drag a knob up or sideways (Shift for fine). Keys: Arrows, Page Up/Down, Home/End.</p>
        </Section>

        <Section id="passes" title="Passes module — caption per family" src="src/ui/PassesModule.tsx (knob + PassesMeter)">
          <div className="sec sec-passes"><PassesModule value={passes} family="ink" onChange={setPasses} /></div>
          {(['light', 'matter'] as Family[]).map((f, i) => <div key={f} className="sec sec-passes" style={{ pointerEvents: 'none' }}><PassesModule value={[4, 24][i]} family={f} onChange={noop} /></div>)}
        </Section>

        <Section id="press" title="Press set — six native radios grouped Ink / Light / Matter" src="src/instrument/PressSetPicker.tsx">
          <div className="sec"><PressSetPicker value={press} onChange={setPress} /></div>
        </Section>

        <Section id="actions" title="Action bar — states" src="src/ui/ActionBar.tsx (sticky in the app; static here)">
          <div className="lib-static">
            {([['default', {}], ['sound on', { soundOn: true }], ['printing', { exporting: true, status: 'Rendering 3000 × 3000 artwork…' }], ['printed', { exported: true, status: 'Sleeve printed — 3000 × 3000 PNG.', statusFile: 'sleeve-night-office-phase-garden-harmonic-01352905.png' }]] as const).map(([k, s]) => (
              <Card key={k} label={k}><ActionBar status="" statusFile="" soundOn={false} exporting={false} exported={false} {...s} onNewProof={noop} onSound={noop} onPrint={noop} /></Card>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
