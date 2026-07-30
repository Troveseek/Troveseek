import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2, Tag, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLocale } from 'next-intl';

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px' }}>{isAr ? 'عربة التسوق' : 'Your Cart'}</h1>
        <p style={{ color: 'var(--clr-text-muted)', fontSize: '16px' }}>{isAr ? 'راجع عناصرك قبل الدفع.' : 'Review your items before checkout.'}</p>
      </div>

      {cartItems.length > 0 ? (
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {/* Left Column: Cart Items */}
          <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cartItems.map((item) => (
              <Card key={item.id} style={{ display: 'flex', flexDirection: 'row', gap: '16px', padding: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '80px', height: '80px', flexShrink: 0,
                  background: `${item.color}22`,
                  border: `1px solid ${item.color}44`,
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', background: `${item.color}`, borderRadius: '10px' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    color: 'var(--clr-primary)',
                    background: 'rgba(124,111,255,0.15)',
                    padding: '4px 8px',
                    borderRadius: '999px',
                    alignSelf: 'flex-start'
                  }}>
                    {item.category}
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--clr-text)' }}>{item.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>{isAr ? 'النوع:' : 'Type:'} {item.type}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                    ${item.price.toFixed(2)}
                  </span>
                  <button style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--clr-danger)', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    fontWeight: 500
                  }}>
                    <Trash2 size={14} />
                    {isAr ? 'إزالة' : 'Remove'}
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Right Column: Order Summary */}
          <div style={{ flex: '1 1 30%', minWidth: '300px' }}>
            <Card style={{ position: 'sticky', top: '100px' }}>
              <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{isAr ? 'ملخص الطلب' : 'Order Summary'}</h2>
                
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

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--clr-text-muted)', fontSize: '13px', marginTop: '8px' }}>
                  <ShieldCheck size={16} color="var(--clr-success)" />
                  {isAr ? 'دفع آمن' : 'Secure SSL Checkout'}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      ) : (
        <Card style={{ textAlign: 'center', padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--clr-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
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
