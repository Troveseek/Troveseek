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
      {/* Main Content from DB Settings */}
      <AboutSection />

      {/* Reusable CTA */}
      <CTASection />
    </div>
  );
}
