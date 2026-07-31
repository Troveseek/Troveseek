"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Wallet, Smartphone, ShieldCheck, Lock, Loader, CheckCircle, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useCartStore } from '@/lib/store/cartStore';
import { useLocale } from 'next-intl';
import { countries } from '@/lib/data/countries';

export default function CheckoutPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });

  React.useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('success') === 'true') {
        clearCart();
        setSuccess(true);
        setTimeout(() => router.push('/profile'), 3000);
      }
      if (params.get('canceled') === 'true') {
        setError(isAr ? 'تم إلغاء عملية الدفع.' : 'Payment was canceled.');
      }
    }
    fetch('/api/settings?keys=pay_stripe_enabled,pay_baridi_enabled,pay_crypto_enabled,pay_baridi_name,pay_baridi_rip,pay_crypto_usdt,pay_crypto_binance')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        if (data.pay_stripe_enabled === 'true') setPaymentMethod('card');
        else if (data.pay_baridi_enabled === 'true') setPaymentMethod('baridi');
        else if (data.pay_crypto_enabled === 'true') setPaymentMethod('crypto');
      })
      .catch(console.error);
  }, [clearCart, isAr, router]);

  const [billing, setBilling] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setBilling((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError(isAr ? 'عربة التسوق الخاصة بك فارغة.' : 'Your cart is empty.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Form Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billing.email)) {
      setError(isAr ? 'تنسيق البريد الإلكتروني غير صالح' : 'Invalid email format');
      setIsLoading(false);
      return;
    }
    if (billing.zip.length < 3) {
      setError(isAr ? 'الرمز البريدي غير صالح' : 'Invalid ZIP code');
      setIsLoading(false);
      return;
    }
    if (paymentMethod === 'baridi' || paymentMethod === 'crypto') {
      if (!transactionId.trim()) {
        setError(isAr ? 'يرجى إدخال معرف المعاملة' : 'Please enter the transaction ID/hash');
        setIsLoading(false);
        return;
      }
    }
    if (paymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
        setError(isAr ? 'يرجى ملء تفاصيل البطاقة' : 'Please fill in all card details');
        setIsLoading(false);
        return;
      }
    }

    let finalReceiptUrl = receiptUrl;
    if (receiptFile && (paymentMethod === 'baridi' || paymentMethod === 'crypto')) {
      const formData = new FormData();
      formData.append('file', receiptFile);
      try {
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalReceiptUrl = uploadData.url;
        }
      } catch (e) {
        console.error('Failed to upload receipt', e);
      }
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: total(),
          paymentMethod,
          transactionId: transactionId,
          receiptUrl: finalReceiptUrl,
          billingInfo: billing,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (isAr ? 'فشل إنشاء الطلب' : 'Failed to create order'));
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      clearCart();
      setSuccess(true);
      setTimeout(() => router.push('/profile'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };



  const orderTotal = mounted ? total() : 0;

  if (success) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: 'rgba(0,229,176,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={40} color="var(--clr-success)" />
        </div>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '16px' }}>{isAr ? 'تم تأكيد الطلب!' : 'Order Confirmed!'}</h1>
        <p style={{ color: 'var(--clr-text-muted)', marginBottom: '24px' }}>
          {isAr ? 'شكراً لطلبك. ستتلقى رسالة تأكيد بالبريد الإلكتروني قريباً. جاري التوجيه إلى ملفك الشخصي...' : 'Thank you for your order. You will receive a confirmation email shortly. Redirecting to your profile...'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Lock size={24} color="var(--clr-success)" />
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{isAr ? 'الدفع الآمن' : 'Secure Checkout'}</h1>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'var(--clr-danger-light, #fee2e2)', color: 'var(--clr-danger, #ef4444)', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <ShieldAlert size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          
          {/* Left Column: Billing & Payment */}
          <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Billing Information */}
            <section>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>{isAr ? '1. معلومات الفواتير' : '1. Billing Information'}</h2>
              <Card>
                <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}><Input label={isAr ? 'الاسم الأول' : 'First Name'} placeholder="John" value={billing.firstName} onChange={handleChange('firstName')} required /></div>
                    <div style={{ flex: 1 }}><Input label={isAr ? 'الاسم الأخير' : 'Last Name'} placeholder="Doe" value={billing.lastName} onChange={handleChange('lastName')} required /></div>
                  </div>
                  <Input label={isAr ? 'البريد الإلكتروني' : 'Email Address'} type="email" placeholder="john@example.com" value={billing.email} onChange={handleChange('email')} required />
                  <Input label={isAr ? 'العنوان' : 'Address Line 1'} placeholder="123 Main St" value={billing.address} onChange={handleChange('address')} required />
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 2 }}><Input label={isAr ? 'المدينة' : 'City'} placeholder="New York" value={billing.city} onChange={handleChange('city')} required /></div>
                    <div style={{ flex: 1 }}><Input label={isAr ? 'الولاية/المقاطعة' : 'State/Province'} placeholder="NY" value={billing.state} onChange={handleChange('state')} /></div>
                    <div style={{ flex: 1 }}><Input label={isAr ? 'الرمز البريدي' : 'ZIP/Postal Code'} placeholder="10001" value={billing.zip} onChange={handleChange('zip')} required /></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--clr-text)' }}>{isAr ? 'البلد' : 'Country'}</label>
                    <select
                      value={billing.country}
                      onChange={(e) => setBilling(prev => ({ ...prev, country: e.target.value }))}
                      required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface)', color: 'var(--clr-text)', fontSize: '15px', outline: 'none', fontFamily: 'var(--font-body)', appearance: 'auto' }}
                    >
                      <option value="" disabled>{isAr ? 'اختر البلد' : 'Select Country'}</option>
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </CardBody>
              </Card>
            </section>

            {/* Payment Method */}
            <section>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>{isAr ? '2. طريقة الدفع' : '2. Payment Method'}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Credit Card */}
                {settings.pay_stripe_enabled === 'true' && (
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px', background: 'var(--clr-surface)', border: `1px solid ${paymentMethod === 'card' ? 'var(--clr-primary)' : 'var(--clr-border)'}`, borderRadius: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                    <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} style={{ marginTop: '4px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CreditCard size={18} color="var(--clr-primary)" />
                          {isAr ? 'بطاقة ائتمان / خصم' : 'Credit / Debit Card'}
                        </span>
                      </div>
                      {paymentMethod === 'card' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                          <Input 
                            placeholder={isAr ? 'رقم البطاقة (تجريبي: أي رقم)' : 'Card Number (demo: any number)'} 
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails(p => ({ ...p, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19) }))}
                          />
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                              <Input 
                                placeholder="MM / YY" 
                                value={cardDetails.expiry}
                                onChange={(e) => setCardDetails(p => ({ ...p, expiry: e.target.value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2').trim().slice(0, 5) }))}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <Input 
                                placeholder="CVC" 
                                type="password"
                                value={cardDetails.cvc}
                                onChange={(e) => setCardDetails(p => ({ ...p, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                )}

                {/* Baridi Mob */}
                {settings.pay_baridi_enabled === 'true' && (
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px', background: 'var(--clr-surface)', border: `1px solid ${paymentMethod === 'baridi' ? 'var(--clr-primary)' : 'var(--clr-border)'}`, borderRadius: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                    <input type="radio" name="payment" value="baridi" checked={paymentMethod === 'baridi'} onChange={() => setPaymentMethod('baridi')} style={{ marginTop: '4px' }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Smartphone size={18} />
                        {isAr ? 'بريدي موب (CIB/Edahabia)' : 'Baridi Mob (CIB/Edahabia)'}
                      </span>
                      {paymentMethod === 'baridi' && (
                        <div style={{ marginTop: '16px', padding: '16px', background: 'var(--clr-surface-2)', borderRadius: '8px', border: '1px solid var(--clr-border)', fontSize: '14px' }}>
                          <p style={{ margin: '0 0 12px 0', color: 'var(--clr-text-muted)' }}>
                            {isAr ? 'يرجى تحويل المبلغ الإجمالي إلى الحساب التالي:' : 'Please transfer the total amount to the following account:'}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontWeight: 500 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--clr-text-muted)' }}>{isAr ? 'الاسم:' : 'Name:'}</span>
                              <span>{settings.pay_baridi_name || 'TroveSeek LTD'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--clr-text-muted)' }}>{isAr ? 'رقم الحساب (RIP):' : 'RIP Number:'}</span>
                              <span style={{ fontFamily: 'var(--font-mono)' }}>{settings.pay_baridi_rip || '00799999000000001234'}</span>
                            </div>
                          </div>
                          <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: 'var(--clr-primary)' }}>
                            {isAr ? 'ملاحظة: سيتم معالجة طلبك بعد التحقق من الدفع.' : 'Note: Your order will be processed after payment verification.'}
                          </p>
                          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Input 
                              label={isAr ? 'معرف المعاملة / رقم الإيصال *' : 'Transaction ID / Receipt Number *'} 
                              placeholder="e.g. TR-987654321" 
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              required={paymentMethod === 'baridi'}
                            />
                            <div>
                              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--clr-text)', marginBottom: '8px', display: 'block' }}>
                                {isAr ? 'صورة الإيصال (اختياري)' : 'Receipt Image (Optional)'}
                              </label>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      setReceiptFile(e.target.files[0]);
                                    }
                                  }}
                                  style={{ padding: '8px' }}
                                />
                                {receiptFile && <span style={{ fontSize: '13px', color: 'var(--clr-success)' }}>{isAr ? 'تم اختيار الملف' : 'File selected'}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                )}

                {/* Crypto */}
                {settings.pay_crypto_enabled === 'true' && (
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px', background: 'var(--clr-surface)', border: `1px solid ${paymentMethod === 'crypto' ? 'var(--clr-primary)' : 'var(--clr-border)'}`, borderRadius: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                    <input type="radio" name="payment" value="crypto" checked={paymentMethod === 'crypto'} onChange={() => setPaymentMethod('crypto')} style={{ marginTop: '4px' }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Wallet size={18} />
                        {isAr ? 'بينانس باي / محفظة مشفرة' : 'Binance Pay / Crypto Wallet'}
                      </span>
                      {paymentMethod === 'crypto' && (
                        <div style={{ marginTop: '16px', padding: '16px', background: 'var(--clr-surface-2)', borderRadius: '8px', border: '1px solid var(--clr-border)', fontSize: '14px' }}>
                          <p style={{ margin: '0 0 12px 0', color: 'var(--clr-text-muted)' }}>
                            {isAr ? 'قم بتحويل العملات الرقمية إلى إحدى المحافظ التالية:' : 'Transfer cryptocurrency to one of the following wallets:'}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontWeight: 500 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--clr-text-muted)' }}>{isAr ? 'عنوان USDT (TRC20):' : 'USDT Wallet (TRC20):'}</span>
                              <span style={{ fontFamily: 'var(--font-mono)', wordBreak: 'break-all', textAlign: 'right', marginLeft: '16px' }}>{settings.pay_crypto_usdt || 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--clr-text-muted)' }}>{isAr ? 'معرف بينانس باي:' : 'Binance Pay ID:'}</span>
                              <span style={{ fontFamily: 'var(--font-mono)' }}>{settings.pay_crypto_binance || '123456789'}</span>
                            </div>
                          </div>
                          <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: 'var(--clr-primary)' }}>
                            {isAr ? 'ملاحظة: سيتم تفعيل الخدمة تلقائياً بعد تأكيد المعاملة على الشبكة.' : 'Note: Service will be activated after network confirmation.'}
                          </p>
                          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Input 
                              label={isAr ? 'هاش المعاملة (TxID) *' : 'Transaction Hash (TxID) *'} 
                              placeholder="0x..." 
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              required={paymentMethod === 'crypto'}
                            />
                            <div>
                              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--clr-text)', marginBottom: '8px', display: 'block' }}>
                                {isAr ? 'لقطة شاشة للتحويل (اختياري)' : 'Transfer Screenshot (Optional)'}
                              </label>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      setReceiptFile(e.target.files[0]);
                                    }
                                  }}
                                  style={{ padding: '8px' }}
                                />
                                {receiptFile && <span style={{ fontSize: '13px', color: 'var(--clr-success)' }}>{isAr ? 'تم اختيار الملف' : 'File selected'}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                )}

                {Object.keys(settings).length > 0 && settings.pay_stripe_enabled !== 'true' && settings.pay_baridi_enabled !== 'true' && settings.pay_crypto_enabled !== 'true' && (
                  <div style={{ padding: '16px', background: 'var(--clr-surface-2)', borderRadius: '8px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
                    {isAr ? 'لا توجد طرق دفع متاحة حالياً.' : 'No payment methods available currently.'}
                  </div>
                )}
              </div>
            </section>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              style={{ width: '100%', padding: '16px', fontSize: '16px' }}
              disabled={isLoading || (mounted && items.length === 0)}
              icon={isLoading ? <Loader className="spin" size={18} /> : undefined}
            >
              {isLoading ? (isAr ? 'جاري المعالجة...' : 'Processing...') : `${isAr ? 'دفع' : 'Pay'} ${formatPrice(orderTotal)}`}
            </Button>

            <p style={{ textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: '13px' }}>
              {isAr ? 'بتقديم طلبك، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا.' : 'By placing your order, you agree to our Terms of Service and Privacy Policy.'}
            </p>
          </div>

          {/* Right Column: Order Summary */}
          <div style={{ flex: '1 1 30%', minWidth: '300px' }}>
            <Card style={{ position: 'sticky', top: '100px' }}>
              <CardHeader>
                <CardTitle style={{ fontSize: '18px' }}>{isAr ? 'ملخص الطلب' : 'Order Summary'}</CardTitle>
              </CardHeader>
              <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {(!mounted || items.length === 0) ? (
                  <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', textAlign: 'center', padding: '16px 0' }}>{isAr ? 'عربة التسوق الخاصة بك فارغة' : 'Your cart is empty'}</p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', background: 'var(--clr-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontWeight: 600, color: 'var(--clr-text-muted)', fontSize: '18px' }}>{item.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '14px', fontWeight: 500 }}>{isAr ? (item as any).nameAr || item.name : item.name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>{isAr ? 'الكمية:' : 'Qty:'} {item.quantity}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))
                )}

                <div style={{ height: '1px', background: 'var(--clr-border)', margin: '8px 0' }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--clr-text-muted)' }}>
                  <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span>{formatPrice(orderTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--clr-text-muted)' }}>
                  <span>{isAr ? 'الضريبة' : 'Tax'}</span>
                  <span>{isAr ? 'يتم الحساب في الخطوة التالية' : 'Calculated at next step'}</span>
                </div>

                <div style={{ height: '1px', background: 'var(--clr-border)', margin: '8px 0' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                  <span>{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span>{formatPrice(orderTotal)}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(0,229,176,0.1)', color: 'var(--clr-success)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginTop: '16px' }}>
                  <ShieldCheck size={16} />
                  {isAr ? 'المدفوعات آمنة ومشفرة' : 'Payments are secure and encrypted'}
                </div>
              </CardBody>
            </Card>
          </div>

        </div>
      </form>
    </div>
  );
}
