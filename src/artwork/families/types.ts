import type { ArtworkRecipeV1 } from '../../instrument/recipe.ts';
import type { Trace } from '../geometry.ts';
import type { PressSet } from '../palettes.ts';

export type Quality = 'draft' | 'full';
/** Everything a family renderer needs, computed once per (recipe, size). */
export type G = {
  r: ArtworkRecipeV1;
  set: PressSet;
  S: number;
  trs: Trace[];
  N: number;
  reg: { amount: number; dx: number; dy: number; rot: number };
  place: { scale: number; tx: number; ty: number };
  /** Curve emphasis: a seeded stretch of the key contour (fractions of its length) rendered heavier. */
  emph: { start: number; len: number };
};
