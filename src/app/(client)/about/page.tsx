import React from 'react';
import { AboutSection } from '@/components/blocks/AboutSection';
import { CTASection } from '@/components/blocks/CTASection';
import { getLocale } from 'next-intl/server';

export const metadata = {
  title: 'About Us | TroveSeek',
  description: 'Learn more about TroveSeek, our mission, vision, and the core values that drive us.',
};

export default async function AboutPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--clr-bg)' }}>
      {/* Page Header */}
      <div style={{ 
        padding: '120px 32px 64px', 
        background: 'linear-gradient(135deg, var(--clr-primary-dim), var(--clr-bg))',
        textAlign: 'center'
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 800, color: 'var(--clr-text)', margin: '0 0 16px' }}>
          {isAr ? 'قصتنا' : 'Our Story'}
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--clr-text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          {isAr ? 'اكتشف كيف تقوم TroveSeek بتحويل المشهد الرقمي.' : 'Discover how TroveSeek is transforming the digital landscape.'}
        </p>
      </div>

      {/* Main Content from DB Settings */}
      <AboutSection />

      {/* Reusable CTA */}
      <CTASection />
    </div>
  );
}
