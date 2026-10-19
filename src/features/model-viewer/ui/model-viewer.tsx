'use client';

import dynamic from 'next/dynamic';

import type { ModelSceneProps } from './model-scene';

/**
 * three.js only runs in the browser and is heavy, so the scene is split into
 * its own chunk and loaded on the client after the page shell renders.
 */
const ModelScene = dynamic(() => import('./model-scene'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-sm text-white/80">Đang khởi tạo trình xem 3D…</div>
  ),
});

export function ModelViewer(props: ModelSceneProps) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-ocean-700 shadow-xl ring-4 ring-sand-300 sm:aspect-[4/3]">
      <ModelScene {...props} />
      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs text-white backdrop-blur">
        Kéo để xoay 360° · Cuộn hoặc chụm để phóng to
      </p>
    </div>
  );
}
