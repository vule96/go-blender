import type { Region } from '../model/provinces';

/** A dot in the region's map colour, tying text back to the map. */
export function RegionSwatch({ region }: { readonly region: Region }) {
  return (
    <span
      aria-hidden="true"
      data-region={region}
      className="inline-block size-3 shrink-0 rounded-full bg-(--region) ring-2 ring-white"
    />
  );
}
