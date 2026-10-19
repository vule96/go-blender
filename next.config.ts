import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  experimental: {
    // Tree-shake the big 3D packages: only the parts we import end up in the bundle.
    optimizePackageImports: ['three', '@react-three/drei'],
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  headers() {
    return Promise.resolve([
      {
        // 3D models are large and change rarely. When they move to a CDN with
        // hashed file names, switch this to `max-age=31536000, immutable`.
        source: '/models/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ]);
  },
};

export default nextConfig;
