import type { ImageLoaderProps } from "next/image";

const UNSPLASH_HOST = "images.unsplash.com";

/**
 * Serve Unsplash images straight from Unsplash's CDN (already resized, AVIF/WebP via
 * auto=format) instead of re-optimizing them through /_next/image. Saves a hop and the
 * Vercel image-optimization quota.
 */
export function unsplashLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "crop");
  return url.toString();
}

/** Returns the Unsplash loader for Unsplash URLs, otherwise undefined (default optimizer). */
export function loaderFor(src: string) {
  try {
    return new URL(src).hostname === UNSPLASH_HOST ? unsplashLoader : undefined;
  } catch {
    return undefined;
  }
}
