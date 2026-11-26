import { TEXT_MAX } from '../instrument/recipe.ts';

/** Character count, shown only near the limit so truncation never surprises. */
export function CharCount({ id, length }: { id: string; length: number }) {
  const near = length >= TEXT_MAX - 12;
  return (
    <span id={id} className="field-count">
      {near ? `${length}/${TEXT_MAX}` : ''}
    </span>
  );
}

/** Large light text on an underline rule, inside the dark cover chassis (Artist / Track). */
export function ChassisField({ id, label, ariaLabel, value, placeholder, onChange }: { id: string; label: string; ariaLabel: string; value: string; placeholder: string; onChange: (v: string) => void }) {
  return (
    <div className="field">
      <div className="field-head">
        <label htmlFor={id}>{label}</label>
        <CharCount id={`${id}-count`} length={value.length} />
      </div>
      <input id={id} aria-label={ariaLabel} aria-describedby={`${id}-count`} type="text" value={value} maxLength={TEXT_MAX} placeholder={placeholder}
        autoComplete="off" spellCheck={false} onChange={(e) => onChange(e.currentTarget.value)} />
    </div>
  );
}
