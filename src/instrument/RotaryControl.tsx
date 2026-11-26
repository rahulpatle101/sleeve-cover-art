import { useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  /** Coarse step for Shift+Arrow and Page Up/Down. */
  coarse: number;
  onChange: (v: number) => void;
  /** Visible value text (defaults to the number). */
  display?: string;
  /** Small secondary line under the value (e.g. palette name). */
  caption?: string;
  /** Screen-reader value text, e.g. "45 degrees". */
  valueText?: string;
  unit?: string;
  /** 'knob' = ivory calibrated knob (270° sweep). 'hero' = dark knurled Registration wheel (360° from 12 o'clock). */
  variant?: 'knob' | 'hero';
  /** Hide the per-dial readout when the module shows the value elsewhere (e.g. the central ratio readout). */
  hideReadout?: boolean;
  /** Extra content under the readout (hero explanation / state). */
  children?: ReactNode;
  /** Values marked with a fixed tick on the dial (e.g. the in-register detents). */
  ticks?: number[];
  /** Extra id(s) describing the input (e.g. a shared hint). */
  describedBy?: string;
};

const SWEEP = 270;
/**
 * Drag distance per step: big detents for small ranges (Form 22 px/step),
 * 1 px per degree for Phase. Shift divides speed by 4.
 */
const SLOP_MOUSE = 6; // px before a drag engages
const SLOP_TOUCH = 10;
const pxPerStep = (span: number) => Math.min(22, Math.max(1, 160 / Math.max(1, span)));

/**
 * Semantic core is a native range input (keyboard, AT, focus). The dial is a
 * visual and a forgiving vertical/horizontal drag surface on top of it.
 */
