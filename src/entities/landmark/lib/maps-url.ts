import type { Landmark } from '@/entities/landmark/model/landmark';

/**
 * A Google Maps link that opens the place itself, as if the visitor had searched
 * for it, instead of dropping a pin on raw coordinates (which lands a little off
 * and shows no place details).
 * https://developers.google.com/maps/documentation/urls/get-started#search-action
 */
export function googleMapsUrl(landmark: Pick<Landmark, 'name' | 'mapsQuery'>, provinceName: string): string {
  const query = landmark.mapsQuery ?? `${landmark.name}, ${provinceName}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
