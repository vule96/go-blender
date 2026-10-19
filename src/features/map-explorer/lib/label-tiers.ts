/*
 * Label decluttering. Labels are placed greedily in the given order; a label
 * that would overlap one already placed is deferred to the next zoom tier,
 * where text is smaller relative to the map. CSS then reveals each tier via
 * `data-zoom` on the <svg> (see ZOOM_TIERS in use-pan-zoom.ts).
 */

export interface PlacedLabel {
  readonly id: string;
  readonly text: string;
  /** Anchor (text centre) in map units. */
  readonly x: number;
  readonly y: number;
}

interface Box {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}

export const LABEL_FONT = 13.5; // keep in sync with .map-province-label in globals.css
const LABEL_SHRINK = 0.65; // on screen, font size divides by k^0.65
const CHAR_WIDTH_EM = 0.46; // Archivo at 78% width, semibold
/** Zoom level at which each tier becomes visible. Must match ZOOM_TIERS. */
export const TIER_ZOOM = [1, 1.8, 3.5] as const;

function labelBox({ x, y, text }: PlacedLabel, k: number): Box {
  const size = LABEL_FONT / k ** LABEL_SHRINK;
  const halfW = (text.length * CHAR_WIDTH_EM * size) / 2 + size * 0.15;
  const halfH = size * 0.6;
  return { x0: x - halfW, y0: y - halfH, x1: x + halfW, y1: y + halfH };
}

const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

/** Returns the zoom tier (index into TIER_ZOOM) for every label, in priority order. */
export function assignLabelTiers(labels: readonly PlacedLabel[]): ReadonlyMap<string, number> {
  const placed: Box[][] = TIER_ZOOM.map(() => []);
  const tiers = new Map<string, number>();
  const last = TIER_ZOOM.length - 1;

  for (const label of labels) {
    const fits = (k: number, i: number) =>
      !(placed[i] ?? []).some((other) => overlaps(labelBox(label, k), other));
    const found = TIER_ZOOM.findIndex(fits);
    const tier = found === -1 ? last : found;
    // Once visible, a label stays visible at every deeper tier, so it occupies space there too.
    for (let i = tier; i <= last; i++) placed[i]?.push(labelBox(label, TIER_ZOOM[i] ?? 1));
    tiers.set(label.id, tier);
  }
  return tiers;
}
