import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ShoppingCart } from 'lucide-react';
import db from '@/lib/db';
import AddToCartButton from '@/components/ui/AddToCartButton';
import AddToWishlistButton from '@/components/ui/AddToWishlistButton';
import { getLocale } from 'next-intl/server';
import { formatServerPrice } from '@/lib/currency';

export async function FeaturedProducts() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const products = await db.product.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 4,
    include: { category: true },
  });

  const dbCurrency = await db.siteSetting.findUnique({ where: { key: 'site_currency' } });
  const siteCurrency = dbCurrency?.value || 'USD';
  const formatPrice = (price: number) => formatServerPrice(price, siteCurrency, locale);

  if (products.length === 0) return null; // Hide if empty

  return (
    <section className="section-padding" style={{ background: 'var(--clr-bg)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(24px, 3.5vw, 40px)', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              {isAr ? 'المتجر الرقمي' : 'Digital Shop'}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 2.4vw + 6px, 32px)', fontWeight: 700, margin: 0 }}>{isAr ? 'منتجات مميزة' : 'Featured Products'}</h2>
          </div>
          <Link href="/shop" style={{ color: 'var(--clr-primary)', fontWeight: 600, fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isAr ? 'عرض كل المنتجات ←' : 'View All Products →'}
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
          {products.map((product) => (
            <Link key={product.id} href={`/shop/${product.slug}`} style={{ textDecoration: 'none' }}>
              <Card isInteractive style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {product.images && JSON.parse(product.images).length > 0 ? (
                  <div style={{ height: '180px', background: `url(${JSON.parse(product.images)[0]}) center/cover` }} />
                ) : product.logo ? (
                  <div style={{ height: '180px', background: `url(${product.logo}) center/cover` }} />
                ) : (
                  <div style={{ height: '180px', background: `linear-gradient(135deg, var(--clr-surface-2), var(--clr-surface-3))` }} />
                )}
                
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '12px', color: 'var(--clr-primary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                    {isAr && product.category ? (product.category.nameAr || product.category.name) : (product.category?.name || 'Uncategorized')}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--clr-text)' }}>{isAr ? (product.nameAr || product.name) : product.name}</h3>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--clr-text)' }}>{formatPrice(product.price)}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <AddToWishlistButton product={{ id: product.id, name: isAr ? (product.nameAr || product.name) : product.name, price: product.price, category: isAr && product.category ? (product.category.nameAr || product.category.name) : (product.category?.name || 'Uncategorized'), slug: product.slug, image: (product.images && JSON.parse(product.images).length > 0 ? JSON.parse(product.images)[0] : undefined) || product.logo }} />
                      <AddToCartButton product={{ id: product.id, name: isAr ? (product.nameAr || product.name) : product.name, price: product.price, category: isAr && product.category ? (product.category.nameAr || product.category.name) : (product.category?.name || 'Uncategorized'), imageUrl: (product.images && JSON.parse(product.images).length > 0 ? JSON.parse(product.images)[0] : undefined) || product.logo }} />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
