import React from 'react';
import { productService } from '@/lib/productService';
import HomeClient from '@/components/HomeClient';

// Always query the database dynamically on page load
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const featuredLaptops = await productService.getFeaturedProducts();

  return (
    <div className="min-h-screen">
      <HomeClient featuredLaptops={featuredLaptops} />
    </div>
  );
}
