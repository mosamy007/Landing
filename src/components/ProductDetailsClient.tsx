'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { MessageSquare, ArrowLeft, X, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { LaptopProduct } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';

interface ProductDetailsClientProps {
  product: LaptopProduct;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const { language, t, formatPrice, isRtl } = useLanguage();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Setup product images fallback if empty
  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800'];

  const handleWhatsAppInquiry = () => {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '15550199';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lapstore.vercel.app';
    const productUrl = `${baseUrl}/product/${product.slug}`;
    
    // Construct pre-filled bilingual message matching format requirements:
    const message = language === 'ar'
      ? `مرحباً، أود الاستفسار عن شراء هذا الجهاز:\n*الجهاز:* ${product.title}\n*السعر:* ${formatPrice(product.price)}\n*الرابط:* ${productUrl}`
      : `Hello, I want to buy this laptop:\n*Product:* ${product.title}\n*Price:* ${formatPrice(product.price)}\n*Link:* ${productUrl}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-slate-800">
      
      {/* 1. Back button */}
      <Link
        href="/products"
        className={`inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors mb-8 group ${isRtl ? 'flex-row-reverse' : ''}`}
      >
        <ArrowLeft className={`w-3.5 h-3.5 transition-transform duration-200 ${isRtl ? 'group-hover:translate-x-1 rotate-180' : 'group-hover:-translate-x-1'}`} />
        <span>{t('back_catalog')}</span>
      </Link>

      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-start ${isRtl ? 'lg:flex-row-reverse' : ''}`}>
        
        {/* 2. IMAGE GALLERY (Left - Col span 6) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Active image */}
          <div 
            onClick={() => {
              setIsOpen(true);
              setLightboxIdx(activeImageIdx);
            }}
            className="relative h-[300px] sm:h-[420px] w-full border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-sm cursor-zoom-in group"
          >
            <Image
              src={images[activeImageIdx]}
              alt={`${product.title} - View ${activeImageIdx + 1}`}
              fill
              className="object-contain p-4 transition-all duration-500 group-hover:scale-102"
              sizes="(max-w-768px) 100vw, 600px"
              priority
            />
          </div>

