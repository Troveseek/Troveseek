"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import Button from '@/components/ui/Button';
import { ShoppingCart, Heart, Share2, Flag, Package, Check, Lock, Shield, ChevronDown, MessageSquare } from 'lucide-react';
import ShareModal from '@/components/ui/ShareModal';
import { useCartStore } from '@/lib/store/cartStore';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import styles from './page.module.css';
import { useLocale } from 'next-intl';

export default function ProductClient({ product }: { product: any }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { formatPrice } = useCurrency();
  const images = Array.isArray(product.images) ? product.images : JSON.parse(product.images || '[]');
  const mainImage = images.length > 0 ? images[0] : '/placeholder-image.png'; // Use a generic placeholder or first image
  const [activeImage, setActiveImage] = useState(mainImage);
  const [activeTab, setActiveTab] = useState('Description');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [added, setAdded] = useState(false);
  
  // Review state
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  // Image Zoom State
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  
  const router = useRouter();

  let faqs = [];
  try { faqs = JSON.parse((isAr ? product.faqsAr : product.faqs) || product.faqs || '[]'); } catch (e) { faqs = []; }

  let features = [];
  try { features = JSON.parse((isAr ? product.featuresAr : product.features) || product.features || '[]'); } catch (e) { features = []; }

  let specifications = [];
  try { specifications = JSON.parse((isAr ? product.specificationsAr : product.specifications) || product.specifications || '[]'); } catch (e) { specifications = []; }

  let requirements = [];
  try { requirements = JSON.parse((isAr ? product.requirementsAr : product.requirements) || product.requirements || '[]'); } catch (e) { requirements = []; }

  let tags = [];
  try { tags = JSON.parse(product.tags || '[]'); } catch (e) { tags = []; }

  let bulkPricing = [];
  try { bulkPricing = JSON.parse(product.bulkPricing || '[]'); } catch (e) { bulkPricing = []; }

  const [quantity, setQuantity] = useState(1);

  const addCartItem = useCartStore((s) => s.addItem);
  const { items: wishlistItems, addItem: addWishlistItem, removeItem: removeWishlistItem } = useWishlistStore();
  const isWishlisted = wishlistItems.some((i) => i.id === product.id);

  const handleAddToCart = () => {
    addCartItem({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      basePrice: product.salePrice || product.price,
      bulkPricing,
      category: product.category?.name || 'Uncategorized',
      quantity,
      imageUrl: product.logo || (images.length > 0 ? images[0] : undefined),
    } as any);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addCartItem({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      category: product.category?.name || 'Uncategorized',
      quantity,
      imageUrl: product.logo || (images.length > 0 ? images[0] : undefined),
    } as any);
    router.push('/checkout');
  };

  const handleToggleWishlist = () => {
    if (isWishlisted) {
      removeWishlistItem(product.id);
    } else {
      addWishlistItem({
        id: product.id,
        name: product.name,
        price: product.salePrice || product.price,
        category: product.category?.name || 'Uncategorized',
        slug: product.slug,
        image: product.logo || (images.length > 0 ? images[0] : undefined),
      });
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    setShareModalOpen(true);
  };

  const handleReport = () => {
    const confirmReport = window.confirm(isAr ? 'هل أنت متأكد أنك تريد الإبلاغ عن هذا المنتج؟' : 'Are you sure you want to report this product?');
    if (confirmReport) {
      alert(isAr ? 'شكراً لك. سيقوم فريق الثقة والأمان لدينا بمراجعة هذا المنتج قريباً.' : 'Thank you. Our Trust & Safety team will review this product shortly.');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
          authorName: reviewName
        })
      });
      if (res.ok) {
        setReviewSuccess(true);
        setIsReviewFormOpen(false);
        setReviewComment('');
        setReviewName('');
        setReviewRating(5);
      } else {
        const data = await res.json();
        alert(data.error || (isAr ? 'فشل في إرسال التقييم' : 'Failed to submit review'));
      }
    } catch (error) {
      alert(isAr ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Markdown to simple HTML conversion since we used ** and _ in the admin
  const formatText = (text: string) => {
    if (!text) return { __html: '' };
    // Basic formatting for bold, italic, and lists that we implemented in admin
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/\n- (.*)/g, '<li>$1</li>');
    
    // Wrap consecutive li's in ul
    html = html.replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>');
    // Replace newlines with br outside of lists
    html = html.replace(/\n/g, '<br />');

    return { __html: html };
  };

  const discountPercentage = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) 
    : 0;

  const basePrice = product.salePrice || product.price;
  let effectivePrice = basePrice;
  let activeDiscountPercent = 0;

  if (bulkPricing.length > 0) {
    const sorted = [...bulkPricing].sort((a, b) => b.minQty - a.minQty);
    const active = sorted.find((t: any) => quantity >= t.minQty && (!t.maxQty || quantity <= t.maxQty));
    if (active) {
      effectivePrice = basePrice * (1 - active.discountPercent / 100);
      activeDiscountPercent = active.discountPercent;
    }
  }

  const reviews = product.reviews || [];
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter((r: any) => r.rating === stars).length;
    return { stars, count, percent: reviews.length > 0 ? (count / reviews.length) * 100 : 0 };
  });

  return (
    <div className={styles.detailPage}>
      <div className={styles.breadcrumb}>
        {isAr ? 'الرئيسية' : 'Home'} / {isAr ? 'المتجر' : 'Shop'} / {isAr ? (product.category?.nameAr || product.category?.name) : product.category?.name || (isAr ? 'غير مصنف' : 'Uncategorized')} / {isAr ? (product.nameAr || product.name) : product.name}
      </div>

      <div className={styles.mainSection}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* Image Gallery */}
          <div 
            className={styles.mainImage} 
            style={{ 
              overflow: 'hidden', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: '#0a0a0a',
              position: 'relative',
              cursor: isZoomed ? 'zoom-out' : 'zoom-in'
            }}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => { setIsZoomed(false); setZoomPos({ x: 50, y: 50 }); }}
            onMouseMove={handleMouseMove}
          >
            <img 
              src={activeImage} 
              alt={product.name} 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                transition: isZoomed ? 'none' : 'transform 0.3s ease-out',
                willChange: 'transform'
              }} 
            />
          </div>
          {images.length > 1 && (
            <div className={styles.thumbnailRow}>
              {images.map((img: string, i: number) => (
                <div 
                  key={i} 
                  className={`${styles.thumbnail} ${activeImage === img ? styles.active : ''}`}
                  onClick={() => setActiveImage(img)}
                  style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                ></div>
              ))}
            </div>
          )}

          {/* Product Description Tabs */}
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${activeTab === 'Description' ? styles.active : ''}`} onClick={() => setActiveTab('Description')}>{isAr ? 'الوصف' : 'Description'}</button>
            <button className={`${styles.tab} ${activeTab === 'Features' ? styles.active : ''}`} onClick={() => setActiveTab('Features')}>{isAr ? 'الميزات' : 'Features'}</button>
            <button className={`${styles.tab} ${activeTab === 'Specifications' ? styles.active : ''}`} onClick={() => setActiveTab('Specifications')}>{isAr ? 'المواصفات' : 'Specifications'}</button>
            <button className={`${styles.tab} ${activeTab === 'Requirements' ? styles.active : ''}`} onClick={() => setActiveTab('Requirements')}>{isAr ? 'المتطلبات' : 'Requirements'}</button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'Description' && (
              <>
                <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--clr-text-muted)' }}>
                  {isAr ? (product.descriptionAr || product.description) : product.description}
                </p>
                {product.fullDescription && (
                  <div style={{ marginTop: '24px', lineHeight: '1.7' }} dangerouslySetInnerHTML={formatText(isAr ? (product.fullDescriptionAr || product.fullDescription) : product.fullDescription)} />
                )}
              </>
            )}
            {activeTab === 'Features' && (
              <div style={{ padding: '8px 0' }}>
                {features.length > 0 ? (
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--clr-text-muted)' }}>
                    {features.map((feature: string, i: number) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: 'var(--clr-text-muted)' }}>{isAr ? 'لا توجد ميزات مدرجة لـ' : 'No features listed for'} {isAr ? (product.nameAr || product.name) : product.name}.</p>
                )}
              </div>
            )}
            {activeTab === 'Specifications' && (
              <div style={{ padding: '8px 0' }}>
                {specifications.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {specifications.map((spec: any, i: number) => (
                      <div key={i} style={{ display: 'flex', borderBottom: '1px solid var(--clr-border)', paddingBottom: '8px' }}>
                        <span style={{ width: '40%', fontWeight: 500 }}>{spec.name}</span>
                        <span style={{ width: '60%', color: 'var(--clr-text-muted)' }}>{spec.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--clr-text-muted)' }}>{isAr ? 'لا توجد مواصفات مدرجة لـ' : 'No specifications listed for'} {product.name}.</p>
                )}
              </div>
            )}
            {activeTab === 'Requirements' && (
              <div style={{ padding: '8px 0' }}>
                {requirements.length > 0 ? (
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--clr-text-muted)' }}>
                    {requirements.map((req: string, i: number) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: 'var(--clr-text-muted)' }}>{isAr ? 'لا توجد متطلبات مدرجة لـ' : 'No requirements listed for'} {isAr ? (product.nameAr || product.name) : product.name}.</p>
                )}
              </div>
            )}
          </div>

          {/* FAQ Section */}
          {faqs.length > 0 && (
            <div className={styles.faqSection} style={{ marginTop: '40px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>{isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {faqs.map((faq: any, idx: number) => (
                  <div key={idx} style={{ border: '1px solid var(--clr-border)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div 
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      style={{ padding: '16px', background: 'var(--clr-surface)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <span style={{ fontWeight: 500 }}>{faq.question}</span>
                      <ChevronDown size={16} style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                    </div>
                    {openFaq === idx && (
                      <div style={{ padding: '0 16px 16px', background: 'var(--clr-surface)', color: 'var(--clr-text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Sticky) */}
        <div className={styles.rightColumn}>
          <Card className={styles.infoCard}>
            {product.category?.name && (
              <span className={styles.categoryBadge}>{isAr ? (product.category.nameAr || product.category.name) : product.category.name}</span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              {product.logo && (
                <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', padding: '4px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={product.logo} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              )}
              <h1 className={styles.title} style={{ margin: 0 }}>{isAr ? (product.nameAr || product.name) : product.name}</h1>
            </div>
            
            <div className={styles.ratingRow}>
              <div className={styles.stars} style={{ color: 'var(--clr-surface-elevated)' }}>
                {'★'.repeat(Math.round(parseFloat(avgRating)))}{'☆'.repeat(5 - Math.round(parseFloat(avgRating)))}
              </div>
              <span style={{ fontWeight: 600, color: 'var(--clr-text)' }}>{avgRating}</span>
              <span style={{ color: 'var(--clr-text-muted)' }}>({reviews.length} {isAr ? 'تقييم' : `review${reviews.length !== 1 ? 's' : ''}`})</span>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.priceRow}>
              {activeDiscountPercent > 0 ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ textDecoration: 'line-through', color: 'var(--clr-text-muted)', fontSize: '16px' }}>{formatPrice(basePrice)}</span>
                    <span style={{ background: 'var(--clr-accent-dim)', color: 'var(--clr-accent)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{isAr ? `وفر ${activeDiscountPercent}% (بالجملة)` : `SAVE ${activeDiscountPercent}% (BULK)`}</span>
                  </div>
                  <span className={styles.price}>{formatPrice(effectivePrice)}</span>
                </>
              ) : product.salePrice ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ textDecoration: 'line-through', color: 'var(--clr-text-muted)', fontSize: '16px' }}>{formatPrice(product.price)}</span>
                    <span style={{ background: 'var(--clr-accent-dim)', color: 'var(--clr-accent)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{isAr ? `وفر ${discountPercentage}%` : `SAVE ${discountPercentage}%`}</span>
                  </div>
                  <span className={styles.price}>{formatPrice(product.salePrice)}</span>
                </>
              ) : (
                <span className={styles.price}>{formatPrice(product.price)}</span>
              )}
              <span className={styles.taxNote}>{isAr ? 'شامل الضريبة حيثما ينطبق' : 'Tax included where applicable'}</span>
            </div>

            <div className={styles.actionRow} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--clr-border)', borderRadius: '8px', height: '48px', overflow: 'hidden' }}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: '40px', height: '100%', background: 'var(--clr-surface)', border: 'none', color: 'var(--clr-text)', cursor: 'pointer', fontSize: '18px' }}
                >-</button>
                <div style={{ width: '40px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-surface-elevated)', fontWeight: 600 }}>{quantity}</div>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ width: '40px', height: '100%', background: 'var(--clr-surface)', border: 'none', color: 'var(--clr-text)', cursor: 'pointer', fontSize: '18px' }}
                >+</button>
              </div>
              <Button size="lg" style={{ flex: 1 }} variant={added ? 'primary' : 'primary'} icon={added ? <Check size={18} /> : <ShoppingCart size={18} />} onClick={handleAddToCart}>
                {added ? (isAr ? 'تمت الإضافة!' : 'Added to Cart!') : (isAr ? 'أضف إلى السلة' : 'Add to Cart')}
              </Button>
              <Button size="lg" variant="secondary" onClick={handleBuyNow}>
                {isAr ? 'اشتر الآن' : 'Buy Now'}
              </Button>
            </div>

            <div className={styles.secondaryActions}>
              <a onClick={handleToggleWishlist} style={{ cursor: 'pointer', color: isWishlisted ? '#ef4444' : 'inherit' }}>
                <Heart size={14} fill={isWishlisted ? '#ef4444' : 'none'} style={{ display: 'inline', marginRight: '4px' }}/> 
                {isWishlisted ? (isAr ? 'موجود في المفضلة' : 'Saved to Wishlist') : (isAr ? 'أضف للمفضلة' : 'Add to Wishlist')}
              </a>
              <a onClick={handleShare} style={{ cursor: 'pointer' }}>
                <Share2 size={14} style={{ display: 'inline', marginRight: '4px' }}/> {isAr ? 'مشاركة' : 'Share'}
              </a>
              <a onClick={handleReport} style={{ cursor: 'pointer' }}>
                <Flag size={14} style={{ display: 'inline', marginRight: '4px' }}/> {isAr ? 'إبلاغ' : 'Report'}
              </a>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.typeIndicator}>
              <Package size={16} color="var(--clr-primary)" />
              {product.stock === 0 ? (isAr ? 'منتج رقمي / غير محدود' : 'Digital Product / Unlimited') : `${product.stock} ${isAr ? 'في المخزن' : 'in stock'}`}
            </div>

            <div className={styles.trustBadges}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={12}/> {isAr ? 'دفع آمن' : 'Secure checkout'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={12}/> {isAr ? 'تشفير SSL' : 'SSL Encrypted'}</span>
            </div>

            {tags.length > 0 && (
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--clr-border)' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--clr-text)' }}>{isAr ? 'العلامات' : 'Tags'}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {tags.map((tag: string, i: number) => (
                    <span key={i} style={{ padding: '4px 10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '16px', fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {bulkPricing.length > 0 && (
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--clr-border)' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--clr-text)' }}>{isAr ? 'خصومات أسعار الجملة' : 'Bulk Pricing Discounts'}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {bulkPricing.map((tier: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--clr-surface)', borderRadius: '6px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--clr-text-muted)' }}>
                        {isAr ? 'اشتر' : 'Buy'} {tier.minQty}{tier.maxQty ? ` - ${tier.maxQty}` : '+'} {isAr ? 'عناصر' : 'items'}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--clr-primary)' }}>{tier.discountPercent}% {isAr ? 'خصم' : 'OFF'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Reviews Section */}
      <div className={styles.reviewsSection}>
        <div className={styles.reviewsHeader}>
          <h2 style={{ fontSize: '24px' }}>{isAr ? 'تقييمات العملاء' : 'Customer Reviews'}</h2>
          <Button variant="secondary" icon={<MessageSquare size={16} />} onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}>
            {isReviewFormOpen ? (isAr ? 'إلغاء التقييم' : 'Cancel Review') : (isAr ? 'اكتب تقييماً' : 'Write a Review')}
          </Button>
        </div>

        {reviewSuccess && (
          <div style={{ background: 'var(--clr-success-dim)', color: 'var(--clr-success)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--clr-success)' }}>
            {isAr ? 'شكراً لك! تم إرسال تقييمك وهو قيد المراجعة من قبل فريق الثقة والأمان لدينا.' : 'Thank you! Your review has been submitted and is pending moderation by our Trust & Safety team.'}
          </div>
        )}

        {isReviewFormOpen && !reviewSuccess && (
          <form onSubmit={submitReview} style={{ background: 'var(--clr-surface-elevated)', padding: '24px', borderRadius: '12px', marginBottom: '32px', border: '1px solid var(--clr-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0 }}>{isAr ? 'اكتب تقييماً' : 'Write a Review'}</h3>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--clr-text-muted)' }}>{isAr ? 'التقييم' : 'Rating'}</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button type="button" key={star} onClick={() => setReviewRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: star <= reviewRating ? 'var(--clr-primary)' : 'var(--clr-surface)' }}>
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--clr-text-muted)' }}>{isAr ? 'اسمك' : 'Your Name'}</label>
              <input required type="text" value={reviewName} onChange={e => setReviewName(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none' }} placeholder={isAr ? 'جون دو' : 'John Doe'} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--clr-text-muted)' }}>{isAr ? 'تقييمك' : 'Your Review'}</label>
              <textarea required rows={4} value={reviewComment} onChange={e => setReviewComment(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none', resize: 'vertical' }} placeholder={isAr ? 'ما الذي أعجبك أو لم يعجبك؟' : 'What did you like or dislike?'} />
            </div>

            <Button type="submit" variant="primary" disabled={isSubmittingReview}>
              {isSubmittingReview ? (isAr ? 'جاري الإرسال...' : 'Submitting...') : (isAr ? 'إرسال التقييم' : 'Submit Review')}
            </Button>
          </form>
        )}

        <div className={styles.reviewsContainer}>
          <div className={styles.ratingSummary}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div className={styles.bigRating}>{avgRating}</div>
              <div>
                <div className={styles.stars} style={{ fontSize: '20px', color: 'var(--clr-primary)' }}>
                  {'★'.repeat(Math.round(parseFloat(avgRating)))}{'☆'.repeat(5 - Math.round(parseFloat(avgRating)))}
                </div>
                <div style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>({reviews.length} {isAr ? 'تقييمات' : 'reviews'})</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ratingDistribution.map((dist) => (
                <div key={dist.stars} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span>{dist.stars}★</span>
                  <div style={{ height: '8px', flex: 1, background: 'var(--clr-surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${dist.percent}%`, background: 'var(--clr-primary)' }}></div>
                  </div>
                  <span style={{ width: '30px', textAlign: 'right', color: 'var(--clr-text-muted)' }}>{Math.round(dist.percent)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.reviewList}>
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--clr-text-muted)' }}>
                {isAr ? 'لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج!' : 'No reviews yet. Be the first to review this product!'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {reviews.map((rev: any, idx: number) => (
                  <div key={idx} style={{ paddingBottom: '24px', borderBottom: idx < reviews.length - 1 ? '1px solid var(--clr-border)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600 }}>{rev.authorName}</span>
                      <span style={{ color: 'var(--clr-text-muted)', fontSize: '13px' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ color: 'var(--clr-primary)', marginBottom: '12px', fontSize: '14px' }}>
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </div>
                    <p style={{ color: 'var(--clr-text-muted)', lineHeight: '1.6', margin: 0 }}>
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {typeof window !== 'undefined' && (
        <ShareModal 
          isOpen={shareModalOpen} 
          onClose={() => setShareModalOpen(false)} 
          url={window.location.href} 
          title={product.name} 
        />
      )}
    </div>
  );
}
