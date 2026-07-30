import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import styles from './CTASection.module.css';
import { getLocale } from 'next-intl/server';

export async function CTASection() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  return (
    <section className={styles.ctaSection}>
      <div className={styles.container}>
        <div className={styles.glow}></div>
        
        <h2 className={styles.title}>{isAr ? 'هل أنت مستعد لتحويل عملك الرقمي؟' : 'Ready to Transform Your Digital Business?'}</h2>
        
        <p className={styles.subtitle}>
          {isAr ? 'انضم إلى الآلاف من المبدعين والشركات الذين يستخدمون TroveSeek لشراء وبيع وإدارة أصولهم الرقمية عالمياً.' : 'Join thousands of creators and enterprises already using TroveSeek to buy, sell, and manage their digital assets globally.'}
        </p>
        
        <div className={styles.actions}>
          <Button href="/register" size="lg" variant="primary" icon={<ArrowRight size={18} />}>
            {isAr ? 'ابدأ مجاناً' : 'Get Started for Free'}
          </Button>
          <Button href="/contact" size="lg" variant="secondary">
            {isAr ? 'تواصل مع المبيعات' : 'Contact Sales'}
          </Button>
        </div>
      </div>
    </section>
  );
}
