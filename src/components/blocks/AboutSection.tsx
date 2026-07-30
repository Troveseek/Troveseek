import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Target, Lightbulb, Globe, Award } from 'lucide-react';
import db from '@/lib/db';
import { getLocale } from 'next-intl/server';

export async function AboutSection() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const settings = await db.siteSetting.findMany({
    where: {
      key: { in: [
        'about_title', 'about_subtitle', 'about_description', 
        'about_mission', 'about_vision', 'about_cta_label', 'about_cta_url',
        'about_stat1_value', 'about_stat1_label', 'about_stat2_value', 'about_stat2_label',
        'about_stat3_value', 'about_stat3_label', 'about_stat4_value', 'about_stat4_label',
        'about_title_ar', 'about_subtitle_ar', 'about_description_ar',
        'about_mission_ar', 'about_vision_ar', 'about_cta_label_ar',
        'about_stat1_value_ar', 'about_stat1_label_ar', 'about_stat2_value_ar', 'about_stat2_label_ar',
        'about_stat3_value_ar', 'about_stat3_label_ar', 'about_stat4_value_ar', 'about_stat4_label_ar'
      ] }
    }
  });

  const getSetting = (key: string, defaultVal: string) => settings.find(s => s.key === key)?.value || defaultVal;
  const getLocalized = (key: string, defaultVal: string) => {
    if (isAr) {
      const arVal = getSetting(`${key}_ar`, '');
      if (arVal) return arVal;
    }
    return getSetting(key, defaultVal);
  };

  const title = getLocalized('about_title', 'Empowering Your Digital Transformation');
  const subtitle = getLocalized('about_subtitle', 'About TroveSeek');
  const desc = getLocalized('about_description', 'TroveSeek is a global enterprise platform unifying digital commerce, SaaS distribution, and professional IT services.');
  const mission = getLocalized('about_mission', 'Simplify complex technology for businesses globally.');
  const vision = getLocalized('about_vision', 'Be the leading digital ecosystem worldwide.');
  const ctaLabel = getLocalized('about_cta_label', 'Learn More About Us');
  const ctaUrl = getSetting('about_cta_url', '/about');

  return (
    <section style={{ padding: '96px 32px', background: 'var(--clr-bg)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '64px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Left: Text Content */}
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            {subtitle}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, marginBottom: '24px', lineHeight: 1.2 }}>
            {title}
          </h2>
          <p style={{ fontSize: '18px', color: 'var(--clr-text-muted)', lineHeight: 1.7, marginBottom: '32px' }}>
            {desc}
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ color: 'var(--clr-primary)', background: 'var(--clr-primary-dim)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={24} /></div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{isAr ? 'مهمتنا' : 'Our Mission'}</h4>
                <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)', margin: 0 }}>{mission}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ color: 'var(--clr-accent)', background: 'rgba(0,229,176,0.1)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lightbulb size={24} /></div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{isAr ? 'رؤيتنا' : 'Our Vision'}</h4>
                <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)', margin: 0 }}>{vision}</p>
              </div>
            </div>
          </div>
          
          {ctaLabel && ctaUrl && (
            <Link href={ctaUrl} style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="lg">{ctaLabel}</Button>
            </Link>
          )}
        </div>

        {/* Right: Stats & Visual */}
        <div style={{ flex: '1 1 400px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { value: getLocalized('about_stat1_value', '150+'), label: getLocalized('about_stat1_label', 'Countries Served'), icon: <Globe size={20} color="var(--clr-primary)" /> },
            { value: getLocalized('about_stat2_value', '10,000+'), label: getLocalized('about_stat2_label', 'Digital Products'), icon: <Target size={20} color="var(--clr-accent)" /> },
            { value: getLocalized('about_stat3_value', '500+'), label: getLocalized('about_stat3_label', 'SaaS Solutions'), icon: <Lightbulb size={20} color="#ffaa00" /> },
            { value: getLocalized('about_stat4_value', '99.9%'), label: getLocalized('about_stat4_label', 'Uptime'), icon: <Award size={20} color="#ff4444" /> },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'var(--clr-surface)',
              border: '1px solid var(--clr-border)',
              borderRadius: '16px',
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: 'var(--shadow-card)',
              transform: i % 2 !== 0 ? 'translateY(24px)' : 'none'
            }}>
              <div style={{ marginBottom: '16px' }}>{stat.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, color: 'var(--clr-text)', marginBottom: '8px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--clr-text-muted)', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
