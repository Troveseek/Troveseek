import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Laptop, Smartphone, Palette, Bot, Cloud, Shield, BarChart, TrendingUp, Video, Check, Clock } from 'lucide-react';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import styles from './page.module.css';
import db from '@/lib/db';
import { getLocale } from 'next-intl/server';
import { formatServerPrice } from '@/lib/currency';

const ICON_MAP: Record<string, React.ReactNode> = {
  web: <Laptop size={28} />,
  mobile: <Smartphone size={28} />,
  design: <Palette size={28} />,
  ai: <Bot size={28} />,
  cloud: <Cloud size={28} />,
  security: <Shield size={28} />,
  analytics: <BarChart size={28} />,
  marketing: <TrendingUp size={28} />,
  video: <Video size={28} />,
};

export default async function ServicesPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';
  
  const dbCurrency = await db.siteSetting.findUnique({ where: { key: 'site_currency' } });
  const siteCurrency = dbCurrency?.value || 'USD';
  const formatPrice = (price: number) => formatServerPrice(price, siteCurrency, locale);

  const dbServices = await db.service.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });

  const services = dbServices.map((s, i) => ({
    id: s.id,
    slug: s.slug,
    name: isAr ? (s.nameAr || s.name) : s.name,
    description: isAr ? (s.descriptionAr || s.description) : s.description,
    basePrice: s.basePrice,
    estimatedDays: s.estimatedDays,
    status: s.status,
    features: [] as string[],
    logo: s.logo,
    iconKey: 'web' as string,
    large: i % 4 === 0 || i % 4 === 3,
  }));

  // Fetch Hero for this page
  const heroData = await db.pageHero.findFirst({
    where: { page: 'SERVICES', isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  const heroButtons = heroData?.buttons ? JSON.parse(heroData.buttons) : [];

  return (
    <div className={styles.servicesPage}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.eyebrow}>{heroData?.label ? (isAr ? (heroData.labelAr || heroData.label) : heroData.label) : (isAr ? 'الخدمات المهنية' : 'Professional Services')}</div>
        <h1 className={styles.title}>
          {heroData?.title ? (isAr ? (heroData.titleAr || heroData.title) : heroData.title) : (isAr ? 'مواهب خبيرة، تُقدم بسرعة' : 'Expert Talent, Delivered Fast')}
        </h1>
        <p className={styles.subtitle}>
          {heroData?.subtitle ? (isAr ? (heroData.subtitleAr || heroData.subtitle) : heroData.subtitle) : (isAr ? 'من تطوير الويب إلى دمج الذكاء الاصطناعي — فريقنا يقدم النتائج في الوقت المحدد وفي حدود الميزانية.' : 'From web development to AI integration — our vetted team delivers results on time and on budget.')}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '32px' }}>
          {heroButtons.length > 0 ? heroButtons.map((btn: any, i: number) => (
            btn.isActive && (
              <Button key={i} href={btn.url} variant={btn.variant as any} size="lg">
                {isAr ? (btn.labelAr || (btn.label?.trim().toLowerCase() === 'browse services' ? 'تصفح الخدمات' : btn.label?.trim().toLowerCase() === 'request custom quote' ? 'اطلب عرض سعر مخصص' : btn.label)) : btn.label}
              </Button>
            )
          )) : (
            <>
              <Button href="#services" variant="primary" size="lg">{isAr ? 'تصفح الخدمات' : 'Browse Services'}</Button>
              <Button href="/contact" variant="secondary" size="lg">{isAr ? 'اطلب عرض سعر مخصص' : 'Request Custom Quote'}</Button>
            </>
          )}
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className={styles.servicesSection}>
        {services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--clr-text-muted)' }}>
            {isAr ? 'لا توجد خدمات متاحة في الوقت الحالي.' : 'No services available at the moment.'}
          </div>
        ) : (
          <div className={styles.bentoGrid}>
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                style={{ textDecoration: 'none' }}
                className={`${styles.serviceCard} ${service.large ? styles.largeCard : ''}`}
              >
                <div className={styles.iconCircle} style={{ background: service.logo ? 'transparent' : undefined, overflow: 'hidden' }}>
                  {service.logo ? (
                    <img src={service.logo} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    ICON_MAP[service.iconKey] ?? <Laptop size={28} />
                  )}
                </div>
                <div className={styles.serviceName}>{service.name}</div>
                <p className={styles.serviceDesc}>{service.description}</p>
                {service.features.length > 0 && (
                  <ul className={styles.checklist}>
                    {service.features.slice(0, 4).map((f: string) => (
                      <li key={f} className={styles.checkItem}>
                        <Check size={14} color="var(--clr-accent)" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                <div className={styles.divider} />
                <div className={styles.bottomRow}>
                  <div>
                    <div className={styles.priceStart}>{isAr ? 'يبدأ من' : 'From'}</div>
                    <div className={styles.priceLabel}>{formatPrice(service.basePrice)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <Clock size={12} /> {service.estimatedDays} {isAr ? 'أيام للتسليم' : `day${service.estimatedDays !== 1 ? 's' : ''} delivery`}
                    </div>
                  </div>
                  <Button variant="primary" size="sm">{isAr ? 'ابدأ الآن' : 'Get Started'}</Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
