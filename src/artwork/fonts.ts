// Bundled, subset, OFL-licensed cover fonts (static instances; licences in /licenses/).
// Canvas never triggers font loading by itself, so every render path awaits ensureFonts() first.
import bigShoulders from '../assets/fonts/BigShouldersDisplay-Black.woff2?url';
import schibstedBlack from '../assets/fonts/SchibstedGrotesk-Black.woff2?url';
import funnelExtraBold from '../assets/fonts/FunnelDisplay-ExtraBold.woff2?url';
import bricolage from '../assets/fonts/BricolageGrotesque-CondensedExtraBold.woff2?url';
import martianRegular from '../assets/fonts/MartianMono-Regular.woff2?url';
import martianMedium from '../assets/fonts/MartianMono-Medium.woff2?url';
import spaceMono from '../assets/fonts/SpaceMono-Regular.woff2?url';

/** Family names used in canvas font strings (prefixed to avoid clashing with installed fonts). */
export const F = {
  inkDisplay: 'SLV Big Shoulders',
  inkNotation: 'SLV Space Mono',
  spectrumDisplay: 'SLV Schibsted Grotesk',
  horizonDisplay: 'SLV Funnel Display',
  mono: 'SLV Martian Mono',
  matterDisplay: 'SLV Bricolage',
} as const;
const FALLBACK = '"Helvetica Neue", Helvetica, Arial, sans-serif';
export const font = (weight: number | string, px: number, family: string, style = 'normal') => `${style} ${weight} ${px}px "${family}", ${FALLBACK}`;

const FACES: [string, string, FontFaceDescriptors][] = [
  [F.inkDisplay, bigShoulders, { weight: '900' }],
  [F.inkNotation, spaceMono, { weight: '400' }],
  [F.spectrumDisplay, schibstedBlack, { weight: '900' }],
  [F.horizonDisplay, funnelExtraBold, { weight: '800' }],
  [F.mono, martianRegular, { weight: '400' }],
  [F.mono, martianMedium, { weight: '500' }],
  [F.matterDisplay, bricolage, { weight: '800' }],
];

let ready: Promise<boolean> | null = null;
/** Resolves true when all faces are usable; false if any failed (fallback stack is then used). */
export function ensureFonts(): Promise<boolean> {
  if (ready) return ready;
  if (typeof document === 'undefined' || typeof FontFace === 'undefined') return (ready = Promise.resolve(false));
  ready = Promise.all(FACES.map(async ([fam, url, desc]) => { const f = new FontFace(fam, `url(${url})`, desc); await f.load(); document.fonts.add(f); return true; }))
    .then(() => true)
    .catch(() => false);
  return ready;
}
export const fontsLoaded = () => ready !== null;
