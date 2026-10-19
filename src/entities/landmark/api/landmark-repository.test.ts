import { describe, expect, it } from 'vitest';

import { isProvinceId } from '@/entities/province/model/provinces';

import { LANDMARK_SEED } from '../model/landmarks.seed';
import { createStaticLandmarkRepository } from './landmark-repository';

describe('landmark repository', () => {
  const repo = createStaticLandmarkRepository(LANDMARK_SEED);

  it('validates the seed and keeps slugs unique', async () => {
    const all = await repo.list();
    expect(all.length).toBe(LANDMARK_SEED.length);
    expect(new Set(all.map((l) => l.slug)).size).toBe(all.length);
    expect(all.every((l) => isProvinceId(l.provinceId))).toBe(true);
  });

  it('finds by slug and groups by province', async () => {
    const cathedral = await repo.findBySlug('nha-tho-nui-nha-trang');
    expect(cathedral?.provinceId).toBe('khanh-hoa');
    expect(cathedral?.model?.path).toMatch(/\.glb$/);

    const counts = await repo.countByProvince();
    const inKhanhHoa = await repo.listByProvince('khanh-hoa');
    expect(counts.get('khanh-hoa')).toBe(inKhanhHoa.length);
    expect(await repo.findBySlug('khong-ton-tai')).toBeUndefined();
  });

  it('rejects invalid seed data', () => {
    expect(() =>
      createStaticLandmarkRepository([
        {
          slug: 'Bad Slug',
          name: 'x',
          provinceId: 'ha-noi',
          category: 'nature',
          summary: 'x',
          coordinates: { lat: 0, lng: 0 },
        },
      ]),
    ).toThrow();
  });
});
