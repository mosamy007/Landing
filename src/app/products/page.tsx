import React, { Suspense } from 'react';
import FilterableCatalog from '@/components/FilterableCatalog';
import { productService } from '@/lib/productService';

// Enable Incremental Static Regeneration (ISR) with a 10s revalidation interval.
// This guarantees instant initial page loads and caches data at the CDN edge.
export const revalidate = 10;

export default async function ProductsPage() {
  const products = await productService.getProducts();

  return (
    <div className="min-h-screen pb-16 bg-[#f8fafc]">
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center bg-[#f8fafc]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-slate-400">Loading Catalog Browser / جاري تحميل المعرض...</p>
        </div>
      }>
        <FilterableCatalog initialProducts={products} />
      </Suspense>
    </div>
  );
}
