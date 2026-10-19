/**
 * Builds the pre-projected Vietnam map used by the web app.
 *
 *   npm run map:build            (uses the download cache in .cache/geo)
 *   npm run map:build -- --fresh (re-downloads the source GeoJSON)
 *
 * Pipeline: GeoJSON (34 provinces, EPSG:4326)
 *   → TopoJSON (shared borders become shared arcs)
 *   → simplify + drop tiny islets (borders stay watertight)
 *   → Mercator projection fitted to a fixed viewBox
 *   → SVG path strings rounded to 1 decimal
 *   → src/entities/province/data/vietnam-map.generated.json
 *
 * The browser never touches lon/lat or projections: it just renders paths,
 * which keeps the client bundle small and the first paint fast.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';
import { feature, mesh } from 'topojson-client';
import { topology } from 'topojson-server';
import { filter, filterWeight, presimplify, quantile, simplify, sphericalRingArea } from 'topojson-simplify';
import type { GeometryCollection, Topology } from 'topojson-specification';

import { type ProvinceId, PROVINCES } from '../../src/entities/province/model/provinces';

const ROOT = path.resolve(import.meta.dirname, '../..');
const CACHE_DIR = path.join(ROOT, '.cache/geo');
const OUT_FILE = path.join(ROOT, 'src/entities/province/data/vietnam-map.generated.json');

/**
 * Province boundaries from the "Vietnam Administrative Units Reference Map"
 * (sapnhap.bando.com.vn), normalised by github.com/ThangLeQuoc/vietnamese-provinces-database (MIT).
 */
const SOURCE_BASE =
  'https://raw.githubusercontent.com/ThangLeQuoc/vietnamese-provinces-database/master/dataset-generation-scripts/resources/gis/geojson_11Mar2026';
const SOURCE_DIRS: Record<ProvinceId, string> = {
  'ha-noi': '1_thu_đo_ha_noi',
  'cao-bang': '2_tinh_cao_bang',
  'tuyen-quang': '3_tinh_tuyen_quang',
  'lao-cai': '4_tinh_lao_cai',
  'dien-bien': '5_tinh_đien_bien',
  'lai-chau': '6_tinh_lai_chau',
  'son-la': '7_tinh_son_la',
  'thai-nguyen': '8_tinh_thai_nguyen',
  'lang-son': '9_tinh_lang_son',
  'quang-ninh': '10_tinh_quang_ninh',
  'phu-tho': '11_tinh_phu_tho',
  'bac-ninh': '12_tinh_bac_ninh',
  'hai-phong': '13_hai_phong',
  'hung-yen': '14_tinh_hung_yen',
  'ninh-binh': '15_tinh_ninh_binh',
  'thanh-hoa': '16_tinh_thanh_hoa',
  'nghe-an': '17_tinh_nghe_an',
  'ha-tinh': '18_tinh_ha_tinh',
  'quang-tri': '19_tinh_quang_tri',
  hue: '20_hue',
  'da-nang': '21_đa_nang',
  'quang-ngai': '22_tinh_quang_ngai',
  'khanh-hoa': '23_tinh_khanh_hoa',
  'gia-lai': '24_tinh_gia_lai',
  'dak-lak': '25_tinh_đak_lak',
  'lam-dong': '26_tinh_lam_đong',
  'tay-ninh': '27_tinh_tay_ninh',
  'dong-nai': '28_tinh_đong_nai',
  'tp-ho-chi-minh': '29_ho_chi_minh',
  'vinh-long': '30_tinh_vinh_long',
  'dong-thap': '31_tinh_đong_thap',
  'an-giang': '32_tinh_an_giang',
  'can-tho': '33_can_tho',
  'ca-mau': '34_tinh_ca_mau',
};

/**
 * Hoàng Sa (Đà Nẵng) and Trường Sa (Khánh Hòa) are not in the province
 * dataset, so they are drawn from representative island positions [lon, lat].
 * Positions are approximate and only meant for a stylised overview map.
 */
const ARCHIPELAGOS = [
  {
    id: 'hoang-sa',
    name: 'QĐ. Hoàng Sa',
    belongsTo: 'da-nang',
    islands: [
      [112.336, 16.834],
      [112.27, 16.98],
      [112.34, 16.95],
      [112.31, 16.93],
      [112.73, 16.67],
      [111.6, 16.53],
      [111.58, 16.55],
      [111.6, 16.45],
      [111.74, 16.46],
      [111.2, 15.78],
      [111.75, 16.05],
      [111.48, 17.08],
      [111.7, 16.58],
    ],
  },
  {
    id: 'truong-sa',
    name: 'QĐ. Trường Sa',
    belongsTo: 'khanh-hoa',
    islands: [
      [111.92, 8.64],
      [114.33, 11.43],
      [114.3, 11.45],
      [114.36, 10.38],
      [114.33, 9.89],
      [114.37, 10.18],
      [114.48, 10.37],
      [112.92, 7.89],
      [114.28, 11.05],
      [114.42, 10.68],
      [113.7, 8.97],
      [112.25, 8.85],
      [113.07, 8.86],
      [114.66, 10.5],
      [115.03, 10.18],
    ],
  },
] as const satisfies readonly {
  id: string;
  name: string;
  belongsTo: ProvinceId;
  islands: readonly (readonly [number, number])[];
}[];

const VIEW_WIDTH = 1000;
const PADDING = 24;
const SIMPLIFY_QUANTILE = 0.12; // keep the top 12% most significant points
const MIN_ISLAND_AREA_KM2 = 4; // drop islets smaller than this

type ProvinceGeometry = Polygon | MultiPolygon;
type ProvinceFeature = Feature<ProvinceGeometry, { id: ProvinceId }>;

