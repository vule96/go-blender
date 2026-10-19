import 'server-only';

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { env } from '@/shared/config/env';

/** What the server knows about a public asset before the browser asks for it. */
export type AssetCheck =
  { readonly exists: false } | { readonly exists: true; readonly version: string | null };

/**
 * Whether a public asset can be served, plus a short content hash to use as a
 * cache-busting version. Checked on the server so a missing model shows a
 * placeholder instead of a failed download in the browser, and so a rebuilt
 * model gets a new URL (`/models/foo.glb?v=…`) instead of the copy the browser
 * cached from the previous deploy. Assets on a CDN are assumed to exist and
 * carry no version (checking would cost a request).
 */
export async function checkAsset(assetPath: `/${string}`): Promise<AssetCheck> {
  if (env.NEXT_PUBLIC_ASSET_BASE_URL) return { exists: true, version: null };
  try {
    const bytes = await readFile(path.join(process.cwd(), 'public', assetPath));
    return { exists: true, version: createHash('sha1').update(bytes).digest('hex').slice(0, 10) };
  } catch {
    return { exists: false };
  }
}
