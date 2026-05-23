import { ImageLoaderProps } from 'next/image';

/**
 * Custom Next.js image loader that leverages Supabase and Unsplash dynamic optimization APIs.
 * This offloads heavy image processing workloads from the Next.js server, delivering highly
 * optimized files directly from high-speed CDNs.
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  // 1. Supabase Storage Image Optimization API
  if (src.includes('supabase.co') && src.includes('/storage/v1/object/public/')) {
    const cleanUrl = src.split('?')[0]; // Strip any existing search query params
    
    // Convert object delivery URL to the dynamic render endpoint
    const renderUrl = cleanUrl.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    
    return `${renderUrl}?width=${width}&quality=${quality || 75}&resize=contain`;
  }

  // 2. Unsplash Dynamic Optimization API
  if (src.includes('images.unsplash.com')) {
    const url = new URL(src);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('q', (quality || 75).toString());
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'crop');
    return url.toString();
  }

  // Fallback for local assets (public folder) and other image domains
  return src;
}
