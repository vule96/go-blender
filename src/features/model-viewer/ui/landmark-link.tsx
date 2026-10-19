'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import type { LandmarkSlug } from '@/entities/landmark/model/landmark';

import { preloadModelScene } from '../preload';

interface LandmarkLinkProps {
  readonly slug: LandmarkSlug;
  readonly hasModel: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}

/** Link to a landmark page that warms up the 3D viewer when the user shows intent. */
export function LandmarkLink({ slug, hasModel, className, children }: LandmarkLinkProps) {
  const warmUp = hasModel ? preloadModelScene : undefined;
  return (
    <Link href={`/dia-danh/${slug}`} prefetch className={className} onPointerEnter={warmUp} onFocus={warmUp}>
      {children}
    </Link>
  );
}
