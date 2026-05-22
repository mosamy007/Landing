'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowRight, X } from 'lucide-react';
import { LaptopProduct } from '@/lib/types';
import { productService } from '@/lib/productService';
import { useLanguage } from '@/context/LanguageContext';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language, t, formatPrice, isRtl } = useLanguage();

  // Search input state
  const queryParam = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(queryParam);
  const [laptops, setLaptops] = useState<LaptopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state with URL parameter changes
  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  // Load catalog on mount
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts();
        setLaptops(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // Compute matched items
  const matches = useMemo(() => {
    if (!queryParam.trim()) return [];
    const q = queryParam.toLowerCase();
    return laptops.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.laptop_model.toLowerCase().includes(q) ||
        p.processor.toLowerCase().includes(q) ||
        p.graphics.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [laptops, queryParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-20 text-slate-800 bg-[#f8fafc]">
      
      {/* Search Header */}
      <div className={`space-y-4 text-center max-w-xl mx-auto ${isRtl ? 'text-right' : 'text-left'}`}>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-sans text-center">
          {t('search_results')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 text-center">
          {t('search_desc')}
        </p>

        {/* Dynamic Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-xl text-xs glass-input"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : !queryParam.trim() ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-slate-200 space-y-4 max-w-md mx-auto bg-white/50">
          <div className="text-4xl">🔍</div>
          <h2 className="text-base font-extrabold text-slate-900">{t('awaiting_search')}</h2>
          <p className="text-xs text-slate-400">
            {t('awaiting_search_desc')}
          </p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-slate-200 space-y-4 max-w-md mx-auto bg-white/50">
          <div className="text-4xl">🤷‍♂️</div>
          <h2 className="text-base font-extrabold text-slate-900">{t('no_search_matches')}</h2>
          <p className="text-xs text-slate-400">
            {t('no_search_matches_desc')}
          </p>
          <button
            onClick={() => router.push('/products')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all duration-200"
          >
            {language === 'ar' ? 'تصفح الكتالوج كاملاً' : 'Browse Full Catalog'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className={`text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2 flex gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <span>
              {language === 'ar'
                ? `تم العثور على ${matches.length} جهاز مطابقة لـ`
                : `Found ${matches.length} matching laptops for`}
            </span>
            <span className="text-blue-600">&quot;{queryParam}&quot;</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((product) => (
              <div
                key={product.id}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white overflow-hidden hover-glow-card group relative"
              >
                {product.featured && (
                  <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-50 border border-purple-200 text-purple-600 uppercase tracking-widest">
                    {language === 'ar' ? 'مميز' : 'Featured'}
                  </span>
                )}

                {/* Card image */}
                <div className="h-48 relative w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                  <Image
                    src={product.images[0] || 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800'}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="280px"
                  />
                </div>

                {/* Card body */}
                <div className="p-5 flex-grow flex flex-col space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{product.brand}</span>
                    <h3 className="text-base font-extrabold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {product.title}
                    </h3>
                  </div>

                  {/* Specs Quick Checklist */}
                  <div className="space-y-1.5 text-xs text-slate-500 border-t border-b border-slate-100 py-3 font-sans">
                    <div className={`flex justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{t('processor')}</span>
                      <span className="font-semibold text-slate-700 line-clamp-1 max-w-[130px]">{product.processor.split(' (')[0]}</span>
                    </div>
                    <div className={`flex justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{t('graphics')}</span>
                      <span className="font-semibold text-slate-700 line-clamp-1 max-w-[130px]">{product.graphics.split(' (')[0]}</span>
                    </div>
                    <div className={`flex justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{t('ram_label')} / {t('storage_label')}</span>
                      <span className="font-semibold text-slate-700">{product.ram} / {product.storage}</span>
                    </div>
                  </div>

                  {/* Bottom section */}
                  <div className={`mt-auto pt-2 flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className={`space-y-0.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('showcase_price')}</span>
                      <p className="text-lg font-black text-slate-900">{formatPrice(product.price)}</p>
                    </div>
                    <Link
                      href={`/product/${product.slug}`}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 bg-white hover:text-blue-600 hover:border-blue-600/30 hover:bg-slate-50 transition-all duration-200 flex items-center gap-1"
                    >
                      <span>{t('inspect_specs')}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center bg-[#f8fafc]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-400">Loading Search Portal...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
