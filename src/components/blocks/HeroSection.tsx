import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import styles from './HeroSection.module.css';
import db from '@/lib/db';
import { getLocale } from 'next-intl/server';

export async function HeroSection() {
  const locale = await getLocale();
  const isAr = locale === 'ar';
  
  const hero = await db.pageHero.findFirst({
    where: { page: 'HOME', isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  const title = isAr ? (hero?.titleAr || hero?.title || 'Beyond Search. Beyond Expectations.') : (hero?.title || 'Beyond Search. Beyond Expectations.');
  const subtitle = isAr ? (hero?.subtitleAr || hero?.subtitle || 'The premier platform for high-quality digital assets...') : (hero?.subtitle || 'The premier platform for high-quality digital assets...');
  
  let buttons: any[] = [];
  try {
    buttons = JSON.parse(hero?.buttons || '[]');
  } catch (e) {}

  if (buttons.length === 0) {
    buttons = [
      { label: 'Explore Assets', labelAr: 'تصفح المنتجات', url: '/shop', variant: 'primary' },
      { label: 'View Solutions', labelAr: 'عرض الحلول', url: '/saas', variant: 'secondary' }
    ];
  }

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.title} dangerouslySetInnerHTML={{ __html: title.replace(/\n/g, '<br />') }}></h1>
        
        <p className={styles.subtitle}>
          {subtitle}
        </p>
        
        <div className={styles.actions}>
          {buttons.map((btn, i) => (
            <Button key={i} href={btn.url || '#'} size="lg" variant={btn.variant || 'primary'} icon={i === 0 ? <ArrowRight size={18} /> : undefined}>
              {isAr ? (btn.labelAr || btn.label) : btn.label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
