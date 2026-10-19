'use client';

import { type CSSProperties, type KeyboardEvent, memo } from 'react';

import { getProvinceShape, VIETNAM_MAP } from '@/entities/province/data/vietnam-map';
import { regionFill } from '@/entities/province/lib/region-fill';
import { findProvince, isProvinceId, type ProvinceId } from '@/entities/province/model/provinces';

interface ProvinceLayerProps {
  readonly selectedId: ProvinceId | null;
  readonly onSelect: (id: ProvinceId) => void;
  readonly onHover: (id: ProvinceId | null) => void;
}

function provinceFromEvent(target: EventTarget | null): ProvinceId | null {
  const el = target instanceof Element ? target.closest<SVGElement>('[data-province]') : null;
  const id = el?.dataset['province'];
  return isProvinceId(id) ? id : null;
}

// Static per-province attributes, computed once.
const PIECES = VIETNAM_MAP.provinces.map((shape) => {
  const province = findProvince(shape.id);
  return {
    id: shape.id,
    d: shape.d,
    name: province?.name ?? shape.id,
    region: province?.region,
    style: (province ? { '--fill': regionFill(province.region, province.order) } : {}) as CSSProperties,
  };
});

const PIECE_STYLE = new Map(PIECES.map((p) => [p.id, p.style]));

const landShadow = <path className="map-land-shadow" d={VIETNAM_MAP.land} />;
const borders = <path className="map-borders" d={VIETNAM_MAP.borders} />;
const coastline = <path className="map-coastline" d={VIETNAM_MAP.coastline} />;

/**
 * All 34 provinces, their borders and the two archipelagos. Events are
 * delegated to the group (one listener instead of 34) and hover styling is
 * pure CSS, so hovering never re-renders React.
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

  const selectedShape = selectedId ? getProvinceShape(selectedId) : undefined;

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
      {landShadow}
      {PIECES.map((piece) => (
        <path
          key={piece.id}
          d={piece.d}
          data-province={piece.id}
          data-region={piece.region}
          className="map-province"
          style={piece.style}
          role="button"
          tabIndex={0}
          aria-label={piece.name}
          aria-pressed={piece.id === selectedId}
        />
      ))}
      {borders}
      {coastline}
      {VIETNAM_MAP.archipelagos.map((a) => (
        <g
          key={a.id}
          data-province={a.belongsTo}
          data-selected={a.belongsTo === selectedId || undefined}
          className="map-archipelago"
          role="button"
          tabIndex={0}
          aria-label={a.name}
        >
          {a.islands.map(([x, y]) => (
            <circle key={`${String(x)},${String(y)}`} cx={x} cy={y} r={2.4} className="map-island" />
          ))}
        </g>
      ))}
      {selectedShape ? (
        // Re-keyed per province so the lift animation replays on every new selection.
        <path
          key={selectedShape.id}
          d={selectedShape.d}
          data-region={findProvince(selectedShape.id)?.region}
          style={PIECE_STYLE.get(selectedShape.id)}
          className="map-province-lifted"
          aria-hidden="true"
        />
      ) : null}
    </g>
  );
});
