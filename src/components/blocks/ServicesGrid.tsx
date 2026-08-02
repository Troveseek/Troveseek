import React from 'react';
import Link from 'next/link';
import { Laptop, Smartphone, Palette, Bot, Code, Settings } from 'lucide-react';
import db from '@/lib/db';
import { getLocale } from 'next-intl/server';
import { formatServerPrice } from '@/lib/currency';

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case 'smartphone': return <Smartphone size={32} />;
    case 'palette': return <Palette size={32} />;
    case 'bot': return <Bot size={32} />;
    case 'code': return <Code size={32} />;
    case 'settings': return <Settings size={32} />;
    default: return <Laptop size={32} />;
  }
};

export async function ServicesGrid() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const services = await db.service.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 4,
  });

  const dbCurrency = await db.siteSetting.findUnique({ where: { key: 'site_currency' } });
  const siteCurrency = dbCurrency?.value || 'USD';

  if (services.length === 0) return null; // Hide if empty

  return (
    <section className="section-padding" style={{ background: 'var(--clr-surface)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(24px, 3.5vw, 40px)', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              {isAr ? 'الخدمات الاحترافية' : 'Professional Services'}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 2.4vw + 6px, 32px)', fontWeight: 700, margin: 0 }}>{isAr ? 'خدمات رقمية احترافية' : 'Expert Digital Services'}</h2>
          </div>
          <Link href="/services" style={{ color: 'var(--clr-primary)', fontWeight: 600, fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isAr ? 'عرض كل الخدمات ←' : 'View All Services →'}
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'clamp(16px, 2.5vw, 24px)' }}>
          {services.map((srv) => (
            <Link key={srv.id} href={`/services/${srv.slug || srv.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--clr-surface-2)',
                border: '1px solid var(--clr-border)',
                borderRadius: '16px',
                padding: 'clamp(20px, 2.5vw, 28px)',
                transition: 'var(--transition)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: srv.logo ? `url(${srv.logo}) center/cover` : 'var(--clr-primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-primary)', marginBottom: '18px', overflow: 'hidden', border: srv.logo ? '1px solid var(--clr-border)' : 'none' }}>
                  {!srv.logo && getIcon('laptop')}
                </div>
                <h3 style={{ fontSize: 'clamp(16px, 1.1vw + 4px, 19px)', fontWeight: 600, marginBottom: '10px', color: 'var(--clr-text)' }}>{isAr ? (srv.nameAr || srv.name) : srv.name}</h3>
                <p style={{ color: 'var(--clr-text-muted)', fontSize: 'clamp(13px, 0.8vw + 3px, 14.5px)', lineHeight: 1.6, flex: 1, margin: 0 }}>{isAr ? (srv.descriptionAr || srv.description) : srv.description}</p>
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>{isAr ? 'تبدأ من' : 'Starting from'}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 1.2vw + 4px, 18px)', fontWeight: 700, color: 'var(--clr-primary)' }}>
                    {formatServerPrice(srv.basePrice, siteCurrency, locale)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
