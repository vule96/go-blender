import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { landmarkRepository } from '@/entities/landmark/api/landmark-repository';
import { hasModel, LANDMARK_CATEGORY_LABEL } from '@/entities/landmark/model/landmark';
import {
  findProvince,
  provinceKindLabel,
  PROVINCES,
  REGION_LABEL,
} from '@/entities/province/model/provinces';
import { ProvinceMinimap } from '@/entities/province/ui/province-minimap';
import { RegionSwatch } from '@/entities/province/ui/region-swatch';
import { LandmarkLink } from '@/features/model-viewer/ui/landmark-link';
import { BackLink } from '@/shared/ui/back-link';
import { ModelCubeIcon } from '@/shared/ui/icons';

type Params = PageProps<'/tinh/[provinceId]'>['params'];

export function generateStaticParams() {
  return PROVINCES.map((p) => ({ provinceId: p.id }));
}

export async function generateMetadata({ params }: PageProps<'/tinh/[provinceId]'>): Promise<Metadata> {
  const province = findProvince((await params).provinceId);
  if (!province) return {};
  return {
    title: province.name,
    description: `Các địa danh nổi bật của ${province.name} và mô hình 3D có thể xoay 360°.`,
  };
}

/**
 * The page shell renders without the URL: `params` is URL data, so everything
 * that reads it sits behind a Suspense boundary (Cache Components requires this
 * even for params listed in generateStaticParams).
 */
export default function ProvincePage({ params }: PageProps<'/tinh/[provinceId]'>) {
  return (
    <main className="grid min-h-dvh md:grid-cols-[minmax(0,1fr)_minmax(0,34rem)]">
      <Suspense fallback={<ProvinceSkeleton />}>
        <ProvinceContent params={params} />
      </Suspense>
    </main>
  );
}

async function ProvinceContent({ params }: { readonly params: Params }) {
  const province = findProvince((await params).provinceId);
  if (!province) notFound();

  const landmarks = await landmarkRepository.listByProvince(province.id);

  return (
    <>
      <div className="ocean-surface relative h-[42dvh] overflow-hidden md:sticky md:top-0 md:h-dvh">
        <ProvinceMinimap provinceId={province.id} className="absolute inset-0 size-full p-6 md:p-12" />
      </div>

      <article className="bg-sand-50 px-5 py-6 md:px-10 md:py-10">
        <BackLink href={`/?tinh=${province.id}`} className="text-ink-muted hover:text-ink">
          Bản đồ
        </BackLink>

        <h1 className="mt-3 font-display text-[clamp(2.75rem,6vw,4rem)] leading-[1.02] font-extrabold text-balance text-leaf-900">
          {province.name}
        </h1>
        <p className="mt-3 flex items-center gap-2 text-[17px] text-ink-muted">
          <RegionSwatch region={province.region} />
          {provinceKindLabel(province.kind)}, {REGION_LABEL[province.region].toLowerCase()}.
        </p>
        {province.mergedFrom.length > 0 ? (
          <p className="mt-1 text-[17px] text-ink-muted">
            Từ 7/2025 gồm cả {province.mergedFrom.join(' và ')}.
          </p>
        ) : null}

        <h2 className="mt-10 flex items-baseline border-b-2 border-sand-300 pb-2 font-display text-xl font-bold">
          Địa danh
          <span className="ml-auto font-sans text-sm font-normal text-ink-muted tabular-nums">
            {landmarks.length}
          </span>
        </h2>

        {landmarks.length === 0 ? (
          <p className="max-w-[60ch] py-5 text-[17px] text-ink-muted">
            Chưa có địa danh nào của {province.name}. Khi một địa danh được thêm vào, nó sẽ hiện ở đây kèm mô
            hình 3D nếu có.
          </p>
        ) : (
          <ul>
            {landmarks.map((l) => (
              <li key={l.slug} className="border-b border-sand-200 last:border-b-0">
                <LandmarkLink slug={l.slug} hasModel={hasModel(l)} className="group flex gap-4 py-4">
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-xl font-bold transition-colors group-hover:text-leaf-700">
                      {l.name}
                    </span>
                    <span className="block text-sm text-ink-muted">
                      {LANDMARK_CATEGORY_LABEL[l.category]}
                    </span>
                    <span className="mt-1.5 block max-w-[60ch] text-[15px] leading-relaxed">{l.summary}</span>
                  </span>
                  {hasModel(l) ? (
                    <ModelCubeIcon role="img" aria-label="Có mô hình 3D" className="mt-1.5 size-5 shrink-0" />
                  ) : null}
                </LandmarkLink>
              </li>
            ))}
          </ul>
        )}
      </article>
    </>
  );
}

function ProvinceSkeleton() {
  return (
    <>
      <div className="ocean-surface h-[42dvh] md:h-dvh" />
      <div className="bg-sand-50 px-5 py-6 md:px-10 md:py-10" aria-busy="true">
        <div className="h-4 w-16 rounded-md bg-sand-200" />
        <div className="mt-6 h-12 w-3/4 rounded-md bg-sand-200" />
        <div className="mt-4 h-4 w-1/2 rounded-md bg-sand-200" />
      </div>
    </>
  );
}
