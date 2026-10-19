'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';

import type { LandmarkListItem } from '@/entities/landmark/model/landmark';
import { findProvince, isProvinceId, type ProvinceId } from '@/entities/province/model/provinces';
import { SITE } from '@/shared/config/site';
import { cn } from '@/shared/lib/cn';

import { useMapStore } from '../model/map-store';
import { ProvinceDetails } from './province-details';
import { ProvinceDirectory } from './province-directory';
import { VietnamMap } from './vietnam-map';

interface MapExplorerProps {
  readonly landmarks: readonly LandmarkListItem[];
}

const QUERY_KEY = 'tinh';
const NO_LANDMARKS: readonly LandmarkListItem[] = [];

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
  const panelRef = useRef<HTMLElement>(null);

  // One pass over the landmarks, then O(1) lookups per province.
  const byProvince = useMemo(() => {
    const map = new Map<ProvinceId, LandmarkListItem[]>();
    for (const l of landmarks) {
      const list = map.get(l.provinceId);
      if (list) list.push(l);
      else map.set(l.provinceId, [l]);
    }
    return map;
  }, [landmarks]);

  const counts = useMemo(
    () => new Map([...byProvince].map(([id, list]) => [id, list.length] as const)),
    [byProvince],
  );

  const selected = findProvince(selectedId);

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden md:flex-row">
      <div className="relative min-h-0 flex-1">
        <VietnamMap occluderRef={panelRef} />
      </div>

      <aside
        ref={panelRef}
        aria-label={selected ? `Thông tin ${selected.name}` : 'Danh sách tỉnh, thành phố'}
        className={cn(
          'absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-3xl border-4 border-b-0 border-sand-300 bg-sand-50 pt-5 shadow-2xl',
          'md:static md:m-3 md:max-h-none md:w-[380px] md:shrink-0 md:rounded-3xl md:border-b-4',
          // The sheet stays short while browsing so the map stays visible on phones.
          selected ? 'max-h-[56dvh]' : 'max-h-[42dvh]',
        )}
      >
        {selected ? (
          <ProvinceDetails
            province={selected}
            landmarks={byProvince.get(selected.id) ?? NO_LANDMARKS}
            onBack={() => {
              select(null);
            }}
          />
        ) : (
          <>
            <header className="mb-4 px-5">
              <h1 className="font-display text-3xl leading-none font-extrabold text-leaf-900">{SITE.name}</h1>
              <p className="mt-2 max-w-[34ch] text-[15px] text-ink-muted">
                Chọn một tỉnh trên bản đồ để xem các địa danh và mô hình 3D của tỉnh đó.
              </p>
            </header>
            <ProvinceDirectory landmarkCounts={counts} onSelect={select} />
          </>
        )}
      </aside>
    </div>
  );
}
