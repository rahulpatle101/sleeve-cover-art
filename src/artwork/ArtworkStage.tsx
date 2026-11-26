import { useEffect, useRef, useState } from 'react';
import type { ArtworkRecipeV1 } from '../instrument/recipe.ts';
import { renderArtLayer, renderTypeLayer } from './renderArtwork.ts';
import { ensureFonts } from './fonts.ts';

const MAX_DPR = 2;
const FADE_MS = 240; // engine / Remix change
const FADE_INTERRUPTED_MS = 140; // a change arriving mid-fade resolves faster, so rapid input never muddies
const SETTLE_MS = 160; // idle time after the last tuning change before the full material is rendered

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const makeCanvas = (px: number) => {
  const c = document.createElement('canvas');
  c.width = px;
  c.height = px;
  return c;
};

/**
 * Preview stage.
 * - Tuning (any rotary, text, palette): a simplified DRAFT art layer is drawn immediately; the FULL material is
 *   rendered once input has been idle for SETTLE_MS and no pointer is held (i.e. after release).
 * - Discrete changes (engine, Remix): the FULL art layer is rendered first, then ONLY the art layer crossfades from
 *   what is on screen. Type is always drawn crisply for the current recipe. Reduced motion: cut.
 * - Settled frames equal renderArtwork(…, 'full') exactly. `data-settled="true"` marks that state (used by tests).
 */
export function ArtworkStage({ recipe, label }: { recipe: ArtworkRecipeV1; label: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const artRef = useRef<HTMLCanvasElement | null>(null); // current recipe's art layer
  const artFull = useRef(false); // is artRef the full render of recipeRef?
  const scratchRef = useRef<HTMLCanvasElement | null>(null); // used only when a fade is interrupted
  const fromRef = useRef<HTMLCanvasElement | null>(null); // art snapshot fading out
  const fadeRef = useRef<{ raf: number } | null>(null);
  const alphaRef = useRef(0); // current opacity of the fading snapshot
  const recipeRef = useRef(recipe);
  const prevKey = useRef('');
  const settleRef = useRef<number | null>(null);
  const pointerDown = useRef(false);
  const pendingFull = useRef(false);
  const composeRef = useRef<(a: number) => void>(() => {});
  const [css, setCss] = useState(0);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let live = true;
    ensureFonts().then(() => live && setFontsReady(true));
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setCss(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const markSettled = () => {
    const c = canvasRef.current;
    if (c) c.dataset.settled = artFull.current && !fadeRef.current ? 'true' : 'false';
  };

  const renderFull = () => {
    settleRef.current = null;
    if (pointerDown.current) {
      pendingFull.current = true; // still dragging: wait for release
      return;
    }
    pendingFull.current = false;
    const art = artRef.current;
    if (!art || artFull.current) return;
    renderArtLayer(art.getContext('2d')!, recipeRef.current, art.width, art.height, 'full');
    artFull.current = true;
    if (!fadeRef.current) composeRef.current(0); // a running fade picks it up on its next frame
    markSettled();
  };

  useEffect(() => {
    const down = () => {
      pointerDown.current = true;
    };
    const up = () => {
      pointerDown.current = false;
      if (pendingFull.current && settleRef.current === null) renderFull();
    };
    window.addEventListener('pointerdown', down, true);
    window.addEventListener('pointerup', up, true);
    window.addEventListener('pointercancel', up, true);
    return () => {
      window.removeEventListener('pointerdown', down, true);
      window.removeEventListener('pointerup', up, true);
      window.removeEventListener('pointercancel', up, true);
    };
  }, []);

  useEffect(() => {
    recipeRef.current = recipe;
    const canvas = canvasRef.current;
    if (!canvas || css === 0 || !fontsReady) return;
    const raf = requestAnimationFrame(() => {
      const px = Math.round(css * Math.min(MAX_DPR, window.devicePixelRatio || 1));
      const resized = canvas.width !== px;
      const initial = prevKey.current === '';
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
      const discrete = !initial && prevKey.current !== key;
      const animate = discrete && !resized && !reducedMotion();
      prevKey.current = key;
      const interrupted = animate && fadeRef.current !== null;

      if (animate) {
        // Snapshot the art layer exactly as displayed right now (restart, never queue).
        if (interrupted && fromRef.current) {
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
          fx.drawImage(art, 0, 0);
        }
      }

      // Discrete changes, first paint and resizes render the full material now; tuning draws a draft.
      const quality = discrete || initial || resized ? 'full' : 'draft';
      if (settleRef.current !== null) clearTimeout(settleRef.current);
      settleRef.current = null;
      renderArtLayer(art.getContext('2d')!, recipe, px, px, quality);
      artFull.current = quality === 'full';
      if (!artFull.current) settleRef.current = window.setTimeout(renderFull, SETTLE_MS);

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
      composeRef.current = compose;

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
            markSettled();
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
      markSettled();
    });
    return () => cancelAnimationFrame(raf);
  }, [recipe, css, fontsReady]);

  useEffect(
    () => () => {
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current.raf);
      if (settleRef.current !== null) clearTimeout(settleRef.current);
    },
    [],
  );

  return (
    <div className="stage" ref={wrapRef}>
      <canvas ref={canvasRef} className="stage-canvas" role="img" aria-label={label} data-settled="false" />
    </div>
  );
}
