/**
 * Start downloading the three.js scene chunk before the user lands on a page
 * that needs it (on hover or focus of a link to a landmark with a model).
 * The import is the same module `next/dynamic` loads, so it is one chunk.
 */
let started = false;

export function preloadModelScene(): void {
  if (started || typeof window === 'undefined') return;
  started = true;
  void import('./ui/model-scene');
}
