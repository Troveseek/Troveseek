import React from 'react';
import ClientHeader from '@/components/layout/ClientHeader';
import ClientFooter from '@/components/layout/ClientFooter';
import db from '@/lib/db';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { Providers } from '@/components/auth/Providers';
import LiveChatWidget from '@/components/ui/LiveChatWidget';
import CookieConsent from '@/components/ui/CookieConsent';

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  let siteName = "TroveSeek";
  let siteLogoLight = "";
  let siteLogoDark = "";
  let isMaintenance = false;
  let maintenanceMessage = "";
  let bypassIps: string[] = [];
  let requireCookieConsent = false;
  let privacyUrl = "";
  let termsUrl = "";
  
  try {
    const settings = await db.siteSetting.findMany({ 
      where: { key: { in: ['site_name', 'site_logo_light', 'site_logo_dark', 'maintenance_mode', 'maintenance_message', 'maintenance_bypass_ips', 'legal_cookie', 'legal_privacy', 'legal_terms'] } } 
    });
    for (const s of settings) {
      if (s.key === 'site_name') siteName = s.value;
      if (s.key === 'site_logo_light') siteLogoLight = s.value;
      if (s.key === 'site_logo_dark') siteLogoDark = s.value;
      if (s.key === 'maintenance_mode') isMaintenance = s.value === 'true';
      if (s.key === 'maintenance_message') maintenanceMessage = s.value;
      if (s.key === 'maintenance_bypass_ips') bypassIps = s.value.split(',').map(ip => ip.trim());
      if (s.key === 'legal_cookie') requireCookieConsent = s.value === 'true';
      if (s.key === 'legal_privacy') privacyUrl = s.value;
      if (s.key === 'legal_terms') termsUrl = s.value;
    }
  } catch(e) { console.error(e) }

  // Check Maintenance Mode
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
  
  const STAFF_ROLES = [
    'SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'MARKETING', 
    'SUPPORT', 'CONTENT_EDITOR', 'FINANCE', 'EMPLOYEE'
  ];
  
  const isAdmin = session?.user && STAFF_ROLES.includes((session.user as any).role);
  const isBypassed = bypassIps.includes(ip);

  if (isMaintenance && !isAdmin && !isBypassed) {
    return (
      <div style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
        minHeight: '100vh', background: 'var(--clr-background)', color: 'var(--clr-text)', padding: '20px', textAlign: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        
        {/* Background Decorative Elements */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'var(--clr-primary)', opacity: 0.05, filter: 'blur(100px)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'var(--clr-accent)', opacity: 0.05, filter: 'blur(100px)', borderRadius: '50%' }}></div>

        <div style={{ 
          background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', 
          padding: '48px 40px', borderRadius: '24px', maxWidth: '540px', width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.05)', position: 'relative', zIndex: 1
        }}>
          {/* Site Logo */}
          <div style={{ marginBottom: '32px' }}>
            {siteLogoDark || siteLogoLight ? (
              <img 
                src={siteLogoDark || siteLogoLight} 
                alt={siteName} 
                style={{ height: '48px', objectFit: 'contain', margin: '0 auto' }} 
              />
            ) : (
              <span style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'var(--font-display)', color: 'var(--clr-text)' }}>
                {siteName}
              </span>
            )}
          </div>

          <div style={{ 
            background: 'var(--clr-danger-light, #fee2e2)', color: 'var(--clr-danger, #ef4444)', 
            width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', margin: '0 auto 24px',
            animation: 'pulse 2s infinite'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          
          <h1 style={{ fontSize: '28px', margin: '0 0 16px 0', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.5px' }}>
            System Maintenance
          </h1>
          
          <p style={{ color: 'var(--clr-text-muted)', lineHeight: '1.6', margin: '0 0 32px 0', fontSize: '15px' }}>
            {maintenanceMessage || 'We are currently upgrading our systems to serve you better. We will be back online shortly. Thank you for your patience.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: 'var(--clr-danger, #ef4444)', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--clr-danger, #ef4444)', textTransform: 'uppercase', letterSpacing: '1px' }}>System Offline</span>
          </div>
        </div>

        {/* Footer for Admins */}
        <div style={{ marginTop: '32px', color: 'var(--clr-text-muted)', fontSize: '13px', position: 'relative', zIndex: 1 }}>
          Are you an administrator? <a href="/login" style={{ color: 'var(--clr-primary)', textDecoration: 'none', fontWeight: 500 }}>Login here</a> to bypass.
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}} />
      </div>
    );
  }

  return (
    <Providers>
      <div className="client-layout">
        <ClientHeader siteName={siteName} siteLogoLight={siteLogoLight} siteLogoDark={siteLogoDark} />
        <main style={{ minHeight: '100vh' }}>
          {children}
        </main>
        <ClientFooter siteName={siteName} siteLogoLight={siteLogoLight} siteLogoDark={siteLogoDark} privacyUrl={privacyUrl} termsUrl={termsUrl} />
        <LiveChatWidget />
        {requireCookieConsent && <CookieConsent privacyUrl={privacyUrl} />}
      </div>
    </Providers>
  );
}
