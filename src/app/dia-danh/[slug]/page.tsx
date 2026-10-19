import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { landmarkRepository } from '@/entities/landmark/api/landmark-repository';
import { googleMapsUrl } from '@/entities/landmark/lib/maps-url';
import { hasModel, LANDMARK_CATEGORY_LABEL } from '@/entities/landmark/model/landmark';
import { getProvince } from '@/entities/province/model/provinces';
import { DaypartToggle } from '@/features/model-viewer/ui/daypart-toggle';
import { ModelViewer } from '@/features/model-viewer/ui/model-viewer';
import { OutdoorBackdrop } from '@/features/model-viewer/ui/outdoor-backdrop';
import { checkAsset } from '@/shared/lib/asset-exists';
import { assetUrl } from '@/shared/lib/asset-url';
import { BackLink } from '@/shared/ui/back-link';

type Params = PageProps<'/dia-danh/[slug]'>['params'];

export async function generateStaticParams() {
  const landmarks = await landmarkRepository.list();
  return landmarks.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<'/dia-danh/[slug]'>): Promise<Metadata> {
  const landmark = await landmarkRepository.findBySlug((await params).slug);
  if (!landmark) return {};
  return { title: landmark.name, description: landmark.summary };
}

/** Shell renders immediately; everything that reads `params` streams in behind Suspense. */
export default function LandmarkPage({ params }: PageProps<'/dia-danh/[slug]'>) {
  return (
    <main className="grid min-h-dvh md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <Suspense fallback={<LandmarkSkeleton />}>
        <LandmarkContent params={params} />
      </Suspense>
    </main>
  );
}

async function LandmarkContent({ params }: { readonly params: Params }) {
  const landmark = await landmarkRepository.findBySlug((await params).slug);
  if (!landmark) notFound();

  const province = getProvince(landmark.provinceId);
  const modelAsset = hasModel(landmark) ? await checkAsset(landmark.model.path) : null;
  const modelUrl =
    hasModel(landmark) && modelAsset?.exists ? assetUrl(landmark.model.path, modelAsset.version) : null;
  const mapsUrl = googleMapsUrl(landmark, province.name);

  return (
    <>
      <div className="h-[58dvh] md:sticky md:top-0 md:h-dvh">
        {modelUrl ? (
          <ModelViewer url={modelUrl} />
        ) : (
          <div className="relative grid h-full place-items-center overflow-hidden p-6">
            <OutdoorBackdrop />
            <DaypartToggle className="absolute top-3 right-3" />
            <div className="relative max-w-xs rounded-2xl border-4 border-sand-300 bg-sand-50 p-4 text-[15px] shadow-xl">
              <p className="font-display text-lg font-bold">Chưa có mô hình 3D</p>
              <p className="mt-1 text-ink-muted">
                {hasModel(landmark) ? (
                  <>
                    Thêm file <code className="text-ink">public{landmark.model.path}</code> để hiện mô hình ở
                    đây.
                  </>
                ) : (
                  <>Mô hình của {landmark.name} đang được dựng trong Blender.</>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      <article className="bg-sand-50 px-5 py-6 md:px-8 md:py-10">
        <BackLink href={`/tinh/${province.id}`} className="text-ink-muted hover:text-ink">
          {province.name}
        </BackLink>

        <h1 className="mt-3 font-display text-[clamp(2.25rem,3.6vw,3rem)] leading-[1.05] font-extrabold text-balance text-leaf-900">
          {landmark.name}
        </h1>
        <p className="mt-3 text-[17px] text-ink-muted">
          {LANDMARK_CATEGORY_LABEL[landmark.category]}, {province.name}
        </p>

        <p className="mt-6 max-w-[60ch] text-[17px] leading-relaxed">{landmark.summary}</p>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-block rounded-2xl border-2 border-leaf-700 px-5 py-2.5 font-display text-lg font-bold text-leaf-700 transition-colors hover:bg-leaf-700 hover:text-white"
        >
          Mở trong Google Maps
        </a>

        {hasModel(landmark) && landmark.model.author ? (
          <p className="mt-8 text-sm text-ink-muted">Mô hình: {landmark.model.author}</p>
        ) : null}
      </article>
    </>
  );
}

function LandmarkSkeleton() {
  return (
    <>
      <div className="backdrop-base h-[58dvh] md:h-dvh" />
      <div className="bg-sand-50 px-5 py-6 md:px-8 md:py-10" aria-busy="true">
        <div className="h-4 w-20 rounded-md bg-sand-200" />
        <div className="mt-6 h-10 w-4/5 rounded-md bg-sand-200" />
        <div className="mt-4 h-4 w-1/2 rounded-md bg-sand-200" />
      </div>
    </>
  );
}
