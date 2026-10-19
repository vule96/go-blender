import { VIETNAM_MAP } from '../data/vietnam-map';
import { regionFill } from '../lib/region-fill';
import { findProvince, type ProvinceId } from '../model/provinces';

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

/** Server-rendered locator: the province in full colour and lifted, its neighbours faded. */
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
    </svg>
  );
}
