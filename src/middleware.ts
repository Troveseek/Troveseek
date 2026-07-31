import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  
  // Example security: Obscure admin panel with a secret query parameter.
  // If user visits /admin?secret=xyz123, set a cookie and allow access.
  // If they try to access /admin without the cookie, return 404.
  
  if (url.pathname.startsWith('/admin')) {
    const hasAccessCookie = req.cookies.has('admin_unlocked');
    const secretQuery = url.searchParams.get('secret');

    // The secret should ideally be fetched from env var or DB. Using a hardcoded one for now.
    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'troveseek_admin_2024';

    if (secretQuery === ADMIN_SECRET) {
      // Create response that redirects to /admin without the secret query param,
      // but sets the cookie.
      url.searchParams.delete('secret');
      const response = NextResponse.redirect(url);
      response.cookies.set('admin_unlocked', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/admin',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
      return response;
    }

    if (!hasAccessCookie) {
      // Rewrite to a 404 page so attackers don't even know /admin exists
      url.pathname = '/404';
      return NextResponse.rewrite(url);
    }
  }

  // Use next-intl middleware for everything else if needed.
  // Since next-intl wasn't using a middleware yet, we just return next.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
