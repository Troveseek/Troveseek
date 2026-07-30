"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import ShareModal from '@/components/ui/ShareModal';
import { Input } from '@/components/ui/Input';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import {
  ArrowLeft, Star, Check, Globe, ExternalLink, ShieldCheck,
  BarChart2, Bot, Link2, Users, Smartphone, Shield, Mail,
  Book, MessageSquare, Heart, Share2, Code, ChevronRight,
  ChevronLeft, Send, Loader2, ThumbsUp, Award, Zap,
  CreditCard, Wallet, X
} from 'lucide-react';
import { useLocale } from 'next-intl';

const IconMap: Record<string, React.ReactNode> = {
  'Star':       <Star       size={24} color="var(--clr-primary)" />,
  'BarChart2':  <BarChart2  size={24} color="var(--clr-primary)" />,
  'Bot':        <Bot        size={24} color="var(--clr-primary)" />,
  'Link2':      <Link2      size={24} color="var(--clr-primary)" />,
  'Users':      <Users      size={24} color="var(--clr-primary)" />,
  'Smartphone': <Smartphone size={24} color="var(--clr-primary)" />,
  'Shield':     <Shield     size={24} color="var(--clr-primary)" />,
  'Zap':        <Zap        size={24} color="var(--clr-primary)" />,
  'Award':      <Award      size={24} color="var(--clr-primary)" />,
  'ThumbsUp':   <ThumbsUp   size={24} color="var(--clr-primary)" />,
};

function StarRating({ value, onChange, size = 24 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: onChange ? 'pointer' : 'default' }}
        >
          <Star
            size={size}
            fill={(hovered || value) >= star ? '#ffaa00' : 'none'}
            color={(hovered || value) >= star ? '#ffaa00' : 'var(--clr-border)'}
          />
        </button>
      ))}
    </div>
  );
}

