// Canonical recipe and the single validation boundary.
export type Mode = 'harmonic' | 'radial';

export type ArtworkRecipeV1 = {
  version: 1;
  seed: number; // uint32
  mode: Mode;
  artist: string;
  track: string;
  form: number; // int 1..8
  rhythm: number; // int 1..8
  phase: number; // int degrees 0..360
  density: number; // int 1..24
  palette: number; // int 0..PALETTE_COUNT-1
};

export type NumericKey = 'form' | 'rhythm' | 'phase' | 'density' | 'palette';

export const PALETTE_COUNT = 6;
export const TEXT_MAX = 48;

export const BOUNDS: Record<NumericKey, { min: number; max: number }> = {
  form: { min: 1, max: 8 },
  rhythm: { min: 1, max: 8 },
  phase: { min: 0, max: 360 },
  density: { min: 1, max: 24 },
  palette: { min: 0, max: PALETTE_COUNT - 1 },
};

export function clampInt(value: unknown, min: number, max: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(n)) return min;
  if (n === Infinity) return max;
  if (n === -Infinity) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function sanitizeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  // Strip control characters, collapse whitespace, cap length.
  return value
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, TEXT_MAX);
}

/** The one boundary: everything that reaches a renderer passes through here. */
export function validateRecipe(input: Partial<ArtworkRecipeV1>): ArtworkRecipeV1 {
  const r: ArtworkRecipeV1 = {
    version: 1,
    seed: clampInt(input.seed, 0, 0xffffffff) >>> 0,
    mode: input.mode === 'radial' ? 'radial' : 'harmonic',
    artist: sanitizeText(input.artist),
    track: sanitizeText(input.track),
    form: clampInt(input.form, BOUNDS.form.min, BOUNDS.form.max),
    rhythm: clampInt(input.rhythm, BOUNDS.rhythm.min, BOUNDS.rhythm.max),
    phase: clampInt(input.phase, BOUNDS.phase.min, BOUNDS.phase.max),
    density: clampInt(input.density, BOUNDS.density.min, BOUNDS.density.max),
    palette: clampInt(input.palette, BOUNDS.palette.min, BOUNDS.palette.max),
  };
  if (import.meta.env?.DEV) {
    for (const k of Object.keys(BOUNDS) as NumericKey[]) {
      if (input[k] !== undefined && input[k] !== r[k]) console.warn(`[recipe] clamped ${k}: ${input[k]} → ${r[k]}`);
    }
  }
  return r;
}

export const DEFAULT_RECIPE: ArtworkRecipeV1 = validateRecipe({
  seed: 20261125,
  mode: 'harmonic',
  artist: 'Night Office',
  track: 'Phase Garden',
  form: 3,
  rhythm: 4,
  phase: 45,
  density: 10,
  palette: 0,
});
