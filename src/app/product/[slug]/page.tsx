import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { productService } from '@/lib/productService';
import ProductDetailsClient from '@/components/ProductDetailsClient';

// Enable Incremental Static Regeneration (ISR) with a 10s revalidation interval.
// This guarantees instant initial page loads and caches data at the CDN edge.
export const revalidate = 10;

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

/**
 * Dynamic Metadata Generator for high-quality SEO ranking.
 * Instantly updates tags based on the active laptop specs.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await productService.getProductBySlug(resolvedParams.slug);

  if (!product) {
    return {
      title: 'Laptop Not Found | LapStore',
      description: 'The requested laptop configuration could not be found in our database.',
    };
  }

  return {
    title: `${product.title} - Specs & Inquiry | LapStore`,
    description: `Inspect detailed specifications for the ${product.brand} ${product.laptop_model}. Brand: ${product.brand}, CPU: ${product.processor}, RAM: ${product.ram}, GPU: ${product.graphics}. Contact us directly via WhatsApp to purchase.`,
    openGraph: {
      title: `${product.title} - ${product.price.toLocaleString()} EGP at LapStore`,
      description: `Premium Specs: ${product.processor} | ${product.ram} RAM | ${product.storage} SSD | ${product.graphics}. Click to inspect details and purchase.`,
      images: [
        {
          url: product.images[0] || '/assets/logo.png',
          alt: product.title,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const product = await productService.getProductBySlug(resolvedParams.slug);

  if (!product) {
    // Basic server fallback, client details handles localization of found items.
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#f8fafc]">
        <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-slate-200 text-center space-y-6 bg-white shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-900">Laptop Not Found / الحاسوب غير موجود</h1>
          <p className="text-xs text-slate-400">
            The laptop you are looking for does not exist in our catalog or may have been sold out.
            <br />
            المواصفات المطلوبة غير موجودة في كتالوجنا حالياً أو تم بيعها.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Catalog / العودة للكتالوج
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 bg-[#f8fafc]">
      <ProductDetailsClient product={product} />
    </div>
  );
}
