import { BOUNDS } from '../instrument/recipe.ts';
import { RotaryControl } from '../instrument/RotaryControl.tsx';
import type { Family } from '../artwork/palettes.ts';

export const PASS_MEANING: Record<Family, string> = { ink: 'ink builds, edges break up', light: 'band widens and brightens', matter: 'relief deepens' };

/** Descending segmented meter, filled up to the value (decorative; the value is in the caption and the slider). */
export function PassesMeter({ value, max = BOUNDS.density.max }: { value: number; max?: number }) {
  return (
    <span className="meter" aria-hidden="true">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`meter-bar${i < value ? ' is-on' : ''}`} style={{ height: `${100 - i * 3.4}%` }} />
      ))}
    </span>
  );
}

/** Ivory Passes knob + meter + caption naming what passes mean for the current family. */
export function PassesModule({ value, family, onChange }: { value: number; family: Family; onChange: (v: number) => void }) {
  return (
    <div className="passes">
      <RotaryControl label="Passes" value={value} {...BOUNDS.density} coarse={4} onChange={onChange} describedBy="dial-hint" hideReadout />
      <div className="passes-read">
        <PassesMeter value={value} />
        <span className="passes-caption" aria-hidden="true">
          {value} {value === 1 ? 'pass' : 'passes'} · {PASS_MEANING[family]}
        </span>
      </div>
    </div>
  );
}
