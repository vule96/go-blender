'use client';

import Link from 'next/link';

import { LANDMARK_CATEGORY_LABEL, type LandmarkListItem } from '@/entities/landmark/model/landmark';
import { type Province, provinceKindLabel, REGION_LABEL } from '@/entities/province/model/provinces';
import { RegionSwatch } from '@/entities/province/ui/region-swatch';
import { LandmarkLink } from '@/features/model-viewer/ui/landmark-link';
import { ChevronLeftIcon, ModelCubeIcon } from '@/shared/ui/icons';

interface ProvinceDetailsProps {
  readonly province: Province;
  readonly landmarks: readonly LandmarkListItem[];
  readonly onBack: () => void;
}

export function ProvinceDetails({ province, landmarks, onBack }: ProvinceDetailsProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-5">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 inline-flex items-center gap-1 py-1 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ChevronLeftIcon className="size-4" aria-hidden="true" />
          Tất cả tỉnh
        </button>

        <h2 className="mt-3 text-[2.25rem] leading-[1.02] font-extrabold tracking-[-0.01em] text-balance type-wide">
          {province.name}
        </h2>
        <p className="mt-2 flex items-center gap-2 text-[15px] text-ink-muted">
          <RegionSwatch region={province.region} />
          {provinceKindLabel(province.kind)}, {REGION_LABEL[province.region].toLowerCase()}.
        </p>
        {province.mergedFrom.length > 0 ? (
          <p className="mt-1 text-[15px] text-ink-muted">
            Từ 7/2025 gồm cả {province.mergedFrom.join(' và ')}.
          </p>
        ) : null}
      </div>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
        <h3 className="flex items-baseline border-b border-ink pb-1.5 text-sm font-semibold">
          Địa danh
          <span className="ml-auto font-normal text-ink-muted tabular-nums">{landmarks.length}</span>
        </h3>
        {landmarks.length === 0 ? (
          <p className="py-4 text-[15px] text-ink-muted">
            Chưa có địa danh nào của {province.name} trên bản đồ.
          </p>
        ) : (
          <ul>
            {landmarks.map((l) => (
              <li key={l.slug} className="border-b border-rule">
                <LandmarkLink
                  slug={l.slug}
                  hasModel={l.hasModel}
                  className="group flex items-center gap-3 py-2.5 focus-visible:outline-offset-0"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium transition-colors group-hover:text-select">
                      {l.name}
                    </span>
                    <span className="block text-sm text-ink-muted">
                      {LANDMARK_CATEGORY_LABEL[l.category]}
                    </span>
                  </span>
                  {l.hasModel ? <ModelCubeIcon role="img" aria-label="Có mô hình 3D" /> : null}
                </LandmarkLink>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-5">
        <Link
          href={`/tinh/${province.id}`}
          prefetch
          className="block rounded-md bg-ink px-4 py-3 text-center text-[15px] font-semibold text-paper transition-colors hover:bg-black"
        >
          Mở trang {province.name}
        </Link>
      </div>
    </div>
  );
}
