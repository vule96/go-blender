'use client';

import dynamic from 'next/dynamic';

import { useDaypart } from '@/shared/lib/use-daypart';

import { DaypartToggle } from './daypart-toggle';
import type { ModelSceneProps } from './model-scene';
import { OutdoorBackdrop } from './outdoor-backdrop';

/**
 * three.js only runs in the browser and is heavy, so the scene is split into
 * its own chunk, loaded on the client after the page shell renders.
 * `preloadModelScene()` warms the same chunk from links.
 */
const ModelScene = dynamic(() => import('./model-scene'), { ssr: false });

export function ModelViewer(props: Omit<ModelSceneProps, 'daypart'>) {
  // The backdrop follows <html data-daypart> through CSS; the scene's lights need the value.
  const daypart = useDaypart();
  return (
    <div className="backdrop-base relative h-full min-h-[320px] w-full overflow-hidden">
      <OutdoorBackdrop />
      <div className="absolute inset-0">
        <ModelScene {...props} daypart={daypart} />
      </div>
      <DaypartToggle className="absolute top-3 right-3" />
      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/35 px-3 py-1 text-xs whitespace-nowrap text-white backdrop-blur">
        Kéo để xoay, cuộn hoặc chụm hai ngón để phóng to
      </p>
    </div>
  );
}
