"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, ShoppingCart, Heart, Menu, X } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import CartDrawer from '../ui/CartDrawer';
import NotificationDropdown from '../ui/NotificationDropdown';
import ClientSearch from '../ui/ClientSearch';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/lib/store/cartStore';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import styles from './ClientHeader.module.css';
import { useTranslations, useLocale } from 'next-intl';

export default function ClientHeader({ siteName = "TroveSeek", siteLogoLight, siteLogoDark }: { siteName?: string, siteLogoLight?: string, siteLogoDark?: string }) {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
          {session?.user ? (
            <Link href="/profile" className={styles.desktopOnly} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                title={session.user.name || (isAr ? 'الملف الشخصي' : 'Profile')}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid var(--clr-primary)',
                  background: session.user.image
                    ? `url(${session.user.image}) center/cover`
                    : 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '14px',
                  fontFamily: 'var(--font-display)',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(124,111,255,0.25)',
                }}
              >
                {!session.user.image && (
                  session.user.name
                    ? session.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                    : '?'
                )}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--clr-text)', whiteSpace: 'nowrap' }}>
                {session.user.name || 'User'}
              </span>
            </Link>
          ) : (
            <Link href="/login" className={styles.desktopOnly}>
              <button className={styles.signInBtn}>{isAr ? 'تسجيل الدخول' : 'Sign In'}</button>
            </Link>
          )}
          <button className={`${styles.iconBtn} ${styles.menuBtn}`} onClick={() => setMobileMenuOpen(true)}>
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
          <button className={styles.iconBtn} onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className={styles.mobileDrawerContent}>
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
                {link.name}
              </Link>
            ))}
          </nav>
          
          <div className={styles.mobileDrawerFooter}>
            <div className={styles.mobileDrawerActions}>
              <button className={styles.iconBtn} onClick={handleLanguageSwitch} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px' }}>
                <Globe size={20} />
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{locale.toUpperCase()}</span>
              </button>
              
              <div style={{ padding: '12px', display: 'flex', alignItems: 'center' }}>
                <ThemeToggle />
                <span style={{ fontSize: '14px', fontWeight: 600, marginLeft: '8px' }}>
                  {isAr ? 'المظهر' : 'Theme'}
                </span>
              </div>
            </div>
            
            {session?.user ? (
              <Link href="/profile" className={styles.mobileProfileBtn} onClick={() => setMobileMenuOpen(false)}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: session.user.image ? `url(${session.user.image}) center/cover` : 'var(--clr-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold'
                  }}
                >
                  {!session.user.image && session.user.name ? session.user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--clr-text)' }}>{session.user.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>{isAr ? 'عرض الملف الشخصي' : 'View Profile'}</div>
                </div>
              </Link>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <button className={styles.signInBtn} style={{ width: '100%', marginTop: '16px' }}>
                  {isAr ? 'تسجيل الدخول' : 'Sign In'}
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
