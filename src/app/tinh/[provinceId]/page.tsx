import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { hasModel, LANDMARK_CATEGORY_LABEL, landmarkRepository } from '@/entities/landmark';
import {
  findProvince,
  provinceKindLabel,
  ProvinceMinimap,
  PROVINCES,
  REGION_LABEL,
} from '@/entities/province';
import { BackLink } from '@/shared/ui/back-link';

export function generateStaticParams() {
  return PROVINCES.map((p) => ({ provinceId: p.id }));
}

export async function generateMetadata({ params }: PageProps<'/tinh/[provinceId]'>): Promise<Metadata> {
  const province = findProvince((await params).provinceId);
  if (!province) return {};
  return {
    title: province.name,
    description: `Địa điểm nổi bật của ${province.name} trên bản đồ 3D GoBlender.`,
  };
}

export default async function ProvincePage({ params }: PageProps<'/tinh/[provinceId]'>) {
  const province = findProvince((await params).provinceId);
  if (!province) notFound();

  const landmarks = await landmarkRepository.listByProvince(province.id);

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-[1fr_320px] md:py-12">
      <section className="space-y-6">
        <BackLink href={`/?tinh=${province.id}`}>Bản đồ</BackLink>
        <header className="space-y-1">
          <p className="text-sm font-semibold tracking-wide text-leaf-700 uppercase">
            {REGION_LABEL[province.region]} · {provinceKindLabel(province.kind)}
          </p>
          <h1 className="font-display text-4xl font-extrabold text-leaf-900 md:text-5xl">{province.name}</h1>
          {province.mergedFrom.length > 0 && (
            <p className="text-ink/70">Hợp nhất với: {province.mergedFrom.join(', ')}</p>
          )}
        </header>

        <h2 className="font-display text-2xl font-bold">Địa điểm nổi bật</h2>
        {landmarks.length === 0 ? (
          <p className="rounded-2xl bg-white/70 p-6 text-ink/70 ring-1 ring-sand-300">
            Chưa có địa điểm nào. Thêm vào <code>landmarks.seed.ts</code> nhé!
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {landmarks.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/dia-danh/${l.slug}`}
                  className="block h-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sand-300 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-leaf-700">
                      {LANDMARK_CATEGORY_LABEL[l.category]}
                    </span>
                    {hasModel(l) && (
                      <span className="rounded-full bg-coral-500 px-2 py-0.5 text-xs font-bold text-white">
                        3D
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 font-display text-lg font-bold">{l.name}</h3>
                  <p className="mt-1 line-clamp-3 text-sm text-ink/70">{l.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="md:pt-14">
        <ProvinceMinimap
          provinceId={province.id}
          className="aspect-square w-full shadow-lg ring-4 ring-sand-300"
        />
      </aside>
    </main>
  );
}
