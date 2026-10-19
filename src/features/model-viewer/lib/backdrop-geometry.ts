/*
 * Procedural shapes for the outdoor backdrop: mountain ridges, rolling hills,
 * a forest edge, clouds and stars. Generated once at module load from fixed
 * seeds with integer-only randomness and rounded coordinates, so the server
 * and every browser produce byte-identical SVG (no hydration mismatch).
 */

export const VIEW_W = 1600;
export const VIEW_H = 900;

/** mulberry32: a tiny deterministic PRNG built on 32-bit integer ops. */
function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (v: number) => Math.round(v * 10) / 10;

interface Point {
  readonly x: number;
  readonly y: number;
}

/** A ridge line across the full width by midpoint displacement. */
function ridge(seed: number, baseY: number, amplitude: number, roughness: number, depth: number): Point[] {
  const rand = prng(seed);
  const n = 2 ** depth;
  const ys = new Array<number>(n + 1).fill(baseY);
  ys[0] = baseY + (rand() - 0.5) * amplitude;
  ys[n] = baseY + (rand() - 0.5) * amplitude;
  let step = n;
  let amp = amplitude;
  while (step > 1) {
    const half = step / 2;
    for (let i = half; i < n; i += step) {
      ys[i] = ((ys[i - half] ?? baseY) + (ys[i + half] ?? baseY)) / 2 + (rand() - 0.5) * amp;
    }
    amp *= roughness;
    step = half;
  }
  const x0 = -40;
  const span = VIEW_W + 80;
  return ys.map((y, i) => ({ x: r1(x0 + (i / n) * span), y: r1(y) }));
}

/** Height of a ridge at x (linear interpolation). */
function heightAt(points: readonly Point[], x: number): number {
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (a && b && x <= b.x) return a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x);
  }
  return points.at(-1)?.y ?? VIEW_H;
}

const closeToBottom = (points: readonly Point[]) =>
  `L${String(points.at(-1)?.x ?? VIEW_W)} ${String(VIEW_H)}L${String(points[0]?.x ?? 0)} ${String(VIEW_H)}Z`;

/** Jagged outline (straight segments): distant mountains. */
function jaggedFill(points: readonly Point[]): string {
  return `M${points.map((p) => `${String(p.x)} ${String(p.y)}`).join('L')}${closeToBottom(points)}`;
}

/** Smooth outline (Catmull-Rom as cubic Béziers): rolling hills. */
function smoothFill(points: readonly Point[]): string {
  let d = `M${String(points[0]?.x)} ${String(points[0]?.y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    if (!p0 || !p1 || !p2 || !p3) continue;
    const c1x = r1(p1.x + (p2.x - p0.x) / 6);
    const c1y = r1(p1.y + (p2.y - p0.y) / 6);
    const c2x = r1(p2.x - (p3.x - p1.x) / 6);
    const c2y = r1(p2.y - (p3.y - p1.y) / 6);
    d += `C${String(c1x)} ${String(c1y)} ${String(c2x)} ${String(c2y)} ${String(p2.x)} ${String(p2.y)}`;
  }
  return d + closeToBottom(points);
}

/** A forest edge of overlapping rounded crowns standing on a ridge. */
function forestEdge(
  seed: number,
  ground: readonly Point[],
  from: number,
  to: number,
  minR: number,
  maxR: number,
) {
  const rand = prng(seed);
  const base = (x: number) => r1(heightAt(ground, x) + 26);
  let d = `M${String(from)} ${String(base(from))}`;
  let x = from;
  while (x < to) {
    const r = minR + rand() * (maxR - minR);
    const cx = x + r * 0.8;
    const cy = r1(heightAt(ground, cx) - r * (0.55 + rand() * 0.6));
    d += `L${String(r1(cx - r))} ${String(cy)}A${String(r1(r))} ${String(r1(r * 0.92))} 0 0 1 ${String(r1(cx + r))} ${String(cy)}`;
    x = cx + r * (0.35 + rand() * 0.45);
  }
  d += `L${String(r1(x))} ${String(base(x))}`;
  for (let gx = Math.floor(x / 40) * 40; gx > from; gx -= 40) d += `L${String(gx)} ${String(base(gx))}`;
  return `${d}Z`;
}

export interface Puff {
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
}

/** A cumulus: a flat-bottomed base and a heap of puffs on top. */
function cumulus(seed: number, x: number, y: number, w: number, h: number): Puff[] {
  const rand = prng(seed);
  const puffs: Puff[] = [{ cx: x, cy: y, rx: w / 2, ry: h * 0.22 }];
  const count = 5 + Math.floor(rand() * 4);
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const px = x - w * 0.42 + t * w * 0.84 + (rand() - 0.5) * w * 0.08;
    const lift = Math.sin(t * Math.PI) * h * (0.45 + rand() * 0.35);
    const r = h * (0.22 + rand() * 0.2) * (0.6 + Math.sin(t * Math.PI) * 0.6);
    puffs.push({ cx: r1(px), cy: r1(y - lift * 0.6), rx: r1(r * 1.15), ry: r1(r) });
  }
  return puffs.map((p) => ({ cx: r1(p.cx), cy: r1(p.cy), rx: r1(p.rx), ry: r1(p.ry) }));
}

export interface Star {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly o: number;
}

function starField(seed: number, count: number): Star[] {
  const rand = prng(seed);
  return Array.from({ length: count }, () => {
    const bright = rand() > 0.9;
    return {
      x: r1(rand() * VIEW_W),
      // Denser and brighter high up; they fade into the horizon glow.
      y: r1(rand() ** 1.6 * 560),
      r: r1(bright ? 1.3 + rand() * 0.8 : 0.5 + rand() * 0.7),
      o: r1(bright ? 0.85 + rand() * 0.15 : 0.35 + rand() * 0.45),
    };
  });
}

const FAR_RIDGE = ridge(11, 505, 150, 0.56, 7);
const MID_RIDGE = ridge(23, 568, 110, 0.5, 6);
const HILLS = ridge(37, 628, 60, 0.45, 4);
const NEAR = ridge(41, 682, 30, 0.4, 3);

export const BACKDROP = {
  farMountains: jaggedFill(FAR_RIDGE),
  midMountains: jaggedFill(MID_RIDGE),
  hills: smoothFill(HILLS),
  forest: forestEdge(53, HILLS, -40, VIEW_W + 40, 9, 22),
  meadow: smoothFill(NEAR),
  clouds: [
    { key: 'c1', puffs: cumulus(61, 300, 230, 330, 120) },
    { key: 'c2', puffs: cumulus(67, 860, 150, 260, 95) },
    { key: 'c3', puffs: cumulus(71, 1380, 270, 380, 130) },
    { key: 'c4', puffs: cumulus(73, 620, 360, 200, 60) },
    { key: 'c5', puffs: cumulus(79, 1130, 380, 180, 52) },
  ],
  /** Thin high-altitude streaks (cirrus): [cx, cy, rx, ry]. */
  cirrus: [
    [520, 90, 260, 7],
    [1240, 70, 220, 6],
    [980, 120, 160, 5],
  ] as const,
  stars: starField(97, 170),
} as const;
