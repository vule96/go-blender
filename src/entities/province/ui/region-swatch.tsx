import type { Region } from '../model/provinces';

/** A small square of the region's paper, tying list headings to the colours on the map. */
export function RegionSwatch({ region }: { readonly region: Region }) {
  return (
    <span
      aria-hidden="true"
      data-region={region}
      className="inline-block size-2.5 shrink-0 rounded-[2px] bg-(--paper) ring-1 ring-black/20"
    />
  );
}
