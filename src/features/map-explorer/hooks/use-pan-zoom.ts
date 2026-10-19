'use client';

import { type RefObject, useCallback, useEffect, useMemo, useRef } from 'react';

import type { Bounds } from '@/shared/lib/types';

import {
  constrain,
  coverViewBox,
  easeInOutCubic,
  fitBounds,
  IDENTITY,
  interpolate,
  panBy,
  type Rect,
  toTransform,
  type Viewport,
  zoomAround,
  type ZoomLimits,
} from '../lib/viewport';

/** Zoom level from which the map counts as zoomed-in (`data-zoom="detail"` on the svg). */
export const DETAIL_ZOOM = 1.8;

export interface PanZoomOptions {
  /** Map content rectangle in viewBox units (the generated map's viewBox). */
  readonly content: Rect;
  readonly limits?: ZoomLimits;
  /** Movement (px) after which a pointer press counts as a drag, not a click. */
  readonly dragThreshold?: number;
}

export interface PanZoomControls {
  zoomBy(factor: number): void;
  reset(): void;
  flyToBounds(bounds: Bounds, options?: FlyToOptions): void;
  getViewport(): Viewport;
}

/** Screen-space (CSS px) areas of the map hidden behind overlays such as a bottom sheet. */
export interface Insets {
  readonly top?: number;
  readonly right?: number;
  readonly bottom?: number;
  readonly left?: number;
}

export interface FlyToOptions {
  /** Breathing room around the bounds, in map units. */
  readonly padding?: number;
  /** Keep the target inside the part of the map that is actually visible. */
  readonly insets?: Insets;
}

const DEFAULT_LIMITS: ZoomLimits = { minK: 1, maxK: 14 };
const WHEEL_SENSITIVITY = 0.0018;
const FLY_DURATION_MS = 650;

/**
 * Pan / zoom / pinch for an SVG map, written imperatively: pointer moves
 * update a ref and one `transform` attribute inside requestAnimationFrame,
 * so React never re-renders while the user drags or zooms.
 *
 * - wheel & trackpad zoom around the cursor, drag to pan, two-finger pinch
 * - double-click to zoom in, animated `flyToBounds`
 * - clicks that end a drag are swallowed so dragging never selects a province
 */
