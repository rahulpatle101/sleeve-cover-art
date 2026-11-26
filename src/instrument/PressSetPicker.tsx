import { PALETTES, FAMILY_LABEL, type Family, type PressSet } from '../artwork/palettes.ts';

const FAMILIES: Family[] = ['ink', 'light', 'matter'];
const css = (c: number[]) => `rgb(${c[0]},${c[1]},${c[2]})`;

/** Flat swatch: the set's paper / surface with its two channel colours as overlapping ink dots. */
function channels(set: PressSet): [string, string, string] {
  if (set.plates) return [set.stock, css(set.plates[0]), css(set.plates[1])];
  if (set.family === 'light') return [set.stock, '#345CFF', '#FFB04A'];
  return [css(set.albedo!), '#9a9ea6', set.accent!];
}

function Swatch({ set }: { set: PressSet }) {
  const [paper, a, b] = channels(set);
  return (
    <span className={`swatch swatch-${set.family}${set.macro ? ' is-macro' : ''}${set.horizon ? ' is-horizon' : ''}`} style={{ background: paper }} aria-hidden="true">
      <span className="dot dot-a" style={{ background: a }} />
      <span className="dot dot-b" style={{ background: b }} />
    </span>
  );
}

/** Six native radios in one group (arrow keys move + select), grouped Ink / Light / Matter. */
export function PressSetPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="press-sets">
      {FAMILIES.map((f) => (
        <div key={f} className="press-family" role="group" aria-label={f[0].toUpperCase() + f.slice(1)}>
          <span className="press-family-name" aria-hidden="true">
            {FAMILY_LABEL[f]}
          </span>
          <div className="press-tiles">
            {PALETTES.map((set, i) =>
              set.family !== f ? null : (
                <label key={set.name} className="press-tile">
                  <input type="radio" name="press-set" value={i} checked={value === i} onChange={() => onChange(i)} />
                  <Swatch set={set} />
                  <span className="press-name">{set.name}</span>
                </label>
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
