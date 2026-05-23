'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Sparkles, AlertCircle, LogIn, Mail, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { productService } from '@/lib/productService';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Login Method tab selection: 'google' | 'credentials'
  const [loginMethod, setLoginMethod] = useState<'google' | 'credentials'>('google');

  // Credentials inputs
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Monitor auth state and check if already logged in
  useEffect(() => {
    const checkActiveSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email) {
        const check = await productService.isAdmin(session.user.email);
        if (check.authorized) {
          router.push('/admin/dashboard');
        } else {
          // Force signout of unauthorized sessions
          await supabase.auth.signOut();
          router.push('/admin/unauthorized');
        }
      }
      setLoading(false);
    };

    checkActiveSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        setLoading(true);
        const check = await productService.isAdmin(session.user.email);
        if (check.authorized) {
          router.push('/admin/dashboard');
        } else {
          await supabase.auth.signOut();
          router.push('/admin/unauthorized');
        }
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      
      // Determine redirection URL targeting the auth callback exchange
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
    } catch (e: any) {
      setAuthError(e.message || 'An error occurred during authentication.');
      setLoading(false);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setAuthError('Please fill in both fields.');
      return;
    }

    try {
      setLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput,
        password: passwordInput,
      });

      if (error) throw error;

      if (data?.user?.email) {
        const check = await productService.isAdmin(data.user.email);
        if (check.authorized) {
          router.push('/admin/dashboard');
        } else {
          await supabase.auth.signOut();
          router.push('/admin/unauthorized');
        }
      }
    } catch (e: any) {
      setAuthError(e.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 relative bg-[#f8fafc]">
      {/* Visual background glows (hidden on mobile for rendering speed) */}
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 relative z-10 text-center bg-white">
        
        {/* Header Icon */}
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide font-sans uppercase">
              Admin Login / دخول المشرف
            </h1>
            <p className="text-xs text-slate-400">
              Only authorized administrators may enter the catalog database console.
              <br />
              هذه البوابة مخصصة للمشرفين المعتمدين لتعديل كتالوج الأجهزة فقط.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setLoginMethod('google');
              setAuthError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              loginMethod === 'google'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Google OAuth
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('credentials');
              setAuthError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              loginMethod === 'credentials'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Email & Password
          </button>
        </div>

        {/* Info panel */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Secure Connection / اتصال آمن
          </span>
          <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
            {loginMethod === 'google'
              ? 'Authentication is powered securely by Google OAuth. If Google login is not enabled in your Supabase dashboard, switch to the "Email & Password" tab.'
              : 'Sign in using the admin account created in your Supabase Auth Console. Ensure this email is registered in your "admins" table.'}
            <br />
            {loginMethod === 'google'
              ? 'تأكيد الهوية يتم بشكل آمن عبر حساب جوجل. في حال عدم تفعيل هذه الخدمة بلوحة تحكم قاعدة البيانات، يرجى التبديل لتبويب البريد الإلكتروني.'
              : 'قم بتسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور المسجلة مسبقاً بقواعد البيانات.'}
          </p>
        </div>

        {/* Error notifications */}
        {authError && (
          <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 font-bold" />
            <span>{authError}</span>
          </div>
        )}

        {/* Login Forms based on Active Tab */}
        {loginMethod === 'google' ? (
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:pointer-events-none text-sm animate-fade-in"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authorizing Session...' : 'Sign in with Google / الدخول باستخدام جوجل'}
          </button>
        ) : (
          <form onSubmit={handleCredentialsLogin} className="space-y-4 text-left animate-fade-in">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Email Address / البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs glass-input"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Password / كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs glass-input"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:pointer-events-none text-sm mt-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Verifying Credentials...' : 'Sign in / تسجيل الدخول'}
            </button>
          </form>
        )}

        {/* Return Button */}
        <div className="border-t border-slate-100 pt-4">
          <button
            onClick={() => router.push('/')}
            className="text-xs text-slate-400 hover:text-blue-600 transition-colors"
          >
            ← Cancel & Return / إلغاء والعودة للمعرض
          </button>
        </div>
      </div>
    </div>
  );
}
