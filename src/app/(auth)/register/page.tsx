"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Mail, Lock, User, ArrowRight, Loader, ShieldAlert, KeyRound } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export default function RegisterPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [legalTerms, setLegalTerms] = useState<string | null>(null);
  const [legalPrivacy, setLegalPrivacy] = useState<string | null>(null);
  const [siteLogoLight, setSiteLogoLight] = useState<string | null>(null);
  const [siteLogoDark, setSiteLogoDark] = useState<string | null>(null);
  const [siteName, setSiteName] = useState('TroveSeek');

  useEffect(() => {
    fetch('/api/settings?keys=legal_terms,legal_privacy,site_logo_light,site_logo_dark,site_name')
      .then(res => res.json())
      .then(data => {
        if (data.legal_terms) setLegalTerms(data.legal_terms);
        if (data.legal_privacy) setLegalPrivacy(data.legal_privacy);
        if (data.site_logo_light) setSiteLogoLight(data.site_logo_light);
        if (data.site_logo_dark) setSiteLogoDark(data.site_logo_dark);
        if (data.site_name) setSiteName(data.site_name);
      })
      .catch(console.error);
  }, []);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError(isAr ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      let recaptchaToken = '';
      if (executeRecaptcha) {
        recaptchaToken = await executeRecaptcha('register_request_code');
      }

      const res = await fetch('/api/auth/register/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, recaptchaToken }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || (isAr ? 'فشل إرسال رمز التحقق' : 'Failed to send verification code'));
      }
      
      setStep('verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      setError(isAr ? 'الرجاء إدخال رمز صحيح مكون من 6 أرقام' : 'Please enter a valid 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      let recaptchaToken = '';
      if (executeRecaptcha) {
        recaptchaToken = await executeRecaptcha('register_verify');
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, code: verificationCode, recaptchaToken }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || (isAr ? 'فشل التسجيل' : 'Registration failed'));
      }
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        loginType: 'client'
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
    <Card variant="glass" className="register-card">
      <CardHeader style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: '16px' }}>
          {siteLogoLight || siteLogoDark ? (
            <>
              {siteLogoLight && <img src={siteLogoLight} alt={siteName} className={siteLogoDark ? 'logoLight' : ''} style={{ maxHeight: '48px', objectFit: 'contain' }} />}
              {siteLogoDark && <img src={siteLogoDark} alt={siteName} className={siteLogoLight ? 'logoDark' : ''} style={{ maxHeight: '48px', objectFit: 'contain' }} />}
            </>
          ) : (
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
              {siteName.charAt(0)}
            </div>
          )}
        </div>
        <CardTitle style={{ fontSize: '24px' }}>
          {step === 'details' ? (isAr ? 'إنشاء حساب جديد' : 'Create an account') : (isAr ? 'تأكيد البريد الإلكتروني' : 'Verify your email')}
        </CardTitle>
        <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '8px' }}>
          {step === 'details' 
            ? (isAr ? 'انضم إلى TroveSeek للبدء في شراء وبيع الأصول الرقمية' : 'Join TroveSeek to start buying and selling digital assets')
            : (isAr ? 'تحقق من بريدك الإلكتروني' : 'Verify your email address')}
        </p>
      </CardHeader>

      {step === 'details' ? (
        <form onSubmit={handleRequestCode}>
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
              icon={isLoading ? <Loader size={18} className="spin" /> : <ArrowRight size={18} />}
              disabled={isLoading}
            >
              {isLoading ? (isAr ? 'جاري التحقق...' : 'Verifying...') : (isAr ? 'الاستمرار' : 'Continue')}
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
            </div>
          </CardBody>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndRegister}>
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
            {error && (
              <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                <ShieldAlert size={16} /> {error}
              </div>
            )}
            
            <KeyRound size={48} style={{ color: 'var(--clr-primary)', margin: '0 auto' }} />
            <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)' }}>
              {isAr ? `لقد أرسلنا رمز تحقق إلى ${email}. الرجاء إدخاله أدناه لإكمال تسجيلك.` : `We've sent a verification code to ${email}. Please enter it below to complete your registration.`}
            </p>

            <Input
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value)}
              disabled={isLoading}
              style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '24px', fontWeight: 'bold' }}
              maxLength={6}
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <Button type="button" variant="ghost" onClick={() => setStep('details')} disabled={isLoading} style={{ flex: 1 }}>
                {isAr ? 'رجوع' : 'Back'}
              </Button>
              <Button type="submit" variant="primary" disabled={isLoading || verificationCode.length !== 6} style={{ flex: 2 }} icon={isLoading ? <Loader size={18} className="spin" /> : <ArrowRight size={18} />}>
                {isLoading ? (isAr ? 'جاري التحقق...' : 'Verifying...') : (isAr ? 'إنشاء حساب' : 'Create Account')}
              </Button>
            </div>
          </CardBody>
        </form>
      )}

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
