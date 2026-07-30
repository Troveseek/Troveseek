"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, X, Minus, Plus, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import Button from '@/components/ui/Button';
import styles from './CartDrawer.module.css';
import { useLocale } from 'next-intl';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CartDrawer({ isOpen, onClose }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { items, removeItem, updateQuantity, total, itemCount } = useCartStore();
  const { formatPrice } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} />
      )}

      {/* Drawer */}
      <aside className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <ShoppingCart size={20} />
            {isAr ? 'عربة التسوق' : 'Cart'} {mounted ? `(${itemCount()})` : ''}
          </h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.items}>
          {!mounted ? null : items.length === 0 ? (
            <div className={styles.empty}>
              <ShoppingCart size={48} opacity={0.2} />
              <p>{isAr ? 'عربة التسوق فارغة' : 'Your cart is empty'}</p>
              <Link href="/shop" onClick={onClose} style={{ color: 'var(--clr-primary)', fontSize: '14px' }}>
                {isAr ? 'تصفح المنتجات ←' : 'Browse products →'}
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemIcon}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                  ) : (
                    item.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemCategory}>{item.category}</div>
                  <div className={styles.itemPrice}>{formatPrice(item.price || 0)}</div>
                </div>
                <div className={styles.itemControls}>
                  <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Minus size={12} />
                  </button>
                  <span className={styles.qty}>{item.quantity}</span>
                  <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus size={12} />
                  </button>
                  <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {mounted && items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.total}>
              <span>{isAr ? 'المجموع' : 'Total'}</span>
              <span className={styles.totalAmount}>{formatPrice(total())}</span>
            </div>
            <Link href="/checkout" onClick={onClose}>
              <Button variant="primary" size="lg" style={{ width: '100%' }} icon={<ArrowRight size={18} />}>
                {isAr ? 'متابعة الدفع' : 'Proceed to Checkout'}
              </Button>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