export function usePanZoom(
  svgRef: RefObject<SVGSVGElement | null>,
  layerRef: RefObject<SVGGElement | null>,
  { content, limits = DEFAULT_LIMITS, dragThreshold = 5 }: PanZoomOptions,
): PanZoomControls {
  const viewport = useRef<Viewport>(IDENTITY);
  const view = useRef<Rect>(content);
  const frame = useRef<number | null>(null);
  const animation = useRef<number | null>(null);

  const apply = useCallback(() => {
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const v = viewport.current;
      layerRef.current?.setAttribute('transform', toTransform(v));
      const svg = svgRef.current;
      if (!svg) return;
      svg.style.setProperty('--map-k', v.k.toFixed(4));
      // Coarse zoom tier for CSS (e.g. reveal secondary labels). Only touch the DOM when it changes.
      const tier = v.k >= DETAIL_ZOOM ? 'detail' : 'overview';
      if (svg.dataset['zoom'] !== tier) svg.dataset['zoom'] = tier;
    });
  }, [layerRef, svgRef]);

  const set = useCallback(
    (next: Viewport) => {
      viewport.current = constrain(next, content, view.current, limits);
      apply();
    },
    [apply, content, limits],
  );

  const stopAnimation = useCallback(() => {
    if (animation.current !== null) cancelAnimationFrame(animation.current);
    animation.current = null;
  }, []);

  const animateTo = useCallback(
    (target: Viewport) => {
      stopAnimation();
      const from = viewport.current;
      const to = constrain(target, content, view.current, limits);
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        set(to);
        return;
      }
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / FLY_DURATION_MS);
        set(interpolate(from, to, easeInOutCubic(t), view.current));
        animation.current = t < 1 ? requestAnimationFrame(step) : null;
      };
      animation.current = requestAnimationFrame(step);
    },
    [content, limits, set, stopAnimation],
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // --- keep the viewBox matched to the container's aspect ratio
    const resize = () => {
      const { width, height } = svg.getBoundingClientRect();
      const vb = coverViewBox(content, width, height);
      view.current = vb;
      svg.setAttribute(
        'viewBox',
        `${vb.x.toFixed(2)} ${vb.y.toFixed(2)} ${vb.width.toFixed(2)} ${vb.height.toFixed(2)}`,
      );
      set(viewport.current);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(svg);
    resize();

    // --- coordinate helpers
    const toViewBox = (clientX: number, clientY: number) => {
      const ctm = svg.getScreenCTM();
      if (!ctm) return { x: 0, y: 0 };
      const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
      return { x: p.x, y: p.y };
    };
    const pxToUnits = () => view.current.width / Math.max(svg.clientWidth, 1);

    // --- wheel / trackpad
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stopAnimation();
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      set(
        zoomAround(
          viewport.current,
          toViewBox(e.clientX, e.clientY),
          Math.exp(-delta * WHEEL_SENSITIVITY),
          limits,
        ),
      );
    };

    // --- pointers (mouse, pen, touch): drag + pinch
    const pointers = new Map<number, { x: number; y: number }>();
    let dragged = false;
    let travel = 0;
    let pinch: { distance: number; center: { x: number; y: number } } | null = null;

    const pinchState = () => {
      const [a, b] = [...pointers.values()];
      if (!a || !b) return null;
      return {
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        center: toViewBox((a.x + b.x) / 2, (a.y + b.y) / 2),
      };
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      stopAnimation();
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) {
        dragged = false;
        travel = 0;
      }
      if (pointers.size === 2) pinch = pinchState();
    };

    const onPointerMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      const next = { x: e.clientX, y: e.clientY };
      pointers.set(e.pointerId, next);

      if (pointers.size >= 2 && pinch) {
        const current = pinchState();
        if (!current) return;
        let v = zoomAround(
          viewport.current,
          pinch.center,
          current.distance / Math.max(pinch.distance, 1),
          limits,
        );
        v = panBy(v, current.center.x - pinch.center.x, current.center.y - pinch.center.y);
        pinch = current;
        dragged = true;
        set(v);
        return;
      }

      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      travel += Math.hypot(dx, dy);
      if (!dragged && travel < dragThreshold) return;
      if (!dragged) {
        dragged = true;
        svg.setPointerCapture(e.pointerId);
        svg.dataset['dragging'] = 'true';
      }
      const s = pxToUnits();
      set(panBy(viewport.current, dx * s, dy * s));
    };

    const onPointerUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (svg.hasPointerCapture(e.pointerId)) svg.releasePointerCapture(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 0) delete svg.dataset['dragging'];
    };

    // A click that ends a drag must not select the province under the cursor.
    const onClickCapture = (e: MouseEvent) => {
      if (dragged) {
        e.stopPropagation();
        e.preventDefault();
        dragged = false;
      }
    };

    const onDoubleClick = (e: MouseEvent) => {
      e.preventDefault();
      const anchor = toViewBox(e.clientX, e.clientY);
      animateTo(zoomAround(viewport.current, anchor, e.shiftKey ? 0.5 : 2, limits));
    };

    svg.addEventListener('wheel', onWheel, { passive: false });
    svg.addEventListener('pointerdown', onPointerDown);
    svg.addEventListener('pointermove', onPointerMove);
    svg.addEventListener('pointerup', onPointerUp);
    svg.addEventListener('pointercancel', onPointerUp);
    svg.addEventListener('click', onClickCapture, { capture: true });
    svg.addEventListener('dblclick', onDoubleClick);

    return () => {
      observer.disconnect();
      svg.removeEventListener('wheel', onWheel);
      svg.removeEventListener('pointerdown', onPointerDown);
      svg.removeEventListener('pointermove', onPointerMove);
      svg.removeEventListener('pointerup', onPointerUp);
      svg.removeEventListener('pointercancel', onPointerUp);
      svg.removeEventListener('click', onClickCapture, { capture: true });
      svg.removeEventListener('dblclick', onDoubleClick);
      stopAnimation();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [animateTo, content, dragThreshold, limits, set, stopAnimation, svgRef]);

  return useMemo<PanZoomControls>(
    () => ({
      zoomBy: (factor) => {
        const vb = view.current;
        animateTo(
          zoomAround(viewport.current, { x: vb.x + vb.width / 2, y: vb.y + vb.height / 2 }, factor, limits),
        );
      },
      reset: () => {
        animateTo(IDENTITY);
      },
      flyToBounds: (bounds, { padding = 60, insets = {} } = {}) => {
        const visible = shrinkByInsets(view.current, insets, svgRef.current);
        animateTo(fitBounds(bounds, visible, padding, { ...limits, maxK: Math.min(limits.maxK, 8) }));
      },
      getViewport: () => viewport.current,
    }),
    [animateTo, limits, svgRef],
  );
}

/** Convert CSS-px insets into map units and remove them from the view rect. */
function shrinkByInsets(view: Rect, insets: Insets, svg: SVGSVGElement | null): Rect {
  const width = svg?.clientWidth ?? 0;
  if (width === 0) return view;
  const unit = view.width / width;
  const top = (insets.top ?? 0) * unit;
  const right = (insets.right ?? 0) * unit;
  const bottom = (insets.bottom ?? 0) * unit;
  const left = (insets.left ?? 0) * unit;
  // Never shrink below 30% of the view: a huge overlay should not zoom the map out to nothing.
  const w = Math.max(view.width - left - right, view.width * 0.3);
  const h = Math.max(view.height - top - bottom, view.height * 0.3);
  return { x: view.x + left, y: view.y + top, width: w, height: h };
}
