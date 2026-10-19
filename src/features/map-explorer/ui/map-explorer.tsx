'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';

import type { Landmark } from '@/entities/landmark';
import { findProvince, isProvinceId, type ProvinceId } from '@/entities/province';

import { useMapStore } from '../model/map-store';
import { ProvinceDetails } from './province-details';
import { ProvinceDirectory } from './province-directory';
import { VietnamMap } from './vietnam-map';

interface MapExplorerProps {
  readonly landmarks: readonly Landmark[];
}

const QUERY_KEY = 'tinh';

/** Keeps the selected province in the URL (`?tinh=khanh-hoa`) so it can be shared and survives reloads. */
function useSelectionUrlSync() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const select = useMapStore((s) => s.select);

  // URL → store (initial load, back/forward)
  const fromUrl = searchParams.get(QUERY_KEY);
  useEffect(() => {
    select(isProvinceId(fromUrl) ? fromUrl : null);
  }, [fromUrl, select]);

  // store → URL
  useEffect(
    () =>
      useMapStore.subscribe(
        (s) => s.selectedId,
        (id) => {
          const params = new URLSearchParams(window.location.search);
          if (id) params.set(QUERY_KEY, id);
          else params.delete(QUERY_KEY);
          const query = params.toString();
          window.history.replaceState(null, '', query ? `${pathname}?${query}` : pathname);
        },
      ),
    [pathname],
  );
}

export function MapExplorer({ landmarks }: MapExplorerProps) {
  useSelectionUrlSync();
  const selectedId = useMapStore((s) => s.selectedId);
  const select = useMapStore((s) => s.select);

  const byProvince = useMemo(() => {
    const map = new Map<ProvinceId, Landmark[]>();
    for (const l of landmarks) map.set(l.provinceId, [...(map.get(l.provinceId) ?? []), l]);
    return map;
  }, [landmarks]);

  const counts = useMemo(
    () =>
      Object.fromEntries([...byProvince].map(([id, list]) => [id, list.length])) as Partial<
        Record<ProvinceId, number>
      >,
    [byProvince],
  );

  const selected = findProvince(selectedId);
  const panelRef = useRef<HTMLElement>(null);

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden md:flex-row">
      <div className="ocean relative min-h-0 flex-1">
        <VietnamMap occluderRef={panelRef} />
      </div>

      <aside
        ref={panelRef}
        className="absolute inset-x-2 bottom-2 z-20 flex max-h-[55dvh] flex-col gap-3 rounded-3xl border-4 border-sand-300 bg-sand-50 p-4 shadow-2xl md:static md:inset-auto md:m-3 md:max-h-none md:w-[380px] md:shrink-0"
        aria-label="Thông tin tỉnh"
      >
        {selected ? (
          <ProvinceDetails
            province={selected}
            landmarks={byProvince.get(selected.id) ?? []}
            onClose={() => {
              select(null);
            }}
          />
        ) : (
          <>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h1 className="font-display text-2xl font-extrabold text-ink">Chọn một tỉnh</h1>
              <p className="mt-1 text-sm text-ink/70">
                Chạm vào một tỉnh trên bản đồ hoặc tìm trong danh sách để xem các địa danh nổi bật.
              </p>
            </div>
            <ProvinceDirectory landmarkCounts={counts} onSelect={select} />
          </>
        )}
      </aside>
    </div>
  );
}
