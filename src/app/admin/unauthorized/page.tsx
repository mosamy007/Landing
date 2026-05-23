'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleSignOutAndRetry = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 relative bg-[#f8fafc]">
      {/* Background glow (hidden on mobile for rendering speed) */}
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-red-200 shadow-sm space-y-6 text-center bg-white relative z-10">
        
        {/* Error icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-sm animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Messaging */}
        <div className="space-y-3">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-sans tracking-wide">
            ACCESS DENIED / غير مصرح بالدخول
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            Your Google Account is successfully authenticated, but your email address is not registered in the whitelisted <code className="text-xs px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-red-600 font-bold">admins</code> database table.
            <br />
            تم تسجيل الدخول بنجاح، ولكن هذا البريد الإلكتروني غير مسجل في جدول المشرفين المعتمدين في قواعد البيانات.
          </p>
        </div>

        {/* Warning text */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400 leading-relaxed text-left space-y-2">
          <p><strong>Admin note:</strong> Please ask a super administrator to add this email to your Supabase <code>admins</code> table.</p>
          <p className="text-right" dir="rtl"><strong>ملاحظة للمشرف:</strong> يرجى التواصل مع المسؤول لإضافة هذا البريد لجدول المشرفين <code>admins</code>.</p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSignOutAndRetry}
            className="flex-grow py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <LogOut className="w-4 h-4" /> Try Another Account / حساب آخر
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2.5 rounded-xl font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Home / الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
