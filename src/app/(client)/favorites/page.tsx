"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, HeartOff, ShoppingCart, Share2, Star } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ShareModal from '@/components/ui/ShareModal';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { useCartStore } from '@/lib/store/cartStore';
import { useLocale } from 'next-intl';

export default function FavoritesPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [mounted, setMounted] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState({ url: '', title: '' });
  const favoriteItems = useWishlistStore((state) => state.items);
  const removeWishlistItem = useWishlistStore((state) => state.removeItem);
  const addCartItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Heart size={32} color="#ff4444" fill="#ff4444" />
        <div>
          <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{isAr ? 'المفضلة' : 'Your Favorites'}</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '16px' }}>{favoriteItems.length} {isAr ? 'عناصر محفوظة' : 'items saved'}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <Button variant="primary" style={{ borderRadius: '999px' }}>{isAr ? 'الكل' : 'All'} ({favoriteItems.length})</Button>
      </div>

      {favoriteItems.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '24px' 
        }}>
          {favoriteItems.map((item) => (
            <Card key={item.id} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '100%',
                  aspectRatio: '16/10',
                  background: item.image
                    ? `url(${item.image}) center/cover`
                    : `linear-gradient(135deg, var(--clr-primary-dim), var(--clr-surface-3))`,
                  borderBottom: `1px solid var(--clr-border)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {!item.image && (
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: `var(--clr-primary)`, opacity: 0.85 }} />
                  )}
                </div>
                <button 
                  onClick={() => removeWishlistItem(item.id)}
                  style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'var(--clr-surface)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <Heart size={18} color="#ff4444" fill="#ff4444" />
                </button>
              </div>
              <CardBody style={{ display: 'flex', flexDirection: 'column', padding: '20px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    color: 'var(--clr-primary)',
                    background: 'rgba(124,111,255,0.15)',
                    padding: '4px 8px',
                    borderRadius: '999px'
                  }}>
                    {item.category}
                  </span>
                </div>
                
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', lineHeight: 1.4 }}>
                  {item.name}
                </h3>
                
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ height: '1px', background: 'var(--clr-border)', marginBottom: '16px' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                        {isAr ? 'السعر' : 'Price'}
                      </span>
                      <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          const url = window.location.origin + (item.slug ? `/shop/${item.slug}` : `/shop`);
                          setShareData({ url, title: item.name });
                          setShareModalOpen(true);
                        }}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--clr-border)',
                          borderRadius: '8px',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--clr-text)',
                          cursor: 'pointer'
                        }}
                        title={isAr ? 'مشاركة المنتج' : 'Share Product'}
                      >
                        <Share2 size={18} />
                      </button>
                      <Button variant="primary" style={{ padding: '0 16px' }} icon={<ShoppingCart size={16} />} onClick={() => addCartItem({ ...item, basePrice: item.price })}>
                        {isAr ? 'إضافة' : 'Add'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card style={{ textAlign: 'center', padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--clr-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
            <HeartOff size={40} color="var(--clr-text-muted)" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 600 }}>{isAr ? 'لا توجد مفضلة بعد' : 'No favorites yet'}</h2>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '15px', maxWidth: '400px' }}>
            {isAr ? 'احفظ العناصر التي تعجبك وستظهر هنا حتى تتمكن من العثور عليها بسهولة لاحقاً.' : 'Save items you like and they will appear here so you can easily find them later.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Link href="/shop" style={{ textDecoration: 'none' }}>
              <Button variant="primary">{isAr ? 'تصفح المنتجات' : 'Browse Products'}</Button>
            </Link>
            <Link href="/saas" style={{ textDecoration: 'none' }}>
              <Button variant="secondary">{isAr ? 'استكشف SaaS' : 'Explore SaaS'}</Button>
            </Link>
          </div>
        </Card>
      )}

      <ShareModal 
        isOpen={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
        url={shareData.url} 
        title={shareData.title} 
      />
    </div>
  );
}
