'use client';

import Link from 'next/link';

import { hasModel, type Landmark, LANDMARK_CATEGORY_LABEL } from '@/entities/landmark';
import { type Province, provinceKindLabel, REGION_LABEL } from '@/entities/province';

interface ProvinceDetailsProps {
  readonly province: Province;
  readonly landmarks: readonly Landmark[];
  readonly onClose: () => void;
}

export function ProvinceDetails({ province, landmarks, onClose }: ProvinceDetailsProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-leaf-700 uppercase">
            {REGION_LABEL[province.region]} · {provinceKindLabel(province.kind)}
          </p>
          <h2 className="font-display text-3xl leading-tight font-extrabold text-ink">{province.name}</h2>
          {province.mergedFrom.length > 0 && (
            <p className="mt-1 text-sm text-ink/70">Hợp nhất với: {province.mergedFrom.join(', ')}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-sand-200 text-ink/70 transition hover:bg-sand-300"
        >
          ✕
        </button>
      </div>

      <div className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2">
        <h3 className="mb-2 font-display text-lg font-bold text-ink">Địa danh nổi bật</h3>
        {landmarks.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-sand-300 p-4 text-sm text-ink/60">
            Chưa có địa danh nào cho {province.name}. Mô hình 3D sẽ sớm được bổ sung.
          </p>
        ) : (
          <ul className="space-y-2">
            {landmarks.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/dia-danh/${l.slug}`}
                  className="group block rounded-2xl border-2 border-sand-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-leaf-400 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display font-bold text-ink">{l.name}</span>
                    {hasModel(l) && (
                      <span className="shrink-0 rounded-full bg-leaf-600 px-2 py-0.5 text-[11px] font-bold text-white">
                        3D
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-leaf-700">
                    {LANDMARK_CATEGORY_LABEL[l.category]}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-ink/70">{l.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href={`/tinh/${province.id}`}
        className="block rounded-2xl bg-leaf-700 px-4 py-3 text-center font-display font-bold text-white shadow-[0_4px_0_0_var(--color-leaf-900)] transition hover:bg-leaf-600 active:translate-y-0.5 active:shadow-none"
      >
        Xem trang {province.name}
      </Link>
    </div>
  );
}
