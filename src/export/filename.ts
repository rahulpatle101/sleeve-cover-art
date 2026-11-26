// Pure export filename (no DOM, no fonts) so Node checks can import it.
import type { ArtworkRecipeV1 } from '../instrument/recipe.ts';

/** ASCII slug ≤ 32 chars, cut at a word boundary when possible (never "…-home-ex"). */
const slug = (s: string) => {
  const full = s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (full.length <= 32) return full;
  const cut = full.slice(0, 33);
  const at = cut.lastIndexOf('-');
  return (at >= 12 ? cut.slice(0, at) : full.slice(0, 32)).replace(/-+$/, '');
};

/** sleeve-{artist}-{track}-{engine}-{seed}.png; no names → sleeve-003-{engine}-{seed}.png. ASCII, ≤ 96 chars. */
export function exportFilename(r: ArtworkRecipeV1): string {
  const names = [slug(r.artist), slug(r.track)].filter(Boolean);
  const parts = ['sleeve', ...(names.length ? names : ['003']), r.mode, r.seed.toString(16).padStart(8, '0')];
  return parts.join('-') + '.png';
}
