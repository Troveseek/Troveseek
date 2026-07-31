import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import db from '@/lib/db';
import { getLocale } from 'next-intl/server';
import { formatServerPrice } from '@/lib/currency';

export async function FeaturedSaaS() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const saasProducts = await db.saaS.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const dbCurrency = await db.siteSetting.findUnique({ where: { key: 'site_currency' } });
  const siteCurrency = dbCurrency?.value || 'USD';
  const formatPrice = (price: number) => formatServerPrice(price, siteCurrency, locale);

  if (saasProducts.length === 0) return null; // Hide if empty

  return (
    <section style={{ padding: 'clamp(48px, 10vw, 96px) 16px', background: 'var(--clr-surface-2)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            {isAr ? 'برمجيات SaaS' : 'SaaS Solutions'}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, marginBottom: '16px' }}>
            {isAr ? 'برمجيات الشركات، مبسطة' : 'Enterprise Software, Simplified'}
          </h2>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto 24px' }}>
            {isAr ? 'اكتشف مجموعة برمجياتنا السحابية المصممة للنمو مع عملك.' : 'Discover our suite of cloud software products designed to scale with your business.'}
          </p>
          <Link href="/saas" style={{ color: 'var(--clr-primary)', fontWeight: 600, textDecoration: 'none' }}>
            {isAr ? 'استكشف كل برمجياتنا ←' : 'Explore All SaaS →'}
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {saasProducts.map((saas, idx) => {
            let imgUrl = null;
            try {
              const parsed = JSON.parse(saas.images || '[]');
              if (parsed.length > 0) imgUrl = parsed[0];
            } catch(e) {}
            if (!imgUrl) imgUrl = saas.logo || null;

            return (
            <Link key={saas.id} href={`/saas/${saas.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: idx % 2 === 0 ? 'row' : 'row-reverse',
                background: 'var(--clr-surface)', 
                border: '1px solid var(--clr-border)', 
                borderRadius: '24px', 
                overflow: 'hidden',
                transition: 'var(--transition)',
                boxShadow: 'var(--shadow-card)',
                flexWrap: 'wrap'
              }}>
                <div style={{ flex: '1 1 300px', minHeight: '300px', background: imgUrl ? `url(${imgUrl}) center/cover` : 'var(--clr-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {!imgUrl && (
                    <div style={{ width: '120px', height: '120px', background: 'var(--clr-primary)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', boxShadow: '0 16px 32px rgba(0,0,0,0.15)' }}>
                      {(isAr ? (saas.nameAr || saas.name) : saas.name).charAt(0)}
                    </div>
                  )}
                </div>
                <div style={{ flex: '1 1 300px', padding: 'clamp(24px, 5vw, 48px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,229,176,0.15)', color: '#00e5b0', padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, marginBottom: '24px', width: 'fit-content' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e5b0' }} /> {isAr ? 'نشط' : 'Live'}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, marginBottom: '16px' }}>{isAr ? (saas.nameAr || saas.name) : saas.name}</h3>
                  <p style={{ fontSize: '16px', color: 'var(--clr-text-muted)', lineHeight: 1.7, marginBottom: '32px' }}>{isAr ? (saas.descriptionAr || saas.description) : saas.description}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--clr-primary)' }}>
                      {isAr ? `تبدأ من ${formatPrice(saas.monthlyPrice).replace(/\.00$/, '')}/شهر` : `From ${formatPrice(saas.monthlyPrice).replace(/\.00$/, '')}/mo`}
                    </div>
                    <Button variant="primary">{isAr ? 'اعرف المزيد' : 'Learn More'}</Button>
                  </div>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
