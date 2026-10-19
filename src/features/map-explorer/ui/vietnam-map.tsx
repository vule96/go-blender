'use client';

import { type RefObject, useEffect, useRef } from 'react';

import { findProvince, getProvinceShape, VIETNAM_MAP } from '@/entities/province';

import { usePanZoom } from '../hooks/use-pan-zoom';
import type { Rect } from '../lib/viewport';
import { useMapStore } from '../model/map-store';
import { MapControls } from './map-controls';
import { MapLabels } from './map-labels';
import { ProvinceLayer } from './province-layer';

const [, , MAP_W, MAP_H] = VIETNAM_MAP.viewBox;
const CONTENT: Rect = { x: 0, y: 0, width: MAP_W, height: MAP_H };
const GRID_STEP = 50;

interface VietnamMapProps {
  /** An element floating over the map (e.g. a mobile bottom sheet); the camera keeps selections clear of it. */
  readonly occluderRef?: RefObject<HTMLElement | null>;
}

export function VietnamMap({ occluderRef }: VietnamMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const layerRef = useRef<SVGGElement>(null);
  const controls = usePanZoom(svgRef, layerRef, { content: CONTENT });

  const selectedId = useMapStore((s) => s.selectedId);
  const hoveredId = useMapStore((s) => s.hoveredId);
  const select = useMapStore((s) => s.select);
  const hover = useMapStore((s) => s.hover);

  // Camera follows the selection.
  useEffect(() => {
    const shape = selectedId ? getProvinceShape(selectedId) : undefined;
    if (shape) controls.flyToBounds(shape.bounds, { insets: { bottom: overlapFromBottom() } });
    else controls.reset();

    function overlapFromBottom(): number {
      const svg = svgRef.current;
      const occluder = occluderRef?.current;
      if (!svg || !occluder) return 0;
      const a = svg.getBoundingClientRect();
      const b = occluder.getBoundingClientRect();
      const overlapsHorizontally = b.left < a.right && b.right > a.left;
      return overlapsHorizontally ? Math.max(0, a.bottom - b.top) : 0;
    }
  }, [controls, occluderRef, selectedId]);

  const hovered = findProvince(hoveredId);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <svg
        ref={svgRef}
        className="map-svg size-full touch-none select-none"
        viewBox={VIETNAM_MAP.viewBox.join(' ')}
        role="group"
        aria-label="Bản đồ hành chính Việt Nam: 34 tỉnh, thành"
      >
        <defs>
          <radialGradient id="reef-glow">
            <stop offset="0" stopColor="#9be7f2" stopOpacity="0.35" />
            <stop offset="1" stopColor="#9be7f2" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g ref={layerRef}>
          <path
            className="map-grid"
            d={Array.from(
              { length: Math.ceil(MAP_W / GRID_STEP) + 21 },
              (_, i) => `M${(i - 10) * GRID_STEP} -500V${MAP_H + 500}`,
            )
              .concat(
                Array.from(
                  { length: Math.ceil(MAP_H / GRID_STEP) + 21 },
                  (_, i) => `M-500 ${(i - 10) * GRID_STEP}H${MAP_W + 500}`,
                ),
              )
              .join('')}
          />
          {VIETNAM_MAP.archipelagos.map((a) => {
            const [x0, y0, x1, y1] = a.bounds;
            return (
              <ellipse
                key={a.id}
                cx={(x0 + x1) / 2}
                cy={(y0 + y1) / 2}
                rx={(x1 - x0) / 2 + 30}
                ry={(y1 - y0) / 2 + 30}
                fill="url(#reef-glow)"
              />
            );
          })}
          <ProvinceLayer selectedId={selectedId} onSelect={select} onHover={hover} />
          <MapLabels />
        </g>
      </svg>

      <div className="pointer-events-none absolute top-4 right-4 z-10">
        <MapControls controls={controls} />
      </div>

      <div
        aria-live="polite"
        className="pointer-events-none absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 font-display text-sm font-bold text-ink shadow-md transition-opacity data-[visible=false]:opacity-0"
        data-visible={hovered ? 'true' : 'false'}
      >
        {hovered?.name ?? ''}
      </div>

      <p className="pointer-events-none absolute bottom-2 left-3 z-10 max-w-[70%] text-[10px] leading-tight text-white/70">
        {VIETNAM_MAP.attribution}
      </p>
    </div>
  );
}