export function RotaryControl({ label, value, min, max, coarse, onChange, display, caption, valueText, unit, variant = 'knob', ticks, describedBy, hideReadout, children }: Props) {
  const hero = variant === 'hero';
  const sweep = hero ? 360 : SWEEP, start = hero ? 0 : -SWEEP / 2;
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  type Drag = { x: number; y: number; start: number; last: number; acc: number; axis: 'x' | 'y' | 'none' | null };
  const drag = useRef<Drag | null>(null);
  const [dragging, setDragging] = useState(false);
  const span = max - min;
  const frac = span === 0 ? 0 : (value - min) / span;
  const angle = start + sweep * frac;

  const set = (v: number) => {
    const n = Math.min(max, Math.max(min, Math.round(v)));
    if (n !== value) onChange(n);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    let next: number | null = null;
    const up = e.key === 'ArrowUp' || e.key === 'ArrowRight';
    const down = e.key === 'ArrowDown' || e.key === 'ArrowLeft';
    if (e.key === 'PageUp' || (e.shiftKey && up)) next = value + coarse;
    else if (e.key === 'PageDown' || (e.shiftKey && down)) next = value - coarse;
    else if (e.key === 'Home') next = min;
    else if (e.key === 'End') next = max;
    if (next !== null) {
      e.preventDefault();
      set(next);
    }
    // Plain arrows: native range behaviour (±1 step).
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    inputRef.current?.focus({ preventScroll: true });
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, start: value, last: value, acc: 0, axis: null };
    setDragging(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const touch = e.pointerType === 'touch';
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (d.axis === null) {
      // Dead zone, then lock the dominant axis for this drag: hand jitter on a click never
      // changes the value, and sideways wobble during a vertical drag cannot reverse it.
      if (Math.max(Math.abs(dx), Math.abs(dy)) < (touch ? SLOP_TOUCH : SLOP_MOUSE)) return;
      d.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : touch ? 'none' : 'y'; // touch + vertical = page scroll
      // No re-anchor: the movement inside the dead zone still counts along the locked axis,
      // so fast flicks are not lost and reversing returns exactly to the start.
    }
    if (d.axis === 'none') return;
    // Up or right increases. Incremental, so pressing Shift mid-drag only slows what follows.
    const move = d.axis === 'x' ? dx : -dy;
    d.x = e.clientX;
    d.y = e.clientY;
    d.acc += (move * (e.shiftKey ? 0.25 : 1)) / pxPerStep(span);
    const next = Math.min(max, Math.max(min, Math.round(d.start + d.acc)));
    // Keep the accumulator inside the range so reversing after a clamp responds immediately.
    d.acc = Math.min(max - d.start + 0.49, Math.max(min - d.start - 0.49, d.acc));
    if (next !== d.last) {
      d.last = next;
      onChange(next); // only on stepped change, never per raw pixel
    }
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  // Geometry in a 0..100 viewBox, centre (50, 50). Angles: 0° = 12 o'clock, clockwise.
  const P = (deg: number, r: number) => { const rad = ((deg - 90) * Math.PI) / 180; return [50 + r * Math.cos(rad), 50 + r * Math.sin(rad)]; };
  const gid = id.replace(/[^a-zA-Z0-9_-]/g, '');
  const steps = span <= 12 ? span * 3 : Math.min(span, 24); // calibrated ring: minor ticks between small-range steps
  const majorEvery = span <= 12 ? 3 : 1;
  return (
    <div className={`rotary rotary-${variant}`}>
      <label className="rotary-label" htmlFor={id}>
        {label}
      </label>
      <div className="rotary-body">
        <div
          className={`dial-wrap${dragging ? ' is-dragging' : ''}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <input
            ref={inputRef}
            id={id}
            className="dial-input"
            type="range"
            aria-label={label /* natural case; the visible label is CSS-uppercased */}
            min={min}
            max={max}
            step={1}
            value={value}
            aria-valuetext={valueText ?? (unit ? `${value} ${unit}` : undefined)}
            aria-describedby={describedBy}
            onChange={(e) => set(Number(e.currentTarget.value))}
            onKeyDown={onKeyDown}
          />
          {hero ? (
            <svg className="dial dial-hero" viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <radialGradient id={`face-${gid}`} cx="42%" cy="35%" r="70%">
                  <stop offset="0" style={{ stopColor: 'var(--wheel-face-hi)' }} />
                  <stop offset="1" style={{ stopColor: 'var(--wheel-face-lo)' }} />
                </radialGradient>
              </defs>
              {/* fixed detent marks outside the wheel: where the plates register */}
              {(ticks ?? []).map((t) => { const a = start + (sweep * (t - min)) / (span || 1), [x1, y1] = P(a, 46.6), [x2, y2] = P(a, 50); return <line key={t} className="dial-detent" x1={x1} y1={y1} x2={x2} y2={y2} />; })}
              <g className="wheel" transform={`rotate(${angle} 50 50)`}>
                <circle className="wheel-rim" cx="50" cy="50" r="45" />
                {Array.from({ length: 96 }, (_, k) => { const [x1, y1] = P(k * 3.75, 38.5), [x2, y2] = P(k * 3.75, 44.5); return <line key={k} className="wheel-knurl" x1={x1} y1={y1} x2={x2} y2={y2} />; })}
                <circle cx="50" cy="50" r="37" fill={`url(#face-${gid})`} className="wheel-face" />
                <line className="wheel-pointer" x1="50" y1="23" x2="50" y2="8.5" />
              </g>
            </svg>
          ) : (
            <svg className="dial dial-knob" viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <radialGradient id={`face-${gid}`} cx="40%" cy="32%" r="75%">
                  <stop offset="0" style={{ stopColor: 'var(--knob-face-hi)' }} />
                  <stop offset="0.7" style={{ stopColor: 'var(--knob-face-mid)' }} />
                  <stop offset="1" style={{ stopColor: 'var(--knob-face-lo)' }} />
                </radialGradient>
              </defs>
              {Array.from({ length: steps + 1 }, (_, k) => { const a = start + (sweep * k) / steps, major = k === 0 || k === steps || (majorEvery > 1 && k % majorEvery === 0), [x1, y1] = P(a, major ? 40.5 : 44), [x2, y2] = P(a, 48.5); return <line key={k} className={`knob-tick${major ? ' is-major' : ''}`} x1={x1} y1={y1} x2={x2} y2={y2} />; })}
              <g className="knob-body">
                <circle cx="50" cy="50" r="36" fill={`url(#face-${gid})`} className="knob-face" />
              </g>
              <line className="knob-pointer" x1={P(angle, 9)[0]} y1={P(angle, 9)[1]} x2={P(angle, 30)[0]} y2={P(angle, 30)[1]} />
            </svg>
          )}
        </div>
        {!hideReadout && (
          <div className="rotary-readout">
            <output className="rotary-value" htmlFor={id} aria-hidden="true">{display ?? value}</output>
            {caption && <span className="rotary-caption" aria-hidden="true">{caption}</span>}
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
