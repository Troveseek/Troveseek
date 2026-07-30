/**
 * Edge-compatible auth config (NO database/Node.js imports).
 * Used by proxy.ts (middleware) for JWT-only session verification.
 */
import type { NextAuthConfig } from 'next-auth';

import { canAccessPath } from './auth/permissions';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
  providers: [], // Providers are added only in auth.ts (Node.js environment)
  callbacks: {
    // Must mirror auth.ts so the proxy can read role from the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.department = (user as any).department;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).department = token.department;
      }
      return session;
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      const isAdminLoginPage = nextUrl.pathname === '/admin/login';

      if (isAdminRoute) {
        // Don't protect the admin login page itself
        if (isAdminLoginPage) return true;

        if (!isLoggedIn) {
          // Redirect unauthenticated users to the admin login page
          return Response.redirect(new URL('/admin/login', nextUrl));
        }

        // Check for admin roles (now populated via jwt callback above)
        const role = (auth?.user as any)?.role;
        const STAFF_ROLES = [
          'SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'MARKETING', 
          'SUPPORT', 'CONTENT_EDITOR', 'FINANCE', 'EMPLOYEE', 'CUSTOM'
        ];
        
        if (!STAFF_ROLES.includes(role)) {
          // Redirect unauthorized users to the homepage
          return Response.redirect(new URL('/', nextUrl));
        }

        // Granular RBAC Check
        if (!canAccessPath(role, nextUrl.pathname)) {
           return Response.redirect(new URL('/admin', nextUrl));
        }

        return true;
      }
      return true;
    },
  },
};
