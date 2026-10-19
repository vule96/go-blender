import { describe, expect, it } from 'vitest';

import { constrain, coverViewBox, fitBounds, IDENTITY, interpolate, type Rect, zoomAround } from './viewport';

const LIMITS = { minK: 1, maxK: 10 };
const CONTENT: Rect = { x: 0, y: 0, width: 1000, height: 1200 };

describe('zoomAround', () => {
  it('keeps the anchor point fixed', () => {
    const anchor = { x: 300, y: 400 };
    const v = zoomAround(IDENTITY, anchor, 2, LIMITS);
    // map point (300,400) must still project to (300,400)
    expect(300 * v.k + v.x).toBeCloseTo(300);
    expect(400 * v.k + v.y).toBeCloseTo(400);
    expect(v.k).toBe(2);
  });

  it('respects zoom limits', () => {
    expect(zoomAround(IDENTITY, { x: 0, y: 0 }, 0.1, LIMITS).k).toBe(1);
    expect(zoomAround(IDENTITY, { x: 0, y: 0 }, 100, LIMITS).k).toBe(10);
  });
});

describe('constrain', () => {
  it('keeps content that is smaller than the view entirely inside it', () => {
    const view: Rect = { x: -500, y: 0, width: 2000, height: 1200 };
    const v = constrain({ x: 999, y: 999, k: 1 }, CONTENT, view, LIMITS);
    expect(v.x).toBe(500); // right edge of the content on the right edge of the view
    expect(v.y).toBe(0);
    // ...but it may move freely within the view
    expect(constrain({ x: -200, y: 0, k: 1 }, CONTENT, view, LIMITS).x).toBe(-200);
  });

  it('stops edges from entering the view when zoomed in', () => {
    const v = constrain({ x: 500, y: 0, k: 2 }, CONTENT, CONTENT, LIMITS);
    expect(v.x).toBe(0); // left edge pinned to the view's left edge
  });
});

describe('fitBounds', () => {
  it('frames the bounds in the centre of the view', () => {
    const v = fitBounds([100, 100, 200, 200], CONTENT, 0, LIMITS);
    const cx = 150 * v.k + v.x;
    const cy = 150 * v.k + v.y;
    expect(cx).toBeCloseTo(500);
    expect(cy).toBeCloseTo(600);
    expect(v.k).toBe(10); // 1000/100 = 10, clamped to maxK
  });
});

describe('interpolate', () => {
  it('returns the endpoints at t = 0 and t = 1', () => {
    const b = { x: -200, y: -300, k: 3 };
    expect(interpolate(IDENTITY, b, 0, CONTENT)).toMatchObject(IDENTITY);
    const end = interpolate(IDENTITY, b, 1, CONTENT);
    expect(end.k).toBeCloseTo(3);
    expect(end.x).toBeCloseTo(-200);
    expect(end.y).toBeCloseTo(-300);
  });
});

describe('coverViewBox', () => {
  it('widens the viewBox for wide containers', () => {
    const vb = coverViewBox(CONTENT, 2000, 1200);
    expect(vb.height).toBe(1200);
    expect(vb.width).toBe(2000);
    expect(vb.x).toBe(-500);
  });
});
