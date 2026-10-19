import { env } from '@/shared/config/env';

/**
 * Resolve a public asset path (e.g. `/models/foo.glb`) against the asset CDN.
 * With no CDN configured, files are served from `/public`.
 */
export function assetUrl(path: `/${string}`): string {
  return env.NEXT_PUBLIC_ASSET_BASE_URL ? `${env.NEXT_PUBLIC_ASSET_BASE_URL}${path}` : path;
}
