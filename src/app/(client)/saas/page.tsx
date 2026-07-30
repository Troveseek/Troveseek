"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import ShareModal from '@/components/ui/ShareModal';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { Search, Star, LayoutGrid, Heart, Share2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useCurrency } from '@/components/providers/CurrencyProvider';

export default function SaasPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { formatPrice } = useCurrency();
  const [saasProducts, setSaasProducts] = useState<any[]>([]);
  const [heroData, setHeroData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL_CATEGORIES');

  // Share modal
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState({ url: '', title: '' });

  // Wishlist (hydration-safe)
  const [mounted, setMounted] = useState(false);
  const addWishlistItem    = useWishlistStore((s) => s.addItem);
  const removeWishlistItem = useWishlistStore((s) => s.removeItem);
  const isInWishlist       = useWishlistStore((s) => s.isInWishlist);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [saasRes, heroRes] = await Promise.all([
          fetch('/api/saas?status=ACTIVE'),
          fetch('/api/page-heroes?page=SAAS&isActive=true'),
        ]);
        const saasData = await saasRes.json();
        const heroDataList = await heroRes.json();
        setSaasProducts(saasData.data ?? []);
        if (heroDataList.data && heroDataList.data.length > 0) setHeroData(heroDataList.data[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    saasProducts.forEach(s => cats.add((isAr ? (s.category?.nameAr || s.category?.name) : s.category?.name) || (isAr ? 'غير مصنف' : 'Uncategorized')));
    return Array.from(cats).sort();
  }, [saasProducts, isAr]);

  const filtered = useMemo(() => {
    let list = [...saasProducts];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => 
        (isAr ? (s.nameAr || s.name) : s.name).toLowerCase().includes(q) || 
        (isAr ? (s.descriptionAr || s.description) : s.description)?.toLowerCase().includes(q) || 
        (isAr ? (s.category?.nameAr || s.category?.name) : s.category?.name)?.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'ALL_CATEGORIES') {
      list = list.filter(s => {
        const catName = (isAr ? (s.category?.nameAr || s.category?.name) : s.category?.name) || (isAr ? 'غير مصنف' : 'Uncategorized');
        return catName === selectedCategory;
      });
    }
    return list;
  }, [saasProducts, search, selectedCategory]);

  const heroButtons = heroData?.buttons ? JSON.parse(heroData.buttons) : [];

  const handleToggleFavorite = (e: React.MouseEvent, saas: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(saas.id)) {
      removeWishlistItem(saas.id);
    } else {
      addWishlistItem({
        id: saas.id,
        name: saas.name,
        price: saas.monthlyPrice ?? 0,
        category: saas.category?.name ?? 'SaaS',
        slug: saas.slug,
      });
    }
  };

  const handleShare = (e: React.MouseEvent, saas: any) => {
    e.preventDefault();
    e.stopPropagation();
    const url = typeof window !== 'undefined' ? `${window.location.origin}/saas/${saas.slug}` : `/saas/${saas.slug}`;
    setShareData({ url, title: saas.name });
    setShareModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--clr-surface-2) 0%, var(--clr-surface) 100%)', padding: '64px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: '1 1 480px' }}>
            {heroData?.label && (
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                {heroData.label}
              </div>
            )}
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 700, lineHeight: 1.15, marginBottom: '20px' }}>
              {heroData ? (isAr ? (heroData.titleAr || heroData.title) : heroData.title) : (isAr ? 'برمجيات المؤسسات، مبسطة' : 'Enterprise Software, Simplified')}
            </h1>
            <p style={{ fontSize: '17px', color: 'var(--clr-text-muted)', maxWidth: '500px', lineHeight: 1.7, marginBottom: '32px' }}>
              {heroData?.subtitle 
                ? (isAr ? (heroData.subtitleAr || heroData.subtitle) : heroData.subtitle)
                : (isAr ? `اكتشف ${saasProducts.length}+ حلول SaaS لكل احتياجات الأعمال — مع تجارب مجانية واشتراكات مرنة.` : `Discover ${saasProducts.length}+ SaaS solutions for every business need — from CRM to DevOps, with free trials and flexible subscriptions.`)}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {heroButtons.length > 0 ? heroButtons.map((btn: any, i: number) => (
                btn.isActive && (
                  <Link key={i} href={btn.url} style={{ textDecoration: 'none' }}>
                    <Button variant={btn.variant as any} size="lg">
                      {isAr ? (btn.labelAr || (btn.label?.trim().toLowerCase() === 'browse solutions' ? 'تصفح الحلول' : btn.label)) : btn.label}
                    </Button>
                  </Link>
                )
              )) : (
                <>
                  <Link href="#saas" style={{ textDecoration: 'none' }}>
                    <Button variant="primary" size="lg">{isAr ? 'تصفح الحلول' : 'Browse Solutions'}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ background: 'var(--clr-surface)', borderBottom: '1px solid var(--clr-border)', padding: '16px 32px', position: 'sticky', top: '72px', zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: '999px', padding: '10px 16px', flex: '1 1 280px', maxWidth: '340px' }}>
            <Search size={16} color="var(--clr-text-muted)" />
            <input
              type="text"
              placeholder={isAr ? 'ابحث عن حلول SaaS...' : 'Search SaaS solutions...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--clr-text)', fontSize: '14px', width: '100%', fontFamily: 'var(--font-body)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory('ALL_CATEGORIES')}
              style={{ padding: '8px 16px', borderRadius: '999px', border: `1px solid ${selectedCategory === 'ALL_CATEGORIES' ? 'var(--clr-primary)' : 'var(--clr-border)'}`, background: selectedCategory === 'ALL_CATEGORIES' ? 'var(--clr-primary-dim)' : 'transparent', color: selectedCategory === 'ALL_CATEGORIES' ? 'var(--clr-primary)' : 'var(--clr-text-muted)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              {isAr ? 'الكل' : 'All'}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{ padding: '8px 16px', borderRadius: '999px', border: `1px solid ${selectedCategory === cat ? 'var(--clr-primary)' : 'var(--clr-border)'}`, background: selectedCategory === cat ? 'var(--clr-primary-dim)' : 'transparent', color: selectedCategory === cat ? 'var(--clr-primary)' : 'var(--clr-text-muted)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '14px', color: 'var(--clr-text-muted)' }}>
            {isLoading ? '...' : `${filtered.length} ${isAr ? 'حل' : `solution${filtered.length !== 1 ? 's' : ''}`}`}
          </div>
        </div>
      </div>

      {/* SaaS Grid */}
      <div id="saas" style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--clr-text-muted)' }}>{isAr ? 'جاري تحميل الحلول...' : 'Loading solutions...'}</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', background: 'var(--clr-surface)', borderRadius: '16px' }}>
            <LayoutGrid size={48} color="var(--clr-border)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{isAr ? 'لا توجد حلول' : 'No solutions found'}</h3>
            <p style={{ color: 'var(--clr-text-muted)' }}>{isAr ? 'حاول تعديل البحث أو الفلاتر.' : 'Try adjusting your search or filters.'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {filtered.map((saas) => {
              const fav = mounted ? isInWishlist(saas.id) : false;
              const name = isAr ? (saas.nameAr || saas.name) : saas.name;
              const desc = isAr ? (saas.taglineAr || saas.tagline || saas.descriptionAr || saas.description) : (saas.tagline || saas.description);
              return (
                <Link key={saas.id} href={`/saas/${saas.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.25s ease', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Card Banner */}
                    <div style={{ height: '140px', background: 'linear-gradient(135deg, var(--clr-surface-2), var(--clr-surface-3))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {(() => {
                        let parsedImages: string[] = [];
                        try {
                          parsedImages = typeof saas.images === 'string' ? JSON.parse(saas.images) : saas.images || [];
                          if (typeof parsedImages === 'string') parsedImages = JSON.parse(parsedImages);
                          if (!Array.isArray(parsedImages)) parsedImages = [];
                        } catch(e) {}
                        
                        if (parsedImages.length > 0 && parsedImages[0]) {
                          return (
                            <img 
                              src={parsedImages[0]} 
                              alt={name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          );
                        }

                        if (saas.logo) {
                          return (
                            <img 
                              src={saas.logo} 
                              alt={name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          );
                        }
                        
                        return (
                          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', boxShadow: '0 8px 24px rgba(124,111,255,0.3)' }}>
                            {name.charAt(0)}
                          </div>
                        );
                      })()}
                      {saas.platform && (
                        <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'var(--clr-surface-elevated)', color: 'var(--clr-text)', border: '1px solid var(--clr-border)', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 600 }}>
                          {saas.platform}
                        </div>
                      )}
                      {/* Action Buttons */}
                      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                        <button
                          onClick={(e) => handleShare(e, saas)}
                          title={isAr ? 'مشاركة' : 'Share'}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--clr-text-muted)', transition: 'all 0.2s' }}
                        >
                          <Share2 size={14} />
                        </button>
                        <button
                          onClick={(e) => handleToggleFavorite(e, saas)}
                          title={fav ? (isAr ? 'إزالة من المفضلة' : 'Remove from favorites') : (isAr ? 'أضف للمفضلة' : 'Save to favorites')}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', background: fav ? 'rgba(255,68,68,0.1)' : 'var(--clr-surface)', border: `1px solid ${fav ? 'rgba(255,68,68,0.4)' : 'var(--clr-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: fav ? '#ff4444' : 'var(--clr-text-muted)', transition: 'all 0.2s' }}
                        >
                          <Heart size={14} fill={fav ? '#ff4444' : 'none'} />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '18px', margin: 0, color: 'var(--clr-text)' }}>{name}</h3>
                        {saas.category?.name && (
                          <span style={{ fontSize: '11px', background: 'var(--clr-primary-dim)', color: 'var(--clr-primary)', borderRadius: '999px', padding: '3px 8px', whiteSpace: 'nowrap', fontWeight: 600 }}>{isAr ? (saas.category?.nameAr || saas.category?.name) : saas.category?.name}</span>
                        )}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--clr-text-muted)', marginBottom: '4px' }}>
                            <Star size={13} fill="#ffaa00" color="#ffaa00" />
                            <span style={{ fontWeight: 600, color: 'var(--clr-text)' }}>{isAr ? 'جديد' : 'New'}</span>
                          </div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--clr-primary)' }}>
                            {isAr ? `يبدأ من ${formatPrice(saas.monthlyPrice).replace(/\.00$/, '')}/شهرياً` : `From ${formatPrice(saas.monthlyPrice).replace(/\.00$/, '')}/mo`}
                          </div>
                        </div>
                        <Button variant="primary" size="sm">{saas.hasFreeTrial ? (isAr ? 'جرب مجاناً' : 'Try Free') : (isAr ? 'عرض التفاصيل' : 'View Details')}</Button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        url={shareData.url}
        title={shareData.title}
      />
    </div>
  );
}
