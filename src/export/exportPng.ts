import type { ArtworkRecipeV1 } from '../instrument/recipe.ts';
import { renderArtwork } from '../artwork/renderArtwork.ts';
import { ensureFonts } from '../artwork/fonts.ts';

export const EXPORT_SIZE = 3000;

export { exportFilename } from './filename.ts';
import { exportFilename } from './filename.ts';

/** Let the browser paint (e.g. the "Rendering…" status) before the synchronous encode. */
const nextPaint = () => new Promise<void>((r) => requestAnimationFrame(() => setTimeout(r, 0)));

/** Decode a data: URL locally (no fetch, no network). */
function dataUrlToBlob(url: string): Blob {
  const [head, b64] = url.split(',');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: head.slice(5, head.indexOf(';')) });
}

/**
 * Rerender the exact recipe at full size (never upscales the preview).
 * Encodes synchronously with toDataURL: Chrome's async toBlob() encodes in idle periods and was
 * measured stalling 6+ s when the page was busy (critique finding S1-1). ~100 ms, deterministic.
 */
export async function renderPngBlob(r: ArtworkRecipeV1, size = EXPORT_SIZE): Promise<Blob> {
  await ensureFonts(); // bundled OFL faces; falls back to the system stack only if they fail to load
  await document.fonts.ready;
  await nextPaint();
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable in this browser.');
  renderArtwork(ctx, r, size, size, 'full');
  const url = canvas.toDataURL('image/png');
  canvas.width = canvas.height = 0; // release memory
  if (!url.startsWith('data:image/png')) throw new Error('The browser could not encode the PNG.');
  return dataUrlToBlob(url);
}

export async function exportPng(r: ArtworkRecipeV1): Promise<string> {
  const blob = await renderPngBlob(r);
  const name = exportFilename(r);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return name;
}
