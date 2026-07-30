export type AdminRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'SALES_MANAGER' 
  | 'MARKETING' 
  | 'SUPPORT' 
  | 'CONTENT_EDITOR' 
  | 'FINANCE' 
  | 'EMPLOYEE' 
  | 'CUSTOM';

export type AdminModule = 
  | 'DASHBOARD'
  | 'PROFILE'
  | 'PRODUCTS'
  | 'SAAS'
  | 'SERVICES'
  | 'CATEGORIES'
  | 'BLOG'
  | 'TECH_SPECS'
  | 'ORDERS'
  | 'PAYMENTS'
  | 'INVOICES'
  | 'MESSAGES'
  | 'USERS'
  | 'EMPLOYEES'
  | 'TEAM_CMS'
  | 'TESTIMONIALS'
  | 'REVIEWS'
  | 'ABOUT_PAGE'
  | 'GALLERY_CMS'
  | 'ANNOUNCEMENTS'
  | 'COUNTRIES'
  | 'LOCATIONS'
  | 'MARKETING_MOD'
  | 'ANALYTICS'
  | 'SETTINGS'
  | 'SUPPORT_TICKETS';

// Define which roles can access which modules
const ROLE_PERMISSIONS: Record<AdminRole, AdminModule[]> = {
  SUPER_ADMIN: [
    'DASHBOARD', 'PROFILE', 'PRODUCTS', 'SAAS', 'SERVICES', 'CATEGORIES', 'BLOG', 'TECH_SPECS',
    'ORDERS', 'PAYMENTS', 'INVOICES', 'MESSAGES', 'USERS', 'EMPLOYEES', 'TEAM_CMS',
    'TESTIMONIALS', 'REVIEWS', 'ABOUT_PAGE', 'GALLERY_CMS', 'ANNOUNCEMENTS',
    'COUNTRIES', 'LOCATIONS', 'MARKETING_MOD', 'ANALYTICS', 'SETTINGS', 'SUPPORT_TICKETS'
  ],
  ADMIN: [
    'DASHBOARD', 'PROFILE', 'PRODUCTS', 'SAAS', 'SERVICES', 'CATEGORIES', 'BLOG', 'TECH_SPECS',
    'ORDERS', 'PAYMENTS', 'INVOICES', 'MESSAGES', 'USERS', 'TEAM_CMS', // No EMPLOYEES
    'TESTIMONIALS', 'REVIEWS', 'ABOUT_PAGE', 'GALLERY_CMS', 'ANNOUNCEMENTS',
    'COUNTRIES', 'LOCATIONS', 'MARKETING_MOD', 'ANALYTICS', 'SETTINGS', 'SUPPORT_TICKETS'
  ],
  SALES_MANAGER: [
    'DASHBOARD', 'PROFILE', 'PRODUCTS', 'SAAS', 'SERVICES', 'CATEGORIES', 'TECH_SPECS',
    'ORDERS', 'PAYMENTS', 'INVOICES', 'USERS', 'ANALYTICS', 'SUPPORT_TICKETS'
  ],
  MARKETING: [
    'DASHBOARD', 'PROFILE', 'BLOG', 'TESTIMONIALS', 'REVIEWS', 'ABOUT_PAGE', 'GALLERY_CMS',
    'ANNOUNCEMENTS', 'MARKETING_MOD', 'ANALYTICS', 'SUPPORT_TICKETS'
  ],
  SUPPORT: [
    'DASHBOARD', 'PROFILE', 'MESSAGES', 'ORDERS', 'USERS', 'REVIEWS', 'SUPPORT_TICKETS'
  ],
  CONTENT_EDITOR: [
    'DASHBOARD', 'PROFILE', 'BLOG', 'TEAM_CMS', 'TESTIMONIALS', 'ABOUT_PAGE', 'GALLERY_CMS', 'ANNOUNCEMENTS'
  ],
  FINANCE: [
    'DASHBOARD', 'PROFILE', 'ORDERS', 'PAYMENTS', 'INVOICES', 'ANALYTICS'
  ],
  EMPLOYEE: [
    'DASHBOARD', 'PROFILE'
  ],
  CUSTOM: [
    'DASHBOARD', 'PROFILE' // Fallback for custom roles until granular DB permissions are built
  ]
};

/**
 * Maps a sidebar URL path to a specific AdminModule for checking permissions.
 */
export function getModuleForPath(path: string): AdminModule | null {
  if (path === '/admin') return 'DASHBOARD';
  if (path.startsWith('/admin/profile')) return 'PROFILE';
  if (path.startsWith('/admin/products')) return 'PRODUCTS';
  if (path.startsWith('/admin/saas')) return 'SAAS';
  if (path.startsWith('/admin/services')) return 'SERVICES';
  if (path.startsWith('/admin/categories')) return 'CATEGORIES';
  if (path.startsWith('/admin/blog')) return 'BLOG';
  if (path.startsWith('/admin/tech-specs')) return 'TECH_SPECS';
  if (path.startsWith('/admin/orders')) return 'ORDERS';
  if (path.startsWith('/admin/payments')) return 'PAYMENTS';
  if (path.startsWith('/admin/invoices')) return 'INVOICES';
  if (path.startsWith('/admin/messages')) return 'MESSAGES';
  if (path.startsWith('/admin/users')) return 'USERS';
  if (path.startsWith('/admin/employees')) return 'EMPLOYEES';
  if (path.startsWith('/admin/team')) return 'TEAM_CMS';
  if (path.startsWith('/admin/testimonials')) return 'TESTIMONIALS';
  if (path.startsWith('/admin/reviews')) return 'REVIEWS';
  if (path.startsWith('/admin/about')) return 'ABOUT_PAGE';
  if (path.startsWith('/admin/gallery')) return 'GALLERY_CMS';
  if (path.startsWith('/admin/announcements')) return 'ANNOUNCEMENTS';
  if (path.startsWith('/admin/countries')) return 'COUNTRIES';
  if (path.startsWith('/admin/locations')) return 'LOCATIONS';
  if (path.startsWith('/admin/marketing')) return 'MARKETING_MOD';
  if (path.startsWith('/admin/analytics')) return 'ANALYTICS';
  if (path.startsWith('/admin/settings')) return 'SETTINGS';
  if (path.startsWith('/admin/support')) return 'SUPPORT_TICKETS';
  
  return null;
}

export function hasPermission(role: string, module: AdminModule): boolean {
  if (!role) return false;
  // Ensure the role exists in our matrix, otherwise default to EMPLOYEE
  const normalizedRole = (ROLE_PERMISSIONS[role as AdminRole] ? role : 'EMPLOYEE') as AdminRole;
  return ROLE_PERMISSIONS[normalizedRole].includes(module);
}

export function canAccessPath(role: string, path: string): boolean {
  const module = getModuleForPath(path);
  if (!module) return true; // If no module mapping, allow by default (or deny, but allow is safer for obscure routes)
  return hasPermission(role, module);
}
