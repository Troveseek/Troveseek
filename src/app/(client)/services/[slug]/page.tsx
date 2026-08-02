import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { ArrowLeft, Check, Star, Mail, Phone, MessageSquare, ArrowRight, Laptop, Search, Palette, Settings, Rocket, X, Clock } from 'lucide-react';
import db from '@/lib/db';
import { getLocale } from 'next-intl/server';
import { formatServerPrice } from '@/lib/currency';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const isAr = locale === 'ar';
  const service = await db.service.findUnique({ where: { slug } });
  if (!service) return { title: 'Service Not Found' };
  
  return {
    title: (isAr ? (service.metaTitleAr || service.nameAr) : (service.metaTitle || service.name)) || service.name,
    description: (isAr ? (service.metaDescriptionAr || service.descriptionAr) : (service.metaDescription || service.description)) || service.description,
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getLocale();
  const isAr = locale === 'ar';
  const { slug } = await params;
  
  const service = await db.service.findUnique({
    where: { slug }
  });

  if (!service) {
    notFound();
  }
  
  const dbCurrency = await db.siteSetting.findUnique({ where: { key: 'site_currency' } });
  const siteCurrency = dbCurrency?.value || 'USD';
  const formatPrice = (price: number) => formatServerPrice(price, siteCurrency, locale);

  // Parse dynamic JSON fields
  let process = [];
  let portfolio = [];
  let testimonials = [];
  let tiers = [];
  
  try { if (isAr && service.processAr && service.processAr !== "[]") process = JSON.parse(service.processAr); else if (service.process && service.process !== "[]") process = JSON.parse(service.process); } catch(e){}
  try { if (isAr && service.portfolioAr && service.portfolioAr !== "[]") portfolio = JSON.parse(service.portfolioAr); else if (service.portfolio && service.portfolio !== "[]") portfolio = JSON.parse(service.portfolio); } catch(e){}
  try { if (isAr && service.testimonialsAr && service.testimonialsAr !== "[]") testimonials = JSON.parse(service.testimonialsAr); else if (service.testimonials && service.testimonials !== "[]") testimonials = JSON.parse(service.testimonials); } catch(e){}
  try { if (isAr && service.tiersAr && service.tiersAr !== "[]") tiers = JSON.parse(service.tiersAr); else if (service.tiers && service.tiers !== "[]") tiers = JSON.parse(service.tiers); } catch(e){}

  return (
    <div style={{ minHeight: '100vh', background: 'var(--clr-bg)' }}>
      {/* Breadcrumb */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 32px 0' }}>
        <Link href="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--clr-text-muted)', fontSize: '14px', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> {isAr ? 'العودة للخدمات' : 'Back to Services'}
        </Link>
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #080810, #0f0f1a)', padding: '60px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ width: '80px', height: '80px', background: service.logo ? 'transparent' : 'var(--clr-primary-dim)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '36px', border: service.logo ? 'none' : '1px solid var(--clr-primary)', overflow: 'hidden' }}>
            {service.logo ? (
              <img src={service.logo} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'var(--clr-surface)' }} />
            ) : (
              <Laptop size={36} color="var(--clr-primary)" />
            )}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(32px, 5vw, 48px)', color: '#eeeeff', marginBottom: '16px' }}>
            {isAr ? (service.nameAr || service.name) : service.name}
          </h1>
          <p style={{ fontSize: '18px', color: '#8888aa', lineHeight: 1.7, marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
            {isAr ? (service.descriptionAr || service.description) : service.description}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/contact" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="lg" icon={<ArrowRight size={18} />}>{isAr ? 'اطلب عرض سعر' : 'Request a Quote'}</Button>
            </Link>
            {portfolio.length > 0 && <a href="#portfolio" style={{textDecoration: 'none'}}><Button variant="secondary" size="lg">{isAr ? 'عرض الأعمال' : 'View Portfolio'}</Button></a>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '64px 32px', display: 'flex', flexDirection: 'column', gap: '80px' }}>

        {/* Our Process */}
        {process.length > 0 && (
          <section id="portfolio">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>{isAr ? 'كيف نعمل' : 'How We Work'}</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '32px' }}>{isAr ? 'عمليتنا' : 'Our Process'}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
              {process.map((step: any, index: number) => (
                <div key={index} style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '16px', padding: '28px', position: 'relative' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--clr-primary)', letterSpacing: '0.05em', marginBottom: '12px' }}>{step.step || `0${index + 1}`}</div>
                  <div style={{ fontSize: '28px', marginBottom: '12px', color: 'var(--clr-text-muted)' }}>
                    {index % 4 === 0 ? <Search size={28} /> : index % 4 === 1 ? <Palette size={28} /> : index % 4 === 2 ? <Settings size={28} /> : <Rocket size={28} />}
                  </div>
                  <h3 style={{ fontWeight: 600, fontSize: '18px', marginBottom: '10px' }}>{step.title}</h3>
                  <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Portfolio */}
        {portfolio.length > 0 && (
          <section id="portfolio">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>{isAr ? 'أعمالنا' : 'Our Work'}</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '32px' }}>{isAr ? 'المشاريع الحديثة' : 'Recent Projects'}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {portfolio.map((proj: any, i: number) => {
                const tags = proj.tags ? proj.tags.split(',').map((t: string) => t.trim()) : [];
                const cardContent = (
                  <CardBody style={{ padding: '0', display: 'flex', flexWrap: 'wrap', overflow: 'hidden', borderRadius: '16px' }}>
                    <div style={{ 
                      width: '280px', minHeight: '180px', 
                      background: proj.image ? `url(${proj.image}) center/cover` : `linear-gradient(135deg, ${i % 3 === 0 ? '#7c6fff33' : i % 3 === 1 ? '#00e5b033' : '#ffaa0033'}, var(--clr-surface-3))`, 
                      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: proj.image ? 'transparent' : 'var(--clr-text-muted)', fontSize: '14px', borderRight: '1px solid var(--clr-border)' 
                    }}>
                      {!proj.image && 'Project Preview'}
                    </div>
                    <div style={{ flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '240px' }}>
                      <div>
                        {proj.client && <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)', marginBottom: '4px' }}>{isAr ? 'العميل' : 'Client'}: {proj.client}</div>}
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {proj.project}
                          {proj.link && <ArrowRight size={16} color="var(--clr-primary)" style={{ transform: isAr ? 'rotate(180deg) rotate(-45deg)' : 'rotate(-45deg)' }} />}
                        </h3>
                      </div>
                      <p style={{ color: 'var(--clr-text-muted)', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>{proj.desc}</p>
                      {tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {tags.map((t: string) => (
                            <span key={t} style={{ fontSize: '12px', padding: '4px 10px', background: 'var(--clr-primary-dim)', color: 'var(--clr-primary)', borderRadius: '999px', fontWeight: 500 }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardBody>
                );

                return (
                  <Card key={i} style={{ transition: 'var(--transition)', ...(proj.link ? { cursor: 'pointer' } : {}) }} className={proj.link ? "hover-scale" : ""}>
                    {proj.link ? (
                      <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {cardContent}
                      </a>
                    ) : (
                      cardContent
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Client Testimonials */}
        {testimonials.length > 0 && (
          <section>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>{isAr ? 'آراء العملاء' : 'Client Feedback'}</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '32px' }}>{isAr ? 'ماذا يقول عملاؤنا' : 'What Our Clients Say'}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {testimonials.map((test: any, i: number) => (
                <Card key={i}>
                  <CardBody style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>{[...Array(5)].map((_, idx) => <Star key={idx} size={14} fill="#ffaa00" color="#ffaa00" />)}</div>
                    <p style={{ color: 'var(--clr-text-muted)', fontSize: '15px', lineHeight: 1.8, margin: 0, fontStyle: 'italic', flex: 1 }}>&ldquo;{test.quote}&rdquo;</p>
                    <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '16px' }}>
                      <div style={{ fontWeight: 600 }}>{test.author}</div>
                      <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>{test.role}</div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Pricing Tiers */}
        {tiers.length > 0 && (
          <section>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>{isAr ? 'تسعير شفاف' : 'Transparent Pricing'}</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '32px' }}>{isAr ? 'اختر الباقة' : 'Choose Your Tier'}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
              {tiers.map((plan: any, idx: number) => (
                <div key={idx} style={{
                  background: 'var(--clr-surface)',
                  border: `2px solid ${plan.isPopular ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                  borderRadius: '16px',
                  padding: '32px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0',
                  transform: plan.isPopular ? 'scale(1.02)' : 'none',
                  boxShadow: plan.isPopular ? '0 0 40px rgba(124,111,255,0.2)' : 'none',
                }}>
                  {plan.isPopular && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--clr-primary)', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '4px 14px', borderRadius: '999px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={12} fill="#fff" /> {isAr ? 'الأكثر شعبية' : 'Most Popular'}</div>}
                  <div style={{ padding: '32px 32px 0' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>{plan.name}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>{plan.description}</p>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '40px', color: plan.isPopular ? 'var(--clr-primary)' : 'var(--clr-text)', lineHeight: 1 }}>{formatPrice(parseFloat(plan.price.toString().replace(/[^0-9.]/g, '') || '0'))}</div>
                    {plan.priceDzd && (
                      <div style={{ fontSize: '18px', color: 'var(--clr-text-muted)', marginTop: '4px', fontWeight: 500 }}>
                        {new Intl.NumberFormat(isAr ? 'ar-DZ' : 'en-DZ').format(plan.priceDzd)} DZD
                      </div>
                    )}
                    {plan.duration && <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> {plan.duration}</div>}
                  </div>
                  <div style={{ padding: '32px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {plan.features?.map((f: string, findex: number) => (
                      <div key={findex} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--clr-text)' }}>
                        <Check size={15} color="var(--clr-accent)" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <Button href="/contact" variant={plan.isPopular ? 'primary' : 'secondary'} style={{ width: '100%' }}>{isAr ? 'ابدأ الآن' : 'Get Started'}</Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact CTA */}
        <section style={{
          background: 'linear-gradient(135deg, #080810, #0f0f1a, #16162a)',
          borderRadius: '24px',
          padding: '64px 48px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '36px', color: '#eeeeff', marginBottom: '16px' }}>{isAr ? 'هل أنت مستعد لبدء مشروعك؟' : 'Ready to Start Your Project?'}</h2>
          <p style={{ color: '#8888aa', fontSize: '18px', maxWidth: '560px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            {isAr ? 'تواصل مع فريقنا لمناقشة متطلباتك وسنرسل لك عرضاً تفصيلياً خلال 24 ساعة.' : 'Contact our team to discuss your requirements and receive a detailed proposal within 24 hours.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <Button href="/contact" variant="primary" size="lg" icon={<ArrowRight size={18} />}>{isAr ? 'اطلب عرض سعر مجاني' : 'Request a Free Quote'}</Button>
            <Button href="/contact" variant="secondary" size="lg" icon={<MessageSquare size={18} />}>{isAr ? 'تحدث معنا' : 'Chat with Us'}</Button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
            {service.contactEmail && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8888aa', fontSize: '14px' }}>
                <Mail size={16} color="var(--clr-primary)" />
                {service.contactEmail}
              </div>
            )}
            {service.contactPhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8888aa', fontSize: '14px' }}>
                <Phone size={16} color="var(--clr-primary)" />
                {service.contactPhone}
              </div>
            )}
            {(!service.contactEmail && !service.contactPhone) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8888aa', fontSize: '14px' }}>
                <Mail size={16} color="var(--clr-primary)" />
                contact@troveseek.com
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