async function loadProvince(id: ProvinceId, fresh: boolean): Promise<ProvinceFeature> {
  const cacheFile = path.join(CACHE_DIR, `${id}.geojson`);
  let text: string | undefined;
  if (!fresh) {
    text = await readFile(cacheFile, 'utf8').catch(() => undefined);
  }
  if (text === undefined) {
    const url = `${SOURCE_BASE}/${encodeURIComponent(SOURCE_DIRS[id])}/province.geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download ${id}: HTTP ${String(res.status)}`);
    text = await res.text();
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(cacheFile, text);
  }
  const collection = JSON.parse(text) as FeatureCollection<ProvinceGeometry>;
  const geometries = collection.features.map((f) => f.geometry);
  const polygons: Position[][][] = geometries.flatMap((g) =>
    g.type === 'Polygon' ? [g.coordinates] : g.coordinates,
  );
  return { type: 'Feature', properties: { id }, geometry: { type: 'MultiPolygon', coordinates: polygons } };
}

const round1 = (n: number): number => Math.round(n * 10) / 10;

async function main(): Promise<void> {
  const fresh = process.argv.includes('--fresh');
  const features = await Promise.all(PROVINCES.map((p) => loadProvince(p.id, fresh)));
  const collection: FeatureCollection<ProvinceGeometry, { id: ProvinceId }> = {
    type: 'FeatureCollection',
    features,
  };

  // 1. Topology: shared borders become shared arcs, so simplification never opens gaps.
  let topo = topology({ provinces: collection }, 1e6) as Topology<{
    provinces: GeometryCollection<{ id: ProvinceId }>;
  }>;
  topo = presimplify(topo);
  topo = simplify(topo, quantile(topo, SIMPLIFY_QUANTILE)); // p = fraction of points retained
  const EARTH_RADIUS_KM = 6371;
  const minSteradians = MIN_ISLAND_AREA_KM2 / EARTH_RADIUS_KM ** 2;
  // filterWeight forwards (ring, interior) to the weigher at runtime; the typings only declare (ring).
  const ringArea = sphericalRingArea as unknown as Parameters<typeof filterWeight>[2] & {};
  topo = filter(topo, filterWeight(topo, minSteradians, ringArea)) as typeof topo;

  const provinces = feature(topo, topo.objects.provinces);

  // 2. Projection fitted to the mainland + both archipelagos.
  const islandPoints = ARCHIPELAGOS.flatMap((a) =>
    a.islands.map(([lon, lat]) => [lon, lat] as [number, number]),
  );
  const extent: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      ...provinces.features,
      { type: 'Feature', properties: {}, geometry: { type: 'MultiPoint', coordinates: islandPoints } },
    ],
  };
  const probe = geoMercator().fitWidth(VIEW_WIDTH - PADDING * 2, extent);
  const [[, y0], [, y1]] = geoPath(probe).bounds(extent);
  const viewHeight = Math.ceil(y1 - y0 + PADDING * 2);
  const projection = geoMercator().fitExtent(
    [
      [PADDING, PADDING],
      [VIEW_WIDTH - PADDING, viewHeight - PADDING],
    ],
    extent,
  );
  projection.precision(0); // no adaptive resampling: it would re-densify the simplified arcs
  const toPath = geoPath(projection).digits(1);

  const project = (lon: number, lat: number): [number, number] => {
    const p = projection([lon, lat]);
    if (!p) throw new Error('Projection failed');
    return [round1(p[0]), round1(p[1])];
  };

  // 3. Per-province paths + label anchors (centroid of the largest polygon).
  const out = provinces.features.map((f) => {
    const id = f.properties.id;
    const geom = f.geometry as MultiPolygon;
    const largest = geom.coordinates
      .map((coords) => ({ coords, area: toPath.area({ type: 'Polygon', coordinates: coords }) }))
      .sort((a, b) => b.area - a.area)[0];
    const centroid = largest
      ? toPath.centroid({ type: 'Polygon', coordinates: largest.coords })
      : toPath.centroid(f);
    const [[bx0, by0], [bx1, by1]] = toPath.bounds(f);
    return {
      id,
      d: toPath(f) ?? '',
      label: [round1(centroid[0]), round1(centroid[1])] as [number, number],
      bounds: [round1(bx0), round1(by0), round1(bx1), round1(by1)] as [number, number, number, number],
    };
  });

  const object = topo.objects.provinces;
  const borders = toPath(mesh(topo, object, (a, b) => a !== b)) ?? '';
  const coastline = toPath(mesh(topo, object, (a, b) => a === b)) ?? '';

  const archipelagos = ARCHIPELAGOS.map((a) => {
    const points = a.islands.map(([lon, lat]) => project(lon, lat));
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    return {
      id: a.id,
      name: a.name,
      belongsTo: a.belongsTo,
      islands: points,
      bounds: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)].map(round1) as [
        number,
        number,
        number,
        number,
      ],
    };
  });

  const data = {
    version: 1,
    generatedAt: new Date().toISOString(),
    attribution:
      'Ranh giới hành chính: Bản đồ đơn vị hành chính Việt Nam (sapnhap.bando.com.vn), qua vietnamese-provinces-database (MIT)',
    viewBox: [0, 0, VIEW_WIDTH, viewHeight] as const,
    provinces: out,
    borders,
    coastline,
    archipelagos,
  };

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, `${JSON.stringify(data)}\n`);
  const kb = (Buffer.byteLength(JSON.stringify(data)) / 1024).toFixed(1);
  console.log(
    `✔ ${String(out.length)} provinces, viewBox ${String(VIEW_WIDTH)}×${String(viewHeight)}, ${kb} KB → ${path.relative(ROOT, OUT_FILE)}`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
