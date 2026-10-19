import { Suspense } from 'react';

import { landmarkRepository } from '@/entities/landmark/api/landmark-repository';
import { toListItem } from '@/entities/landmark/model/landmark';
import { MapExplorer } from '@/features/map-explorer/ui/map-explorer';

export default async function HomePage() {
  // Only the fields the map panel renders cross the server/client boundary.
  const landmarks = (await landmarkRepository.list()).map(toListItem);

  return (
    <main>
      {/* MapExplorer reads `?tinh=` from the URL, so it renders inside a Suspense boundary. */}
      <Suspense fallback={<div className="h-dvh bg-mat" />}>
        <MapExplorer landmarks={landmarks} />
      </Suspense>
    </main>
  );
}
