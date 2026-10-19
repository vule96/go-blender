import { z } from 'zod';

import { PROVINCE_IDS } from '@/entities/province/model/provinces';

export const LANDMARK_CATEGORIES = ['religious', 'historical', 'nature', 'architecture', 'culture'] as const;
export type LandmarkCategory = (typeof LANDMARK_CATEGORIES)[number];

export const LANDMARK_CATEGORY_LABEL = {
  religious: 'Tôn giáo',
  historical: 'Di tích lịch sử',
  nature: 'Thiên nhiên',
  architecture: 'Kiến trúc',
  culture: 'Văn hóa',
} as const satisfies Record<LandmarkCategory, string>;

const SlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case ASCII')
  .brand<'LandmarkSlug'>();
export type LandmarkSlug = z.infer<typeof SlugSchema>;

export const LandmarkModelSchema = z.object({
  /** Path under the asset base, e.g. `/models/nha-tho-nui.glb`. */
  path: z.templateLiteral(['/', z.string().min(1), '.glb']),
  /** Optional credit for the model author. */
  author: z.string().optional(),
  /** Rough download size, shown before loading on slow connections. */
  sizeKb: z.number().int().positive().optional(),
});

export const LandmarkSchema = z.object({
  slug: SlugSchema,
  name: z.string().min(1),
  provinceId: z.enum(PROVINCE_IDS),
  category: z.enum(LANDMARK_CATEGORIES),
  summary: z.string().min(1),
  coordinates: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }),
  /**
   * What to type into Google Maps to land on the place's own listing, when
   * "<name>, <province>" isn't precise enough (e.g. the official name differs).
   */
  mapsQuery: z.string().min(1).optional(),
  model: LandmarkModelSchema.optional(),
});

export type Landmark = z.infer<typeof LandmarkSchema>;
export type LandmarkInput = z.input<typeof LandmarkSchema>;
export type LandmarkModel = z.infer<typeof LandmarkModelSchema>;

export function hasModel(landmark: Landmark): landmark is Landmark & { model: LandmarkModel } {
  return landmark.model !== undefined;
}

/**
 * What list views need to render a landmark. Client components receive this
 * instead of the full record, so summaries and coordinates are not serialised
 * into the map page's RSC payload.
 */
export interface LandmarkListItem {
  readonly slug: LandmarkSlug;
  readonly name: string;
  readonly provinceId: Landmark['provinceId'];
  readonly category: LandmarkCategory;
  readonly hasModel: boolean;
}

export function toListItem(landmark: Landmark): LandmarkListItem {
  return {
    slug: landmark.slug,
    name: landmark.name,
    provinceId: landmark.provinceId,
    category: landmark.category,
    hasModel: hasModel(landmark),
  };
}
