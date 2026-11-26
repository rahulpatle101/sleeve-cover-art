import type { Mode } from '../instrument/recipe.ts';

export const MODES: { id: Mode; name: string; hint: string }[] = [
  { id: 'harmonic', name: 'Harmonic', hint: 'Lissajous' },
  { id: 'radial', name: 'Radial', hint: 'Rose' },
];

/** Strong segmented selector over native radios; the active segment is a near-black fill with ✓. */
export function EngineSelector({ value, onChange, name = 'mode' }: { value: Mode; onChange: (m: Mode) => void; name?: string }) {
  return (
    <div className="segmented">
      {MODES.map((m) => (
        <label key={m.id} className={`segment segment-${m.id}`}>
          <input type="radio" name={name} value={m.id} checked={value === m.id} onChange={() => onChange(m.id)} />
          <span className="segment-mark" aria-hidden="true" />
          <span className="segment-name">{m.name}</span>
          <span className="segment-hint">{m.hint}</span>
        </label>
      ))}
    </div>
  );
}
