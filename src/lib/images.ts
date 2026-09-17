import type { ImageMetadata } from 'astro';

// Eagerly import every image under src/assets/images/** so components can resolve
// a plain filename (as stored in content collections and src/data/*.json) to an
// optimized ImageMetadata object, without a hand-written import per asset.
const modules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/**/*.{png,jpg,jpeg,webp,avif}',
  { eager: true }
);

const byFilename = new Map<string, ImageMetadata>();
for (const path in modules) {
  const filename = path.split('/').pop()!;
  byFilename.set(filename, modules[path].default);
}

/**
 * Resolve a bare filename (e.g. "panel-pcc-power-control-centre.png") to its
 * optimized Astro image object. Throws at build time if the file is missing —
 * a broken image reference should fail the build, not ship silently.
 */
export function img(filename: string): ImageMetadata {
  const found = byFilename.get(filename);
  if (!found) {
    throw new Error(
      `[images] "${filename}" was not found under src/assets/images/. ` +
        `Check the filename in your content/data file.`
    );
  }
  return found;
}

export function hasImg(filename: string): boolean {
  return byFilename.has(filename);
}
