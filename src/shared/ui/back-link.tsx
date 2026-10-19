import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import { ChevronLeftIcon } from './icons';

interface BackLinkProps<T extends string> {
  readonly href: Route<T>;
  readonly children: ReactNode;
  readonly className?: string;
}

export function BackLink<T extends string>({ href, children, className }: BackLinkProps<T>) {
  return (
    <Link
      href={href}
      prefetch
      className={cn('-ml-1 inline-flex items-center gap-1 py-1 text-sm transition-colors', className)}
    >
      <ChevronLeftIcon className="size-4" aria-hidden="true" />
      {children}
    </Link>
  );
}
