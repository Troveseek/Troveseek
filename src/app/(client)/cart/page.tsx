import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2, Tag, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLocale } from 'next-intl';
import styles from './page.module.css';

export default function CartPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  
  // Mock data for the cart
  const cartItems = [
    {
      id: 1,
      name: 'TroveSeek Enterprise SaaS Template',
      category: 'Templates',
      price: 49.99,
      icon: '⚡',
      color: '#7c6fff',
      type: 'Download'
    },
    {
      id: 2,
      name: 'Cloud DevOps Consulting (Basic)',
      category: 'Services',
      price: 500.00,
      icon: '☁️',
      color: '#00e5b0',
      type: 'Service'
    }
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <div className={styles.cartPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>{isAr ? 'عربة التسوق' : 'Your Cart'}</h1>
        <p className={styles.subtitle}>{isAr ? 'راجع عناصرك قبل الدفع.' : 'Review your items before checkout.'}</p>
      </div>

      {cartItems.length > 0 ? (
        <div className={styles.cartLayout}>
          {/* Left Column: Cart Items */}
          <div className={styles.itemsList}>
            {cartItems.map((item) => (
              <Card key={item.id} className={styles.cartItem}>
                <div className={styles.itemIcon} style={{
                  background: `${item.color}22`,
                  border: `1px solid ${item.color}44`,
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: `${item.color}`, borderRadius: '10px' }} />
                </div>
                <div className={styles.itemDetails}>
                  <span className={styles.itemCategory}>
                    {item.category}
                  </span>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <p className={styles.itemType}>{isAr ? 'النوع:' : 'Type:'} {item.type}</p>
                </div>
                <div className={styles.itemActions}>
                  <span className={styles.itemPrice}>
                    ${item.price.toFixed(2)}
                  </span>
                  <button className={styles.removeBtn}>
                    <Trash2 size={14} />
                    {isAr ? 'إزالة' : 'Remove'}
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Right Column: Order Summary */}
          <div className={styles.orderSummary}>
            <Card>
              <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{isAr ? 'ملخص الطلب' : 'Order Summary'}</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--clr-text-muted)', fontSize: '15px' }}>
                    <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--clr-text-muted)', fontSize: '15px' }}>
                    <span>{isAr ? 'الضريبة المقدرة (10%)' : 'Estimated Tax (10%)'}</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div style={{ height: '1px', background: 'var(--clr-border)', margin: '4px 0' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                    <span>{isAr ? 'الإجمالي' : 'Total'}</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <Input placeholder={isAr ? 'رمز الخصم' : 'Coupon code'} iconLeft={<Tag size={16} />} />
                  </div>
                  <Button variant="secondary">{isAr ? 'تطبيق' : 'Apply'}</Button>
                </div>

                <Link href="/checkout" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="lg" style={{ width: '100%' }} icon={<ArrowRight size={18} />}>
                    {isAr ? 'متابعة الدفع' : 'Proceed to Checkout'}
                  </Button>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--clr-text-muted)', fontSize: '13px', marginTop: '4px' }}>
                  <ShieldCheck size={16} color="var(--clr-success)" />
                  {isAr ? 'دفع آمن' : 'Secure SSL Checkout'}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      ) : (
        <Card className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <ShoppingCart size={40} color="var(--clr-text-muted)" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 600 }}>{isAr ? 'عربة التسوق فارغة' : 'Your cart is empty'}</h2>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '15px', maxWidth: '400px' }}>
            {isAr ? 'يبدو أنك لم تضف أي منتجات رقمية مميزة أو خدمات إلى عربة التسوق بعد.' : "Looks like you haven't added any premium digital products, SaaS, or services to your cart yet."}
          </p>
          <Link href="/shop" style={{ textDecoration: 'none', marginTop: '16px' }}>
            <Button variant="primary" size="lg">{isAr ? 'تصفح المنتجات' : 'Browse Products'}</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
