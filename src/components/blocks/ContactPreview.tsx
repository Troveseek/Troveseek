"use client";

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { LiveChatButton } from '@/components/ui/LiveChatButton';
import { Mail, Phone, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';

const MapComponent = dynamic(() => import('@/components/ui/MapComponent'), { ssr: false });

export function ContactPreview() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <section style={{ padding: '96px 32px', background: 'var(--clr-bg)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ background: 'linear-gradient(135deg, var(--clr-surface-2), var(--clr-surface))', border: '1px solid var(--clr-border)', borderRadius: '24px', padding: '64px', display: 'flex', gap: '64px', flexWrap: 'wrap', boxShadow: 'var(--shadow-card)' }}>
          
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
              {isAr ? 'تواصل معنا' : 'Get in Touch'}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, marginBottom: '24px' }}>
              {isAr ? 'دعنا نبني شيئاً مذهلاً معاً' : "Let's Build Something Amazing Together"}
            </h2>
            <p style={{ color: 'var(--clr-text-muted)', fontSize: '18px', lineHeight: 1.7, marginBottom: '40px' }}>
              {isAr ? 'هل لديك مشروع في ذهنك أو تحتاج إلى حلول برمجية للشركات؟ فريقنا مستعد لمساعدتك في التوسع.' : 'Have a project in mind or need enterprise software solutions? Our team is ready to help you scale.'}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'var(--clr-primary-dim)', color: 'var(--clr-primary)', padding: '12px', borderRadius: '12px' }}><Mail size={20} /></div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginBottom: '4px' }}>{isAr ? 'راسلنا' : 'Email Us'}</div>
                  <div style={{ fontWeight: 600 }}>contact@troveseek.com</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(0,229,176,0.1)', color: 'var(--clr-accent)', padding: '12px', borderRadius: '12px' }}><Phone size={20} /></div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginBottom: '4px' }}>{isAr ? 'اتصل بنا' : 'Call Us'}</div>
                  <div style={{ fontWeight: 600 }}>+1 (555) 234-5678</div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/contact" style={{ textDecoration: 'none' }}>
                <Button variant="primary">{isAr ? 'اذهب لصفحة التواصل' : 'Go to Contact Page'}</Button>
              </Link>
              <LiveChatButton />
            </div>
          </div>
          
          <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ borderRadius: '16px', flex: 1, minHeight: '300px', display: 'flex', overflow: 'hidden' }}>
              <MapComponent />
            </div>
          </div>
          
        </div>
        
      </div>
    </section>
  );
}