          {/* Thumbnail list */}
          {images.length > 1 && (
            <div className={`flex gap-3 overflow-x-auto pb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-20 h-20 rounded-xl border overflow-hidden shrink-0 transition-all duration-300 ${
                    activeImageIdx === idx
                      ? 'border-blue-600 bg-blue-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.title} Thumb ${idx + 1}`}
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. PRODUCT DETAILS (Right - Col span 6) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Brand, Title, Price */}
          <div className={`space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
            <div className={`flex flex-wrap items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <span className="px-3 py-1 rounded-full text-[9px] font-black bg-blue-50 border border-blue-200 text-blue-600 uppercase tracking-wider">
                {product.brand}
              </span>
              {product.featured && (
                <span className="px-3 py-1 rounded-full text-[9px] font-black bg-purple-50 border border-purple-200 text-purple-600 uppercase tracking-wider">
                  {language === 'ar' ? 'جهاز مميز' : 'Featured flagship'}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight font-sans">
              {product.title}
            </h1>

            <div className={`flex items-baseline gap-3 pt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{t('showcase_price')}</span>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{formatPrice(product.price)}</p>
            </div>
          </div>

          {/* WhatsApp Action Button */}
          <div className="p-[1px] rounded-2xl bg-emerald-500/20 shadow-sm hover:shadow-emerald-500/10 transition-all duration-300">
            <button
              onClick={handleWhatsAppInquiry}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 text-base group"
            >
              <MessageSquare className="w-5 h-5 text-white" />
              <span>{t('inquire_whatsapp')}</span>
            </button>
          </div>

          {/* Description */}
          <div className={`space-y-3 ${isRtl ? 'text-right' : 'text-left'}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">{t('description')}</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-sans font-light">
              {product.description}
            </p>
          </div>

          {/* Specifications Table (Strict Format Requirement) */}
          <div className={`space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">{t('specifications')}</h3>
            
            <div className="glass-panel rounded-2xl border border-slate-200 p-6 space-y-4 bg-white/50">
              {/* Mandatory precise layout structure */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs text-slate-800 ${isRtl ? 'text-right' : 'text-left'}`}>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('brand_label')}:</span>
                  <span className="font-semibold text-slate-900">{product.brand}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('laptop_model')}:</span>
                  <span className="font-semibold text-slate-900">{product.laptop_model}</span>
                </div>
                <div className="sm:col-span-2 border-t border-slate-100 my-1" />
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('processor')}:</span>
                  <span className="font-semibold text-slate-900 inline-block" dir="ltr">{product.processor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('ram_label')}:</span>
                  <span className="font-semibold text-slate-900 inline-block" dir="ltr">{product.ram}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('storage_label')}:</span>
                  <span className="font-semibold text-slate-900 inline-block" dir="ltr">{product.storage}</span>
                </div>
                <div className="sm:col-span-2 border-t border-slate-100 my-1" />
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('graphics')}:</span>
                  <span className="font-semibold text-slate-900 inline-block" dir="ltr">{product.graphics}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('display')}:</span>
                  <span className="font-semibold text-slate-900 inline-block" dir="ltr">{product.display}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Overlay */}
      {isOpen && mounted && createPortal(
        <div 
          onClick={() => {
            setIsOpen(false);
            setZoomScale(1);
          }}
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col justify-between items-center p-4 animate-fade-in font-sans cursor-zoom-out"
        >
          {/* Header Controls */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full flex items-center justify-between text-white py-2 px-4 z-20"
          >
            <span className="text-xs font-mono text-slate-400">
              {lightboxIdx + 1} / {images.length}
            </span>
            <div className="flex items-center gap-4">
              {/* Zoom Out */}
              <button
                onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.25))}
                className="p-2 rounded-full hover:bg-slate-800 text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <Minus className="w-5 h-5 pointer-events-none" />
              </button>
              {/* Reset Zoom */}
              <button
                onClick={() => setZoomScale(1)}
                className="text-xs font-bold px-2.5 py-1 rounded border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                100%
              </button>
              {/* Zoom In */}
              <button
                onClick={() => setZoomScale(prev => Math.min(3, prev + 0.25))}
                className="p-2 rounded-full hover:bg-slate-800 text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <Plus className="w-5 h-5 pointer-events-none" />
              </button>
            </div>
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                setZoomScale(1);
              }}
              className="p-2 rounded-full hover:bg-slate-800 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6 pointer-events-none" />
            </button>
          </div>

          {/* Main Content (Image & Navigation Arrows) */}
          <div className="relative flex-grow w-full flex items-center justify-center overflow-hidden">
            {/* Previous Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx(prev => (prev - 1 + images.length) % images.length);
                setZoomScale(1);
              }}
              className="absolute left-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all z-20 border border-slate-800 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6 pointer-events-none" />
            </button>

            {/* Enlarged Image container */}
            <div 
              className="relative w-full h-[70vh] flex items-center justify-center transition-transform duration-200 pointer-events-none"
              style={{ transform: `scale(${zoomScale})` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[lightboxIdx]}
                alt={`${product.title} Lightbox`}
                className="max-w-full max-h-full object-contain pointer-events-none"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx(prev => (prev + 1) % images.length);
                setZoomScale(1);
              }}
              className="absolute right-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all z-20 border border-slate-800 cursor-pointer"
            >
              <ChevronRight className="w-6 h-6 pointer-events-none" />
            </button>
          </div>

          {/* Bottom Thumbnails */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full py-4 flex justify-center gap-2 overflow-x-auto z-20"
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setLightboxIdx(idx);
                  setZoomScale(1);
                }}
                className={`relative w-12 h-12 rounded-lg border overflow-hidden shrink-0 transition-all cursor-pointer ${
                  lightboxIdx === idx
                    ? 'border-blue-500 scale-105 shadow-sm bg-slate-900'
                    : 'border-slate-800 opacity-60 hover:opacity-100 bg-black'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt="Thumb"
                  className="w-full h-full object-contain p-0.5 pointer-events-none"
                />
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
