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
  model: LandmarkModelSchema.optional(),
});

export type Landmark = z.infer<typeof LandmarkSchema>;
export type LandmarkInput = z.input<typeof LandmarkSchema>;
export type LandmarkModel = z.infer<typeof LandmarkModelSchema>;

export function hasModel(landmark: Landmark): landmark is Landmark & { model: LandmarkModel } {
  return landmark.model !== undefined;
}
