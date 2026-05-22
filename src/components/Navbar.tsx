'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, Search, ArrowRight, Languages } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const { language, toggleLanguage, t, isRtl } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer on path change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: t('home'), href: '/' },
    { name: t('catalog'), href: '/products' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-panel-heavy py-2.5 shadow-sm border-b border-slate-200/50'
          : 'bg-transparent py-4 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo Section - Removed Text LAPSTORE, Full Logo is made bigger */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="relative w-28 h-9 sm:w-36 sm:h-11 transition-all duration-300 hover:scale-105">
                <Image
                  src="/assets/logo.png"
                  alt="LapStore Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold tracking-wide transition-all duration-300 relative py-1 hover:text-blue-600 ${
                    isActive ? 'text-blue-600' : 'text-slate-600'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Action Buttons & Bilingual Switcher */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Search Trigger */}
            <Link
              href="/products?search=true"
              className="p-2 text-slate-500 hover:text-blue-600 rounded-lg transition-colors duration-300"
              aria-label="Search Catalog"
            >
              <Search className="w-4.5 h-4.5" />
            </Link>

            {/* Language Switcher Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-600/30 hover:bg-blue-50 transition-all duration-200"
              title={language === 'en' ? 'تغيير اللغة للعربية' : 'Switch to English'}
            >
              <Languages className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </div>

          {/* Mobile Actions Menu Trigger */}
          <div className="md:hidden flex items-center gap-2">
            
            {/* Language switch on mobile header directly */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {language === 'en' ? 'العربية' : 'EN'}
            </button>

            <Link
              href="/products?search=true"
              className="p-2 text-slate-500 hover:text-blue-600 rounded-lg"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80 focus:outline-none transition-colors"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`md:hidden fixed inset-0 top-[56px] z-40 w-full glass-panel-heavy border-t border-slate-200 transition-all duration-300 transform ${
          isOpen 
            ? 'translate-x-0 opacity-100' 
            : `${isRtl ? '-translate-x-full' : 'translate-x-full'} opacity-0`
        }`}
        style={{ height: 'calc(100vh - 56px)' }}
      >
        <div className="px-6 py-8 flex flex-col gap-6 h-full text-slate-800">
          
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-xl font-bold tracking-wide py-2 border-b border-slate-100 flex items-center justify-between ${
                  isActive ? 'text-blue-600' : 'text-slate-700'
                }`}
              >
                {link.name}
                <ArrowRight className={`w-4 h-4 text-blue-600 ${isRtl ? 'rotate-180' : ''}`} />
              </Link>
            );
          })}

          <div className="mt-auto pb-10 text-center text-xs text-slate-400 border-t border-slate-100 pt-6">
            &copy; 2026 {t('all_rights')}
          </div>
        </div>
      </div>
    </nav>
  );
}
