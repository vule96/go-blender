'use client';

import { useDeferredValue, useState } from 'react';

import { type ProvinceId, PROVINCES, REGION_LABEL, REGIONS } from '@/entities/province';
import { cn } from '@/shared/lib/cn';
import { normalizeVietnamese } from '@/shared/lib/text';

interface ProvinceDirectoryProps {
  readonly landmarkCounts: Readonly<Partial<Record<ProvinceId, number>>>;
  readonly onSelect: (id: ProvinceId) => void;
}

const SEARCH_INDEX = PROVINCES.map((p) => ({
  province: p,
  haystack: normalizeVietnamese([p.name, ...p.mergedFrom].join(' ')),
}));

export function ProvinceDirectory({ landmarkCounts, onSelect }: ProvinceDirectoryProps) {
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const needle = normalizeVietnamese(deferred);
  const matches = needle ? SEARCH_INDEX.filter((e) => e.haystack.includes(needle)) : SEARCH_INDEX;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <label className="block">
        <span className="sr-only">Tìm tỉnh, thành</span>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          placeholder="Tìm tỉnh… (vd: Đà Nẵng, Bình Dương)"
          className="w-full rounded-2xl border-2 border-sand-300 bg-white px-4 py-2.5 text-sm text-ink shadow-inner outline-none placeholder:text-ink/40 focus:border-leaf-500"
        />
      </label>

      <div className="-mr-2 min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
        {REGIONS.map((region) => {
          const items = matches.filter((m) => m.province.region === region);
          if (items.length === 0) return null;
          return (
            <section key={region} aria-labelledby={`region-${region}`}>
              <h3
                id={`region-${region}`}
                className={cn(
                  'mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold text-white',
                  region === 'north' && 'bg-leaf-600',
                  region === 'central' && 'bg-amber-500',
                  region === 'south' && 'bg-coral-500',
                )}
              >
                {REGION_LABEL[region]}
              </h3>
              <ul className="grid grid-cols-2 gap-2">
                {items.map(({ province }) => {
                  const count = landmarkCounts[province.id] ?? 0;
                  return (
                    <li key={province.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(province.id);
                        }}
                        className="w-full rounded-2xl border-2 border-sand-200 bg-white px-3 py-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-leaf-400 hover:shadow-md"
                      >
                        <span className="block font-display text-sm font-bold text-ink">{province.name}</span>
                        <span className={cn('text-xs', count > 0 ? 'text-leaf-700' : 'text-ink/40')}>
                          {count > 0 ? `${count} địa danh` : 'Chưa có địa danh'}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
        {matches.length === 0 && <p className="text-sm text-ink/60">Không tìm thấy tỉnh nào phù hợp.</p>}
      </div>
    </div>
  );
}
