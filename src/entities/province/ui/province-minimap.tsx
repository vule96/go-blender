import type { CSSProperties } from 'react';

import { VIETNAM_MAP } from '../data/vietnam-map';
import { regionFill } from '../lib/region-fill';
import { findProvince, type ProvinceId, type ProvinceMeta } from '../model/provinces';

interface ProvinceMinimapProps {
  readonly provinceId: ProvinceId;
  readonly className?: string;
}

const FILLS = new Map(
  VIETNAM_MAP.provinces.map((p) => {
    const province = findProvince(p.id);
    return [p.id, province ? regionFill(province.region, province.order) : '#ccc'] as const;
  }),
);

/** Where each province's name goes (same anchor and nudges as the main map). */
const LABELS = VIETNAM_MAP.provinces.map((p) => {
  const province: ProvinceMeta | undefined = findProvince(p.id);
  const [dx, dy] = province?.labelOffset ?? [0, 0];
  return { id: p.id, name: province?.name ?? p.id, x: p.label[0] + dx, y: p.label[1] + dy };
});

/**
 * Server-rendered locator: the province in full colour and lifted, its
 * neighbours faded, each named so the reader knows what surrounds it.
 */
export function ProvinceMinimap({ provinceId, className }: ProvinceMinimapProps) {
  const shape = VIETNAM_MAP.provinces.find((p) => p.id === provinceId);
  if (!shape) return null;

  const [x0, y0, x1, y1] = shape.bounds;
  const size = Math.max(x1 - x0, y1 - y0) * 1.8 + 40;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  return (
    <svg
      viewBox={`${String(cx - size / 2)} ${String(cy - size / 2)} ${String(size)} ${String(size)}`}
      className={className}
      overflow="visible"
      role="img"
      aria-label={`Vị trí của ${findProvince(provinceId)?.name ?? ''} trên bản đồ`}
    >
      <path
        d={VIETNAM_MAP.land}
        fill="rgb(5 35 55 / 0.4)"
        stroke="rgb(155 231 242 / 0.22)"
        strokeWidth={9}
        vectorEffect="non-scaling-stroke"
        transform="translate(0 3)"
      />
      {VIETNAM_MAP.provinces.map((p) => (
        <path
          key={p.id}
          d={p.d}
          fill={FILLS.get(p.id)}
          opacity={0.55}
          stroke="#fff"
          strokeOpacity={0.8}
          strokeWidth={0.8}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <path
        d={shape.d}
        fill={FILLS.get(provinceId)}
        stroke="#fff"
        strokeWidth={3}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        transform="translate(0 -2)"
        style={{ filter: 'drop-shadow(0 6px 5px rgb(5 35 55 / 0.55))' }}
      />
      {/* Font size is in map units, proportional to the framed area (see .minimap-labels), so names keep the same on-screen size for any province. */}
      <g className="minimap-labels" aria-hidden="true" style={{ '--minimap-size': size } as CSSProperties}>
        {LABELS.filter(
          (l) => l.id !== provinceId && Math.abs(l.x - cx) < size * 0.46 && Math.abs(l.y - cy) < size * 0.48,
        ).map((l) => (
          <text key={l.id} x={l.x} y={l.y} className="minimap-label">
            {l.name}
          </text>
        ))}
        {LABELS.filter((l) => l.id === provinceId).map((l) => (
          <text key={l.id} x={l.x} y={l.y - 2} className="minimap-label minimap-label-selected">
            {l.name}
          </text>
        ))}
      </g>
    </svg>
  );
}
