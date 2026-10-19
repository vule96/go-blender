import type { Bounds } from '@/shared/lib/types';

/**
 * Pure 2D camera math for the map. A viewport is the transform applied to the
 * map layer: `translate(x, y) scale(k)`, all in viewBox units. Kept free of
 * DOM/React so it is trivially unit-testable and reusable (e.g. a game camera).
 */
export interface Viewport {
  readonly x: number;
  readonly y: number;
  readonly k: number;
}

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface ZoomLimits {
  readonly minK: number;
  readonly maxK: number;
}

export const IDENTITY: Viewport = { x: 0, y: 0, k: 1 };

export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/** Zoom by `factor`, keeping the map point under `anchor` fixed on screen. */
export function zoomAround(
  v: Viewport,
  anchor: { readonly x: number; readonly y: number },
  factor: number,
  limits: ZoomLimits,
): Viewport {
  const k = clamp(v.k * factor, limits.minK, limits.maxK);
  const ratio = k / v.k;
  return { k, x: anchor.x - (anchor.x - v.x) * ratio, y: anchor.y - (anchor.y - v.y) * ratio };
}

export function panBy(v: Viewport, dx: number, dy: number): Viewport {
  return { ...v, x: v.x + dx, y: v.y + dy };
}

/**
 * Keep the content (`content`, before transform) usefully in the visible `view`.
 * Along an axis where the scaled content is smaller than the view, it may move
 * but must stay entirely inside (so it can sit above a bottom sheet); where it
 * is larger, its edges may not move inside the view.
 */
export function constrain(v: Viewport, content: Rect, view: Rect, limits: ZoomLimits): Viewport {
  const k = clamp(v.k, limits.minK, limits.maxK);
  const axis = (pos: number, cStart: number, cSize: number, vStart: number, vSize: number): number => {
    const scaled = cSize * k;
    const alignStart = vStart - cStart * k; // content's start edge on the view's start edge
    const alignEnd = vStart + vSize - (cStart + cSize) * k; // content's end edge on the view's end edge
    return scaled <= vSize ? clamp(pos, alignStart, alignEnd) : clamp(pos, alignEnd, alignStart);
  };
  return {
    k,
    x: axis(v.x, content.x, content.width, view.x, view.width),
    y: axis(v.y, content.y, content.height, view.y, view.height),
  };
}

/** Viewport that frames `bounds` inside `view` with `padding` (viewBox units). */
export function fitBounds(bounds: Bounds, view: Rect, padding: number, limits: ZoomLimits): Viewport {
  const [x0, y0, x1, y1] = bounds;
  const w = Math.max(x1 - x0, 1e-6);
  const h = Math.max(y1 - y0, 1e-6);
  const k = clamp(
    Math.min((view.width - padding * 2) / w, (view.height - padding * 2) / h),
    limits.minK,
    limits.maxK,
  );
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return { k, x: view.x + view.width / 2 - cx * k, y: view.y + view.height / 2 - cy * k };
}

/**
 * Interpolate between viewports so the zoom feels linear: scale is
 * interpolated in log space and the screen-space centre linearly.
 */
export function interpolate(a: Viewport, b: Viewport, t: number, view: Rect): Viewport {
  const k = Math.exp(Math.log(a.k) + (Math.log(b.k) - Math.log(a.k)) * t);
  const cx = view.x + view.width / 2;
  const cy = view.y + view.height / 2;
  // map-space point at the centre of the view for each viewport
  const ax = (cx - a.x) / a.k;
  const ay = (cy - a.y) / a.k;
  const bx = (cx - b.x) / b.k;
  const by = (cy - b.y) / b.k;
  const mx = ax + (bx - ax) * t;
  const my = ay + (by - ay) * t;
  return { k, x: cx - mx * k, y: cy - my * k };
}

export const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function toTransform(v: Viewport): string {
  return `translate(${v.x.toFixed(2)} ${v.y.toFixed(2)}) scale(${v.k.toFixed(4)})`;
}

/**
 * Viewport-independent viewBox that covers a container of `width × height`
 * pixels while fully showing `content` (like `preserveAspectRatio="meet"`,
 * but the extra room becomes usable map space instead of letterboxing).
 */
export function coverViewBox(content: Rect, width: number, height: number): Rect {
  if (width <= 0 || height <= 0) return content;
  const containerAspect = width / height;
  const contentAspect = content.width / content.height;
  if (containerAspect > contentAspect) {
    const w = content.height * containerAspect;
    return { x: content.x - (w - content.width) / 2, y: content.y, width: w, height: content.height };
  }
  const h = content.width / containerAspect;
  return { x: content.x, y: content.y - (h - content.height) / 2, width: content.width, height: h };
}
