import 'server-only';

import { access } from 'node:fs/promises';
import path from 'node:path';

import { env } from '@/shared/config/env';

/**
 * Whether a public asset can be served. Checked on the server so a missing
 * model shows a placeholder instead of a failed download in the browser.
 * Assets on a CDN are assumed to exist (checking would cost a request).
 */
export async function assetExists(assetPath: `/${string}`): Promise<boolean> {
  if (env.NEXT_PUBLIC_ASSET_BASE_URL) return true;
  try {
    await access(path.join(process.cwd(), 'public', assetPath));
    return true;
  } catch {
    return false;
  }
}
