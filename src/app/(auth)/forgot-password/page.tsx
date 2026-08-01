"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Mail, ArrowLeft, Send, Loader } from 'lucide-react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      toast.error(isAr ? 'الرجاء إدخال البريد الإلكتروني' : 'Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || 'Failed to send reset link');
      }

      setIsSuccess(true);
      toast.success(isAr ? 'تم إرسال رابط إعادة التعيين بنجاح' : 'Reset link sent successfully');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="glass">
      <CardHeader style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CardTitle style={{ fontSize: '24px' }}>{isAr ? 'إعادة تعيين كلمة المرور' : 'Reset password'}</CardTitle>
        <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '8px' }}>
          {isAr ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.' : "Enter your email address and we'll send you a link to reset your password."}
        </p>
      </CardHeader>
      
      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {isSuccess ? (
          <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', textAlign: 'center', color: '#10b981' }}>
            {isAr ? 'إذا كان البريد الإلكتروني مسجلاً لدينا، فستتلقى رابط إعادة التعيين قريباً.' : 'If an account exists, a reset link was sent to your email.'}
          </div>
        ) : (
          <>
            <Input 
              label={isAr ? 'البريد الإلكتروني' : 'Email Address'} 
              type="email" 
              placeholder="name@company.com" 
              iconLeft={<Mail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button size="lg" variant="primary" style={{ width: '100%', marginTop: '8px' }} icon={isLoading ? <Loader className="spin" size={18} /> : <Send size={18} />} onClick={handleSubmit} disabled={isLoading}>
              {isAr ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link'}
            </Button>
          </>
        )}
      </CardBody>

      <CardFooter style={{ justifyContent: 'center', borderTop: 'none', paddingBottom: '32px' }}>
        <Link href="/login" style={{ color: 'var(--clr-text-muted)', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}>
          <ArrowLeft size={16} />
          {isAr ? 'العودة لتسجيل الدخول' : 'Back to log in'}
        </Link>
      </CardFooter>
    </Card>
  );
}
