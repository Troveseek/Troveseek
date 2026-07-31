import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const url = req.nextUrl.clone();
  
  if (url.pathname.startsWith('/admin')) {
    const hasAccessCookie = req.cookies.has('admin_unlocked');
    const secretQuery = url.searchParams.get('secret')?.trim();
    let envSecret = process.env.ADMIN_SECRET || 'troveseek_admin_super_secret_2026';
    envSecret = envSecret.replace(/^["']|["']$/g, '').trim();

    if (secretQuery && secretQuery === envSecret) {
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
      url.pathname = '/404';
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
