"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Wallet, Smartphone, ShieldCheck, Lock, Loader, CheckCircle, ShieldAlert } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useLocale } from 'next-intl';

export default function ServicePayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  
  const [payment, setPayment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [transactionId, setTransactionId] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('success') === 'true') {
        setSuccess(true);
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
      });
      
    fetch(`/api/service-payments/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPayment(data.payment);
          if (data.payment.status === 'PAID') {
            setSuccess(true);
          }
        } else {
          setError(data.error || 'Failed to load payment details');
        }
        setIsLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    if (paymentMethod === 'baridi' || paymentMethod === 'crypto') {
      if (!transactionId.trim()) {
        setError(isAr ? 'يرجى إدخال معرف المعاملة' : 'Please enter the transaction ID/hash');
        setIsProcessing(false);
        return;
      }
    }
    if (paymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
        setError(isAr ? 'يرجى ملء تفاصيل البطاقة' : 'Please fill in all card details');
        setIsProcessing(false);
        return;
      }
    }

    let receiptUrl = '';
    if (receiptFile && (paymentMethod === 'baridi' || paymentMethod === 'crypto')) {
      const formData = new FormData();
      formData.append('file', receiptFile);
      try {
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          receiptUrl = uploadData.url;
        }
      } catch (e) {
        console.error('Failed to upload receipt', e);
      }
    }

    try {
      const res = await fetch(`/api/service-payments/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          transactionId,
          receiptUrl
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '100px 0', textAlign: 'center' }}><Loader size={32} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  }

  if (!payment) {
    return <div style={{ padding: '100px 0', textAlign: 'center' }}>Payment not found</div>;
  }

  if (success) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: 'rgba(0,229,176,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={40} color="var(--clr-success)" />
        </div>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '16px' }}>{isAr ? 'تم تأكيد الدفع!' : 'Payment Confirmed!'}</h1>
        <p style={{ color: 'var(--clr-text-muted)', marginBottom: '24px' }}>
          {isAr ? 'شكراً لتعاملك معنا. تمت معالجة الدفعة بنجاح.' : 'Thank you for your business. Your payment has been processed successfully.'}
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
          
          <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <section>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>{isAr ? 'طريقة الدفع' : 'Payment Method'}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {settings.pay_stripe_enabled === 'true' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: paymentMethod === 'card' ? '2px solid var(--clr-primary)' : '1px solid var(--clr-border)', borderRadius: '12px', cursor: 'pointer', background: 'var(--clr-surface)' }}>
                    <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} style={{ width: '18px', height: '18px', accentColor: 'var(--clr-primary)' }} />
                    <CreditCard size={20} color="var(--clr-text)" />
                    <div style={{ flex: 1, fontWeight: 500 }}>{isAr ? 'بطاقة ائتمان' : 'Credit / Debit Card'}</div>
                  </label>
                )}

                {settings.pay_baridi_enabled === 'true' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: paymentMethod === 'baridi' ? '2px solid var(--clr-primary)' : '1px solid var(--clr-border)', borderRadius: '12px', cursor: 'pointer', background: 'var(--clr-surface)' }}>
                    <input type="radio" name="payment" value="baridi" checked={paymentMethod === 'baridi'} onChange={() => setPaymentMethod('baridi')} style={{ width: '18px', height: '18px', accentColor: 'var(--clr-primary)' }} />
                    <Smartphone size={20} color="var(--clr-text)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{isAr ? 'بريدي موب (BaridiMob)' : 'BaridiMob'}</div>
                      <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>{isAr ? 'الدفع المحلي في الجزائر' : 'Local payment in Algeria'}</div>
                    </div>
                  </label>
                )}

                {settings.pay_crypto_enabled === 'true' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: paymentMethod === 'crypto' ? '2px solid var(--clr-primary)' : '1px solid var(--clr-border)', borderRadius: '12px', cursor: 'pointer', background: 'var(--clr-surface)' }}>
                    <input type="radio" name="payment" value="crypto" checked={paymentMethod === 'crypto'} onChange={() => setPaymentMethod('crypto')} style={{ width: '18px', height: '18px', accentColor: 'var(--clr-primary)' }} />
                    <Wallet size={20} color="var(--clr-text)" />
                    <div style={{ flex: 1, fontWeight: 500 }}>{isAr ? 'العملات الرقمية (Crypto)' : 'Cryptocurrency'}</div>
                  </label>
                )}
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>{isAr ? 'تفاصيل الدفع' : 'Payment Details'}</h2>
              <Card>
                <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {paymentMethod === 'card' && (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--clr-surface-2)', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '14px', fontWeight: 500 }}>Stripe (Test Mode)</span>
                          <ShieldCheck size={16} color="var(--clr-primary)" />
                        </div>
                        <Input label="Card Number" placeholder="4242 4242 4242 4242" value={cardDetails.number} onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})} />
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <div style={{ flex: 1 }}><Input label="Expiry (MM/YY)" placeholder="12/25" value={cardDetails.expiry} onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})} /></div>
                          <div style={{ flex: 1 }}><Input label="CVC" placeholder="123" value={cardDetails.cvc} onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})} /></div>
                        </div>
                      </div>
                    </>
                  )}

                  {paymentMethod === 'baridi' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ padding: '16px', background: 'rgba(0,229,176,0.1)', borderRadius: '8px', border: '1px solid rgba(0,229,176,0.2)' }}>
                        <h4 style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--clr-primary-dark)' }}>{isAr ? 'تعليمات الدفع' : 'Payment Instructions'}</h4>
                        <p style={{ fontSize: '14px', marginBottom: '8px' }}>{isAr ? 'يرجى تحويل المبلغ الإجمالي إلى الحساب التالي:' : 'Please transfer the total amount to the following account:'}</p>
                        <div style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid var(--clr-border)', color: '#000' }}>
                          <div><strong>Name:</strong> {settings.pay_baridi_name}</div>
                          <div style={{ marginTop: '4px' }}><strong>RIP:</strong> {settings.pay_baridi_rip}</div>
                        </div>
                      </div>
                      <Input label={isAr ? 'رقم المعاملة / مرجع التحويل' : 'Transaction ID / Reference Number'} placeholder={isAr ? 'أدخل رقم المعاملة من التطبيق' : 'Enter the transaction ID from your app'} value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--clr-text)' }}>{isAr ? 'إيصال التحويل (اختياري)' : 'Transfer Receipt (Optional)'}</label>
                        <input type="file" accept="image/*,.pdf" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} style={{ fontSize: '14px', padding: '8px' }} />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'crypto' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ padding: '16px', background: 'rgba(245,158,11,0.1)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <h4 style={{ fontWeight: 600, marginBottom: '8px', color: '#b45309' }}>{isAr ? 'تعليمات الدفع' : 'Payment Instructions'}</h4>
                        <p style={{ fontSize: '14px', marginBottom: '8px' }}>{isAr ? 'قم بإرسال المبلغ إلى إحدى المحافظ التالية (USDT TRC20):' : 'Send the exact amount to one of the following wallets (USDT TRC20):'}</p>
                        <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid var(--clr-border)', color: '#000', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div><strong>USDT Address:</strong><br />{settings.pay_crypto_usdt}</div>
                          <div style={{ borderTop: '1px solid #eee', paddingTop: '8px' }}><strong>Binance Pay ID:</strong><br />{settings.pay_crypto_binance}</div>
                        </div>
                      </div>
                      <Input label={isAr ? 'معرف المعاملة (TxID)' : 'Transaction Hash (TxID)'} placeholder={isAr ? 'أدخل معرف المعاملة' : 'Enter the blockchain transaction hash'} value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--clr-text)' }}>{isAr ? 'لقطة شاشة (اختياري)' : 'Screenshot (Optional)'}</label>
                        <input type="file" accept="image/*,.pdf" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} style={{ fontSize: '14px', padding: '8px' }} />
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </section>
          </div>

          <div style={{ flex: '1 1 35%' }}>
            <Card style={{ position: 'sticky', top: '24px' }}>
              <CardBody style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>{isAr ? 'ملخص الفاتورة' : 'Invoice Summary'}</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginBottom: '4px' }}>Project</div>
                    <div style={{ fontWeight: 600 }}>{payment.techSpec?.title}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginBottom: '4px' }}>Milestone</div>
                    <div style={{ fontWeight: 600 }}>{payment.title}</div>
                  </div>
                  <div style={{ borderBottom: '1px solid var(--clr-border)', paddingBottom: '16px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginBottom: '4px' }}>Client</div>
                    <div style={{ fontWeight: 500 }}>{payment.techSpec?.clientName}</div>
                    <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>{payment.techSpec?.clientEmail}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', fontSize: '20px', fontWeight: 700 }}>
                  <span>{isAr ? 'الإجمالي:' : 'Total:'}</span>
                  <span style={{ color: 'var(--clr-primary)' }}>{payment.amount.toLocaleString()} {payment.currency}</span>
                </div>

                <Button variant="primary" style={{ width: '100%', justifyContent: 'center', height: '48px', fontSize: '16px', fontWeight: 600 }} type="submit" disabled={isProcessing}>
                  {isProcessing ? (isAr ? 'جاري المعالجة...' : 'Processing...') : (isAr ? 'دفع الآن' : `Pay ${payment.amount.toLocaleString()} ${payment.currency}`)}
                </Button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px', color: 'var(--clr-text-muted)', fontSize: '13px' }}>
                  <ShieldCheck size={16} />
                  {isAr ? 'عملية دفع مشفرة وآمنة' : 'Secure and encrypted payment'}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
