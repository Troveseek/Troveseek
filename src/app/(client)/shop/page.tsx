"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import AddToCartButton from '@/components/ui/AddToCartButton';
import AddToWishlistButton from '@/components/ui/AddToWishlistButton';
import { Search, Filter, ShoppingCart, Heart, SlidersHorizontal, PackageOpen, ChevronDown, LayoutGrid } from 'lucide-react';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import styles from './page.module.css';
import { useLocale } from 'next-intl';

export default function ShopPage({ products: initialProducts = [], categories: initialCategories = [] }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { formatPrice } = useCurrency();
  
  const SORT_OPTIONS = [
    { label: isAr ? 'الأحدث' : 'Newest', value: 'newest' },
    { label: isAr ? 'السعر: من الأقل للأعلى' : 'Price: Low to High', value: 'price_asc' },
    { label: isAr ? 'السعر: من الأعلى للأقل' : 'Price: High to Low', value: 'price_desc' },
    { label: isAr ? 'الاسم: أ-ي' : 'Name: A–Z', value: 'name_asc' },
  ];

  const [products, setProducts] = useState<any[]>(initialProducts);
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(initialProducts.length === 0);

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    if (initialProducts.length === 0) {
      const load = async () => {
        setIsLoading(true);
        try {
          const [prodRes, catRes] = await Promise.all([
            fetch('/api/products?status=ACTIVE'),
            fetch('/api/categories'),
          ]);
          const prodData = await prodRes.json();
          const catData = await catRes.json();
          setProducts(prodData.data ?? []);
          setCategories(catData.data ?? []);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };
      load();
    }
  }, []); // Run once on mount

  const toggleCategory = (name: string) => {
    setSelectedCategories(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (isAr ? (p.nameAr || p.name) : p.name).toLowerCase().includes(q) || 
        (isAr ? (p.descriptionAr || p.description) : p.description)?.toLowerCase().includes(q) || 
        (isAr ? (p.category?.nameAr || p.category?.name) : p.category?.name)?.toLowerCase().includes(q)
      );
    }
    if (selectedCategories.length > 0) {
      list = list.filter(p => {
        const catName = isAr ? (p.category?.nameAr || p.category?.name) : p.category?.name;
        return selectedCategories.includes(catName);
      });
    }

    switch (sort) {
      case 'price_asc': return list.sort((a, b) => a.price - b.price);
      case 'price_desc': return list.sort((a, b) => b.price - a.price);
      case 'name_asc': return list.sort((a, b) => {
        const nameA = isAr ? (a.nameAr || a.name) : a.name;
        const nameB = isAr ? (b.nameAr || b.name) : b.name;
        return nameA.localeCompare(nameB);
      });
      default: return list; // newest = default API order
    }
  }, [products, search, selectedCategories, sort]);

  return (
    <div className={styles.shopPage}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        {/* Search */}
        <div className={styles.filterGroup}>
          <h3 className={styles.filterTitle}><Search size={14} style={{ marginRight: '6px' }} />{isAr ? 'بحث' : 'Search'}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: '8px', padding: '8px 12px' }}>
            <Search size={14} color="var(--clr-text-muted)" />
            <input
              type="text"
              placeholder={isAr ? 'ابحث عن المنتجات...' : 'Search products...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--clr-text)', fontSize: '14px', width: '100%' }}
            />
          </div>
        </div>

        {/* Categories */}
        <div className={styles.filterGroup}>
          <h3 className={styles.filterTitle}>{isAr ? 'التصنيفات' : 'Categories'}</h3>
          <div className={styles.filterList}>
            {categories.length === 0 ? (
              <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>{isAr ? 'لا توجد تصنيفات بعد' : 'No categories yet'}</span>
            ) : (
              <>
                <label className={styles.checkboxLabel} style={{ fontWeight: selectedCategories.length === 0 ? 600 : 400 }}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.length === 0}
                    onChange={() => setSelectedCategories([])}
                  />
                  {isAr ? 'الكل' : 'All'} ({products.length})
                </label>
                  {categories.map(cat => {
                  const catName = isAr ? (cat.nameAr || cat.name) : cat.name;
                  return (
                    <label key={cat.id} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(catName)}
                        onChange={() => toggleCategory(catName)}
                      />
                      {catName} ({cat._count?.products ?? 0})
                    </label>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Reset */}
        {(search || selectedCategories.length > 0) && (
          <button
            onClick={() => { setSearch(''); setSelectedCategories([]); }}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--clr-border)', color: 'var(--clr-text-muted)', fontSize: '13px', cursor: 'pointer', marginTop: '8px' }}
          >
            ✕ {isAr ? 'مسح الفلاتر' : 'Clear Filters'}
          </button>
        )}
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {isAr ? 'استكشف المنتجات الرقمية' : 'Explore Digital Products'}
            <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--clr-text-muted)', marginLeft: '12px', marginRight: isAr ? '12px' : '0' }}>
              {isLoading ? '...' : `${filtered.length} ${isAr ? 'نتيجة' : `result${filtered.length !== 1 ? 's' : ''}`}`}
            </span>
          </h1>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{ background: 'var(--clr-surface-3)', color: 'var(--clr-text)', border: '1px solid var(--clr-border)', padding: '8px 16px', borderRadius: '8px', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '14px' }}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--clr-text-muted)' }}>{isAr ? 'جاري التحميل...' : 'Loading products...'}</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', background: 'var(--clr-surface)', borderRadius: '16px' }}>
            <LayoutGrid size={48} color="var(--clr-border)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{isAr ? 'لا توجد منتجات' : 'No products found'}</h3>
            <p style={{ color: 'var(--clr-text-muted)' }}>
              {products.length === 0 ? (isAr ? 'عد لاحقاً لاكتشاف منتجات جديدة.' : 'Check back later for new digital products.') : (isAr ? 'حاول تعديل الفلاتر.' : 'Try adjusting your filters.')}
            </p>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {filtered.map((product) => {
              const name = isAr ? (product.nameAr || product.name) : product.name;
              const catName = isAr ? (product.category?.nameAr || product.category?.name) : product.category?.name;
              return (
                <Link key={product.id} href={`/shop/${product.slug}`} style={{ textDecoration: 'none' }}>
                  <Card className={styles.productCard} isInteractive>
                    <div className={styles.productImage} style={{ background: `linear-gradient(135deg, var(--clr-primary-light) 0%, transparent 100%)` }}>
                      {product.images && JSON.parse(product.images).length > 0 ? (
                        <div className={styles.imageInner} style={{ background: `url(${JSON.parse(product.images)[0]}) center/cover` }} />
                      ) : (
                        <div className={styles.imageInner} style={{ width: '56px', height: '56px', borderRadius: '14px', background: `linear-gradient(135deg, var(--clr-primary), var(--clr-accent))`, boxShadow: `0 8px 24px var(--clr-primary-dark)` }} />
                      )}
                    </div>
                    <div className={styles.productInfo}>
                      <span style={{ fontSize: '12px', color: 'var(--clr-primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                        {catName || (isAr ? 'غير مصنف' : 'Uncategorized')}
                      </span>
                      <h3 className={styles.productTitle}>{name}</h3>
                      <div className={styles.productFooter}>
                        <span className={styles.productPrice}>{formatPrice(product.price)}</span>
                        <div className={styles.productActions}>
                          <AddToWishlistButton product={{ id: product.id, name: name, price: product.price, category: catName || 'Uncategorized', slug: product.slug, image: product.images && JSON.parse(product.images).length > 0 ? JSON.parse(product.images)[0] : undefined }} />
                          <AddToCartButton product={{ id: product.id, name: name, price: product.price, category: catName || 'Uncategorized', imageUrl: product.images && JSON.parse(product.images).length > 0 ? JSON.parse(product.images)[0] : undefined }} />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
