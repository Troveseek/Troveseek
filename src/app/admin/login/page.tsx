"use client";

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [siteName, setSiteName] = useState('TroveSeek');
  const [siteLogoLight, setSiteLogoLight] = useState('');
  const [siteLogoDark, setSiteLogoDark] = useState('');

  React.useEffect(() => {
    fetch('/api/settings?keys=site_name,site_logo_light,site_logo_dark')
      .then(res => res.json())
      .then(data => {
        if (data.site_name) setSiteName(data.site_name);
        if (data.site_logo_light) setSiteLogoLight(data.site_logo_light);
        if (data.site_logo_dark) setSiteLogoDark(data.site_logo_dark);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        loginType: 'admin',
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeLogo = siteLogoDark || siteLogoLight;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--clr-bg)',
      padding: '24px',
    }}>
      {/* Background gradient effects */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,111,255,0.15) 0%, transparent 70%)',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '440px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {activeLogo ? (
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <img
                src={activeLogo}
                alt={siteName}
                style={{
                  maxHeight: '48px',
                  maxWidth: '220px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>
          ) : (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px', height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
              marginBottom: '16px',
              boxShadow: '0 0 40px rgba(124,111,255,0.3)',
            }}>
              <Shield size={28} color="#fff" />
            </div>
          )}
          <h1 style={{
            fontSize: '26px', fontWeight: 800,
            fontFamily: 'var(--font-brand)',
            color: 'var(--clr-text)', marginBottom: '8px',
            letterSpacing: '-0.02em'
          }}>
            {siteName} Admin
          </h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>
            Secure enterprise management portal
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'var(--clr-surface)',
          border: '1px solid var(--clr-border)',
          borderRadius: '16px',
          padding: '36px',
          boxShadow: '0 8px 48px rgba(0,0,0,0.2)',
        }}>
          {/* Error Alert */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
              background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
              color: 'var(--clr-danger)', fontSize: '13px',
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: 600,
                color: 'var(--clr-text-muted)', marginBottom: '8px',
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--clr-text-muted)',
                }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@troveseek.com"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 14px 11px 40px',
                    background: 'var(--clr-surface-elevated)',
                    border: '1px solid var(--clr-border)',
                    borderRadius: '10px',
                    color: 'var(--clr-text)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--clr-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--clr-border)'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block', fontSize: '13px', fontWeight: 600,
                color: 'var(--clr-text-muted)', marginBottom: '8px',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--clr-text-muted)',
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 44px 11px 40px',
                    background: 'var(--clr-surface-elevated)',
                    border: '1px solid var(--clr-border)',
                    borderRadius: '10px',
                    color: 'var(--clr-text)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--clr-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--clr-border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none', border: 'none',
                    cursor: 'pointer', color: 'var(--clr-text-muted)', padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', padding: '13px',
                background: isLoading
                  ? 'var(--clr-text-muted)'
                  : 'linear-gradient(135deg, var(--clr-primary), #6c5ff7)',
                border: 'none', borderRadius: '10px',
                color: '#fff', fontSize: '15px', fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'opacity 0.2s, transform 0.1s',
              }}
              onMouseOver={(e) => { if (!isLoading) (e.target as HTMLElement).style.opacity = '0.9'; }}
              onMouseOut={(e) => { if (!isLoading) (e.target as HTMLElement).style.opacity = '1'; }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px', height: '16px', borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Authenticating...
                </>
              ) : (
                <>Sign In to Admin Portal <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--clr-text-muted)', fontSize: '12px' }}>
          Protected by TroveSeek Enterprise Security
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: var(--clr-text-muted); }
      `}</style>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-bg)' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '3px solid var(--clr-border)', borderTopColor: 'var(--clr-primary)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
