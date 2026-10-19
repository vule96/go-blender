import { Suspense } from 'react';

import { landmarkRepository } from '@/entities/landmark';
import { MapExplorer } from '@/features/map-explorer';

export default async function HomePage() {
  const landmarks = await landmarkRepository.list();

  return (
    <main>
      {/* MapExplorer reads `?tinh=` from the URL, so it renders inside a Suspense boundary. */}
      <Suspense fallback={<div className="ocean h-dvh" />}>
        <MapExplorer landmarks={landmarks} />
      </Suspense>
    </main>
  );
}
