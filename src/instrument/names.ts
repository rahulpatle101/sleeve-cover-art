import { mulberry32 } from './remix.ts';

/**
 * Proof names: invented artist and track titles shown on each New Proof.
 * PROPOSED — DIRECTION. Original combinations, not intended to name real acts.
 * Picked from the proof seed, so the same seed always gives the same names.
 */
export const ARTISTS = [
  'Night Office', 'Quiet Meridian', 'The Paper Lanterns', 'Halftone Club', 'Low Orbit Choir',
  'Mira Valence', 'Copper Saints', 'Glass Arcade', 'The Slow Weather', 'Ondine Park',
  'Harbour Static', 'Velvet Cartography', 'Sunday Instruments', 'The Long Exposure', 'Kite District',
  'Amber Relay', 'Nadia Florence', 'Pale Engine', 'The Second Floor', 'Tidal Office',
  'Marlow & Vane', 'Concrete Bloom', 'Ivo Lindqvist', 'Northern Proof', 'The Registration',
  'Sable Hours', 'Lumen Society', 'Juniper Signal', 'Common Tide', 'Ada Morrow',
] as const;

export const TRACKS = [
  'Phase Garden', 'Slow Return', 'Second Light', 'Paper Moons', 'Harmonic Field',
  'Small Hours', 'Off Register', 'Rose Curve', 'Night Ferry', 'Blue Interval',
  'Sixteen Passes', 'Soft Machinery', 'Weather for Two', 'Tangent Lines', 'Afterimage',
  'Cold Press', 'The Quiet Orbit', 'Glass Hours', 'Folded Map', 'Low Tide Signal',
  'Halfway Home', 'Kerning', 'Long Division', 'Amber Hour', 'Northbound',
  'Ink & Daylight', 'Overprint', 'Ratio of Us', 'Lantern Season', 'Still Rotating',
] as const;

/** Deterministic artist/track pair for a seed (independent stream from the art parameters). */
export function namesFor(seed: number): { artist: string; track: string } {
  const rnd = mulberry32((seed ^ 0x9e3779b9) >>> 0);
  return {
    artist: ARTISTS[Math.floor(rnd() * ARTISTS.length)],
    track: TRACKS[Math.floor(rnd() * TRACKS.length)],
  };
}
