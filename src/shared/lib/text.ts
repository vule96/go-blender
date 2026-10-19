/** Lower-case and strip Vietnamese diacritics so "da nang" matches "Đà Nẵng". */
export function normalizeVietnamese(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}
