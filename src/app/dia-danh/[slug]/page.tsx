import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { hasModel, LANDMARK_CATEGORY_LABEL, landmarkRepository } from '@/entities/landmark';
import { getProvince } from '@/entities/province';
import { ModelViewer } from '@/features/model-viewer';
import { assetUrl } from '@/shared/lib/asset-url';
import { BackLink } from '@/shared/ui/back-link';

export async function generateStaticParams() {
  const landmarks = await landmarkRepository.list();
  return landmarks.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<'/dia-danh/[slug]'>): Promise<Metadata> {
  const landmark = await landmarkRepository.findBySlug((await params).slug);
  if (!landmark) return {};
  return { title: landmark.name, description: landmark.summary };
}

export default async function LandmarkPage({ params }: PageProps<'/dia-danh/[slug]'>) {
  const landmark = await landmarkRepository.findBySlug((await params).slug);
  if (!landmark) notFound();

  const province = getProvince(landmark.provinceId);
  const { lat, lng } = landmark.coordinates;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${String(lat)},${String(lng)}`;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:py-12">
      <BackLink href={`/tinh/${province.id}`}>{province.name}</BackLink>

      <header className="space-y-1">
        <p className="text-sm font-semibold tracking-wide text-leaf-700 uppercase">
          {LANDMARK_CATEGORY_LABEL[landmark.category]} · {province.name}
        </p>
        <h1 className="font-display text-4xl font-extrabold text-leaf-900 md:text-5xl">{landmark.name}</h1>
      </header>

      {hasModel(landmark) ? (
        <ModelViewer url={assetUrl(landmark.model.path)} />
      ) : (
        <div className="grid aspect-[4/3] place-items-center rounded-3xl bg-sand-200 text-center ring-4 ring-sand-300">
          <div className="space-y-2 p-6">
            <p className="font-display text-2xl font-bold text-leaf-900">Mô hình 3D đang được dựng</p>
            <p className="text-ink/70">
              Xuất file <code>.glb</code> từ Blender rồi khai báo <code>model.path</code> cho địa điểm này.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_auto]">
        <p className="text-lg leading-relaxed">{landmark.summary}</p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="self-start rounded-full bg-leaf-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-leaf-700"
        >
          Xem trên Google Maps ↗
        </a>
      </div>

      {hasModel(landmark) && landmark.model.author && (
        <p className="text-sm text-ink/60">Mô hình: {landmark.model.author}</p>
      )}
    </main>
  );
}
