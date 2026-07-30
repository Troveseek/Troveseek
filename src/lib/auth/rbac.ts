// Role hierarchy definitions for TroveSeek Enterprise RBAC
export const ROLES = {
  GUEST: 'GUEST',
  CLIENT: 'CLIENT',
  CONTENT_EDITOR: 'CONTENT_EDITOR',
  SUPPORT: 'SUPPORT',
  MARKETING: 'MARKETING',
  FINANCE: 'FINANCE',
  SALES_MANAGER: 'SALES_MANAGER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Define which roles can access the admin panel at all
export const ADMIN_ROLES: Role[] = [
  ROLES.CONTENT_EDITOR,
  ROLES.SUPPORT,
  ROLES.MARKETING,
  ROLES.FINANCE,
  ROLES.SALES_MANAGER,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
];

// Route permission matrix: maps admin URL path prefixes to minimum-required roles
export const ADMIN_ROUTE_PERMISSIONS: Record<string, Role[]> = {
  '/admin/employees': [ROLES.SUPER_ADMIN],
  '/admin/settings': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  '/admin/payments': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FINANCE, ROLES.SALES_MANAGER],
  '/admin/invoices': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FINANCE],
  '/admin/orders': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.SUPPORT],
  '/admin/users': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SUPPORT],
  '/admin/analytics': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FINANCE, ROLES.MARKETING],
  '/admin/products': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_MANAGER],
  '/admin/saas': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_MANAGER],
  '/admin/services': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_MANAGER],
  '/admin/blog': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MARKETING, ROLES.CONTENT_EDITOR],
  '/admin/announcements': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MARKETING, ROLES.CONTENT_EDITOR],
  '/admin/marketing': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MARKETING],
  '/admin/messages': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SUPPORT],
  '/admin/support': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SUPPORT],
  '/admin': ADMIN_ROLES, // Dashboard home - all admin roles
};

/**
 * Checks if a user with the given role can access a specific admin route.
 */
export function canAccessRoute(role: Role | undefined, pathname: string): boolean {
  if (!role || !ADMIN_ROLES.includes(role)) return false;

  // Find the most specific matching route prefix
  const matchingPaths = Object.keys(ADMIN_ROUTE_PERMISSIONS)
    .filter((path) => pathname.startsWith(path))
    .sort((a, b) => b.length - a.length); // Longest match first

  if (matchingPaths.length === 0) return true; // No restriction defined

  const allowedRoles = ADMIN_ROUTE_PERMISSIONS[matchingPaths[0]];
  return allowedRoles.includes(role);
}
