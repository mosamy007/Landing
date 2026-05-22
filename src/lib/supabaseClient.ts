import { createBrowserClient } from '@supabase/ssr';

// Fallback to placeholder values during build-time compilation if env vars are missing on Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-id.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase environment variables are missing! Using temporary placeholders for build verification. Make sure to set these in Vercel settings.'
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
