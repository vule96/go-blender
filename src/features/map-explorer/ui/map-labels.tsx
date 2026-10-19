import { type CSSProperties, memo } from 'react';

import { VIETNAM_MAP } from '@/entities/province/data/vietnam-map';
import { findProvince, type ProvinceMeta } from '@/entities/province/model/provinces';

import { assignLabelTiers } from '../lib/label-tiers';

const LABELS = VIETNAM_MAP.provinces
  .map((shape) => {
    const province: ProvinceMeta | undefined = findProvince(shape.id);
    const [dx, dy] = province?.labelOffset ?? [0, 0];
    const [x0, y0, x1, y1] = shape.bounds;
    return {
      id: shape.id,
      text: province?.name ?? shape.id,
      x: shape.label[0] + dx,
      y: shape.label[1] + dy,
      // Hà Nội is always placed first; then larger provinces win.
      priority: shape.id === 'ha-noi' ? Infinity : (x1 - x0) * (y1 - y0),
    };
  })
  .toSorted((a, b) => b.priority - a.priority);

const LABEL_TIER = assignLabelTiers(LABELS);

const SEA_LABELS = [
  { text: 'Biển Đông', x: 800, y: 790, size: 28, spacing: 6 },
  { text: 'Vịnh Bắc Bộ', x: 520, y: 290, size: 13, spacing: 1.5 },
  { text: 'Vịnh Thái Lan', x: 110, y: 1090, size: 13, spacing: 1.5 },
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
        const cx = (x0 + x1) / 2;
        return (
          <text key={a.id} x={cx} y={y1 + 16} className="map-archipelago-label">
            <tspan x={cx}>{a.name}</tspan>
            <tspan x={cx} dy="1.25em" className="map-archipelago-owner">
              {owner ? `thuộc ${owner.name}` : ''}
            </tspan>
          </text>
        );
      })}
      {LABELS.map((label) => (
        <text
          key={label.id}
          x={label.x}
          y={label.y}
          className="map-province-label"
          data-tier={LABEL_TIER.get(label.id)}
        >
          {label.text}
        </text>
      ))}
    </g>
  );
});
