import type { Bounds, Point } from '@/shared/lib/types';

import type { ProvinceId } from '../model/provinces';
import raw from './vietnam-map.generated.json';

/**
 * Pre-projected map geometry produced by `npm run map:build`.
 * All coordinates are in viewBox units; nothing is projected in the browser.
 */
export interface ProvinceShape {
  readonly id: ProvinceId;
  /** SVG path data for the province (all of its polygons). */
  readonly d: string;
  /** Label anchor: centroid of the province's largest polygon. */
  readonly label: Point;
  readonly bounds: Bounds;
}

export interface ArchipelagoShape {
  readonly id: 'hoang-sa' | 'truong-sa';
  readonly name: string;
  readonly belongsTo: ProvinceId;
  readonly islands: readonly Point[];
  readonly bounds: Bounds;
}

export interface VietnamMapData {
  readonly version: number;
  readonly generatedAt: string;
  readonly attribution: string;
  readonly viewBox: readonly [0, 0, number, number];
  readonly provinces: readonly ProvinceShape[];
  /** Internal borders between provinces, drawn once (no double strokes). */
  readonly borders: string;
  /** Outer coastline / national border. */
  readonly coastline: string;
  readonly archipelagos: readonly ArchipelagoShape[];
}

// The JSON is generated from the typed province list, and
// `vietnam-map.test.ts` verifies the ids, so this narrowing is safe.
export const VIETNAM_MAP = raw as unknown as VietnamMapData;

const SHAPES = new Map<ProvinceId, ProvinceShape>(VIETNAM_MAP.provinces.map((s) => [s.id, s]));

export function getProvinceShape(id: ProvinceId): ProvinceShape | undefined {
  return SHAPES.get(id);
}
