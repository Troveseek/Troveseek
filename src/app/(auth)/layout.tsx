import React from 'react';
import Link from 'next/link';
import db from '@/lib/db';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  let siteName = "TroveSeek";
  let siteLogo = "";

  try {
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ['site_name', 'site_logo_dark', 'site_logo_light'] } }
    });
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    siteName = map.site_name || siteName;
    siteLogo = map.site_logo_dark || map.site_logo_light || "";
  } catch (e) {
    console.error("Error fetching branding in AuthLayout", e);
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at center, var(--clr-primary-dim) 0%, var(--clr-bg) 100%)'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '12px', textDecoration: 'none' }}>
            {siteLogo ? (
              <img
                src={siteLogo}
                alt={siteName}
                style={{
                  maxHeight: '44px',
                  maxWidth: '220px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            ) : (
              <div style={{ 
                width: '36px', 
                height: '36px', 
                background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontFamily: 'var(--font-brand)',
                fontWeight: 800,
                fontSize: '18px'
              }}>{siteName.charAt(0)}</div>
            )}
            <span style={{ 
              fontFamily: 'var(--font-brand)', 
              fontWeight: 800, 
              fontSize: '24px', 
              color: 'var(--clr-text)',
              letterSpacing: '-0.02em'
            }}>{siteName}</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
