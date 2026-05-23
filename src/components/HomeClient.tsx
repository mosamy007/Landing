'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { LaptopProduct } from '@/lib/types';

interface HomeClientProps {
  featuredLaptops: LaptopProduct[];
}

export default function HomeClient({ featuredLaptops }: HomeClientProps) {
  const { language, t, isRtl } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-800 pb-20 relative w-full overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative w-full flex items-center justify-center overflow-hidden px-4 py-12 sm:py-24 z-10">
        {/* Glow backdrop grid (hidden on mobile for rendering speed) */}
        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="hidden md:block absolute top-1/3 left-1/3 w-[500px] h-[250px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 w-full space-y-8">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight font-sans text-slate-900">
            {t('hero_title_1')} <br />
            <span className="text-gradient-cyan-purple">{t('hero_title_2')}</span>
          </h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/products"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>{t('btn_catalog')}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
