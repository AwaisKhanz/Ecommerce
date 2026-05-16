import createIntlMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';

import { routing } from '@/lib/i18n/routing';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const intlResponse = intlMiddleware(request);
  const { supabase, response } = createMiddlewareClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = /\/admin(?:\/|$)/.test(pathname);
  const isLoginRoute = /\/admin\/login$/.test(pathname);

  if (isAdminRoute && !isLoginRoute && !user) {
    return NextResponse.redirect(new URL('/en/admin/login', request.url));
  }

  return response.headers.get('location') ? response : intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)', '/api/admin/:path*'],
};
