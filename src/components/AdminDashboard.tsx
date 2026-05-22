'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Shield, LogOut, Plus, Edit2, Trash2, Search, 
  Sparkles, UploadCloud, X, ArrowLeft, Eye, Check, 
  AlertTriangle, Save, RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { productService } from '@/lib/productService';
import { LaptopProduct, NewLaptopProduct } from '@/lib/types';
import { BRANDS, RAM_OPTIONS, STORAGE_OPTIONS } from '@/lib/mockData';

export default function AdminDashboard() {
  const router = useRouter();
  
  // Auth state
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Catalog state
  const [laptops, setLaptops] = useState<LaptopProduct[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // CMS workflow state: 'list' | 'create' | 'edit'
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('Razer');
  const [model, setModel] = useState('');
  const [processor, setProcessor] = useState('');
  const [ram, setRam] = useState('16 GB');
  const [ramVal, setRamVal] = useState('16');
  const [storage, setStorage] = useState('1 TB');
  
  // Custom storage configurations
  const [hasSSD, setHasSSD] = useState(false);
  const [ssdSize, setSsdSize] = useState('');
  const [ssdUnit, setSsdUnit] = useState<'GB' | 'TB'>('GB');
  const [hasHDD, setHasHDD] = useState(false);
  const [hddSize, setHddSize] = useState('');
  const [hddUnit, setHddUnit] = useState<'GB' | 'TB'>('TB');

  const [graphics, setGraphics] = useState('');
  const [graphicsVendor, setGraphicsVendor] = useState<'Nvidia' | 'AMD' | 'Intel' | ''>('Nvidia');
  const [graphicsModel, setGraphicsModel] = useState('');
  const [display, setDisplay] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  
  // UI uploader state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parse storage string helper
  const parseStorageString = (storageStr: string) => {
    let ssdChecked = false;
    let ssdVal = '';
    let ssdUnitVal: 'GB' | 'TB' = 'GB';
    let hddChecked = false;
    let hddVal = '';
    let hddUnitVal: 'GB' | 'TB' = 'TB';

    if (storageStr) {
      // Look for SSD capacity (e.g. 256 GB SSD or 256GB SSD)
      const ssdMatch = storageStr.match(/([\d.]+)\s*(GB|TB)\s*SSD/i);
      if (ssdMatch) {
        ssdChecked = true;
        ssdVal = ssdMatch[1].trim();
        ssdUnitVal = ssdMatch[2].toUpperCase() as 'GB' | 'TB';
      } else if (storageStr.includes('SSD')) {
        ssdChecked = true;
      }
      
      // Look for HDD capacity (e.g. 1 TB HDD or 1TB HDD)
      const hddMatch = storageStr.match(/([\d.]+)\s*(GB|TB)\s*HDD/i);
      if (hddMatch) {
        hddChecked = true;
        hddVal = hddMatch[1].trim();
        hddUnitVal = hddMatch[2].toUpperCase() as 'GB' | 'TB';
      } else if (storageStr.includes('HDD')) {
        hddChecked = true;
      }
    }

    setHasSSD(ssdChecked);
    setSsdSize(ssdVal);
    setSsdUnit(ssdUnitVal);
    setHasHDD(hddChecked);
    setHddSize(hddVal);
    setHddUnit(hddUnitVal);
  };

  // Keep storage state in sync when checkboxes/sizes/units are altered
  useEffect(() => {
    if (hasSSD || hasHDD) {
      const parts = [];
      if (hasSSD) {
        parts.push(ssdSize ? `${ssdSize} ${ssdUnit} SSD` : 'SSD');
      }
      if (hasHDD) {
        parts.push(hddSize ? `${hddSize} ${hddUnit} HDD` : 'HDD');
      }
      setStorage(parts.join(' + '));
    }
  }, [hasSSD, ssdSize, ssdUnit, hasHDD, hddSize, hddUnit]);

  // Keep RAM string in sync with input value
  useEffect(() => {
    setRam(ramVal ? `${ramVal} GB` : '');
  }, [ramVal]);

  // Keep Graphics string in sync with vendor and model inputs
  useEffect(() => {
    if (graphicsVendor || graphicsModel) {
      const vendorPart = graphicsVendor ? `${graphicsVendor} ` : '';
      setGraphics(`${vendorPart}${graphicsModel}`);
    } else {
      setGraphics('');
    }
  }, [graphicsVendor, graphicsModel]);

  // Format Helper for Preview Row Display (shows Arabic and English equivalents)
  const previewFormatPrice = (val: number) => {
    return `${val.toLocaleString()} EGP / ج.م`;
  };

  // 1. Session Verification Gate
  useEffect(() => {
    const verifySession = async () => {
      setCheckingAuth(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user?.email) {
        router.push('/admin/login');
        return;
      }

      const check = await productService.isAdmin(session.user.email);
      if (!check.authorized) {
        await supabase.auth.signOut();
        router.push('/admin/unauthorized');
        return;
      }

      setSessionUser(session.user);
      setIsAdmin(true);
      setCheckingAuth(false);
      
      // Load products list once authenticated
      loadCatalog();
    };

    verifySession();

    // Listen for sign outs
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/admin/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // 2. Load Catalog Laptops
  const loadCatalog = async () => {
    setLoadingCatalog(true);
    try {
      const data = await productService.getProducts();
      setLaptops(data);
    } catch (e) {
      console.error('Failed to load laptops list:', e);
    } finally {
      setLoadingCatalog(false);
    }
  };

  // 3. Trigger Log out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // 4. Multiple Images Uploader (Direct with helpful alerts on error)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    setErrorMessage(null);
    const files = Array.from(e.target.files);
    const uploadedUrls: string[] = [];

    // Check if we are in mock mode
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const isMock = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Uploading ${file.name} (${i + 1}/${files.length})...`);
        
        try {
          // Attempt standard Supabase Storage upload
          const url = await productService.uploadProductImage(file);
          uploadedUrls.push(url);
        } catch (storageError: any) {
          console.error('Supabase storage upload failed:', storageError);
          
          if (isMock) {
            // Mock fallback only in mock mode
            const sampleUrls = [
              'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=800',
              'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800',
              'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800',
              'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800'
            ];
            const fallbackUrl = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
            uploadedUrls.push(fallbackUrl);
            await new Promise((resolve) => setTimeout(resolve, 800));
          } else {
            // Throw the actual error so it displays on screen
            throw new Error(`Storage upload failed: ${storageError.message || storageError}. Please ensure you have created a public bucket named 'laptop-images' in your Supabase Console, and set public select/write access policies.`);
          }
        }
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
      setUploadProgress('All files uploaded successfully!');
      setTimeout(() => setUploadProgress(''), 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // Remove uploaded image from index
  const removeImage = (idxToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // 5. Open Create workflow
  const openCreateForm = () => {
    resetFormFields();
    setView('create');
  };

  // 6. Open Edit Form populated with laptop details
  const openEditForm = (laptop: LaptopProduct) => {
    setEditingId(laptop.id);
    setTitle(laptop.title);
    setBrand(laptop.brand);
    setModel(laptop.laptop_model || '');
    setProcessor(laptop.processor || '');
    
    // Parse RAM capacity
    const currentRam = laptop.ram || '';
    setRam(currentRam);
    const ramMatch = currentRam.match(/([\d.]+)/);
    setRamVal(ramMatch ? ramMatch[1] : currentRam.replace(/\s*GB/i, ''));
    
    // Parse storage string
    const currentStorage = laptop.storage || '';
    setStorage(currentStorage);
    parseStorageString(currentStorage);

    // Parse Graphics vendor and model
    const currentGraphics = laptop.graphics || '';
    setGraphics(currentGraphics);
    let detectedVendor: 'Nvidia' | 'AMD' | 'Intel' | '' = '';
    let modelPart = currentGraphics;
    if (/nvidia/i.test(currentGraphics)) {
      detectedVendor = 'Nvidia';
      modelPart = currentGraphics.replace(/nvidia/i, '').trim();
    } else if (/amd/i.test(currentGraphics)) {
      detectedVendor = 'AMD';
      modelPart = currentGraphics.replace(/amd/i, '').trim();
    } else if (/intel/i.test(currentGraphics)) {
      detectedVendor = 'Intel';
      modelPart = currentGraphics.replace(/intel/i, '').trim();
    }
    setGraphicsVendor(detectedVendor);
    setGraphicsModel(modelPart);

    setDisplay(laptop.display || '');
    setPrice(laptop.price ? laptop.price.toString() : '');
    setDescription(laptop.description || '');
    setImages(laptop.images || []);
    setFeatured(laptop.featured || false);
    
    setErrorMessage(null);
    setView('edit');
  };

  const resetFormFields = () => {
    setEditingId(null);
    setTitle('');
    setBrand('Razer');
    setModel('');
    setProcessor('');
    setRam('16 GB');
    setRamVal('16');
    setStorage('');
    setHasSSD(false);
    setSsdSize('');
    setSsdUnit('GB');
    setHasHDD(false);
    setHddSize('');
    setHddUnit('TB');
    setGraphics('');
    setGraphicsVendor('Nvidia');
    setGraphicsModel('');
    setDisplay('');
    setPrice('');
    setDescription('');
    setImages([]);
    setFeatured(false);
    setErrorMessage(null);
  };

  // 7. Form Submission Handler
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    // Title is the ONLY mandatory field to create a catalog item
    if (!title.trim()) {
      setErrorMessage('Please provide a Product Title.');
      setSaving(false);
      return;
    }

    const priceNum = price ? parseFloat(price) : 0;
    if (price && (isNaN(priceNum) || priceNum < 0)) {
      setErrorMessage('Please input a valid price.');
      setSaving(false);
      return;
    }

    // Auto-generate safe lowercase slug
    const cleanSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `laptop-${Date.now()}`;

    const laptopPayload: NewLaptopProduct = {
      slug: cleanSlug,
      title,
      brand: brand || 'Other',
      laptop_model: model || '',
      processor: processor || '',
      ram: ram || '',
      storage: storage || '',
      graphics: graphics || '',
      display: display || '',
      price: priceNum,
      description: description || '',
      images: images,
      featured
    };

    try {
      if (view === 'create') {
        const newProduct = await productService.createProduct(laptopPayload);
        setLaptops((prev) => [newProduct, ...prev]);
      } else if (view === 'edit' && editingId) {
        // Carry out edit update
        const updated = await productService.updateProduct(editingId, laptopPayload);
        setLaptops((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      }
      
      // Close forms and refresh catalog list
      setView('list');
      resetFormFields();
      loadCatalog();
    } catch (saveError: any) {
      console.error('Database save rejected:', saveError);
      // Real environment: show the actual error so the user knows database save failed!
      setErrorMessage(`Failed to save product to Supabase: ${saveError.message || saveError}`);
    } finally {
      setSaving(false);
    }
  };

  // 8. Delete Product Action
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete: "${name}"?`)) return;

    try {
      await productService.deleteProduct(id);
      setLaptops((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.warn('Delete action failed, removing local item in memory fallback:', err);
      setLaptops((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // 9. Quick Toggle Featured status from the catalog row
  const toggleFeaturedStatus = async (laptop: LaptopProduct) => {
    const nextStatus = !laptop.featured;
    try {
      const updated = await productService.updateProduct(laptop.id, { featured: nextStatus });
      setLaptops((prev) => prev.map((p) => (p.id === laptop.id ? updated : p)));
    } catch (err) {
      // Memory state fallback
      setLaptops((prev) =>
        prev.map((p) => (p.id === laptop.id ? { ...p, featured: nextStatus } : p))
      );
    }
  };

  // Memoized search filter for admin catalog row
  const filteredCatalog = useMemo(() => {
    return laptops.filter((p) => {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.laptop_model.toLowerCase().includes(q)
      );
    });
  }, [laptops, searchQuery]);

  if (checkingAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-20 text-slate-800 bg-[#f8fafc]">
      
      {/* 1. Dashboard Ribbon */}
      <header className="glass-panel rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 flex items-center gap-1.5 leading-none uppercase">
              CMS Console Dashboard
            </h1>
            <p className="text-[10px] text-slate-400 mt-1">Authorized Operator: {sessionUser?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {view === 'list' && (
            <button
              onClick={openCreateForm}
              className="flex-grow sm:flex-grow-0 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Laptop / إضافة جهاز
            </button>
          )}

          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Sign Out / خروج
          </button>
        </div>
      </header>

      {/* 2. CMS CONTENT */}
      {view === 'list' ? (
        <div className="space-y-6">
          {/* Search bar and counter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search catalog models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs glass-input bg-white"
              />
            </div>
            
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest self-end">
              Database rows: {filteredCatalog.length}
            </span>
          </div>

          {/* Catalog Listing grid */}
          {loadingCatalog ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3">
              <span className="text-4xl">📭</span>
              <p className="text-sm font-extrabold text-slate-900">Showroom is empty.</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Click "Add Laptop" above to register your first product. 
                <br />
                اضغط على زر الإضافة لتسجيل أول جهاز لابتوب في المعرض.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4">Thumbnail</th>
                      <th className="p-4">Product Name</th>
                      <th className="p-4">Model Specs</th>
                      <th className="p-4">Price (EGP)</th>
                      <th className="p-4 text-center">Featured</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredCatalog.map((laptop) => (
                      <tr key={laptop.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Thumbnail */}
                        <td className="p-4">
                          <div className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                            <Image
                              src={laptop.images[0] || 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800'}
                              alt={laptop.title}
                              fill
                              className="object-contain p-1"
                              sizes="48px"
                            />
                          </div>
                        </td>
                        
                        {/* Product Title */}
                        <td className="p-4 font-extrabold text-slate-900">
                          <div className="space-y-0.5">
                            <p className="line-clamp-1">{laptop.title}</p>
                            <span className="text-[9px] text-blue-600 uppercase font-black">{laptop.brand}</span>
                          </div>
                        </td>

                        {/* Specs overview */}
                        <td className="p-4 text-slate-500 font-sans font-light">
                          {laptop.processor.split(' (')[0]} • {laptop.ram} • {laptop.storage}
                        </td>

                        {/* Price */}
                        <td className="p-4 font-black text-slate-900">
                          {previewFormatPrice(laptop.price)}
                        </td>

                        {/* Featured status toggle */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => toggleFeaturedStatus(laptop)}
                            className={`p-1.5 rounded-lg border text-[10px] font-black transition-all ${
                              laptop.featured
                                ? 'bg-purple-50 border-purple-200 text-purple-600 shadow-sm'
                                : 'border-slate-200 bg-white text-slate-300 hover:text-slate-500'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </td>

                        {/* Action buttons */}
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditForm(laptop)}
                              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-600/30 transition-all"
                              title="Edit Entry"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(laptop.id, laptop.title)}
                              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-500/30 transition-all"
                              title="Delete Entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 10. CMS CREATE / EDIT WORKFLOW WITH LIVE PREVIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Specifications Form (Col span 7) */}
          <form onSubmit={handleSaveProduct} className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <button
                type="button"
                onClick={() => setView('list')}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-xs font-black text-slate-900 uppercase">
                {view === 'create' ? 'Add New Laptop / إضافة لابتوب جديد' : 'Edit Laptop Specs / تعديل الجهاز'}
              </h2>
            </div>

            {/* Error messaging */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Product Title */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Product Showcase Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Asus ROG Zephyrus G16 (2026) OLED"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl text-xs glass-input"
                  required
                />
              </div>

              {/* Brand Select */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Brand</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs glass-input bg-white"
                >
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Laptop Model Name</label>
                <input
                  type="text"
                  placeholder="e.g. Zephyrus G16"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl text-xs glass-input"
                />
              </div>

              {/* Processor */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Processor Model</label>
                <input
                  type="text"
                  placeholder="e.g. AMD Ryzen 9 AI 9 HX 370"
                  value={processor}
                  onChange={(e) => setProcessor(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl text-xs glass-input"
                />
              </div>

              {/* RAM Input (Text field with automatic GB) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">RAM Capacity (GB)</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. 16"
                    value={ramVal}
                    onChange={(e) => setRamVal(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl text-xs glass-input pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">GB</span>
                </div>
              </div>

              {/* Custom Storage Specification Builder */}
              <div className="sm:col-span-2 space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 my-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  Storage Configuration / إعدادات مساحة التخزين
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* SSD Select Option */}
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="hasSSD"
                        checked={hasSSD}
                        onChange={(e) => setHasSSD(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="hasSSD" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                        Solid State Drive (SSD)
                      </label>
                    </div>
                    {hasSSD && (
                      <div className="space-y-1 pt-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase block">SSD Size</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. 512"
                            value={ssdSize}
                            onChange={(e) => setSsdSize(e.target.value)}
                            className="flex-grow px-3 py-1.5 rounded-lg text-xs glass-input"
                          />
                          <select
                            value={ssdUnit}
                            onChange={(e) => setSsdUnit(e.target.value as 'GB' | 'TB')}
                            className="w-20 px-2 py-1.5 rounded-lg text-xs glass-input bg-white font-sans"
                          >
                            <option value="GB">GB</option>
                            <option value="TB">TB</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* HDD Select Option */}
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="hasHDD"
                        checked={hasHDD}
                        onChange={(e) => setHasHDD(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="hasHDD" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                        Hard Disk Drive (HDD)
                      </label>
                    </div>
                    {hasHDD && (
                      <div className="space-y-1 pt-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase block">HDD Size</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. 1"
                            value={hddSize}
                            onChange={(e) => setHddSize(e.target.value)}
                            className="flex-grow px-3 py-1.5 rounded-lg text-xs glass-input"
                          />
                          <select
                            value={hddUnit}
                            onChange={(e) => setHddUnit(e.target.value as 'GB' | 'TB')}
                            className="w-20 px-2 py-1.5 rounded-lg text-xs glass-input bg-white font-sans"
                          >
                            <option value="GB">GB</option>
                            <option value="TB">TB</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Combined Storage Capacity Input */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                    Combined Storage String (Auto-built or custom type)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 256 GB SSD"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl text-xs glass-input"
                  />
                  <p className="text-[9px] text-slate-400">
                    * If you check SSD/HDD above, this value updates automatically. You can also type directly here for custom configurations.
                  </p>
                </div>
              </div>

              {/* Graphics */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Graphics / GPU specs</label>
                <div className="flex gap-2">
                  <select
                    value={graphicsVendor}
                    onChange={(e) => setGraphicsVendor(e.target.value as any)}
                    className="w-1/3 px-3 py-2 rounded-xl text-xs glass-input bg-white shrink-0 font-sans"
                  >
                    <option value="">None</option>
                    <option value="Nvidia">Nvidia</option>
                    <option value="AMD">AMD</option>
                    <option value="Intel">Intel</option>
                  </select>
                  <input
                    type="text"
                    placeholder="e.g. GeForce RTX 4060 8GB"
                    value={graphicsModel}
                    onChange={(e) => setGraphicsModel(e.target.value)}
                    className="flex-grow px-4 py-2 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>

              {/* Display */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Display Specs</label>
                <input
                  type="text"
                  placeholder="e.g. 16.0-inch 2.5K 240Hz OLED"
                  value={display}
                  onChange={(e) => setDisplay(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl text-xs glass-input"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Showcase Price (EGP / جنيه مصري)</label>
                <input
                  type="number"
                  placeholder="e.g. 98500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl text-xs glass-input"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Product Description</label>
                <textarea
                  placeholder="Write details of the laptop..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-xs glass-input h-32 resize-none"
                />
              </div>

              {/* Dynamic Image Uploader */}
              <div className="sm:col-span-2 space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Upload Multiple Images</label>
                
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100/50 transition-colors relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Drag & drop or Click to browse</p>
                  <p className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, JPEG. Select multiple files.</p>
                </div>

                {/* Upload loading status */}
                {uploading && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-600 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                    <span>{uploadProgress}</span>
                  </div>
                )}

                {/* Thumbnail grid of current images */}
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                        <Image
                          src={img}
                          alt="Uploaded thumb"
                          fill
                          className="object-contain p-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 border border-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Featured Toggle option */}
              <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="featuredToggle" className="text-[10px] font-black text-slate-600 uppercase tracking-wider cursor-pointer select-none">
                  Highlight as Featured Laptop / إبراز كجهاز مميز
                </label>
              </div>

            </div>

            {/* Actions Footer */}
            <div className="border-t border-slate-100 pt-6 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-grow py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-xs shadow-sm"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving Entries...' : 'Save Laptop specs / حفظ بيانات الجهاز'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setView('list');
                  resetFormFields();
                }}
                className="px-5 py-3 rounded-xl font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-xs"
              >
                Cancel / إلغاء
              </button>
            </div>
          </form>

          {/* Right Column - REAL-TIME LIVE PREVIEW (Col span 5) */}
          <aside className="lg:col-span-5 space-y-6 sticky top-28">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-600" /> Real-time Live Card Preview
              </span>
              <span className="text-[9px] text-purple-600 font-bold uppercase bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                Simulated Screen
              </span>
            </div>

            {/* Live Simulated Card Preview */}
            <div className="space-y-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Grid Card Layout</span>
              
              <div className="max-w-xs mx-auto w-full flex flex-col rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm relative">
                {featured && (
                  <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-50 border border-purple-200 text-purple-600 uppercase tracking-widest">
                    Featured
                  </span>
                )}
                
                {/* Image */}
                <div className="h-44 relative w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                  <Image
                    src={images[0] || 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800'}
                    alt="Preview Thumbnail"
                    fill
                    className="object-contain p-2"
                    sizes="300px"
                  />
                </div>

                {/* Info block */}
                <div className="p-4 space-y-3 text-slate-800">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">{brand}</span>
                    <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1">
                      {title || 'Untitled Laptop Model'}
                    </h3>
                  </div>

                  {/* Specs summary block */}
                  <div className="space-y-1 text-xs text-slate-500 border-t border-b border-slate-100 py-2 font-sans font-light">
                    <div className="flex justify-between">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">CPU</span>
                      <span className="font-semibold text-slate-700 line-clamp-1 max-w-[120px]" dir="ltr">{processor || 'Intel Core i9 / AMD R9'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Memory</span>
                      <span className="font-semibold text-slate-700" dir="ltr">{ram} / {storage}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Showcase Price</span>
                      <p className="text-sm font-black text-slate-900">{price ? previewFormatPrice(parseFloat(price)) : '0 EGP / ج.م'}</p>
                    </div>
                    <span className="px-3 py-1.5 rounded-lg text-[9px] font-black border border-slate-200 bg-white text-slate-500">
                      Inspect specs
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Simulated Specifications table */}
            <div className="space-y-3 pt-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Specs Sheet Layout</span>
              
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-xs shadow-sm">
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-slate-800">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Brand:</span>
                    <span className="font-semibold text-slate-900">{brand}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Laptop model:</span>
                    <span className="font-semibold text-slate-900">{model || 'Blade 16 / GA403'}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-100 my-0.5" />
                  <div className="col-span-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Processor:</span>
                    <span className="font-semibold text-slate-900" dir="ltr">{processor || 'i9-14900HX (up to 5.8 GHz)'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">RAM:</span>
                    <span className="font-semibold text-slate-900" dir="ltr">{ram}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Storage:</span>
                    <span className="font-semibold text-slate-900" dir="ltr">{storage}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-100 my-0.5" />
                  <div className="col-span-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Graphics:</span>
                    <span className="font-semibold text-slate-900" dir="ltr">{graphics || 'RTX 4090 (16GB VRAM)'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Display:</span>
                    <span className="font-semibold text-slate-900" dir="ltr">{display || '16" Mini-LED Screen'}</span>
                  </div>
                </div>
              </div>
            </div>

          </aside>

        </div>
      )}

    </div>
  );
}
