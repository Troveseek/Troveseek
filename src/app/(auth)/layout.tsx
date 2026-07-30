import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold'
            }}>T</div>
            <span style={{ 
              fontFamily: 'var(--font-display)', 
              fontWeight: 700, 
              fontSize: '24px', 
              color: 'var(--clr-text)',
              letterSpacing: '-0.02em'
            }}>TroveSeek</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
