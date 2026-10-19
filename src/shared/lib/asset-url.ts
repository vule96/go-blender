import { env } from '@/shared/config/env';

/**
 * Resolve a public asset path (e.g. `/models/foo.glb`) against the asset CDN.
 * With no CDN configured, files are served from `/public`. A `version` (a
 * content hash) is appended as `?v=` so a changed file gets a new URL and the
 * browser does not keep showing the copy it cached from an earlier deploy.
 */
export function assetUrl(path: `/${string}`, version?: string | null): string {
  const url = env.NEXT_PUBLIC_ASSET_BASE_URL ? `${env.NEXT_PUBLIC_ASSET_BASE_URL}${path}` : path;
  return version ? `${url}?v=${version}` : url;
}
