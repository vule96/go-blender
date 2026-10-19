import { VIETNAM_MAP } from '@/entities/province/data/vietnam-map';

/*
 * The cutting-mat grid is the real latitude/longitude graticule: thin lines
 * every half degree, stronger lines every 2°, labelled along the map's top and
 * left edges. Everything is computed once at module load (static JSX).
 */
const { meridians, parallels } = VIETNAM_MAP.graticule;
const [, , MAP_W, MAP_H] = VIETNAM_MAP.viewBox;

const X_MIN = meridians[0]?.x ?? 0;
const X_MAX = meridians.at(-1)?.x ?? MAP_W;
// Parallels run south → north, so y decreases along the list.
const Y_MIN = parallels.at(-1)?.y ?? 0;
const Y_MAX = parallels[0]?.y ?? MAP_H;

const isMajor = (deg: number) => deg % 2 === 0;

function linePath(minor: boolean): string {
  let d = '';
  for (const { deg, x } of meridians)
    if (isMajor(deg) !== minor) d += `M${String(x)} ${String(Y_MIN)}V${String(Y_MAX)}`;
  for (const { deg, y } of parallels)
    if (isMajor(deg) !== minor) d += `M${String(X_MIN)} ${String(y)}H${String(X_MAX)}`;
  return d;
}

const MINOR_PATH = linePath(true);
const MAJOR_PATH = linePath(false);

const LON_LABELS = meridians.filter(({ deg, x }) => isMajor(deg) && x > 0 && x < MAP_W);
const LAT_LABELS = parallels.filter(({ deg, y }) => isMajor(deg) && y > 0 && y < MAP_H);

const graticule = (
  <g aria-hidden="true">
    <path className="map-grid-minor" d={MINOR_PATH} />
    <path className="map-grid-major" d={MAJOR_PATH} />
    {LON_LABELS.map(({ deg, x }) => (
      <text key={`lon-${String(deg)}`} x={x + 4} y={12} className="map-grid-label">
        {deg}°Đ
      </text>
    ))}
    {LAT_LABELS.map(({ deg, y }) => (
      <text key={`lat-${String(deg)}`} x={6} y={y - 4} className="map-grid-label">
        {deg}°B
      </text>
    ))}
  </g>
);

export function MapGraticule() {
  return graticule;
}
