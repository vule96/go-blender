'use client';

import dynamic from 'next/dynamic';

import type { ModelSceneProps } from './model-scene';

/**
 * three.js only runs in the browser and is heavy, so the scene is split into
 * its own chunk, loaded on the client after the page shell renders.
 * `preloadModelScene()` warms the same chunk from links.
 */
const ModelScene = dynamic(() => import('./model-scene'), {
  ssr: false,
  loading: () => <div className="ocean-surface h-full w-full" />,
});

export function ModelViewer(props: ModelSceneProps) {
  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden bg-ocean-700">
      <ModelScene {...props} />
      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/35 px-3 py-1 text-xs whitespace-nowrap text-white backdrop-blur">
        Kéo để xoay, cuộn hoặc chụm hai ngón để phóng to
      </p>
    </div>
  );
}
