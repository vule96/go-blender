import { z } from 'zod';

/**
 * Public (browser-exposed) environment variables, validated once at startup.
 * Next.js inlines `process.env.NEXT_PUBLIC_*` at build time, so each key must
 * be referenced literally here.
 */
const PublicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
  NEXT_PUBLIC_ASSET_BASE_URL: z
    .union([z.url(), z.literal('')])
    .default('')
    .transform((v) => v.replace(/\/+$/, '')),
});

/** Treat `FOO=` (empty) in .env files the same as an unset variable. */
const blankToUndefined = (value: string | undefined): string | undefined =>
  value?.trim() ? value : undefined;

// Next.js inlines NEXT_PUBLIC_* only for literal `process.env.NAME` reads, so keep them spelled out.
export const env = PublicEnvSchema.parse({
  NEXT_PUBLIC_SITE_URL: blankToUndefined(process.env.NEXT_PUBLIC_SITE_URL),
  NEXT_PUBLIC_ASSET_BASE_URL: blankToUndefined(process.env.NEXT_PUBLIC_ASSET_BASE_URL),
});

export type PublicEnv = z.infer<typeof PublicEnvSchema>;
