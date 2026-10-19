import type { Region } from '../model/provinces';

/**
 * Each region has a family of fills; neighbouring provinces get different
 * shades (by their order) so borders stay readable without heavy strokes.
 */
const REGION_FILLS = {
  north: ['#9bd47a', '#86c766', '#b2df8a', '#79bb5c', '#a6d97f'],
  central: ['#f3cf6a', '#f0bd55', '#f7dc85', '#e9ae47', '#f5c962'],
  south: ['#f2a477', '#ec8f63', '#f6b98f', '#e88158', '#f0ab82'],
} as const satisfies Record<Region, readonly string[]>;

export function regionFill(region: Region, order: number): string {
  const fills = REGION_FILLS[region];
  return fills[order % fills.length] ?? fills[0];
}
