import { describe, expect, it } from 'vitest';

import { PROVINCE_IDS, PROVINCES } from '../model/provinces';
import { VIETNAM_MAP } from './vietnam-map';

describe('province registry ↔ generated map', () => {
  it('has the 34 post-2025 provinces with unique ids and orders', () => {
    expect(PROVINCES).toHaveLength(34);
    expect(new Set(PROVINCE_IDS).size).toBe(34);
    expect(new Set(PROVINCES.map((p) => p.order)).size).toBe(34);
  });

  it('has a shape for every province and nothing else', () => {
    const shapeIds = VIETNAM_MAP.provinces.map((p) => p.id).sort();
    expect(shapeIds).toEqual([...PROVINCE_IDS].sort());
  });

  it('keeps every label anchor inside the province bounds', () => {
    for (const shape of VIETNAM_MAP.provinces) {
      const [x0, y0, x1, y1] = shape.bounds;
      const [lx, ly] = shape.label;
      expect(lx, shape.id).toBeGreaterThanOrEqual(x0);
      expect(lx, shape.id).toBeLessThanOrEqual(x1);
      expect(ly, shape.id).toBeGreaterThanOrEqual(y0);
      expect(ly, shape.id).toBeLessThanOrEqual(y1);
      expect(shape.d.length, shape.id).toBeGreaterThan(50);
    }
  });

  it('assigns both archipelagos to an existing province', () => {
    const owners = Object.fromEntries(VIETNAM_MAP.archipelagos.map((a) => [a.id, a.belongsTo]));
    expect(owners).toEqual({ 'hoang-sa': 'da-nang', 'truong-sa': 'khanh-hoa' });
  });
});
