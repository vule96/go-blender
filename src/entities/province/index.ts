export type { ArchipelagoShape, ProvinceShape, VietnamMapData } from './data/vietnam-map';
export { getProvinceShape, VIETNAM_MAP } from './data/vietnam-map';
export { regionFill } from './lib/palette';
export type { Province, ProvinceId, ProvinceKind, ProvinceMeta, Region } from './model/provinces';
export {
  findProvince,
  getProvince,
  isProvinceId,
  PROVINCE_IDS,
  provinceKindLabel,
  PROVINCES,
  provincesByRegion,
  REGION_LABEL,
  REGIONS,
} from './model/provinces';
export { ProvinceMinimap } from './ui/province-minimap';
