import { cn } from '@/shared/lib/cn';

import { VIETNAM_MAP } from '../data/vietnam-map';
import { regionFill } from '../lib/palette';
import { type ProvinceId, PROVINCES } from '../model/provinces';

interface ProvinceMinimapProps {
  readonly provinceId: ProvinceId;
  readonly className?: string;
}

const FILLS = new Map(PROVINCES.map((p) => [p.id, regionFill(p.region, p.order)]));

/** Static (server-rendered) map zoomed on one province, with its neighbours greyed out. */
export function ProvinceMinimap({ provinceId, className }: ProvinceMinimapProps) {
  const shape = VIETNAM_MAP.provinces.find((p) => p.id === provinceId);
  if (!shape) return null;
  const [x0, y0, x1, y1] = shape.bounds;
  const size = Math.max(x1 - x0, y1 - y0) * 1.6 + 40;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  return (
    <svg
      viewBox={`${cx - size / 2} ${cy - size / 2} ${size} ${size}`}
      className={cn('ocean rounded-3xl', className)}
      role="img"
      aria-label="Vị trí trên bản đồ"
    >
      {VIETNAM_MAP.provinces.map((p) => (
        <path
          key={p.id}
          d={p.d}
          fill={p.id === provinceId ? FILLS.get(p.id) : '#d9cfb8'}
          stroke="#fff"
          strokeWidth={p.id === provinceId ? 2 : 0.6}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
