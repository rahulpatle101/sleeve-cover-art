// v0.2 press sets (PROPOSED — DIRECTION, approved): paper stock + two ink plates + imposition.
// Recipe field `palette` (0–5) selects a press set; the recipe schema is unchanged.
export type Imposition = 'bleed' | 'gate' | 'field';
export type Blend = 'multiply' | 'screen' | 'source-over';
export type Plate = { ink: string; blend: Blend };

export type PressSet = {
  name: string;
  imposition: Imposition;
  paper: string;
  /** Paper inside the optical gate (gate imposition only). */
  gateFill?: string;
  /** Plate A = key plate (heavier, registered). Plate B = second pass, carries misregistration. */
  plates: [Plate, Plate];
  text: string; // artist
  track: string; // track label
  colophon: string; // print slug
  mark: string; // registration marks / gate ring
  grain: number; // paper texture strength (overlay alpha)
};

export const PALETTES: PressSet[] = [
  {
    name: 'Newsprint',
    imposition: 'bleed',
    paper: '#ECE5D6',
    plates: [
      { ink: '#E2462A', blend: 'multiply' },
      { ink: '#1B1A1E', blend: 'multiply' },
    ],
    text: '#1B1A1E',
    track: '#1B1A1E',
    colophon: '#1B1A1E',
    mark: '#C93A20',
    grain: 0.16,
  },
  {
    name: 'Cobalt Gate',
    imposition: 'gate',
    paper: '#E8EBEE',
    gateFill: '#F4F1E8',
    plates: [
      { ink: '#F5C02A', blend: 'multiply' },
      { ink: '#1F3FBF', blend: 'multiply' },
    ],
    text: '#16181D',
    track: '#1F3FBF',
    colophon: '#16181D',
    mark: '#1F3FBF',
    grain: 0.12,
  },
  {
    name: 'Night Run',
    imposition: 'field',
    paper: '#101113',
    plates: [
      { ink: '#FF6B3D', blend: 'screen' },
      { ink: '#38C7DA', blend: 'screen' },
    ],
    text: '#F3F1EC',
    track: '#9EE6EF',
    colophon: '#8E9097',
    mark: '#8E9097',
    grain: 0.1,
  },
  {
    name: 'Ember',
    imposition: 'gate',
    paper: '#B5330E',
    gateFill: '#A12C0B',
    plates: [
      { ink: '#F6E3C8', blend: 'source-over' },
      { ink: '#2A0E06', blend: 'multiply' },
    ],
    text: '#FFF4E6',
    track: '#FFF4E6',
    colophon: '#FFF4E6',
    mark: '#F6E3C8',
    grain: 0.14,
  },
  {
    name: 'Moss',
    imposition: 'field',
    paper: '#1F2A22',
    plates: [
      { ink: '#E2B13C', blend: 'screen' },
      { ink: '#C9DDBF', blend: 'screen' },
    ],
    text: '#EDF2E6',
    track: '#E2B13C',
    colophon: '#A8B5A2',
    mark: '#A8B5A2',
    grain: 0.1,
  },
  {
    name: 'Chalk',
    imposition: 'bleed',
    paper: '#D5DADF',
    plates: [
      { ink: '#2B4FD8', blend: 'multiply' },
      { ink: '#141416', blend: 'multiply' },
    ],
    text: '#141416',
    track: '#141416',
    colophon: '#141416',
    mark: '#2B4FD8',
    grain: 0.12,
  },
];