export default function SaasDetailClient({ saas }: { saas: any }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeImage, setActiveImage] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [subscribingPlan, setSubscribingPlan] = useState<string | null>(null);

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: number} | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [transactionId, setTransactionId] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    fetch('/api/settings?keys=pay_stripe_enabled,pay_baridi_enabled,pay_crypto_enabled,pay_baridi_name,pay_baridi_rip,pay_crypto_usdt,pay_crypto_binance')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        if (data.pay_stripe_enabled === 'true') setPaymentMethod('card');
        else if (data.pay_baridi_enabled === 'true') setPaymentMethod('baridi');
        else if (data.pay_crypto_enabled === 'true') setPaymentMethod('crypto');
      })
      .catch(console.error);
  }, []);

  const handleSubscribeClick = (planName: string, price: number) => {
    setSelectedPlan({ name: planName, price });
    setCheckoutModalOpen(true);
  };

  const processCheckout = async () => {
    if (!selectedPlan) return;
    
    if ((paymentMethod === 'baridi' || paymentMethod === 'crypto') && !transactionId) {
      alert(isAr ? 'يرجى إدخال معرف المعاملة' : 'Please enter the transaction ID/Hash');
      return;
    }

    setSubscribingPlan(selectedPlan.name);
    
    let finalReceiptUrl = '';
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
        console.error('Failed to upload receipt');
      }
    }

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saasId: saas.id,
          planName: selectedPlan.name,
          billingCycle,
          price: selectedPlan.price,
          paymentMethod: paymentMethod === 'card' ? 'stripe' : paymentMethod,
          transactionId: paymentMethod === 'card' ? undefined : transactionId,
          receiptUrl: finalReceiptUrl
        })
      });
      if (res.status === 401) {
        router.push(`/login?callbackUrl=/saas/${saas.slug}`);
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start subscription');
      }
    } catch (err) {
      alert('Error initiating checkout');
    } finally {
      setSubscribingPlan(null);
    }
  };

  // Wishlist
  const addWishlistItem  = useWishlistStore((s) => s.addItem);
  const removeWishlistItem = useWishlistStore((s) => s.removeItem);
  const isInWishlist     = useWishlistStore((s) => s.isInWishlist);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isFavorite = mounted ? isInWishlist(saas.id) : false;

  // Reviews
  const [reviews, setReviews]           = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewName, setReviewName]     = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // FAQs State
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetch(`/api/saas/${saas.id}/reviews`)
      .then(r => r.json())
      .then(d => setReviews(d.data ?? []))
      .catch(console.error)
      .finally(() => setReviewsLoading(false));
  }, [saas.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) return alert('Please select a rating!');
    setSubmitStatus('loading');
    try {
      const res = await fetch(`/api/saas/${saas.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment, authorName: reviewName }),
      });
      if (res.ok) {
        setSubmitStatus('success');
        setReviewName(''); setReviewComment(''); setReviewRating(0);
        setShowReviewForm(false);
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    }
  };

  // Parse dynamic arrays
  const safeParse = (val: any, def: any) => {
    if (!val) return def;
    try {
      let p = JSON.parse(val);
      if (typeof p === 'string') p = JSON.parse(p);
      return Array.isArray(p) ? p : def;
    } catch { return def; }
  };

  const features    = safeParse(isAr ? (saas.featuresAr || saas.features) : saas.features, []);
  const images      = safeParse(saas.images, []);
  const whyChooseUs = safeParse(isAr ? (saas.whyChooseUsAr || saas.whyChooseUs) : saas.whyChooseUs, []);
  const plans       = safeParse(isAr ? (saas.plansAr || saas.plans) : saas.plans, []);
  const faqs        = safeParse(isAr ? (saas.faqsAr || saas.faqs) : saas.faqs, []);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const toggleFavorite = () => {
    if (isFavorite) {
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

  const iconLetter = (isAr ? (saas.nameAr || saas.name) : saas.name) ? (isAr ? (saas.nameAr || saas.name) : saas.name)[0].toUpperCase() : '?';

  // Sidebar styles
  const ss = {
    sticky: { width: '380px', flexShrink: 0, position: 'sticky' as const, top: '100px', display: 'flex', flexDirection: 'column' as const, gap: '16px' },
    billingBtn: (active: boolean): React.CSSProperties => ({
      flex: 1, padding: '9px 8px', borderRadius: '6px',
      background: active ? 'var(--clr-primary)' : 'transparent',
      color: active ? '#fff' : 'var(--clr-text-muted)',
      border: 'none', fontFamily: 'var(--font-body)', fontSize: '13px',
      fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
    }),
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--clr-bg)' }}>
      {/* Top Nav */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/saas" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--clr-text-muted)', fontSize: '14px', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> {isAr ? 'العودة لكتالوج SaaS' : 'Back to SaaS Catalog'}
        </Link>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShareModalOpen(true)}
            title="Share"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: 'var(--clr-text)' }}
          >
            <Share2 size={15} /> {isAr ? 'مشاركة' : 'Share'}
          </button>
          <button
            onClick={toggleFavorite}
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isFavorite ? 'rgba(255,68,68,0.1)' : 'var(--clr-surface)', border: `1px solid ${isFavorite ? 'rgba(255,68,68,0.4)' : 'var(--clr-border)'}`, borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: isFavorite ? '#ff4444' : 'var(--clr-text)', transition: 'all 0.2s' }}
          >
            <Heart size={15} fill={isFavorite ? '#ff4444' : 'none'} />
            {isFavorite ? (isAr ? 'محفوظ' : 'Saved') : (isAr ? 'حفظ' : 'Save')}
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--clr-surface-2) 0%, var(--clr-surface) 100%)', margin: '24px auto', maxWidth: '1200px', borderRadius: '20px', padding: '40px 48px', position: 'relative', overflow: 'hidden', border: '1px solid var(--clr-border)' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', background: 'radial-gradient(circle, var(--clr-primary) 0%, transparent 70%)', opacity: 0.08, pointerEvents: 'none' }} />
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: '0 8px 32px rgba(124,111,255,0.4)', overflow: 'hidden' }}>
            {saas.logo ? (
              <img src={saas.logo} alt={saas.name} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }} />
            ) : images.length > 0 ? (
              <img src={images[0]} alt={saas.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              iconLetter
            )}
          </div>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '32px', color: 'var(--clr-text)', margin: 0 }}>{isAr ? (saas.nameAr || saas.name) : saas.name}</h1>
              {saas.status === 'ACTIVE' && (
                <span style={{ background: 'rgba(0,229,176,0.15)', color: '#00e5b0', border: '1px solid rgba(0,229,176,0.4)', borderRadius: '999px', padding: '4px 12px', fontSize: '12px', fontWeight: 600 }}>● {isAr ? 'مباشر' : 'Live'}</span>
              )}
              {saas.category?.name && (
                <span style={{ background: 'var(--clr-primary)', color: '#fff', borderRadius: '999px', padding: '4px 12px', fontSize: '12px', fontWeight: 600 }}>{isAr ? (saas.category.nameAr || saas.category.name) : saas.category.name}</span>
              )}
            </div>
            {(saas.taglineAr || saas.tagline) && <p style={{ color: 'var(--clr-text)', fontSize: '18px', fontWeight: 500, margin: '0 0 8px' }}>{isAr ? (saas.taglineAr || saas.tagline) : saas.tagline}</p>}
            <p style={{ color: 'var(--clr-text-muted)', fontSize: '16px', margin: '0 0 12px', maxWidth: '600px', lineHeight: 1.6 }}>{isAr ? (saas.descriptionAr || saas.description) : saas.description}</p>
            {reviews.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StarRating value={Math.round(avgRating)} size={16} />
                <span style={{ fontSize: '14px', color: 'var(--clr-text-muted)' }}>{avgRating.toFixed(1)} ({reviews.length} {isAr ? 'تقييم' : `review${reviews.length !== 1 ? 's' : ''}`})</span>
              </div>
            )}
          </div>
          {saas.demoUrl ? (
            <Button href={saas.demoUrl} target="_blank" rel="noreferrer" variant="primary" size="lg" icon={<ExternalLink size={16} />}>{isAr ? 'إطلاق المنتج' : 'Launch Product'}</Button>
          ) : (
            <Button href="/contact" variant="primary" size="lg" icon={<ExternalLink size={16} />}>
              {saas.hasFreeTrial ? (isAr ? 'جرب مجاناً لمدة 14 يوماً' : 'Try Free for 14 Days') : (isAr ? 'ابدأ الآن' : 'Get Started')}
            </Button>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px', display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ─── Left Column ─── */}
        <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

          {/* Gallery */}
          {images.length > 0 && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '22px', marginBottom: '20px' }}>Screenshots</h2>
              <div style={{ position: 'relative', width: '100%', borderRadius: '16px', overflow: 'hidden', background: '#000', aspectRatio: '16/9', border: '1px solid var(--clr-border)' }}>
                <img src={images[activeImage]} alt={`Screenshot ${activeImage + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImage(p => p > 0 ? p - 1 : images.length - 1)} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <ChevronLeft />
                    </button>
                    <button onClick={() => setActiveImage(p => p < images.length - 1 ? p + 1 : 0)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <ChevronRight />
                    </button>
                    <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
                      {images.map((_: any, i: number) => (
                        <div key={i} onClick={() => setActiveImage(i)} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === activeImage ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {images.map((img: string, i: number) => (
                    <div key={i} onClick={() => setActiveImage(i)} style={{ flexShrink: 0, width: '80px', height: '50px', borderRadius: '6px', overflow: 'hidden', border: `2px solid ${i === activeImage ? 'var(--clr-primary)' : 'var(--clr-border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Features */}
          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '22px', marginBottom: '20px' }}>What's Included</h2>
            {features.length === 0 ? (
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>{isAr ? 'لا توجد ميزات مدرجة بعد.' : 'No features listed yet.'}</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                {features.map((feat: string, i: number) => (
                  <div key={i} style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ color: 'var(--clr-accent)', marginTop: '2px', flexShrink: 0 }}><Check size={16} /></div>
                    <span style={{ fontSize: '14px', lineHeight: 1.5 }}>{feat}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Subscription Plans - Full Width */}
          {plans.length > 0 && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '22px', marginBottom: '8px' }}>Subscription Plans</h2>
              {/* Billing Toggle */}
              {(() => {
                const savingPlans = plans.filter((p: any) => {
                  const m = p.monthlyPrice ?? p.price ?? 0;
                  const y = p.yearlyPrice;
                  return m > 0 && y !== undefined && y !== null && y > 0;
                });
                const avgSaving = savingPlans.length > 0
                  ? Math.round(
                      savingPlans.reduce((sum: number, p: any) => {
                        const m = p.monthlyPrice ?? p.price ?? 0;
                        const y = p.yearlyPrice;
                        const annualMonthly = m * 12;
                        const saving = ((annualMonthly - y) / annualMonthly) * 100;
                        return sum + saving;
                      }, 0) / savingPlans.length
                    )
                  : 0;

                return (
                  <div style={{ display: 'inline-flex', background: 'var(--clr-surface-2)', borderRadius: '8px', padding: '4px', marginBottom: '24px', border: '1px solid var(--clr-border)' }}>
                    <button style={ss.billingBtn(billingCycle === 'monthly')} onClick={() => setBillingCycle('monthly')}>{isAr ? 'شهرياً' : 'Monthly'}</button>
                    <button style={ss.billingBtn(billingCycle === 'yearly')} onClick={() => setBillingCycle('yearly')}>
                      Yearly{avgSaving > 0 && (
                        <span style={{ color: billingCycle === 'yearly' ? '#00e5b0' : 'var(--clr-accent)', fontWeight: 700, marginLeft: '4px' }}>
                          {isAr ? `وفر ${avgSaving}%` : `Save ${avgSaving}%`}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })()}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                {plans.map((plan: any, i: number) => {
                  const monthly = plan.monthlyPrice ?? plan.price ?? 0;
                  const yearly  = plan.yearlyPrice  ?? (monthly * 10 / 12);
                  const price   = billingCycle === 'monthly' ? monthly : yearly;
                  const planFeatures: string[] = Array.isArray(plan.features) ? plan.features.filter((f: string) => f.trim()) : [];
                  const isPopular = !!plan.isPopular;
                  return (
                    <div key={i} style={{ background: isPopular ? 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))' : 'var(--clr-surface)', border: `2px solid ${isPopular ? 'var(--clr-primary)' : 'var(--clr-border)'}`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', transition: 'transform 0.2s' }}>
                      {isPopular && (
                        <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#ffaa00', color: '#000', borderRadius: '999px', padding: '4px 16px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>{isAr ? 'الأكثر شعبية' : 'MOST POPULAR'}</div>
                      )}
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', margin: '0 0 4px', color: isPopular ? '#fff' : 'var(--clr-text)' }}>{plan.name}</h3>
                        {plan.description && <p style={{ fontSize: '13px', color: isPopular ? 'rgba(255,255,255,0.75)' : 'var(--clr-text-muted)', margin: 0, lineHeight: 1.5 }}>{plan.description}</p>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 700, color: isPopular ? '#fff' : 'var(--clr-text)', lineHeight: 1 }}>{formatPrice(price).replace(/\.00$/, '')}</span>
                        <span style={{ fontSize: '14px', color: isPopular ? 'rgba(255,255,255,0.7)' : 'var(--clr-text-muted)' }}>{billingCycle === 'yearly' ? (isAr ? '/سنوياً' : '/yr') : (isAr ? '/شهرياً' : '/mo')}</span>
                      </div>
                      {planFeatures.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                          {planFeatures.map((feat, fi) => (
                            <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: isPopular ? 'rgba(255,255,255,0.9)' : 'var(--clr-text-muted)' }}>
                              <Check size={14} color={isPopular ? '#fff' : 'var(--clr-accent)'} />
                              {feat}
                            </div>
                          ))}
                        </div>
                      )}
                      <button 
                        onClick={() => handleSubscribeClick(plan.name, price)}
                        style={{ marginTop: 'auto', width: '100%', padding: '12px', borderRadius: '8px', background: isPopular ? 'rgba(255,255,255,0.2)' : 'var(--clr-primary)', color: '#fff', border: isPopular ? '2px solid rgba(255,255,255,0.5)' : 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        {isAr ? 'اشترك الآن' : 'Subscribe Now'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Why Choose Us */}
          {whyChooseUs.length > 0 && (
            <section>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '22px', marginBottom: '20px' }}>{isAr ? `لماذا تختار ${saas.name}؟` : `Why Choose ${saas.name}?`}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {whyChooseUs.map((f: any, i: number) => (
                  <div key={i} style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'var(--clr-primary-dim)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {IconMap[f.icon] || <Star size={24} color="var(--clr-primary)" />}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{f.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)', lineHeight: 1.6 }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQs */}
          {faqs.length > 0 && (
            <section style={{ marginTop: '24px', marginBottom: '32px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '22px', marginBottom: '20px' }}>{isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {faqs.map((faq: any, i: number) => (
                  <div key={i} style={{ border: '1px solid var(--clr-border)', borderRadius: '12px', background: 'var(--clr-surface)', overflow: 'hidden' }}>
                    <button 
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '15px', fontWeight: 600, color: 'var(--clr-text)' }}
                    >
                      {faq.question}
                      <span style={{ fontSize: '18px', color: 'var(--clr-text-muted)', transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                    </button>
                    {openFaq === i && (
                      <div style={{ padding: '0 20px 20px', fontSize: '14px', color: 'var(--clr-text-muted)', lineHeight: 1.6, borderTop: '1px solid var(--clr-border)' }}>
                        <div style={{ paddingTop: '16px' }}>{faq.answer}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ─── Reviews ─── */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '22px', margin: '0 0 4px' }}>{isAr ? 'تقييمات العملاء' : 'Customer Reviews'}</h2>
                {reviews.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StarRating value={Math.round(avgRating)} size={16} />
                    <span style={{ fontSize: '14px', color: 'var(--clr-text-muted)' }}>{isAr ? `${avgRating.toFixed(1)} متوسط من ${reviews.length} تقييم` : `${avgRating.toFixed(1)} average from ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--clr-primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                <Send size={14} /> Write a Review
              </button>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '18px', marginBottom: '20px', marginTop: 0 }}>{isAr ? 'شارك تجربتك' : 'Share Your Experience'}</h3>
                <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>{isAr ? 'تقييمك *' : 'Your Rating *'}</label>
                    <StarRating value={reviewRating} onChange={setReviewRating} size={28} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>{isAr ? 'اسمك *' : 'Your Name *'}</label>
                    <input
                      type="text"
                      value={reviewName}
                      onChange={e => setReviewName(e.target.value)}
                      required
                      placeholder="John Doe"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface-2)', color: 'var(--clr-text)', fontSize: '14px', outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>{isAr ? 'مراجعتك *' : 'Your Review *'}</label>
                    <textarea
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      required
                      rows={4}
                      placeholder={isAr ? `شارك تجربتك مع ${saas.name}...` : `Share your experience with ${saas.name}...`}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface-2)', color: 'var(--clr-text)', fontSize: '14px', outline: 'none', fontFamily: 'var(--font-body)', resize: 'vertical', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                      type="submit"
                      disabled={submitStatus === 'loading'}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--clr-primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: submitStatus === 'loading' ? 'not-allowed' : 'pointer', opacity: submitStatus === 'loading' ? 0.7 : 1 }}
                    >
                      {submitStatus === 'loading' ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
                      {isAr ? 'إرسال التقييم' : 'Submit Review'}
                    </button>
                    <span style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>{isAr ? 'يتم نشر التقييمات بعد المراجعة.' : 'Reviews are published after moderation.'}</span>
                  </div>
                  {submitStatus === 'success' && (
                    <div style={{ background: 'rgba(0,229,176,0.1)', border: '1px solid rgba(0,229,176,0.3)', borderRadius: '8px', padding: '12px 16px', color: '#00e5b0', fontSize: '14px' }}>
                      ✓ {isAr ? 'شكراً لك! تم إرسال تقييمك للمراجعة.' : 'Thank you! Your review has been submitted for moderation.'}
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '8px', padding: '12px 16px', color: '#ff4444', fontSize: '14px' }}>
                      ✗ {isAr ? 'حدث خطأ ما. يرجى المحاولة مرة أخرى.' : 'Something went wrong. Please try again.'}
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: 'var(--clr-text-muted)' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--clr-text-muted)', background: 'var(--clr-surface)', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
                <Star size={40} color="var(--clr-border)" style={{ marginBottom: '12px' }} />
                <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{isAr ? 'لا توجد تقييمات بعد' : 'No reviews yet'}</p>
                <p style={{ fontSize: '14px', margin: 0 }}>{isAr ? `كن أول من يقيم ${saas.name}!` : `Be the first to review ${saas.name}!`}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.map((review) => (
                  <div key={review.id} style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{review.authorName}</div>
                        <StarRating value={review.rating} size={14} />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                        {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)', lineHeight: 1.6, margin: 0 }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ─── Right Sidebar ─── */}
        <div style={ss.sticky}>
          {/* Pricing Summary Card */}
          <Card>
            <CardBody style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '18px', margin: 0 }}>
                {plans.length > 0 ? (isAr ? 'يبدأ من' : 'Starting From') : (isAr ? 'التسعير' : 'Pricing')}
              </h3>

              {/* Billing Toggle */}
              {(() => {
                const savingPlans = plans.filter((p: any) => {
                  const m = p.monthlyPrice ?? p.price ?? 0;
                  const y = p.yearlyPrice;
                  return m > 0 && y !== undefined && y !== null && y > 0;
                });
                const avgSaving = savingPlans.length > 0
                  ? Math.round(
                      savingPlans.reduce((sum: number, p: any) => {
                        const m = p.monthlyPrice ?? p.price ?? 0;
                        const y = p.yearlyPrice;
                        const saving = ((m * 12 - y) / (m * 12)) * 100;
                        return sum + saving;
                      }, 0) / savingPlans.length
                    )
                  : 0;
                return (
                  <div style={{ display: 'flex', background: 'var(--clr-surface-2)', borderRadius: '8px', padding: '4px', border: '1px solid var(--clr-border)' }}>
                    <button style={ss.billingBtn(billingCycle === 'monthly')} onClick={() => setBillingCycle('monthly')}>{isAr ? 'شهرياً' : 'Monthly'}</button>
                    <button style={ss.billingBtn(billingCycle === 'yearly')} onClick={() => setBillingCycle('yearly')}>
                      Yearly{avgSaving > 0 && <span style={{ color: billingCycle === 'yearly' ? '#00e5b0' : 'var(--clr-accent)', fontWeight: 700, marginLeft: '4px' }}>-{avgSaving}%</span>}
                    </button>
                  </div>
                );
              })()}

              {/* Price */}
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                {(() => {
                  const lowestPlan = plans.length > 0 ? plans[0] : null;
                  const baseMonthly = lowestPlan ? (lowestPlan.monthlyPrice ?? lowestPlan.price ?? saas.monthlyPrice) : saas.monthlyPrice;
                  const baseYearly = lowestPlan ? (lowestPlan.yearlyPrice ?? (baseMonthly * 10)) : saas.yearlyPrice;
                  const displayPrice = billingCycle === 'monthly' ? baseMonthly : (baseYearly / 12);
                  const annualSaving = baseMonthly && baseYearly ? (baseMonthly * 12 - baseYearly) : 0;
                  return (
                    <>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 700, color: 'var(--clr-text)', lineHeight: 1 }}>
                        {formatPrice(displayPrice ?? 0).replace(/\.00$/, '')}
                      </div>
                      <div style={{ color: 'var(--clr-text-muted)', fontSize: '13px', marginTop: '6px' }}>
                        {billingCycle === 'monthly' ? 'per month' : 'per month, billed yearly'}
                      </div>
                      {billingCycle === 'yearly' && annualSaving > 0 && (
                        <div style={{ color: '#00e5b0', fontSize: '12px', marginTop: '4px', fontWeight: 600 }}>
                          {isAr ? `وفر ${formatPrice(annualSaving).replace(/\.00$/, '')} سنوياً` : `Save ${formatPrice(annualSaving).replace(/\.00$/, '')} per year`}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Top features preview */}
              {features.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {features.slice(0, 5).map((feat: string, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--clr-text-muted)' }}>
                      <Check size={13} color="var(--clr-accent)" /> {feat}
                    </div>
                  ))}
                  {features.length > 5 && <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)', marginTop: '4px' }}>{isAr ? `+ ${features.length - 5} ميزات أخرى` : `+ ${features.length - 5} more features`}</div>}
                </div>
              )}

              <button 
                onClick={() => {
                  const lowestPlan = plans.length > 0 ? plans[0] : null;
                  const baseMonthly = lowestPlan ? (lowestPlan.monthlyPrice ?? lowestPlan.price ?? saas.monthlyPrice) : saas.monthlyPrice;
                  const baseYearly = lowestPlan ? (lowestPlan.yearlyPrice ?? (baseMonthly * 10)) : saas.yearlyPrice;
                  const price = billingCycle === 'monthly' ? baseMonthly : (baseYearly / 12);
                  handleSubscribeClick(lowestPlan ? lowestPlan.name : 'Basic', price);
                }}
                disabled={!!subscribingPlan}
                style={{ width: '100%', padding: '14px', borderRadius: '10px', background: 'var(--clr-primary)', color: '#fff', border: 'none', fontSize: '15px', fontWeight: 700, cursor: subscribingPlan ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                {subscribingPlan ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {isAr ? 'اشترك الآن' : 'Subscribe Now'}
              </button>
              {saas.hasFreeTrial && (
                <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--clr-text-muted)', margin: 0 }}>{isAr ? 'نسخة تجريبية مجانية لمدة 14 يوماً · لا يتطلب بطاقة ائتمان' : '14-day free trial · No credit card required'}</p>
              )}
            </CardBody>
          </Card>

          {/* Links & Support Card */}
          <Card>
            <CardBody style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {saas.demoUrl && (
                <a href={saas.demoUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: 'var(--clr-surface-2)', color: 'var(--clr-text)', fontSize: '13px', fontWeight: 600, border: '1px solid var(--clr-border)' }}>
                  <Globe size={16} color="var(--clr-primary)" /> Launch Demo
                </a>
              )}
              {saas.documentationUrl && (
                <a href={saas.documentationUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: 'var(--clr-surface-2)', color: 'var(--clr-text)', fontSize: '13px', fontWeight: 600, border: '1px solid var(--clr-border)' }}>
                  <Book size={16} color="var(--clr-primary)" /> Documentation
                </a>
              )}
              {saas.communityUrl && (
                <a href={saas.communityUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: 'var(--clr-surface-2)', color: 'var(--clr-text)', fontSize: '13px', fontWeight: 600, border: '1px solid var(--clr-border)' }}>
                  <MessageSquare size={16} color="var(--clr-primary)" /> Community Forum
                </a>
              )}
              {saas.githubUrl && (
                <a href={saas.githubUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: 'var(--clr-surface-2)', color: 'var(--clr-text)', fontSize: '13px', fontWeight: 600, border: '1px solid var(--clr-border)' }}>
                  <Code size={16} color="var(--clr-primary)" /> GitHub Repository
                </a>
              )}
              <a href="/contact" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: 'var(--clr-surface-2)', color: 'var(--clr-text)', fontSize: '13px', fontWeight: 600, border: '1px solid var(--clr-border)' }}>
                <Mail size={16} color="var(--clr-primary)" /> Contact Support
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,229,176,0.08)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: 'var(--clr-accent)', border: '1px solid rgba(0,229,176,0.2)' }}>
                <ShieldCheck size={14} /> 30-day money-back guarantee
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        title={saas.name}
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      {/* Checkout Modal */}
      {checkoutModalOpen && selectedPlan && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99999, backdropFilter: 'blur(4px)' }} onClick={() => setCheckoutModalOpen(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--clr-bg)', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '24px', zIndex: 100000, padding: '32px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '24px' }}>{isAr ? 'إتمام الاشتراك' : 'Complete Subscription'}</h2>
              <button onClick={() => setCheckoutModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)' }}><X size={24} /></button>
            </div>

            <div style={{ background: 'var(--clr-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--clr-border)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '16px' }}>{saas.name} - {selectedPlan.name}</div>
                <div style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>{billingCycle === 'yearly' ? (isAr ? 'الفوترة سنوياً' : 'Billed Yearly') : (isAr ? 'الفوترة شهرياً' : 'Billed Monthly')}</div>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {formatPrice(selectedPlan.price)}
              </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>{isAr ? 'اختر طريقة الدفع' : 'Select Payment Method'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {settings.pay_stripe_enabled === 'true' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--clr-surface)', border: `2px solid ${paymentMethod === 'card' ? 'var(--clr-primary)' : 'var(--clr-border)'}`, borderRadius: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                  <CreditCard size={20} color={paymentMethod === 'card' ? 'var(--clr-primary)' : 'var(--clr-text-muted)'} />
                  <span style={{ fontWeight: 500, fontSize: '15px' }}>{isAr ? 'بطاقة ائتمان (Stripe)' : 'Credit Card (Stripe)'}</span>
                </label>
              )}
              {settings.pay_baridi_enabled === 'true' && (
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', background: 'var(--clr-surface)', border: `2px solid ${paymentMethod === 'baridi' ? 'var(--clr-primary)' : 'var(--clr-border)'}`, borderRadius: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  <input type="radio" name="payment" value="baridi" checked={paymentMethod === 'baridi'} onChange={() => setPaymentMethod('baridi')} style={{ marginTop: '4px' }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 500, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Smartphone size={18} color={paymentMethod === 'baridi' ? 'var(--clr-primary)' : 'var(--clr-text-muted)'} />
                      {isAr ? 'بريدي موب' : 'BaridiMob'}
                    </span>
                    {paymentMethod === 'baridi' && (
                      <div style={{ marginTop: '16px', padding: '16px', background: 'var(--clr-surface-2)', borderRadius: '8px', fontSize: '14px' }}>
                        <p style={{ margin: '0 0 8px 0', color: 'var(--clr-text-muted)' }}>{isAr ? 'يرجى تحويل المبلغ إلى الحساب التالي:' : 'Please transfer the amount to the following account:'}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--clr-text-muted)' }}>{isAr ? 'الاسم:' : 'Name:'}</span>
                          <span style={{ fontWeight: 600 }}>{settings.pay_baridi_name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--clr-text-muted)' }}>{isAr ? 'رقم الحساب (RIP):' : 'RIP:'}</span>
                          <span style={{ fontWeight: 600 }}>{settings.pay_baridi_rip}</span>
                        </div>
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <Input label={isAr ? 'رقم المعاملة *' : 'Transaction ID *'} value={transactionId} onChange={e => setTransactionId(e.target.value)} required />
                          <div>
                            <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>{isAr ? 'لقطة شاشة (اختياري)' : 'Screenshot (Optional)'}</label>
                            <input type="file" accept="image/*" onChange={e => { if(e.target.files?.[0]) setReceiptFile(e.target.files[0]) }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              )}
              {settings.pay_crypto_enabled === 'true' && (
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', background: 'var(--clr-surface)', border: `2px solid ${paymentMethod === 'crypto' ? 'var(--clr-primary)' : 'var(--clr-border)'}`, borderRadius: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  <input type="radio" name="payment" value="crypto" checked={paymentMethod === 'crypto'} onChange={() => setPaymentMethod('crypto')} style={{ marginTop: '4px' }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 500, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Wallet size={18} color={paymentMethod === 'crypto' ? 'var(--clr-primary)' : 'var(--clr-text-muted)'} />
                      {isAr ? 'بينانس باي / محفظة مشفرة' : 'Binance / Crypto Wallet'}
                    </span>
                    {paymentMethod === 'crypto' && (
                      <div style={{ marginTop: '16px', padding: '16px', background: 'var(--clr-surface-2)', borderRadius: '8px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--clr-text-muted)' }}>{isAr ? 'عنوان USDT (TRC20):' : 'USDT (TRC20):'}</span>
                          <span style={{ fontWeight: 600, wordBreak: 'break-all' }}>{settings.pay_crypto_usdt}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--clr-text-muted)' }}>{isAr ? 'معرف بينانس باي:' : 'Binance Pay ID:'}</span>
                          <span style={{ fontWeight: 600 }}>{settings.pay_crypto_binance}</span>
                        </div>
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <Input label={isAr ? 'هاش المعاملة (TxID) *' : 'Transaction Hash (TxID) *'} value={transactionId} onChange={e => setTransactionId(e.target.value)} required />
                          <div>
                            <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>{isAr ? 'لقطة شاشة (اختياري)' : 'Screenshot (Optional)'}</label>
                            <input type="file" accept="image/*" onChange={e => { if(e.target.files?.[0]) setReceiptFile(e.target.files[0]) }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              )}
            </div>

            <Button
              variant="primary"
              size="lg"
              style={{ width: '100%', padding: '16px', fontSize: '16px' }}
              onClick={processCheckout}
              disabled={!!subscribingPlan}
              icon={subscribingPlan ? <Loader2 className="spin" size={18} /> : undefined}
            >
              {subscribingPlan ? (isAr ? 'جاري المعالجة...' : 'Processing...') : (isAr ? 'تأكيد ودفع' : 'Confirm & Pay')}
            </Button>
          </div>
        </>
      )}

    </div>
  );
}
