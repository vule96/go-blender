import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { landmarkRepository } from '@/entities/landmark/api/landmark-repository';
import { hasModel, LANDMARK_CATEGORY_LABEL } from '@/entities/landmark/model/landmark';
import { getProvince } from '@/entities/province/model/provinces';
import { ModelViewer } from '@/features/model-viewer/ui/model-viewer';
import { assetExists } from '@/shared/lib/asset-exists';
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
  const modelPath =
    hasModel(landmark) && (await assetExists(landmark.model.path)) ? landmark.model.path : null;
  const { lat, lng } = landmark.coordinates;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${String(lat)},${String(lng)}`;

  return (
    <>
      <div className="h-[58dvh] md:sticky md:top-0 md:h-dvh">
        {modelPath ? (
          <ModelViewer url={assetUrl(modelPath)} />
        ) : (
          <div className="mat-surface grid h-full place-items-center p-6">
            <div className="max-w-xs rounded-sm bg-paper p-4 text-[15px] shadow-[3px_4px_0_rgb(8_28_22/0.45)]">
              <p className="font-semibold">Chưa có mô hình 3D</p>
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

      <article className="bg-paper px-5 py-6 md:px-8 md:py-10">
        <BackLink href={`/tinh/${province.id}`} className="text-ink-muted hover:text-ink">
          {province.name}
        </BackLink>

        <h1 className="mt-4 text-[clamp(1.75rem,3vw,2.25rem)] leading-[1.08] font-extrabold tracking-[-0.015em] text-balance type-wide">
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
          className="mt-8 inline-block rounded-md border border-ink px-4 py-2.5 text-[15px] font-semibold transition-colors hover:bg-ink hover:text-paper"
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
      <div className="mat-surface h-[58dvh] md:h-dvh" />
      <div className="bg-paper px-5 py-6 md:px-8 md:py-10" aria-busy="true">
        <div className="h-4 w-20 rounded-sm bg-rule" />
        <div className="mt-6 h-10 w-4/5 rounded-sm bg-rule" />
        <div className="mt-4 h-4 w-1/2 rounded-sm bg-rule" />
      </div>
    </>
  );
}
