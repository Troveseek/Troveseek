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
    <section style={{ padding: '96px 32px', background: 'var(--clr-surface)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              {isAr ? 'الخدمات الاحترافية' : 'Professional Services'}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700 }}>{isAr ? 'خدمات رقمية احترافية' : 'Expert Digital Services'}</h2>
          </div>
          <Link href="/services" style={{ color: 'var(--clr-primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isAr ? 'عرض كل الخدمات ←' : 'View All Services →'}
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {services.map((srv) => (
            <Link key={srv.id} href={`/services/${srv.slug || srv.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--clr-surface-2)',
                border: '1px solid var(--clr-border)',
                borderRadius: '16px',
                padding: '32px',
                transition: 'var(--transition)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: srv.logo ? `url(${srv.logo}) center/cover` : 'var(--clr-primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-primary)', marginBottom: '24px', overflow: 'hidden', border: srv.logo ? '1px solid var(--clr-border)' : 'none' }}>
                  {!srv.logo && getIcon('laptop')}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: 'var(--clr-text)' }}>{isAr ? (srv.nameAr || srv.name) : srv.name}</h3>
                <p style={{ color: 'var(--clr-text-muted)', fontSize: '15px', lineHeight: 1.6, flex: 1 }}>{isAr ? (srv.descriptionAr || srv.description) : srv.description}</p>
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>{isAr ? 'تبدأ من' : 'Starting from'}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--clr-primary)' }}>
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
