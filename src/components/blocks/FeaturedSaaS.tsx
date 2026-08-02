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
    <section style={{ padding: 'clamp(48px, 6vw, 88px) clamp(16px, 3vw, 32px)', background: 'var(--clr-surface-2)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 4vw, 56px)' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            {isAr ? 'برمجيات SaaS' : 'SaaS Solutions'}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 2.6vw + 6px, 34px)', fontWeight: 700, marginBottom: '12px', lineHeight: 1.25 }}>
            {isAr ? 'برمجيات الشركات، مبسطة' : 'Enterprise Software, Simplified'}
          </h2>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: 'clamp(14px, 0.9vw + 4px, 16px)', maxWidth: '600px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            {isAr ? 'اكتشف مجموعة برمجياتنا السحابية المصممة للنمو مع عملك.' : 'Discover our suite of cloud software products designed to scale with your business.'}
          </p>
          <Link href="/saas" style={{ color: 'var(--clr-primary)', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
            {isAr ? 'استكشف كل برمجياتنا ←' : 'Explore All SaaS →'}
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 3vw, 32px)' }}>
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
                borderRadius: '20px', 
                overflow: 'hidden',
                transition: 'var(--transition)',
                boxShadow: 'var(--shadow-card)',
                flexWrap: 'wrap'
              }}>
                <div style={{ flex: '1 1 280px', minHeight: 'clamp(200px, 25vw, 280px)', background: imgUrl ? `url(${imgUrl}) center/cover` : 'var(--clr-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {!imgUrl && (
                    <div style={{ width: '90px', height: '90px', background: 'var(--clr-primary)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', boxShadow: '0 12px 28px rgba(0,0,0,0.15)' }}>
                      {(isAr ? (saas.nameAr || saas.name) : saas.name).charAt(0)}
                    </div>
                  )}
                </div>
                <div style={{ flex: '1 1 280px', padding: 'clamp(20px, 3vw, 36px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,229,176,0.15)', color: '#00e5b0', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, marginBottom: '16px', width: 'fit-content' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00e5b0' }} /> {isAr ? 'نشط' : 'Live'}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 1.8vw + 6px, 26px)', fontWeight: 700, marginBottom: '12px' }}>{isAr ? (saas.nameAr || saas.name) : saas.name}</h3>
                  <p style={{ fontSize: 'clamp(13.5px, 0.8vw + 4px, 15px)', color: 'var(--clr-text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>{isAr ? (saas.descriptionAr || saas.description) : saas.description}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 1.4vw + 4px, 22px)', fontWeight: 700, color: 'var(--clr-primary)' }}>
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
