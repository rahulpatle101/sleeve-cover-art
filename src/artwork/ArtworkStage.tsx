import { useEffect, useRef, useState } from 'react';
import type { ArtworkRecipeV1 } from '../instrument/recipe.ts';
import { renderArtLayer, renderTypeLayer } from './renderArtwork.ts';
import { ensureFonts } from './fonts.ts';

const MAX_DPR = 2;
const FADE_MS = 240; // engine / New Proof change
const FADE_INTERRUPTED_MS = 140; // a change arriving mid-fade resolves faster, so rapid input never muddies
const SETTLE_MS = 160; // idle time after the last tuning change before the full material is rendered
const SETTLE_FADE_MS = 150; // draft → full material: the print "develops" instead of popping in

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
 *   rendered once input has been idle for SETTLE_MS and no dial drag is held, then crossfades in over SETTLE_FADE_MS.
 * - Discrete changes (engine, New Proof): the FULL cover is rendered, and the WHOLE frame (art and type together)
 *   crossfades from exactly what is on screen, so the old artwork never carries the new title. An interrupting change
 *   snapshots the mid-fade frame and restarts from it. Reduced motion: cut.
 * - Settled frames equal renderArtwork(…, 'full') exactly. `data-settled="true"` marks that state (used by tests).
 */
export function ArtworkStage({ recipe, label }: { recipe: ArtworkRecipeV1; label: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const artRef = useRef<HTMLCanvasElement | null>(null); // current recipe's art layer
  const artFull = useRef(false); // is artRef the full render of recipeRef?
  const fromRef = useRef<HTMLCanvasElement | null>(null); // snapshot of the displayed frame, fading out
  const fromActive = useRef(false);
  const fadeRef = useRef<{ raf: number } | null>(null);
  const recipeRef = useRef(recipe);
  const prevKey = useRef('');
  const settleRef = useRef<number | null>(null);
  const pointerDown = useRef(false);
  const pendingFull = useRef(false);
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

  /** Current art + crisp type, with the outgoing frame on top at `fromAlpha`. */
  const compose = (fromAlpha: number) => {
    const c = canvasRef.current, art = artRef.current;
    if (!c || !art) return;
    const ctx = c.getContext('2d')!;
    ctx.globalAlpha = 1;
    ctx.drawImage(art, 0, 0);
    renderTypeLayer(ctx, recipeRef.current, c.width, c.height);
    if (fromActive.current && fromRef.current && fromAlpha > 0) {
      ctx.globalAlpha = fromAlpha;
      ctx.drawImage(fromRef.current, 0, 0);
      ctx.globalAlpha = 1;
    }
  };

  /** Snapshot what is on screen right now (mid-fade included) and fade it out over the new frame. */
  const snapshot = () => {
    const c = canvasRef.current, from = fromRef.current;
    if (!c || !from) return false;
    const fx = from.getContext('2d')!;
    fx.globalAlpha = 1;
    fx.drawImage(c, 0, 0);
    return true;
  };
  const fade = (duration: number) => {
    if (fadeRef.current) cancelAnimationFrame(fadeRef.current.raf);
    fromActive.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      compose(1 - easeOut(t));
      if (t < 1) fadeRef.current = { raf: requestAnimationFrame(step) };
      else {
        fadeRef.current = null;
        fromActive.current = false;
        markSettled();
      }
    };
    compose(1);
    fadeRef.current = { raf: requestAnimationFrame(step) };
  };

  const renderFull = () => {
    settleRef.current = null;
    if (pointerDown.current) {
      pendingFull.current = true; // still dragging a dial: wait for release
      return;
    }
    pendingFull.current = false;
    const art = artRef.current;
    if (!art || artFull.current) return;
    const animate = !fadeRef.current && !reducedMotion() && snapshot(); // a running fade picks it up on its next frame
    renderArtLayer(art.getContext('2d')!, recipeRef.current, art.width, art.height, 'full');
    artFull.current = true;
    if (animate) fade(SETTLE_FADE_MS);
    else if (!fadeRef.current) compose(0);
    markSettled();
  };

  useEffect(() => {
    // Only a held dial drag defers the full render; pressing a button or a tile elsewhere does not.
    const down = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.('[data-drag-surface]')) pointerDown.current = true;
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
        if (fadeRef.current) cancelAnimationFrame(fadeRef.current.raf);
        fadeRef.current = null;
        fromActive.current = false;
        canvas.width = px;
        canvas.height = px;
        artRef.current = makeCanvas(px);
        fromRef.current = makeCanvas(px);
      }
      const art = artRef.current!;

      const key = `${recipe.mode}:${recipe.seed}`;
      const discrete = !initial && prevKey.current !== key;
      prevKey.current = key;
      const interrupted = fadeRef.current !== null;
      // Snapshot before the art layer changes: the canvas still shows exactly the previous frame.
      const animate = discrete && !resized && !reducedMotion() && snapshot();

      // Discrete changes, first paint and resizes render the full material now; tuning draws a draft.
      const quality = discrete || initial || resized ? 'full' : 'draft';
      if (settleRef.current !== null) clearTimeout(settleRef.current);
      settleRef.current = null;
      renderArtLayer(art.getContext('2d')!, recipe, px, px, quality);
      artFull.current = quality === 'full';
      if (!artFull.current) settleRef.current = window.setTimeout(renderFull, SETTLE_MS);

      if (animate) fade(interrupted ? FADE_INTERRUPTED_MS : FADE_MS);
      else if (!fadeRef.current) compose(0); // tuning during a fade: the running fade composes the new art next frame
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
