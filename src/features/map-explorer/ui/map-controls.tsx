'use client';

import type { PanZoomControls } from '../hooks/use-pan-zoom';

interface MapControlsProps {
  readonly controls: PanZoomControls;
  /** Frame the whole country (the map knows about overlays; the hook does not). */
  readonly onShowAll: () => void;
}

const BUTTON =
  'grid size-9 place-items-center bg-paper text-ink transition-colors hover:bg-white active:bg-paper-white';

/** Zoom in, zoom out, show everything: three paper squares stacked into one strip. */
export function MapControls({ controls, onShowAll }: MapControlsProps) {
  return (
    <div className="pointer-events-auto flex flex-col divide-y divide-rule overflow-hidden rounded-md shadow-[2px_3px_0_rgb(8_28_22/0.45)]">
      <button
        type="button"
        className={BUTTON}
        aria-label="Phóng to"
        onClick={() => {
          controls.zoomBy(1.6);
        }}
      >
        <svg
          viewBox="0 0 16 16"
          className="size-4"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M8 3v10M3 8h10" strokeLinecap="round" />
        </svg>
      </button>
      <button
        type="button"
        className={BUTTON}
        aria-label="Thu nhỏ"
        onClick={() => {
          controls.zoomBy(1 / 1.6);
        }}
      >
        <svg
          viewBox="0 0 16 16"
          className="size-4"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M3 8h10" strokeLinecap="round" />
        </svg>
      </button>
      <button type="button" className={BUTTON} aria-label="Xem toàn bộ bản đồ" onClick={onShowAll}>
        <svg
          viewBox="0 0 16 16"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <path
            d="M2.5 6V2.5H6M13.5 6V2.5H10M2.5 10v3.5H6M13.5 10v3.5H10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
