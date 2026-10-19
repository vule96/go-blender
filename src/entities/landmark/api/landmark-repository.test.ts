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
    const pagoda = await repo.findBySlug('chua-long-son');
    expect(pagoda?.provinceId).toBe('khanh-hoa');
    expect(pagoda?.model?.path).toBe('/models/chua-long-son.glb');

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

describe('landmark model files', () => {
  it('ships a GLB in public/ for every landmark that declares a local model', async () => {
    const { existsSync } = await import('node:fs');
    const path = await import('node:path');
    const repo = createStaticLandmarkRepository(LANDMARK_SEED);
    for (const l of await repo.list()) {
      if (l.model) expect(existsSync(path.join(process.cwd(), 'public', l.model.path)), l.slug).toBe(true);
    }
  });
});
