import { BOUNDS } from '../instrument/recipe.ts';
import { RotaryControl } from '../instrument/RotaryControl.tsx';

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
/** Musical name of a reduced plate ratio (smaller:larger), when it has a common one. */
export const INTERVAL: Record<string, string> = { '1:1': 'unison', '1:2': 'octave', '2:3': 'perfect fifth', '3:4': 'perfect fourth', '4:5': 'major third', '5:6': 'minor third', '3:5': 'major sixth', '5:8': 'minor sixth', '1:3': 'twelfth', '1:4': 'double octave', '7:8': 'septimal tone' };

/** Form and Rhythm as one instrument module: knob · large "F : R" readout · knob, reduced relation beneath. */
export function RatioModule({ form, rhythm, onForm, onRhythm, readId = 'ratio-read' }: { form: number; rhythm: number; onForm: (v: number) => void; onRhythm: (v: number) => void; readId?: string }) {
  const g = gcd(form, rhythm), rf = form / g, rr = rhythm / g;
  const interval = INTERVAL[`${Math.min(rf, rr)}:${Math.max(rf, rr)}`];
  return (
    <div className="ratio">
      <RotaryControl label="Form" value={form} {...BOUNDS.form} coarse={2} onChange={onForm} describedBy="dial-hint" hideReadout />
      <div className="ratio-readout" aria-hidden="true">
        <span className="ratio-value">{form}<span className="ratio-colon">:</span>{rhythm}</span>
      </div>
      <RotaryControl label="Rhythm" value={rhythm} {...BOUNDS.rhythm} coarse={2} onChange={onRhythm} describedBy="dial-hint" hideReadout />
      <p className="ratio-read" id={readId}>
        {g > 1 ? <>plays as {rf} : {rr}</> : <>plate ratio</>}
        {interval ? <> · {interval}</> : null}
      </p>
    </div>
  );
}
