"use client";

import React from 'react';
import Link from 'next/link';
import styles from './ClientFooter.module.css';
import { useLocale } from 'next-intl';

export default function ClientFooter({ siteName = "TroveSeek", siteLogoLight, siteLogoDark, privacyUrl, termsUrl }: { siteName?: string, siteLogoLight?: string, siteLogoDark?: string, privacyUrl?: string, termsUrl?: string }) {
  const currentYear = new Date().getFullYear();
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logoArea}>
            {siteLogoLight || siteLogoDark ? (
              <>
                {siteLogoLight && <img src={siteLogoLight} alt={siteName} className={styles.logoLight} style={{ maxHeight: '32px', objectFit: 'contain' }} />}
                {siteLogoDark && <img src={siteLogoDark} alt={siteName} className={styles.logoDark} style={{ maxHeight: '32px', objectFit: 'contain', display: 'none' }} />}
              </>
            ) : (
              <div className={styles.logoIcon}>{siteName.charAt(0)}</div>
            )}
            <span className={styles.wordmark}>{siteName}</span>
          </Link>
          <p className={styles.tagline}>
            {isAr ? 'بنية تحتية للتجارة الرقمية على مستوى المؤسسات مصممة للتوسع العالمي. ما وراء البحث، ما وراء التوقعات.' : 'Enterprise-grade digital commerce infrastructure built for global scale. Beyond Search, Beyond Expectations.'}
          </p>
        </div>
        
        <div className={styles.column}>
          <h3>{isAr ? 'المنتجات' : 'Products'}</h3>
          <ul>
            <li><Link href="/shop">{isAr ? 'الأصول الرقمية' : 'Digital Assets'}</Link></li>
            <li><Link href="/saas">{isAr ? 'حلول SaaS' : 'SaaS Solutions'}</Link></li>
            <li><Link href="/services">{isAr ? 'الخدمات المهنية' : 'Professional Services'}</Link></li>
            <li><Link href="/enterprise">{isAr ? 'خطط المؤسسات' : 'Enterprise Plans'}</Link></li>
          </ul>
        </div>
        
        <div className={styles.column}>
          <h3>{isAr ? 'الشركة' : 'Company'}</h3>
          <ul>
            <li><Link href="/about">{isAr ? 'معلومات عنا' : 'About Us'}</Link></li>
            <li><Link href="/blog">{isAr ? 'المدونة والأخبار' : 'Blog & News'}</Link></li>
            <li><Link href="/careers">{isAr ? 'الوظائف' : 'Careers'}</Link></li>
            <li><Link href="/contact">{isAr ? 'اتصل بنا' : 'Contact'}</Link></li>
          </ul>
        </div>
        
        <div className={styles.column}>
          <h3>{isAr ? 'الدعم' : 'Support'}</h3>
          <ul>
            <li><Link href="/help">{isAr ? 'مركز المساعدة' : 'Help Center'}</Link></li>
            <li><Link href="/docs">{isAr ? 'التوثيق' : 'Documentation'}</Link></li>
            <li><Link href="/status">{isAr ? 'حالة النظام' : 'System Status'}</Link></li>
            <li><Link href="/community">{isAr ? 'منتديات المجتمع' : 'Community Forums'}</Link></li>
          </ul>
        </div>
        
        <div className={styles.column}>
          <h3>{isAr ? 'قانوني' : 'Legal'}</h3>
          <ul>
            <li><Link href={privacyUrl || "/policies/privacy"}>{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link></li>
            <li><Link href={termsUrl || "/policies/terms"}>{isAr ? 'شروط الخدمة' : 'Terms of Service'}</Link></li>
            <li><Link href="/policies/cookies">{isAr ? 'سياسة ملفات تعريف الارتباط' : 'Cookie Policy'}</Link></li>
            <li><Link href="/policies/compliance">{isAr ? 'الامتثال' : 'Compliance'}</Link></li>
          </ul>
        </div>
      </div>
      
      <div className={styles.bottomBar}>
        <div className={styles.copyright}>
          &copy; {currentYear} {siteName}. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
        </div>
        <div className={styles.social}>
          <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="https://github.com" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          </a>
          <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
