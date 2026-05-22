'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, ArrowRight, X, Sparkles } from 'lucide-react';
import { LaptopProduct } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';

interface FilterableCatalogProps {
  initialProducts: LaptopProduct[];
}

export default function FilterableCatalog({ initialProducts }: FilterableCatalogProps) {
  const searchParams = useSearchParams();
  const { language, t, formatPrice, isRtl } = useLanguage();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedRAM, setSelectedRAM] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  
  // Mobile filter drawer state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Initialize filters from URL query parameters
  useEffect(() => {
    const brandQuery = searchParams.get('brand');
    const searchParamQuery = searchParams.get('search');
    const featuredQuery = searchParams.get('featured');

    if (brandQuery) {
      setSelectedBrand(brandQuery);
    }
    if (searchParamQuery && searchParamQuery !== 'true') {
      setSearchQuery(searchParamQuery);
    }
    if (featuredQuery === 'true') {
      setFeaturedOnly(true);
    }
  }, [searchParams]);

  // Extract filter checklists dynamically from database records (decouples from mock lists)
  const BRANDS = useMemo(() => {
    const set = new Set(initialProducts.map((p) => p.brand).filter(Boolean));
    return Array.from(set).sort();
  }, [initialProducts]);

  const RAM_OPTIONS = useMemo(() => {
    const set = new Set(initialProducts.map((p) => p.ram).filter(Boolean));
    return Array.from(set).sort();
  }, [initialProducts]);

  const STORAGE_OPTIONS = useMemo(() => {
    const set = new Set(initialProducts.map((p) => p.storage).filter(Boolean));
    return Array.from(set).sort();
  }, [initialProducts]);

  const maxProductPrice = useMemo(() => {
    if (initialProducts.length === 0) return 300000;
    const maxVal = Math.max(...initialProducts.map((p) => p.price));
    return maxVal > 300000 ? maxVal : 300000;
  }, [initialProducts]);

  useEffect(() => {
    setMaxPrice(maxProductPrice);
  }, [maxProductPrice]);

  const toggleRAM = (ram: string) => {
    setSelectedRAM((prev) =>
      prev.includes(ram) ? prev.filter((r) => r !== ram) : [...prev, ram]
    );
  };

  const toggleStorage = (storage: string) => {
    setSelectedStorage((prev) =>
      prev.includes(storage) ? prev.filter((s) => s !== storage) : [...prev, storage]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedBrand('');
    setSelectedRAM([]);
    setSelectedStorage([]);
    setFeaturedOnly(false);
    setMaxPrice(maxProductPrice);
  };

  // Memoized Filter Pipeline
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // 1. Keyword search checking
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.laptop_model.toLowerCase().includes(query) ||
          product.processor.toLowerCase().includes(query) ||
          product.graphics.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // 2. Brand checking
      if (selectedBrand && product.brand !== selectedBrand) {
        return false;
      }

      // 3. RAM checking
      if (selectedRAM.length > 0) {
        const matchesRAM = selectedRAM.some((ram) =>
          product.ram.toLowerCase().includes(ram.toLowerCase())
        );
        if (!matchesRAM) return false;
      }

      // 4. Storage checking
      if (selectedStorage.length > 0) {
        const matchesStorage = selectedStorage.some((storage) =>
          product.storage.toLowerCase().includes(storage.toLowerCase())
        );
        if (!matchesStorage) return false;
      }

      // 5. Featured checking
      if (featuredOnly && !product.featured) {
        return false;
      }

      // 6. Max Price checking
      if (product.price > maxPrice) {
        return false;
      }

      return true;
    });
  }, [initialProducts, searchQuery, selectedBrand, selectedRAM, selectedStorage, featuredOnly, maxPrice]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-slate-800">
      
      {/* 1. Page Header */}
      <div className={`space-y-3 mb-8 text-center ${isRtl ? 'sm:text-right' : 'sm:text-left'}`}>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-sans">
          {language === 'ar' ? (
            <span>الأجهزة المتوفرة</span>
          ) : (
            <>
              Our <span className="text-gradient-cyan-purple">Laptops</span>
            </>
          )}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
          {language === 'ar'
            ? 'اضغط على أي جهاز لمعاينة تفصيلية لمواصفاته ثم تواصل مع المبيعات مباشرة.'
            : 'Click any product to explore complete hardware specs and inquire directly.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 2. DESKTOP FILTERS SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-3 glass-panel rounded-2xl p-6 space-y-6 sticky top-28 border border-slate-200 bg-white/50">
          <div className={`flex items-center justify-between border-b border-slate-100 pb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('filter_title')}</span>
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-slate-400 hover:text-blue-600 font-bold transition-colors"
            >
              {t('reset_filters')}
            </button>
          </div>

          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{language === 'ar' ? 'بحث نصي' : 'Search'}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs glass-input"
              />
            </div>
          </div>

          {/* Brand select */}
          {BRANDS.length > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('brand')}</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs glass-input bg-white/70"
              >
                <option value="">{language === 'ar' ? 'جميع الماركات' : 'All Brands'}</option>
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Featured only checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="featuredOnly"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="featuredOnly" className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>{t('featured_only')}</span>
            </label>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3">
            <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('price_range')}</label>
              <span className="text-xs font-black text-blue-600">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="500"
              max={maxProductPrice > 500 ? maxProductPrice : 300000}
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-blue-600 bg-slate-200 rounded-lg h-1"
            />
          </div>

          {/* RAM Checkboxes */}
          {RAM_OPTIONS.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('ram')}</label>
              <div className="space-y-1.5">
                {RAM_OPTIONS.map((r) => (
                  <label key={r} className={`flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer hover:text-blue-600 transition-colors ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedRAM.includes(r)}
                      onChange={() => toggleRAM(r)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Storage Checkboxes */}
          {STORAGE_OPTIONS.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('storage')}</label>
              <div className="space-y-1.5">
                {STORAGE_OPTIONS.map((s) => (
                  <label key={s} className={`flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer hover:text-blue-600 transition-colors ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedStorage.includes(s)}
                      onChange={() => toggleStorage(s)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* 3. CATALOG CONTENT AREA */}
        <section className="col-span-1 lg:col-span-9 space-y-6">
          
          {/* Top Bar for Mobile / Quick Search */}
          <div className={`flex items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className="relative flex-grow lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs glass-input"
              />
            </div>

            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 flex items-center justify-center gap-2 text-xs font-bold shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" /> 
              <span>{language === 'ar' ? 'تصفية' : 'Filters'}</span>
            </button>

            <span className="hidden sm:inline-block text-xs font-bold text-slate-400 uppercase tracking-wider">
              {language === 'ar' 
                ? `يعرض ${filteredProducts.length} جهاز` 
                : `Showing ${filteredProducts.length} Laptops`}
            </span>
          </div>

          {/* Empty Results state */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 glass-panel rounded-3xl border border-slate-200 space-y-4 bg-white/50">
              <div className="text-4xl">🔍❌</div>
              <h3 className="text-lg font-black text-slate-900">{t('no_matching')}</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                {language === 'ar'
                  ? 'لم نجد أي جهاز يطابق معايير التصفية. يرجى تجربة إعادة ضبط التصفية أو تغيير كلمات البحث.'
                  : 'No setups matched your query parameters. Try modifying values or checking filters.'}
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/10"
              >
                {language === 'ar' ? 'عرض الكتالوج كاملاً' : 'Clear All Filters'}
              </button>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white overflow-hidden hover-glow-card group relative"
              >
                {product.featured && (
                  <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-50 border border-purple-200 text-purple-600 uppercase tracking-widest">
                    {language === 'ar' ? 'مميز' : 'Featured'}
                  </span>
                )}

                {/* Card Image */}
                <Link href={`/product/${product.slug}`} className="h-48 relative w-full overflow-hidden bg-slate-50 border-b border-slate-100 block">
                  <Image
                    src={product.images[0] || 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800'}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-w-768px) 100vw, (max-w-1200px) 33vw, 280px"
                  />
                </Link>

                {/* Card Body */}
                <div className="p-5 flex-grow flex flex-col space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{product.brand}</span>
                    <h3 className="text-base font-extrabold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      <Link href={`/product/${product.slug}`}>
                        {product.title}
                      </Link>
                    </h3>
                  </div>

                   {/* Specs Quick Checklist */}
                  <div className="space-y-1.5 text-xs text-slate-500 border-t border-b border-slate-100 py-3 font-sans">
                    <div className={`flex justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{t('processor')}</span>
                      <span className="font-semibold text-slate-700 line-clamp-1 max-w-[130px]" dir="ltr">{product.processor.split(' (')[0]}</span>
                    </div>
                    <div className={`flex justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{t('graphics')}</span>
                      <span className="font-semibold text-slate-700 line-clamp-1 max-w-[130px]" dir="ltr">{product.graphics.split(' (')[0]}</span>
                    </div>
                    <div className={`flex justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{t('ram_label')} / {t('storage_label')}</span>
                      <span className="font-semibold text-slate-700" dir="ltr">{product.ram} / {product.storage}</span>
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
        </section>
      </div>

      {/* 4. MOBILE FILTERS DRAWER */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 transform ${
          showMobileFilters ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setShowMobileFilters(false)}
        />

        {/* Dynamic sliding panel (sliding from correct dir based on RTL) */}
        <div
          className={`absolute top-0 bottom-0 w-80 max-w-full glass-panel-heavy p-6 space-y-6 overflow-y-auto bg-white transition-transform duration-300 transform ${
            isRtl ? 'left-0' : 'right-0'
          } ${
            showMobileFilters 
              ? 'translate-x-0' 
              : isRtl ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className={`flex items-center justify-between border-b border-slate-100 pb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('filter_title')}</span>
            </span>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Brand select */}
          {BRANDS.length > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('brand')}</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs glass-input bg-white"
              >
                <option value="">{language === 'ar' ? 'جميع الماركات' : 'All Brands'}</option>
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Featured checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="mobileFeaturedOnly"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="mobileFeaturedOnly" className="text-[10px] font-black text-slate-600 uppercase tracking-wider cursor-pointer">
              {t('featured_only')}
            </label>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3">
            <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('price_range')}</label>
              <span className="text-xs font-black text-blue-600">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="500"
              max={maxProductPrice > 500 ? maxProductPrice : 300000}
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-blue-600 bg-slate-200 rounded-lg h-1"
            />
          </div>

          {/* RAM Checkboxes */}
          {RAM_OPTIONS.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('ram')}</label>
              <div className="space-y-1.5">
                {RAM_OPTIONS.map((r) => (
                  <label key={r} className={`flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer ${isRtl ? 'flex-row-reverse font-sans' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedRAM.includes(r)}
                      onChange={() => toggleRAM(r)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Storage Checkboxes */}
          {STORAGE_OPTIONS.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('storage')}</label>
              <div className="space-y-1.5">
                {STORAGE_OPTIONS.map((s) => (
                  <label key={s} className={`flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer ${isRtl ? 'flex-row-reverse font-sans' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedStorage.includes(s)}
                      onChange={() => toggleStorage(s)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Reset button inside mobile */}
          <button
            onClick={() => {
              resetFilters();
              setShowMobileFilters(false);
            }}
            className="w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs"
          >
            {t('reset_filters')}
          </button>
        </div>
      </div>
    </div>
  );
}
