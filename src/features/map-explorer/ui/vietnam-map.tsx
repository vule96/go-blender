'use client';

import { type RefObject, useCallback, useEffect, useRef } from 'react';

import { getProvinceShape, VIETNAM_MAP } from '@/entities/province/data/vietnam-map';
import { findProvince, type ProvinceId } from '@/entities/province/model/provinces';
import type { Bounds } from '@/shared/lib/types';

import { usePanZoom } from '../hooks/use-pan-zoom';
import type { Rect } from '../lib/viewport';
import { useMapStore } from '../model/map-store';
import { MapControls } from './map-controls';
import { MapGraticule } from './map-graticule';
import { MapLabels } from './map-labels';
import { ProvinceLayer } from './province-layer';

const [, , MAP_W, MAP_H] = VIETNAM_MAP.viewBox;
const CONTENT: Rect = { x: 0, y: 0, width: MAP_W, height: MAP_H };
const VIEW_BOX = VIETNAM_MAP.viewBox.join(' ');

/** Shallow-water glow around the two archipelagos. */
const reefs = VIETNAM_MAP.archipelagos.map((a) => {
  const [x0, y0, x1, y1] = a.bounds;
  return (
    <ellipse
      key={a.id}
      cx={(x0 + x1) / 2}
      cy={(y0 + y1) / 2}
      rx={(x1 - x0) / 2 + 30}
      ry={(y1 - y0) / 2 + 30}
      fill="url(#reef-glow)"
      aria-hidden="true"
    />
  );
});

/** The whole country, archipelagos included: what "show everything" frames. */
const HOME_BOUNDS: Bounds = [...VIETNAM_MAP.provinces, ...VIETNAM_MAP.archipelagos].reduce<Bounds>(
  ([ax0, ay0, ax1, ay1], { bounds: [x0, y0, x1, y1] }) => [
    Math.min(ax0, x0),
    Math.min(ay0, y0),
    Math.max(ax1, x1),
    Math.max(ay1, y1),
  ],
  [Infinity, Infinity, -Infinity, -Infinity],
);

interface VietnamMapProps {
  /** An element floating over the map (e.g. a mobile bottom sheet); the camera keeps selections clear of it. */
  readonly occluderRef?: RefObject<HTMLElement | null>;
}

export function VietnamMap({ occluderRef }: VietnamMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const layerRef = useRef<SVGGElement>(null);
  const controls = usePanZoom(svgRef, layerRef, { content: CONTENT });

  const selectedId = useMapStore((s) => s.selectedId);
  const select = useMapStore((s) => s.select);
  const hover = useMapStore((s) => s.hover);

  const positioned = useRef(false);

  // Camera follows the selection; with nothing selected it frames the whole country.
  // Both keep clear of whatever overlays the bottom of the map (the mobile sheet).
  const frame = useCallback(
    (id: ProvinceId | null) => {
      const insets = { bottom: overlapFromBottom(svgRef.current, occluderRef?.current) };
      const animate = positioned.current;
      positioned.current = true;
      const shape = id ? getProvinceShape(id) : undefined;
      if (shape) controls.flyToBounds(shape.bounds, { insets, animate });
      else controls.flyToBounds(HOME_BOUNDS, { insets, animate, padding: 16 });
    },
    [controls, occluderRef],
  );

  useEffect(() => {
    frame(selectedId);
  }, [frame, selectedId]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <svg
        ref={svgRef}
        className="map-svg size-full touch-none select-none"
        viewBox={VIEW_BOX}
        role="group"
        aria-label="Bản đồ hành chính Việt Nam, 34 tỉnh và thành phố"
      >
        <defs>
          <radialGradient id="reef-glow">
            <stop offset="0" stopColor="#9be7f2" stopOpacity="0.35" />
            <stop offset="1" stopColor="#9be7f2" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g ref={layerRef}>
          <MapGraticule />
          {reefs}
          <ProvinceLayer selectedId={selectedId} onSelect={select} onHover={hover} />
          <MapLabels />
        </g>
      </svg>

      <div className="pointer-events-none absolute top-3 left-3 z-10">
        <MapControls
          controls={controls}
          onShowAll={() => {
            frame(null);
          }}
        />
      </div>

      <HoverTag />

      <p className="pointer-events-none absolute bottom-2 left-3 z-10 max-w-[60%] text-[10px] leading-tight text-white/70">
        {VIETNAM_MAP.attribution}
      </p>
    </div>
  );
}

/**
 * Name tag for the province under the pointer. Lives in its own component so
 * hovering re-renders only this tag, not the map.
 */
function HoverTag() {
  const hovered = useMapStore((s) => findProvince(s.hoveredId));
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/95 px-3.5 py-1 font-display text-sm font-bold text-ink shadow-md transition-opacity data-[visible=false]:opacity-0"
      data-visible={hovered ? 'true' : 'false'}
    >
      {hovered?.name ?? ''}
    </div>
  );
}

/** How much of the map (in CSS px) an overlay hides along the bottom edge. */
function overlapFromBottom(svg: SVGSVGElement | null, occluder: HTMLElement | null | undefined): number {
  if (!svg || !occluder) return 0;
  const a = svg.getBoundingClientRect();
  const b = occluder.getBoundingClientRect();
  const overlapsHorizontally = b.left < a.right && b.right > a.left;
  return overlapsHorizontally ? Math.max(0, a.bottom - b.top) : 0;
}
