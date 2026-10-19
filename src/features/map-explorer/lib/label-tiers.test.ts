import { describe, expect, it } from 'vitest';

import { assignLabelTiers } from './label-tiers';

describe('assignLabelTiers', () => {
  it('keeps far-apart labels in the overview tier', () => {
    const tiers = assignLabelTiers([
      { id: 'a', text: 'Hà Nội', x: 0, y: 0 },
      { id: 'b', text: 'Cà Mau', x: 500, y: 500 },
    ]);
    expect(tiers.get('a')).toBe(0);
    expect(tiers.get('b')).toBe(0);
  });

  it('defers a colliding label, never the one placed first', () => {
    const tiers = assignLabelTiers([
      { id: 'first', text: 'Hà Nội', x: 100, y: 100 },
      { id: 'second', text: 'Phú Thọ', x: 120, y: 102 },
    ]);
    expect(tiers.get('first')).toBe(0);
    expect(tiers.get('second')).toBeGreaterThan(0);
  });

  it('falls back to the deepest tier when a label never fits', () => {
    const tiers = assignLabelTiers([
      { id: 'a', text: 'Thành phố Hồ Chí Minh', x: 0, y: 0 },
      { id: 'b', text: 'Thành phố Hồ Chí Minh', x: 0, y: 0 },
    ]);
    expect(tiers.get('b')).toBe(2);
  });
});
