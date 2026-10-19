'use client';

import { type KeyboardEvent, memo } from 'react';

import {
  findProvince,
  isProvinceId,
  type ProvinceId,
  PROVINCES,
  regionFill,
  VIETNAM_MAP,
} from '@/entities/province';

interface ProvinceLayerProps {
  readonly selectedId: ProvinceId | null;
  readonly onSelect: (id: ProvinceId) => void;
  readonly onHover: (id: ProvinceId | null) => void;
}

const FILLS = new Map(PROVINCES.map((p) => [p.id, regionFill(p.region, p.order)]));

function provinceFromEvent(target: EventTarget | null): ProvinceId | null {
  const el = target instanceof Element ? target.closest<SVGElement>('[data-province]') : null;
  const id = el?.dataset['province'];
  return isProvinceId(id) ? id : null;
}

/**
 * All 34 provinces + borders + archipelagos. Events are delegated to the
 * group (one listener instead of 34), and hover styling is pure CSS, so
 * hovering never re-renders React.
 */
export const ProvinceLayer = memo(function ProvinceLayer({
  selectedId,
  onSelect,
  onHover,
}: ProvinceLayerProps) {
  const handleKey = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const id = provinceFromEvent(e.target);
    if (id) {
      e.preventDefault();
      onSelect(id);
    }
  };

  return (
    <g
      className="map-provinces"
      data-has-selection={selectedId ? 'true' : undefined}
      onClick={(e) => {
        const id = provinceFromEvent(e.target);
        if (id) onSelect(id);
      }}
      onPointerOver={(e) => {
        onHover(provinceFromEvent(e.target));
      }}
      onPointerLeave={() => {
        onHover(null);
      }}
      onKeyDown={handleKey}
    >
      <path className="map-coast-shadow" d={VIETNAM_MAP.coastline} />
      {VIETNAM_MAP.provinces.map((shape) => {
        const province = findProvince(shape.id);
        return (
          <path
            key={shape.id}
            d={shape.d}
            data-province={shape.id}
            data-selected={shape.id === selectedId ? 'true' : undefined}
            className="map-province"
            style={{ fill: FILLS.get(shape.id) }}
            role="button"
            tabIndex={0}
            aria-label={province?.name ?? shape.id}
            aria-pressed={shape.id === selectedId}
          />
        );
      })}
      <path className="map-borders" d={VIETNAM_MAP.borders} />
      <path className="map-coastline" d={VIETNAM_MAP.coastline} />
      {VIETNAM_MAP.archipelagos.map((a) => (
        <g
          key={a.id}
          data-province={a.belongsTo}
          className="map-archipelago"
          role="button"
          tabIndex={0}
          aria-label={a.name}
        >
          {a.islands.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={2.2} className="map-island" />
          ))}
        </g>
      ))}
    </g>
  );
});
