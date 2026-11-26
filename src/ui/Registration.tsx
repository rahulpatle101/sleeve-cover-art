import { BOUNDS } from '../instrument/recipe.ts';
import { RotaryControl } from '../instrument/RotaryControl.tsx';
import { REG_MAX } from '../artwork/composition.ts';

export const IN_REGISTER = [0, 90, 180, 270, 360];
const SLEEVE_MM = 304.8; // 12-inch sleeve; channel offset = |sin 2φ| · REG_MAX · side

/** Two crosshairs (plate A ink, plate B signal) offset by the current registration. */
export function RegMark({ phase }: { phase: number }) {
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
      {mark(16, 16, 'var(--text-primary)')}
      {mark(16 + dx, 16 + dy, 'var(--signal)')}
    </svg>
  );
}

/** The hero control: dark knurled wheel (native range 0–360 underneath), large readout, explanation, state. */
export function RegistrationWheel({ phase, onChange }: { phase: number; onChange: (v: number) => void }) {
  const inRegister = IN_REGISTER.includes(phase);
  const offsetMm = Math.abs(Math.sin((2 * phase * Math.PI) / 180)) * REG_MAX * SLEEVE_MM;
  return (
    <RotaryControl
      label="Registration"
      variant="hero"
      value={phase}
      {...BOUNDS.phase}
      coarse={15}
      ticks={[0, 90, 180, 270]}
      display={`${String(phase).padStart(3, '0')}°`}
      valueText={`${phase} degrees, ${inRegister ? 'in register' : 'off register'}`}
      onChange={onChange}
      describedBy="dial-hint"
    >
      <p className="reg-explain">Plate B offset from plate A. The plates register at 0°, 90°, 180° and 270°.</p>
      <p className="reg-state" aria-hidden="true">
        <RegMark phase={phase} />
        <span className="rotary-caption">{inRegister ? 'In register' : `Off register · ${offsetMm.toFixed(1)} mm`}</span>
      </p>
    </RotaryControl>
  );
}
