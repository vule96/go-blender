import { type CSSProperties, memo } from 'react';

import { findProvince, type ProvinceMeta, VIETNAM_MAP } from '@/entities/province';

/**
 * Small provinces in dense areas (Red River delta, Mekong delta) whose names
 * would collide at full view. They are revealed once the map is zoomed in.
 */
const MINOR_LABEL_AREA = 5000;
const MINOR_LABELS: ReadonlySet<string> = new Set(
  VIETNAM_MAP.provinces
    .filter(({ id, bounds: [x0, y0, x1, y1] }) => id !== 'ha-noi' && (x1 - x0) * (y1 - y0) < MINOR_LABEL_AREA)
    .map((p) => p.id),
);

const SEA_LABELS = [
  { text: 'BIỂN ĐÔNG', x: 800, y: 790, size: 26, spacing: 10 },
  { text: 'Vịnh Bắc Bộ', x: 520, y: 290, size: 12, spacing: 2 },
  { text: 'Vịnh Thái Lan', x: 110, y: 1090, size: 12, spacing: 2 },
] as const;

/** Province names, archipelago names and sea labels. Never intercepts pointer events. */
export const MapLabels = memo(function MapLabels() {
  return (
    <g className="map-labels" aria-hidden="true">
      {SEA_LABELS.map((s) => (
        <text
          key={s.text}
          x={s.x}
          y={s.y}
          className="map-sea-label"
          style={
            {
              '--label-size': `${String(s.size)}px`,
              '--label-spacing': `${String(s.spacing)}px`,
            } as CSSProperties
          }
        >
          {s.text}
        </text>
      ))}
      {VIETNAM_MAP.archipelagos.map((a) => {
        const owner = findProvince(a.belongsTo);
        const [x0, , x1, y1] = a.bounds;
        return (
          <text key={a.id} x={(x0 + x1) / 2} y={y1 + 18} className="map-archipelago-label">
            <tspan x={(x0 + x1) / 2}>{a.name}</tspan>
            <tspan x={(x0 + x1) / 2} dy="1.2em" className="map-archipelago-owner">
              ({owner?.name})
            </tspan>
          </text>
        );
      })}
      {VIETNAM_MAP.provinces.map((shape) => {
        const province: ProvinceMeta | undefined = findProvince(shape.id);
        const [dx, dy] = province?.labelOffset ?? [0, 0];
        return (
          <text
            key={shape.id}
            x={shape.label[0] + dx}
            y={shape.label[1] + dy}
            className="map-province-label"
            data-minor={MINOR_LABELS.has(shape.id) || undefined}
          >
            {province?.name}
          </text>
        );
      })}
    </g>
  );
});
