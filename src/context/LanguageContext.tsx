'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

  interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: string) => string;
    formatPrice: (price: number | string) => string;
    isRtl: boolean;
  }

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  home: { en: 'Home', ar: 'الرئيسية' },
  catalog: { en: 'Products', ar: 'الأجهزة المتوفرة' },
  search: { en: 'Search', ar: 'البحث' },
  admin: { en: 'Admin Panel', ar: 'لوحة التحكم' },
  all_rights: { en: 'All rights reserved.', ar: 'جميع الحقوق محفوظة.' },

  // Hero Section
  hero_tag: { en: 'PREMIUM LAPTOP CATALOG', ar: 'كتالوج حواسيب محمولة ممتازة' },
  hero_title_1: { en: 'NEED A LAPTOP?', ar: 'محتاج لابتوب؟' },
  hero_title_2: { en: 'WE GOT YOU COVERED', ar: 'جهازك عندنا' },
  hero_subtitle: { en: '', ar: '' },
  btn_catalog: { en: 'Our Laptops', ar: 'الأجهزة المتوفرة' },
  btn_admin: { en: 'Admin Dashboard', ar: 'لوحة التحكم' },

  // Brands / Quick Filters
  quick_brands: { en: 'Top Flagship Brands', ar: 'أبرز العلامات التجارية الرائدة' },
  featured_title: { en: 'Featured Flagships', ar: 'حواسيب رائدة مختارة' },
  featured_sub: { en: 'Our premium hand-picked performance rigs currently in stock.', ar: 'أقوى الحواسيب الممتازة المحددة يدوياً والمتوفرة حالياً في المخزن.' },

  // Value props
  val_direct: { en: 'Direct Inquiry', ar: 'استفسار مباشر' },
  val_direct_desc: { en: 'Skip shopping carts. Purchase directly by sending a WhatsApp message to our sales agent.', ar: 'تخطى سلة التسوق. اشترِ مباشرة عن طريق إرسال رسالة واتساب إلى موظف المبيعات لدينا.' },
  val_genuine: { en: 'Genuine Hardware', ar: 'أجهزة أصلية ١٠٠٪' },
  val_genuine_desc: { en: 'All laptops are sourced from certified manufacturers with verified hardware specs.', ar: 'جميع الأجهزة مستوردة من الشركات المصنعة المعتمدة مع مواصفات أصلية ومحققة.' },
  val_support: { en: '24/7 Premium Support', ar: 'دعم ممتاز متواصل' },
  val_support_desc: { en: 'Our technical team is ready to answer spec and pricing questions instantly.', ar: 'فريقنا التقني مستعد للإجابة على جميع الأسئلة التقنية والأسعار على الفور.' },

  // Catalog Filters
  filter_title: { en: 'Catalog Filters', ar: 'تصفية الكتالوج' },
  search_placeholder: { en: 'Search brands, specs, model...', ar: 'ابحث عن العلامات، المواصفات، الطراز...' },
  brand: { en: 'Brand', ar: 'العلامة التجارية' },
  ram: { en: 'RAM Memory', ar: 'الذاكرة العشوائية' },
  storage: { en: 'SSD Storage', ar: 'مساحة التخزين' },
  price_range: { en: 'Price Range', ar: 'نطاق السعر' },
  featured_only: { en: 'Featured flagships only', ar: 'الأجهزة المميزة فقط' },
  reset_filters: { en: 'Reset Filters', ar: 'إعادة ضبط التصفية' },
  no_matching: { en: 'No matching workstations found.', ar: 'لا توجد أجهزة مطابقة للبحث.' },
  specifications: { en: 'Specifications', ar: 'المواصفات' },
  inspect_specs: { en: 'Inspect Specs', ar: 'معاينة المواصفات' },

  // Product Details
  back_catalog: { en: 'Back to Catalog', ar: 'العودة للكتالوج' },
  showcase_price: { en: 'Showcase Price', ar: 'سعر العرض' },
  inquire_whatsapp: { en: 'Purchase / Inquire', ar: 'شراء/استفسار' },
  description: { en: 'Description', ar: 'الوصف' },
  brand_label: { en: 'Brand', ar: 'العلامة التجارية' },
  laptop_model: { en: 'Laptop model', ar: 'طراز اللابتوب' },
  processor: { en: 'Processor', ar: 'المعالج' },
  ram_label: { en: 'RAM', ar: 'الذاكرة العشوائية' },
  storage_label: { en: 'Storage', ar: 'مساحة التخزين' },
  graphics: { en: 'Graphics', ar: 'كرت الشاشة' },
  display: { en: 'Display', ar: 'الشاشة' },
  not_found: { en: 'Laptop Not Found', ar: 'الحاسوب غير موجود' },
  not_found_desc: { en: 'The requested laptop configuration could not be found or has been sold out.', ar: 'المواصفات المطلوبة غير موجودة في كتالوجنا حالياً أو تم بيعها.' },

  // Search Results
  search_results: { en: 'SEARCH RESULTS', ar: 'نتائج البحث' },
  search_desc: { en: 'Search our catalog for high-performance laptops.', ar: 'ابحث في كتالوجنا عن الحواسيب فائقة الأداء.' },
  found_matches: { en: 'Found {count} matching laptops for', ar: 'تم العثور على {count} أجهزة مطابقة لـ' },
  awaiting_search: { en: 'Awaiting Search Input', ar: 'بانتظار كلمة البحث' },
  awaiting_search_desc: { en: 'Please enter keywords in the search bar above.', ar: 'يرجى إدخال كلمات البحث في الشريط العلوي.' },
  no_search_matches: { en: 'No Matches Found', ar: 'لم يتم العثور على نتائج' },
  no_search_matches_desc: { en: 'We could not find any matching configurations.', ar: 'لم نجد أي جهاز يطابق الكلمات المدخلة.' },

  // Footer & Contact
  showroom_address: { en: 'Showroom & Premium Sales Office', ar: 'معرضنا ومكتب المبيعات المعتمد' },
  showroom_city: { en: 'Cairo, Egypt', ar: 'القاهرة، جمهورية مصر العربية' },
  contact_us: { en: 'Contact Us', ar: 'اتصل بنا' },
  footer_desc: { en: 'Your premium portal for discovering elite workstations and gaming laptops.', ar: 'بوابتك الفاخرة لاكتشاف أجهزة العمل والألعاب الفائقة.' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  // Load language preference from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lapstore_lang') as Language;
    if (saved === 'en' || saved === 'ar') {
      setLanguage(saved);
    } else {
      // Default to Arabic
      setLanguage('ar');
    }
  }, []);

  // Update layout direction (LTR/RTL) dynamically on HTML node
  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'ar' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('lapstore_lang', nextLang);
  };

  const t = (key: string): string => {
    const block = translations[key];
    if (!block) return key;
    return block[language] || key;
  };

  // Automated EGP / جنيه مصري Currency formatter
  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return price?.toString() || '';

    if (language === 'ar') {
      // Use clean Arabic currency format
      return `${numPrice.toLocaleString('ar-EG')} ج.م`;
    }
    // English layout: standard currency string
    return `${numPrice.toLocaleString('en-US')} EGP`;
  };

  const isRtl = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, formatPrice, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
