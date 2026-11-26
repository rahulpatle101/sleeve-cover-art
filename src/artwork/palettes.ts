// v0.2 production sets (approved art direction). Recipe field `palette` (0–5) selects a set; schema unchanged.
export type Family = 'ink' | 'light' | 'matter';
export type RGB = [number, number, number];

export type PressSet = {
  name: string;
  family: Family;
  index: number; // catalog number, 01–06
  stock: string; // base colour (Matter: albedo is used instead)
  plates?: [RGB, RGB]; // Ink: plate A (key) / plate B
  blend?: 'multiply' | 'source-over'; // Ink: how plates meet the stock (Carbon prints opaque inks on dark stock)
  display: string; // display type colour
  notation: string; // track / catalog colour (Light/Matter track uses `accent`)
  accent?: string;
  horizon?: boolean; // Light: night-sky stock with a lit horizon and reflection
  macro?: boolean; // Matter: magnified crop (signature) vs full sheet (quiet)
  albedo?: RGB; // Matter surface colour
};

export const PALETTES: PressSet[] = [
  { name: 'Newsprint', family: 'ink', index: 1, stock: '#ECE5D6', plates: [[226, 70, 42], [27, 26, 30]], blend: 'multiply', display: '#1B1A1E', notation: '#2A2824' },
  { name: 'Carbon', family: 'ink', index: 2, stock: '#18181A', plates: [[255, 78, 28], [58, 58, 63]], blend: 'source-over', display: '#EDEAE3', notation: '#B9B7B0' },
  { name: 'Spectrum', family: 'light', index: 3, stock: '#07070A', display: '#ECEEF3', notation: '#8C8F9C', accent: '#FFC27A' },
  { name: 'Horizon', family: 'light', index: 4, stock: '#060A18', display: '#F1EADC', notation: '#8E97B5', accent: '#FFC27A', horizon: true },
  { name: 'Full Sheet', family: 'matter', index: 5, stock: '#2A2C30', display: '#ECEAE5', notation: '#B9BCC2', accent: '#D6B577', albedo: [80, 82, 88] },
  { name: 'Macro Relief', family: 'matter', index: 6, stock: '#2A2C30', display: '#ECEAE5', notation: '#B9BCC2', accent: '#D6B577', albedo: [80, 82, 88], macro: true },
];

export const FAMILY_LABEL: Record<Family, string> = { ink: 'INK', light: 'LIGHT', matter: 'MATTER' };
