'use client';

import type { PanZoomControls } from '../hooks/use-pan-zoom';

interface MapControlsProps {
  readonly controls: PanZoomControls;
}

const BUTTON =
  'grid size-10 place-items-center rounded-xl bg-white/90 text-lg font-bold text-ink shadow-md ring-1 ring-black/5 backdrop-blur transition hover:bg-white active:scale-95';

export function MapControls({ controls }: MapControlsProps) {
  return (
    <div className="pointer-events-auto flex flex-col gap-2">
      <button
        type="button"
        className={BUTTON}
        aria-label="Phóng to"
        onClick={() => {
          controls.zoomBy(1.6);
        }}
      >
        +
      </button>
      <button
        type="button"
        className={BUTTON}
        aria-label="Thu nhỏ"
        onClick={() => {
          controls.zoomBy(1 / 1.6);
        }}
      >
        −
      </button>
      <button
        type="button"
        className={BUTTON}
        aria-label="Xem toàn bộ bản đồ"
        onClick={() => {
          controls.reset();
        }}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          aria-hidden="true"
        >
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
