'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, MessageSquare, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { language, t, isRtl } = useLanguage();
  const currentYear = new Date().getFullYear();

  const handleWhatsAppClick = () => {
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '15550199';
    const text = encodeURIComponent(
      language === 'ar'
        ? 'مرحباً، أود الاستفسار عن أجهزة اللابتوب المتوفرة في المتجر.'
        : 'Hello, I have an inquiry about laptops at LapStore.'
    );
    window.open(`https://wa.me/${number}?text=${text}`, '_blank');
  };

  return (
    <footer className="glass-panel-heavy border-t border-slate-200/60 relative z-10 overflow-hidden bg-white/60">
      {/* Decorative gradient overlay (hidden on mobile for rendering speed) */}
      <div className="hidden lg:block absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full -mr-20 -mt-20 pointer-events-none" />
      <div className="hidden lg:block absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 blur-[120px] rounded-full -ml-20 -mb-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-slate-700">

          {/* Logo & Brand statement */}
          <div className="space-y-6 md:col-span-1">
            <Link href="/" className="flex items-center group">
              <div className="relative w-32 h-10 transition-all duration-300 hover:scale-105">
                <Image
                  src="/assets/logo.png"
                  alt="LapStore Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed font-sans font-light">
              {t('footer_desc')}
            </p>
            <button
              onClick={handleWhatsAppClick}
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200 group/wa"
            >
              <span>{language === 'ar' ? 'تواصل مع المبيعات' : 'Contact Sales Agent'}</span>
              <ArrowUpRight className={`w-3.5 h-3.5 transition-transform duration-200 group-hover/wa:translate-x-0.5 group-hover/wa:-translate-y-0.5 ${isRtl ? 'rotate-270' : ''}`} />
            </button>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">{t('catalog')}</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <Link href="/products" className="hover:text-blue-600 transition-colors duration-200">
                  {language === 'ar' ? 'جميع المنتجات' : 'All Products'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">{language === 'ar' ? 'معلومات الإتصال' : 'Contact Info'}</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'البحيرة, كفرالدوار, أبراج الحلواني, أمام موقف العوايد.'
                    : 'Behiera, Kafr El Dawar, Halawany Towers.'}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <span dir="ltr">
                  {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+201012345678'}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span>info@lapstore.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 text-center text-xs text-slate-400">
          <p>
            &copy; {currentYear} <span className="font-semibold text-slate-500">{language === 'ar' ? 'شركة لاب ستور' : 'LapStore'}</span>. {t('all_rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
