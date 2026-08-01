"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { canAccessPath } from '@/lib/auth/permissions';
import { 
  LayoutDashboard, 
  Package,
  Cloud,
  Briefcase,
  BookOpen,
  ShoppingCart,
  CreditCard, 
  FileText, 
  MessageSquare,
  BarChart2,
  Users,
  Shield,
  Globe,
  Megaphone,
  Settings,
  HelpCircle,
  FileCode,
  Target,
  Tag,
  LayoutTemplate,
  Image,
  MessageCircle,
  MapPin
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

interface AdminSidebarProps {
  isOpen?: boolean;
}

export default function AdminSidebar({ isOpen = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || 'EMPLOYEE';
  const [siteName, setSiteName] = React.useState("TroveSeek");
  const [siteLogoLight, setSiteLogoLight] = React.useState("");
  const [siteLogoDark, setSiteLogoDark] = React.useState("");

  React.useEffect(() => {
    fetch('/api/settings?keys=site_name,site_logo_light,site_logo_dark')
      .then(res => res.json())
      .then(data => {
        if (data.site_name) setSiteName(data.site_name);
        if (data.site_logo_light) setSiteLogoLight(data.site_logo_light);
        if (data.site_logo_dark) setSiteLogoDark(data.site_logo_dark);
      })
      .catch(console.error);
  }, []);

  const groups = [
    {
      label: 'MAIN',
      links: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'SaaS', href: '/admin/saas', icon: Cloud },
        { name: 'Services', href: '/admin/services', icon: Briefcase },
        { name: 'Categories', href: '/admin/categories', icon: Tag },
        { name: 'Blog', href: '/admin/blog', icon: BookOpen },
        { name: 'Tech Specs', href: '/admin/tech-specs', icon: FileCode },
      ],
    },
    {
      label: 'COMMERCE',
      links: [
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Payments', href: '/admin/payments', icon: CreditCard },
        { name: 'Invoices', href: '/admin/invoices', icon: FileText },
      ],
    },
    {
      label: 'ENGAGEMENT',
      links: [
        { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Employees', href: '/admin/employees', icon: Shield },
        { name: 'Team CMS', href: '/admin/team', icon: Users },
        { name: 'Testimonials', href: '/admin/testimonials', icon: MessageCircle },
        { name: 'Reviews', href: '/admin/reviews', icon: MessageCircle },
        { name: 'About Page', href: '/admin/about', icon: LayoutTemplate },
        { name: 'Gallery CMS', href: '/admin/gallery', icon: Image },
        { name: 'Page Banners / Heroes', href: '/admin/announcements', icon: Megaphone },
        { name: 'Countries', href: '/admin/countries', icon: Globe },
        { name: 'Locations', href: '/admin/locations', icon: MapPin },
        { name: 'Marketing', href: '/admin/marketing', icon: Target },
      ],
    },
    {
      label: 'INSIGHTS',
      links: [
        { name: 'AI & Analytics', href: '/admin/analytics', icon: BarChart2 },
      ],
    },
  ];

  const bottomLinks = [
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Support', href: '/admin/support', icon: HelpCircle },
  ];

  const isActive = (href: string) =>
    href === '/admin'
      ? pathname === '/admin'
      : pathname.startsWith(href);

  // Filter groups and links based on RBAC
  const filteredGroups = groups.map(group => ({
    ...group,
    links: group.links.filter(link => canAccessPath(role, link.href))
  })).filter(group => group.links.length > 0);

  const filteredBottomLinks = bottomLinks.filter(link => canAccessPath(role, link.href));

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.brand}>
        <div className={styles.brandLogoWrapper}>
          {siteLogoLight || siteLogoDark ? (
            <img
              src={siteLogoLight || siteLogoDark}
              alt={siteName}
              className={styles.brandLogo}
            />
          ) : (
            <h1 className={styles.brandName}>{siteName}</h1>
          )}
        </div>
        <p className={styles.brandSubtitle}>Enterprise Admin</p>
      </div>

      <nav className={styles.navSection} style={{ flex: 1, overflowY: 'auto' }}>
        {filteredGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: '8px' }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: 'var(--clr-text-muted)',
              padding: '8px 20px 4px',
              textTransform: 'uppercase'
            }}>
              {group.label}
            </div>
            {group.links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`${styles.navLink} ${active ? styles.active : ''}`}
                >
                  <Icon size={18} />
                  {link.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.bottomSection}>
        {filteredBottomLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`${styles.navLink} ${active ? styles.active : ''}`}
            >
              <Icon size={18} />
              {link.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
