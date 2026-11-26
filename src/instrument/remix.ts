import { type ArtworkRecipeV1, validateRecipe, PALETTE_COUNT } from './recipe.ts';

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Next seed in the deterministic remix chain. */
export function nextSeed(seed: number): number {
  return (Math.imul(seed >>> 0, 1664525) + 1013904223) >>> 0;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** Remix candidates for Harmonic, derived from the rule (not hand-listed). Form 2–7, Rhythm 2–8, no 1:1. */
const HARMONIC_PAIRS: [number, number][] = [];
for (let f = 2; f <= 7; f++)
  for (let r = 2; r <= 8; r++) {
    const g = gcd(f, r);
    if (f !== r && f / g + r / g <= 9 && Math.max(f / g, r / g) <= 6) HARMONIC_PAIRS.push([f, r]);
  }

const int = (rnd: () => number, min: number, max: number) => min + Math.floor(rnd() * (max - min + 1));

/**
 * Derive a composed variation from a seed. Curated sub-ranges keep results
 * coherent; mode, artist and track are preserved.
 */
export function recipeFromSeed(base: ArtworkRecipeV1, seed: number): ArtworkRecipeV1 {
  const rnd = mulberry32(seed);
  let form: number;
  let rhythm: number;
  if (base.mode === 'harmonic') {
    // Harmonic: only ratios that read as a figure (recipe audit): reduced P+Q ≤ 9 and both terms ≤ 6.
    // 7:8, 6:7, 5:6, 2:7… draw as a boxy grid or comb. Manual dials remain free.
    [form, rhythm] = HARMONIC_PAIRS[int(rnd, 0, HARMONIC_PAIRS.length - 1)];
  } else {
    form = int(rnd, 2, 7);
    rhythm = int(rnd, 2, 8);
  }
  // Step down (never up) so the nudge cannot create a 7 term: 6:6 → 6:5, 2:2 → 2:3.
  if (rhythm === form) rhythm = form > 2 ? form - 1 : form + 1;
  // Visual load ≈ curve complexity (P+Q after reducing the ratio) × layers. Cap Remix density so
  // complex ratios stay legible as a silhouette; simple ratios may still go dense. Manual dials are free.
  const g = gcd(form, rhythm);
  const complexity = form / g + rhythm / g;
  const densityMax = Math.min(18, Math.max(4, Math.floor(70 / complexity)));
  const phase = int(rnd, 0, 24) * 15;
  const density = int(rnd, 4, densityMax);
  return validateRecipe({
    ...base,
    seed,
    form,
    rhythm,
    phase,
    density,
    // Always a different palette from the current one, so every Remix visibly moves.
    palette: (base.palette + int(rnd, 1, PALETTE_COUNT - 1)) % PALETTE_COUNT,
  });
}

export function remix(recipe: ArtworkRecipeV1): ArtworkRecipeV1 {
  return recipeFromSeed(recipe, nextSeed(recipe.seed));
}
