import type { ProvinceId } from '@/entities/province/model/provinces';

import { type Landmark, LandmarkSchema } from '../model/landmark';
import { LANDMARK_SEED } from '../model/landmarks.seed';

/**
 * Data access boundary for landmarks. UI code depends on this interface only,
 * so the static seed can later be replaced by a database/CMS implementation
 * (Postgres, Supabase, a headless CMS…) without touching components.
 */
export interface LandmarkRepository {
  list(): Promise<readonly Landmark[]>;
  listByProvince(provinceId: ProvinceId): Promise<readonly Landmark[]>;
  findBySlug(slug: string): Promise<Landmark | undefined>;
  countByProvince(): Promise<ReadonlyMap<ProvinceId, number>>;
}

export function createStaticLandmarkRepository(seed: readonly unknown[] = LANDMARK_SEED): LandmarkRepository {
  // Validate once: bad seed data fails loudly at build time, not in the UI.
  const landmarks: readonly Landmark[] = seed.map((item) => LandmarkSchema.parse(item));
  const bySlug = new Map(landmarks.map((l) => [l.slug as string, l]));

  return {
    list: () => Promise.resolve(landmarks),
    listByProvince: (provinceId) => Promise.resolve(landmarks.filter((l) => l.provinceId === provinceId)),
    findBySlug: (slug) => Promise.resolve(bySlug.get(slug)),
    countByProvince: () => {
      const counts = new Map<ProvinceId, number>();
      for (const l of landmarks) counts.set(l.provinceId, (counts.get(l.provinceId) ?? 0) + 1);
      return Promise.resolve(counts);
    },
  };
}

export const landmarkRepository: LandmarkRepository = createStaticLandmarkRepository();
