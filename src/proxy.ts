/**
 * Next.js 16 Proxy (replaces middleware.ts)
 * Uses the lightweight edge-compatible auth config only.
 * Only intercepts /admin routes for RBAC enforcement.
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

export const { auth: authProxy } = NextAuth(authConfig);

export default authProxy;

export const config = {
  // ONLY intercept admin routes.
  // Do NOT use a catch-all matcher — it will intercept /api/auth routes
  // and break the NextAuth JSON endpoints.
  matcher: ['/admin', '/admin/:path*'],
};
