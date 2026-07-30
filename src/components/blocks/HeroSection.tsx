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
      <div className={styles.bgEffects}>
        <div className={styles.grid3d}></div>
        <div className={styles.floatingElements}>
          {/* Services */}
          <div className={styles.floatingItem} style={{ '--delay': '0s', '--x': '15%' } as any}>Website Development</div>
          <div className={styles.floatingItem} style={{ '--delay': '4s', '--x': '65%' } as any}>UI/UX Design</div>
          <div className={styles.floatingItem} style={{ '--delay': '8s', '--x': '35%' } as any}>Graphic Design</div>
          <div className={styles.floatingItem} style={{ '--delay': '12s', '--x': '75%' } as any}>App Development</div>
          <div className={styles.floatingItem} style={{ '--delay': '16s', '--x': '20%' } as any}>Social Media Management</div>
          <div className={styles.floatingItem} style={{ '--delay': '20s', '--x': '80%' } as any}>Digital Products</div>
          <div className={styles.floatingItem} style={{ '--delay': '24s', '--x': '45%' } as any}>SaaS Solutions</div>
          <div className={styles.floatingItem} style={{ '--delay': '28s', '--x': '10%' } as any}>Marketing</div>
          <div className={styles.floatingItem} style={{ '--delay': '32s', '--x': '55%' } as any}>Visa Services</div>
          <div className={styles.floatingItem} style={{ '--delay': '36s', '--x': '85%' } as any}>Digital Art</div>
          <div className={styles.floatingItem} style={{ '--delay': '40s', '--x': '25%' } as any}>Pixel Art</div>
          <div className={styles.floatingItem} style={{ '--delay': '44s', '--x': '70%' } as any}>Problem Solving</div>
          
          {/* Marketing Slogans (English & Arabic) */}
          <div className={styles.floatingItem} style={{ '--delay': '48s', '--x': '50%' } as any}>Scale Your Business</div>
          <div className={styles.floatingItem} style={{ '--delay': '52s', '--x': '12%' } as any}>ارتقِ بأعمالك</div>
          <div className={styles.floatingItem} style={{ '--delay': '56s', '--x': '78%' } as any}>Transform Your Brand</div>
          <div className={styles.floatingItem} style={{ '--delay': '60s', '--x': '30%' } as any}>صمم مستقبلك</div>
          <div className={styles.floatingItem} style={{ '--delay': '64s', '--x': '60%' } as any}>Unlock Your Potential</div>
          <div className={styles.floatingItem} style={{ '--delay': '68s', '--x': '18%' } as any}>نجاحك يبدأ هنا</div>
          <div className={styles.floatingItem} style={{ '--delay': '72s', '--x': '88%' } as any}>Boost Your Sales</div>
          <div className={styles.floatingItem} style={{ '--delay': '76s', '--x': '40%' } as any}>ضاعف أرباحك</div>
        </div>
      </div>
      
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
