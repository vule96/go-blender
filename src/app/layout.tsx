import '@fontsource-variable/archivo/wdth.css';
import './globals.css';

import type { Metadata, Viewport } from 'next';

import { env } from '@/shared/config/env';
import { SITE } from '@/shared/config/site';

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: { siteName: SITE.name, locale: SITE.locale, type: 'website' },
};

export const viewport: Viewport = {
  themeColor: '#2e5e4e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="vi">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
