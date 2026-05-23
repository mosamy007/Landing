import React from 'react';
import { productService } from '@/lib/productService';
import HomeClient from '@/components/HomeClient';

// Enable Incremental Static Regeneration (ISR) with a 10s revalidation interval.
// This guarantees instant initial page loads and caches data at the CDN edge.
export const revalidate = 10;

export default async function HomePage() {
  const featuredLaptops = await productService.getFeaturedProducts();

  return (
    <div className="min-h-screen">
      <HomeClient featuredLaptops={featuredLaptops} />
    </div>
  );
}
