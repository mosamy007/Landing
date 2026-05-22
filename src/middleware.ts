import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Defensive check: If Supabase keys are not set, allow access to run in local mock/demo mode
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
    return response;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Fetch user context from session
    const { data: { user } } = await supabase.auth.getUser();

    // Protect administrative dashboard paths
    if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
      if (!user) {
        // Redirect to administrative login page
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
  } catch (e) {
    console.error('Middleware session validation error:', e);
  }

  return response;
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};
