import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/baloo-2/700.css';
import '@fontsource/baloo-2/800.css';
import './globals.css';

import type { Metadata, Viewport } from 'next';

import { env } from '@/shared/config/env';
import { SITE } from '@/shared/config/site';
import { DAYPART_SCRIPT } from '@/shared/lib/daypart';

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: { siteName: SITE.name, locale: SITE.locale, type: 'website' },
};

export const viewport: Viewport = {
  themeColor: '#17607f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // suppressHydrationWarning: <html data-daypart> is set by the script below before
    // React loads, and browser extensions (e.g. ColorZilla's cz-shortcut-listen) add
    // attributes to <body>. Both are expected; this only silences attribute
    // mismatches on these two elements, not on their children.
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Static string from our own code, no user input. */}
        <script dangerouslySetInnerHTML={{ __html: DAYPART_SCRIPT }} />
      </head>
      <body className="min-h-dvh" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
