import { VIETNAM_MAP } from '../data/vietnam-map';
import { findProvince, type ProvinceId } from '../model/provinces';

interface ProvinceMinimapProps {
  readonly provinceId: ProvinceId;
  readonly className?: string;
}

/** Server-rendered locator: the province's paper piece lifted, neighbours left on the mat. */
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
      {VIETNAM_MAP.provinces.map((p) => (
        <path
          key={p.id}
          d={p.d}
          data-region={findProvince(p.id)?.region}
          className="minimap-neighbour"
          stroke="var(--color-mat)"
          strokeWidth={1.4}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <path
        d={shape.d}
        data-region={findProvince(provinceId)?.region}
        fill="var(--paper)"
        stroke="var(--color-select)"
        strokeWidth={2.5}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{ filter: 'drop-shadow(4px 6px 4px rgb(8 28 22 / 0.5))' }}
      />
    </svg>
  );
}
