"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Mail, Lock, User, ArrowRight, Loader, ShieldAlert } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function RegisterPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [legalTerms, setLegalTerms] = useState<string | null>(null);
  const [legalPrivacy, setLegalPrivacy] = useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/settings?keys=legal_terms,legal_privacy')
      .then(res => res.json())
      .then(data => {
        if (data.legal_terms) setLegalTerms(data.legal_terms);
        if (data.legal_privacy) setLegalPrivacy(data.legal_privacy);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError(isAr ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || (isAr ? 'فشل التسجيل' : 'Registration failed'));
      }
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        throw new Error(isAr ? 'فشل تسجيل الدخول بعد التسجيل' : 'Failed to login after registration');
      }
      router.push('/profile');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/profile' });
  };

  return (
    <Card variant="glass">
      <CardHeader style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CardTitle style={{ fontSize: '24px' }}>{isAr ? 'أنشئ حساباً' : 'Create an account'}</CardTitle>
        <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '8px' }}>
          {isAr ? 'انضم إلى TroveSeek للبدء في شراء وبيع الأصول الرقمية' : 'Join TroveSeek to start buying and selling digital assets'}
        </p>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} /> {error}
            </div>
          )}

          <Input
            label={isAr ? 'الاسم الكامل *' : 'Full Name *'}
            type="text"
            placeholder={isAr ? 'جون دو' : 'John Doe'}
            iconLeft={<User size={16} />}
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={isLoading}
          />

          <Input
            label={isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
            type="email"
            placeholder="name@company.com"
            iconLeft={<Mail size={16} />}
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isLoading}
          />

          <div>
            <Input
              label={isAr ? 'كلمة المرور *' : 'Password *'}
              type="password"
              placeholder={isAr ? 'أنشئ كلمة مرور قوية' : 'Create a strong password'}
              iconLeft={<Lock size={16} />}
              hint={isAr ? 'يجب أن تتكون من 8 أحرف على الأقل.' : 'Must be at least 8 characters long.'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
            />
            {password.length > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                <div style={{ height: '4px', flex: 1, backgroundColor: 'var(--clr-success)', borderRadius: '2px' }}></div>
                <div style={{ height: '4px', flex: 1, backgroundColor: password.length >= 8 ? 'var(--clr-success)' : 'var(--clr-border)', borderRadius: '2px' }}></div>
                <div style={{ height: '4px', flex: 1, backgroundColor: 'var(--clr-border)', borderRadius: '2px' }}></div>
                <div style={{ height: '4px', flex: 1, backgroundColor: 'var(--clr-border)', borderRadius: '2px' }}></div>
              </div>
            )}
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginTop: '8px' }}>
            <input type="checkbox" style={{ marginTop: '4px' }} required disabled={isLoading} />
            <span style={{ color: 'var(--clr-text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
              {isAr ? 'أوافق على ' : 'I agree to the '}
              <a href={legalTerms || "/policies/terms"} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--clr-primary)' }}>{isAr ? 'شروط الخدمة' : 'Terms of Service'}</a>
              {isAr ? ' و ' : ' and '}
              <a href={legalPrivacy || "/policies/privacy"} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--clr-primary)' }}>{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</a>.
            </span>
          </label>

          <Button
            type="submit"
            size="lg"
            variant="primary"
            style={{ width: '100%', marginTop: '8px' }}
            icon={isLoading ? <Loader size={18} /> : <ArrowRight size={18} />}
            disabled={isLoading}
          >
            {isLoading ? (isAr ? 'جاري إنشاء الحساب...' : 'Creating Account...') : (isAr ? 'إنشاء حساب' : 'Create Account')}
          </Button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--clr-border)' }}></div>
            <span style={{ padding: '0 12px', fontSize: '13px', color: 'var(--clr-text-muted)' }}>{isAr ? 'أو سجل باستخدام' : 'Or register with'}</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--clr-border)' }}></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button type="button" onClick={handleGoogleSignIn} variant="secondary" style={{ width: '100%', background: 'transparent' }} disabled={isLoading}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </span>
            </Button>
            <Button type="button" variant="secondary" style={{ width: '100%', background: 'transparent' }} disabled={isLoading}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </span>
            </Button>
          </div>
        </CardBody>
      </form>

      <CardFooter style={{ justifyContent: 'center', borderTop: 'none', paddingBottom: '32px' }}>
        <span style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>
          {isAr ? 'هل لديك حساب بالفعل؟ ' : 'Already have an account? '}
          <Link href="/login" style={{ color: 'var(--clr-primary)', textDecoration: 'none', fontWeight: 500 }}>
            {isAr ? 'تسجيل الدخول' : 'Sign in'}
          </Link>
        </span>
      </CardFooter>
    </Card>
  );
}
