import type { Route } from 'next';
import Link from 'next/link';

interface BackLinkProps<T extends string> {
  readonly href: Route<T>;
  readonly children: React.ReactNode;
}

export function BackLink<T extends string>({ href, children }: BackLinkProps<T>) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-sm font-semibold text-leaf-900 shadow-sm ring-1 ring-sand-300 transition hover:bg-white"
    >
      <span aria-hidden>←</span>
      {children}
    </Link>
  );
}
