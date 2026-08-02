"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, ShoppingCart, Heart, Menu, X, User as UserIcon, LogOut, Sparkles, ChevronRight, Package, Headset, Shield, Zap, ChevronDown } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import CartDrawer from '../ui/CartDrawer';
import NotificationDropdown from '../ui/NotificationDropdown';
import ClientSearch from '../ui/ClientSearch';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/lib/store/cartStore';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import styles from './ClientHeader.module.css';
import { useTranslations, useLocale } from 'next-intl';

export default function ClientHeader({ siteName = "TroveSeek", siteLogoLight, siteLogoDark }: { siteName?: string, siteLogoLight?: string, siteLogoDark?: string }) {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('Common');
  const locale = useLocale();
  const isAr = locale === 'ar';

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSwitch = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    window.location.reload();
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: t('Home'), href: '/' },
    { name: t('About'), href: '/about' },
    { name: t('Products'), href: '/shop' },
    { name: t('SaaS'), href: '/saas' },
    { name: t('Services'), href: '/services' },
    { name: t('Blog'), href: '/blog' },
    { name: t('Contact'), href: '/contact' },
  ];

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', flexDirection: 'column' }}>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <Link href="/" className={styles.logoArea}>
          {siteLogoLight || siteLogoDark ? (
            <img
              src={siteLogoLight || siteLogoDark}
              alt={siteName}
              className={styles.logoLight}
            />
          ) : (
            <div className={styles.logoIcon}>{siteName.charAt(0)}</div>
          )}
          <span className={styles.wordmark}>{siteName}</span>
        </Link>

        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <div className={styles.desktopOnly}>
            <ClientSearch />
          </div>
          <div className={styles.desktopOnly}>
            <ThemeToggle />
          </div>
          <button className={`${styles.iconBtn} ${styles.desktopOnly}`} aria-label={isAr ? 'تغيير اللغة' : 'Change language'} onClick={handleLanguageSwitch} style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', padding: '0 12px' }}>
            <Globe size={20} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>
              {locale.toUpperCase()}
            </span>
          </button>
          {session?.user && <NotificationDropdown />}
          <Link href="/favorites" className={`${styles.iconBtn} ${styles.desktopOnly}`} aria-label={isAr ? 'المفضلة' : 'Favorites'} style={{ position: 'relative' }}>
            <Heart size={20} />
            {mounted && wishlistCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '999px',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 5px',
                minWidth: '16px',
                textAlign: 'center',
                lineHeight: 1.4,
              }}>
                {wishlistCount}
              </span>
            )}
          </Link>
          <button
            className={styles.iconBtn}
            aria-label={isAr ? 'عربة التسوق' : 'Shopping Cart'}
            onClick={() => setCartOpen(true)}
            style={{ position: 'relative' }}
          >
            <ShoppingCart size={20} />
            {mounted && itemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: 'var(--clr-primary)',
                color: 'white',
                borderRadius: '999px',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 5px',
                minWidth: '16px',
                textAlign: 'center',
                lineHeight: 1.4,
              }}>
                {itemCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar & Dropdown for Desktop / Larger Screens */}
          {session?.user ? (
            <div className={`${styles.desktopOnly} ${styles.userMenuContainer}`} ref={userMenuRef}>
              <button
                className={styles.userProfileBtn}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                <div className={styles.userAvatar}>
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className={styles.userAvatarImg}
                    />
                  ) : (
                    <span className={styles.userInitials}>
                      {session.user.name
                        ? session.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                        : 'U'}
                    </span>
                  )}
                </div>
                <ChevronDown size={14} className={`${styles.chevron} ${userMenuOpen ? styles.chevronOpen : ''}`} />
              </button>

              {userMenuOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.userDropdownHeader}>
                    <div className={styles.userDropdownName}>{session.user.name || 'User'}</div>
                    <div className={styles.userDropdownEmail}>{session.user.email}</div>
                  </div>

                  <div className={styles.userDropdownDivider} />

                  <div className={styles.userDropdownLinks}>
                    <Link
                      href="/profile"
                      className={styles.userDropdownItem}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <UserIcon size={16} />
                      <span>{isAr ? 'الملف الشخصي' : 'My Profile'}</span>
                    </Link>

                    <Link
                      href="/profile?tab=orders"
                      className={styles.userDropdownItem}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Package size={16} />
                      <span>{isAr ? 'طلباتي' : 'My Orders'}</span>
                    </Link>

                    <Link
                      href="/profile?tab=subscriptions"
                      className={styles.userDropdownItem}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Zap size={16} />
                      <span>{isAr ? 'اشتراكاتي' : 'My Subscriptions'}</span>
                    </Link>

                    <Link
                      href="/profile?tab=support"
                      className={styles.userDropdownItem}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Headset size={16} />
                      <span>{isAr ? 'الدعم الفني' : 'Support Chat'}</span>
                    </Link>

                    {session.user && ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SUPPORT', 'EMPLOYEE'].includes((session.user as any).role) && (
                      <Link
                        href="/admin"
                        className={`${styles.userDropdownItem} ${styles.adminLink}`}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Shield size={16} />
                        <span>{isAr ? 'لوحة التحكم الإدارية' : 'Admin Panel'}</span>
                      </Link>
                    )}
                  </div>

                  <div className={styles.userDropdownDivider} />

                  <button
                    className={`${styles.userDropdownItem} ${styles.logoutBtn}`}
                    onClick={() => {
                      setUserMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                  >
                    <LogOut size={16} />
                    <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className={`${styles.headerAuthLink} ${styles.desktopOnly}`}>
              <button className={styles.signInBtn}>
                <UserIcon size={15} />
                <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>
            </Link>
          )}

          <button className={`${styles.iconBtn} ${styles.menuBtn}`} onClick={() => setMobileMenuOpen(true)} aria-label="Open Menu">
            <Menu size={24} />
          </button>
        </div>
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Mobile Menu Drawer */}
      <div className={`${styles.mobileOverlay} ${mobileMenuOpen ? styles.mobileOverlayOpen : ''}`} onClick={() => setMobileMenuOpen(false)} />
      <div className={`${styles.mobileDrawer} ${mobileMenuOpen ? styles.mobileDrawerOpen : ''}`}>
        <div className={styles.mobileDrawerHeader}>
          <span className={styles.wordmark}>{siteName}</span>
          <button className={styles.iconBtn} onClick={() => setMobileMenuOpen(false)} aria-label="Close Menu">
            <X size={24} />
          </button>
        </div>
        
        <div className={styles.mobileDrawerContent}>
          {/* Drawer Top User Card or Auth CTA */}
          {session?.user ? (
            <div className={styles.drawerUserCard}>
              <div className={styles.drawerUserTop}>
                <div
                  className={styles.drawerAvatar}
                  style={{
                    background: session.user.image
                      ? `url(${session.user.image}) center/cover`
                      : 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
                  }}
                >
                  {!session.user.image && (
                    session.user.name
                      ? session.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                      : '?'
                  )}
                </div>
                <div className={styles.drawerUserInfo}>
                  <div className={styles.drawerUserName}>{session.user.name || 'User'}</div>
                  <div className={styles.drawerUserEmail}>{session.user.email}</div>
                </div>
              </div>

              <div className={styles.drawerUserActions}>
                <Link
                  href="/profile"
                  className={styles.drawerProfileLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserIcon size={15} />
                  <span>{isAr ? 'الملف الشخصي' : 'My Profile'}</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: '/login' });
                  }}
                  className={styles.drawerLogoutBtn}
                  title={isAr ? 'تسجيل الخروج' : 'Sign Out'}
                >
                  <LogOut size={15} />
                  <span>{isAr ? 'خروج' : 'Logout'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.drawerAuthCard}>
              <div className={styles.drawerAuthTitle}>
                <Sparkles size={16} className={styles.drawerSparkle} />
                <span>{isAr ? 'أهلاً بك في ' + siteName : 'Welcome to ' + siteName}</span>
              </div>
              <p className={styles.drawerAuthSub}>
                {isAr ? 'سجّل الدخول للوصول إلى طلباتك وتنزيلاتك' : 'Sign in to access your orders, downloads & licenses'}
              </p>
              <div className={styles.drawerAuthButtons}>
                <Link
                  href="/login"
                  className={styles.drawerPrimaryBtn}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserIcon size={16} />
                  <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
                </Link>
                <Link
                  href="/register"
                  className={styles.drawerSecondaryBtn}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{isAr ? 'إنشاء حساب جديد' : 'Create Account'}</span>
                </Link>
              </div>
            </div>
          )}

          <div className={styles.mobileSearchWrapper}>
            <ClientSearch />
          </div>
          
          <nav className={styles.mobileNav}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`${styles.mobileNavLink} ${pathname === link.href ? styles.active : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{link.name}</span>
                <ChevronRight size={16} opacity={0.5} />
              </Link>
            ))}

            {session?.user && (
              <>
                <Link
                  href="/profile?tab=orders"
                  className={styles.mobileNavLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={16} color="var(--clr-primary)" />
                    {isAr ? 'طلباتي' : 'My Orders'}
                  </span>
                  <ChevronRight size={16} opacity={0.5} />
                </Link>
                <Link
                  href="/profile?tab=support"
                  className={styles.mobileNavLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Headset size={16} color="var(--clr-accent)" />
                    {isAr ? 'محادثة الدعم' : 'Support Chat'}
                  </span>
                  <ChevronRight size={16} opacity={0.5} />
                </Link>
              </>
            )}

            <Link
              href="/favorites"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={16} color="#ef4444" />
                {isAr ? 'المفضلة' : 'Favorites'}
              </span>
              {wishlistCount > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 7px',
                }}>
                  {wishlistCount}
                </span>
              )}
            </Link>
          </nav>
          
          <div className={styles.mobileDrawerFooter}>
            <div className={styles.mobileDrawerActions}>
              <button
                type="button"
                className={styles.mobileActionBtn}
                onClick={handleLanguageSwitch}
                aria-label={isAr ? 'تغيير اللغة' : 'Change Language'}
              >
                <Globe size={18} />
                <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
              </button>
              
              <div className={styles.mobileActionTheme}>
                <ThemeToggle />
                <span className={styles.mobileActionThemeLabel}>
                  {isAr ? 'المظهر' : 'Theme'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
