import { describe, expect, it } from 'vitest';

import { googleMapsUrl } from './maps-url';

describe('googleMapsUrl', () => {
  it('searches for the name and province', () => {
    const url = new URL(googleMapsUrl({ name: 'Tháp Bà Ponagar' }, 'Khánh Hòa'));
    expect(url.origin + url.pathname).toBe('https://www.google.com/maps/search/');
    expect(url.searchParams.get('api')).toBe('1');
    expect(url.searchParams.get('query')).toBe('Tháp Bà Ponagar, Khánh Hòa');
  });

  it('prefers an explicit query', () => {
    const url = new URL(
      googleMapsUrl({ name: 'Nhà thờ Núi', mapsQuery: 'Nhà thờ Chánh Tòa Kitô Vua, Nha Trang' }, 'Khánh Hòa'),
    );
    expect(url.searchParams.get('query')).toBe('Nhà thờ Chánh Tòa Kitô Vua, Nha Trang');
  });
});
