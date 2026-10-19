'use client';

import { useDeferredValue, useState } from 'react';

import { type ProvinceId, PROVINCES, REGION_LABEL, REGIONS } from '@/entities/province/model/provinces';
import { normalizeVietnamese } from '@/shared/lib/text';

interface ProvinceDirectoryProps {
  readonly landmarkCounts: ReadonlyMap<ProvinceId, number>;
  readonly onSelect: (id: ProvinceId) => void;
}

const SEARCH_INDEX = PROVINCES.map((p) => ({
  province: p,
  haystack: normalizeVietnamese([p.name, ...p.mergedFrom].join(' ')),
}));

/** Atlas-style index of all provinces, grouped by region, searchable without diacritics. */
export function ProvinceDirectory({ landmarkCounts, onSelect }: ProvinceDirectoryProps) {
  const [query, setQuery] = useState('');
  const needle = normalizeVietnamese(useDeferredValue(query));
  const matches = needle ? SEARCH_INDEX.filter((e) => e.haystack.includes(needle)) : SEARCH_INDEX;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <label className="mx-5 block">
        <span className="sr-only">Tìm tỉnh, thành phố</span>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          placeholder="Tìm tỉnh, kể cả tên cũ như Bình Dương"
          className="w-full rounded-2xl border-2 border-sand-300 bg-white px-4 py-2.5 text-[15px] text-ink outline-none placeholder:text-ink-muted/70 focus:border-leaf-500"
        />
      </label>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
        {matches.length === 0 ? (
          <p className="py-6 text-[15px] text-ink-muted">
            Không có tỉnh nào khớp với “{query}”. Thử gõ không dấu, ví dụ “quang ngai”.
          </p>
        ) : null}
        {REGIONS.map((region) => {
          const items = matches.filter((m) => m.province.region === region);
          if (items.length === 0) return null;
          return (
            <section key={region} aria-labelledby={`region-${region}`} className="mb-5 last:mb-0">
              <h2 id={`region-${region}`} className="mb-1 flex items-center gap-2 text-sm">
                <span
                  data-region={region}
                  className="rounded-full bg-(--region) px-2.5 py-0.5 font-display font-bold text-ink"
                >
                  {REGION_LABEL[region]}
                </span>
                <span className="text-ink-muted tabular-nums">{items.length} tỉnh, thành</span>
              </h2>
              <ul>
                {items.map(({ province }) => {
                  const count = landmarkCounts.get(province.id) ?? 0;
                  return (
                    <li key={province.id} className="border-b border-sand-200 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(province.id);
                        }}
                        className="-mx-2 flex w-[calc(100%+1rem)] items-baseline gap-3 rounded-lg px-2 py-2 text-left text-[15px] font-medium transition-colors hover:bg-sand-100 focus-visible:outline-offset-0"
                      >
                        <span className="min-w-0 flex-1">{province.name}</span>
                        {count > 0 ? (
                          <span className="text-sm font-semibold text-leaf-700 tabular-nums">
                            {count} địa danh
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
