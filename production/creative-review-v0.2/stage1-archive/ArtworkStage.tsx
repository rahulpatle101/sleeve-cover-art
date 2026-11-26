import { useEffect, useRef, useState } from 'react';
import type { ArtworkRecipeV1 } from '../instrument/recipe.ts';
import { renderArtLayer, renderTypeLayer } from './renderArtwork.ts';

const MAX_DPR = 2;
const FADE_MS = 240; // engine / Remix change
const FADE_INTERRUPTED_MS = 140; // a change arriving mid-fade resolves faster, so rapid input never muddies

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const makeCanvas = (px: number) => {
  const c = document.createElement('canvas');
  c.width = px;
  c.height = px;
  return c;
};

/**
 * Preview stage. Each recipe is rendered once into an art-layer buffer (background + geometry,
 * the same renderer as export). Tuning shows immediately. An engine or seed change crossfades
 * ONLY the art layer from what is on screen; type is always drawn crisply for the current recipe,
 * so no ghosted labels. Settled frames equal renderArtwork() exactly. Reduced motion: cut.
 */
export function ArtworkStage({ recipe, label }: { recipe: ArtworkRecipeV1; label: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const artRef = useRef<HTMLCanvasElement | null>(null); // current recipe's art layer
  const scratchRef = useRef<HTMLCanvasElement | null>(null); // used only when a fade is interrupted
  const fromRef = useRef<HTMLCanvasElement | null>(null); // art snapshot fading out
  const fadeRef = useRef<{ raf: number } | null>(null);
  const alphaRef = useRef(0); // current opacity of the fading snapshot
  const recipeRef = useRef(recipe);
  const prevKey = useRef('');
  const [css, setCss] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setCss(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    recipeRef.current = recipe;
    const canvas = canvasRef.current;
    if (!canvas || css === 0) return;
    const raf = requestAnimationFrame(() => {
      const px = Math.round(css * Math.min(MAX_DPR, window.devicePixelRatio || 1));
      const resized = canvas.width !== px;
      if (resized) {
        canvas.width = px;
        canvas.height = px;
        artRef.current = makeCanvas(px);
        scratchRef.current = makeCanvas(px);
        fromRef.current = null;
      }
      const ctx = canvas.getContext('2d');
      const art = artRef.current!;
      if (!ctx) return;

      const key = `${recipe.mode}:${recipe.seed}`;
      const animate = prevKey.current !== '' && prevKey.current !== key && !resized && !reducedMotion();
      prevKey.current = key;
      const interrupted = animate && fadeRef.current !== null;

      if (animate) {
        // Snapshot the art layer exactly as displayed right now (restart, never queue).
        if (interrupted && fromRef.current) {
          // Displayed art = current target art with the old snapshot on top at alphaRef.
          const scratch = scratchRef.current!;
          const sx = scratch.getContext('2d')!;
          sx.globalAlpha = 1;
          sx.drawImage(art, 0, 0);
          sx.globalAlpha = alphaRef.current;
          sx.drawImage(fromRef.current, 0, 0);
          sx.globalAlpha = 1;
          scratchRef.current = fromRef.current; // swap buffers, no extra allocation
          fromRef.current = scratch;
        } else {
          const from = (fromRef.current ??= makeCanvas(px));
          const fx = from.getContext('2d')!;
          fx.globalAlpha = 1;
          fx.drawImage(art, 0, 0); // the settled art that is on screen now
        }
      }

      const ax = art.getContext('2d')!;
      renderArtLayer(ax, recipe, px, px);

      // Per frame: two blits straight onto the stage, then crisp type.
      const compose = (fromAlpha: number) => {
        alphaRef.current = fromAlpha;
        ctx.globalAlpha = 1;
        ctx.drawImage(art, 0, 0);
        if (fromRef.current && fromAlpha > 0) {
          ctx.globalAlpha = fromAlpha;
          ctx.drawImage(fromRef.current, 0, 0);
          ctx.globalAlpha = 1;
        }
        renderTypeLayer(ctx, recipeRef.current, px, px);
      };

      if (animate) {
        if (fadeRef.current) cancelAnimationFrame(fadeRef.current.raf);
        const duration = interrupted ? FADE_INTERRUPTED_MS : FADE_MS;
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          compose(1 - easeOut(t));
          if (t < 1) fadeRef.current = { raf: requestAnimationFrame(step) };
          else {
            fadeRef.current = null;
            fromRef.current = null;
          }
        };
        compose(1);
        fadeRef.current = { raf: requestAnimationFrame(step) };
      } else if (fadeRef.current) {
        // Tuning during a fade: the running fade composes the new art layer on its next frame.
      } else {
        fromRef.current = null;
        compose(0);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [recipe, css]);

  useEffect(
    () => () => {
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current.raf);
    },
    [],
  );

  return (
    <div className="stage" ref={wrapRef}>
      <canvas ref={canvasRef} className="stage-canvas" role="img" aria-label={label} />
    </div>
  );
}
