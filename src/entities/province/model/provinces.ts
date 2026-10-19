/**
 * The 34 provincial-level administrative units of Vietnam in effect since
 * 1 July 2025 (Resolution 202/2025/QH15).
 *
 * This file is the single source of truth for province identity. Map
 * geometry (generated) and landmark data both reference these ids, and the
 * test suite checks that they stay in sync.
 */

export const REGIONS = ['north', 'central', 'south'] as const;
export type Region = (typeof REGIONS)[number];

export const REGION_LABEL = {
  north: 'Miền Bắc',
  central: 'Miền Trung',
  south: 'Miền Nam',
} as const satisfies Record<Region, string>;

export type ProvinceKind = 'municipality' | 'province';

export interface ProvinceMeta {
  /** Stable, URL-safe identifier. Never rename: URLs and saved data use it. */
  readonly id: string;
  /** Order in the official list; also the folder number of the source GIS data. */
  readonly order: number;
  readonly name: string;
  readonly kind: ProvinceKind;
  readonly region: Region;
  /** Former provinces merged into this unit (empty when unchanged). */
  readonly mergedFrom: readonly string[];
  /** Optional nudge for the map label, in map units (viewBox space). */
  readonly labelOffset?: readonly [dx: number, dy: number];
}

export const PROVINCES = [
  { id: 'ha-noi', order: 1, name: 'Hà Nội', kind: 'municipality', region: 'north', mergedFrom: [] },
  { id: 'cao-bang', order: 2, name: 'Cao Bằng', kind: 'province', region: 'north', mergedFrom: [] },
  {
    id: 'tuyen-quang',
    order: 3,
    name: 'Tuyên Quang',
    kind: 'province',
    region: 'north',
    mergedFrom: ['Hà Giang'],
  },
  { id: 'lao-cai', order: 4, name: 'Lào Cai', kind: 'province', region: 'north', mergedFrom: ['Yên Bái'] },
  { id: 'dien-bien', order: 5, name: 'Điện Biên', kind: 'province', region: 'north', mergedFrom: [] },
  { id: 'lai-chau', order: 6, name: 'Lai Châu', kind: 'province', region: 'north', mergedFrom: [] },
  { id: 'son-la', order: 7, name: 'Sơn La', kind: 'province', region: 'north', mergedFrom: [] },
  {
    id: 'thai-nguyen',
    order: 8,
    name: 'Thái Nguyên',
    kind: 'province',
    region: 'north',
    mergedFrom: ['Bắc Kạn'],
  },
  { id: 'lang-son', order: 9, name: 'Lạng Sơn', kind: 'province', region: 'north', mergedFrom: [] },
  { id: 'quang-ninh', order: 10, name: 'Quảng Ninh', kind: 'province', region: 'north', mergedFrom: [] },
  {
    id: 'phu-tho',
    order: 11,
    name: 'Phú Thọ',
    kind: 'province',
    region: 'north',
    mergedFrom: ['Vĩnh Phúc', 'Hòa Bình'],
  },
  {
    id: 'bac-ninh',
    order: 12,
    name: 'Bắc Ninh',
    kind: 'province',
    region: 'north',
    mergedFrom: ['Bắc Giang'],
  },
  {
    id: 'hai-phong',
    order: 13,
    name: 'Hải Phòng',
    kind: 'municipality',
    region: 'north',
    mergedFrom: ['Hải Dương'],
  },
  {
    id: 'hung-yen',
    order: 14,
    name: 'Hưng Yên',
    kind: 'province',
    region: 'north',
    mergedFrom: ['Thái Bình'],
  },
  {
    id: 'ninh-binh',
    order: 15,
    name: 'Ninh Bình',
    kind: 'province',
    region: 'north',
    mergedFrom: ['Hà Nam', 'Nam Định'],
  },
  { id: 'thanh-hoa', order: 16, name: 'Thanh Hóa', kind: 'province', region: 'central', mergedFrom: [] },
  { id: 'nghe-an', order: 17, name: 'Nghệ An', kind: 'province', region: 'central', mergedFrom: [] },
  { id: 'ha-tinh', order: 18, name: 'Hà Tĩnh', kind: 'province', region: 'central', mergedFrom: [] },
  {
    id: 'quang-tri',
    order: 19,
    name: 'Quảng Trị',
    kind: 'province',
    region: 'central',
    mergedFrom: ['Quảng Bình'],
  },
  { id: 'hue', order: 20, name: 'Huế', kind: 'municipality', region: 'central', mergedFrom: [] },
  {
    id: 'da-nang',
    order: 21,
    name: 'Đà Nẵng',
    kind: 'municipality',
    region: 'central',
    mergedFrom: ['Quảng Nam'],
  },
  {
    id: 'quang-ngai',
    order: 22,
    name: 'Quảng Ngãi',
    kind: 'province',
    region: 'central',
    mergedFrom: ['Kon Tum'],
  },
  {
    id: 'khanh-hoa',
    order: 23,
    name: 'Khánh Hòa',
    kind: 'province',
    region: 'central',
    mergedFrom: ['Ninh Thuận'],
  },
  {
    id: 'gia-lai',
    order: 24,
    name: 'Gia Lai',
    kind: 'province',
    region: 'central',
    mergedFrom: ['Bình Định'],
  },
  { id: 'dak-lak', order: 25, name: 'Đắk Lắk', kind: 'province', region: 'central', mergedFrom: ['Phú Yên'] },
  {
    id: 'lam-dong',
    order: 26,
    name: 'Lâm Đồng',
    kind: 'province',
    region: 'central',
    mergedFrom: ['Đắk Nông', 'Bình Thuận'],
  },
  { id: 'tay-ninh', order: 27, name: 'Tây Ninh', kind: 'province', region: 'south', mergedFrom: ['Long An'] },
  {
    id: 'dong-nai',
    order: 28,
    name: 'Đồng Nai',
    kind: 'province',
    region: 'south',
    mergedFrom: ['Bình Phước'],
  },
  {
    id: 'tp-ho-chi-minh',
    order: 29,
    name: 'TP. Hồ Chí Minh',
    kind: 'municipality',
    region: 'south',
    mergedFrom: ['Bình Dương', 'Bà Rịa - Vũng Tàu'],
  },
  {
    id: 'vinh-long',
    order: 30,
    name: 'Vĩnh Long',
    kind: 'province',
    region: 'south',
    mergedFrom: ['Bến Tre', 'Trà Vinh'],
  },
  {
    id: 'dong-thap',
    order: 31,
    name: 'Đồng Tháp',
    kind: 'province',
    region: 'south',
    mergedFrom: ['Tiền Giang'],
  },
  {
    id: 'an-giang',
    order: 32,
    name: 'An Giang',
    kind: 'province',
    region: 'south',
    mergedFrom: ['Kiên Giang'],
  },
  {
    id: 'can-tho',
    order: 33,
    name: 'Cần Thơ',
    kind: 'municipality',
    region: 'south',
    mergedFrom: ['Sóc Trăng', 'Hậu Giang'],
  },
  { id: 'ca-mau', order: 34, name: 'Cà Mau', kind: 'province', region: 'south', mergedFrom: ['Bạc Liêu'] },
] as const satisfies readonly ProvinceMeta[];

export type ProvinceId = (typeof PROVINCES)[number]['id'];
export type Province = (typeof PROVINCES)[number];

export const PROVINCE_IDS = PROVINCES.map((p) => p.id) as readonly ProvinceId[] as [
  ProvinceId,
  ...ProvinceId[],
];

const BY_ID = new Map<string, Province>(PROVINCES.map((p) => [p.id, p]));

export function isProvinceId(value: unknown): value is ProvinceId {
  return typeof value === 'string' && BY_ID.has(value);
}

export function getProvince(id: ProvinceId): Province {
  const province = BY_ID.get(id);
  if (!province) throw new Error(`Unknown province id: ${id}`);
  return province;
}

export function findProvince(id: string | null | undefined): Province | undefined {
  return id ? BY_ID.get(id) : undefined;
}

export function provincesByRegion(region: Region): readonly Province[] {
  return PROVINCES.filter((p) => p.region === region);
}

export function provinceKindLabel(kind: ProvinceKind): string {
  switch (kind) {
    case 'municipality':
      return 'Thành phố trực thuộc Trung ương';
    case 'province':
      return 'Tỉnh';
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}
