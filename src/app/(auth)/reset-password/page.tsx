"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Lock, Loader, ArrowRight } from 'lucide-react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      toast.error(isAr ? 'رابط غير صالح' : 'Invalid reset link');
    }
  }, [token, email, isAr]);

  const handleSubmit = async () => {
    if (!password || password.length < 8) {
      toast.error(isAr ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    if (!token || !email) {
      toast.error(isAr ? 'رابط غير صالح' : 'Invalid reset link');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password })
      });

      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || 'Failed to reset password');
      }

      setIsSuccess(true);
      toast.success(isAr ? 'تم إعادة تعيين كلمة المرور بنجاح' : 'Password reset successfully');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <Card variant="glass">
        <CardHeader style={{ textAlign: 'center' }}>
          <CardTitle>{isAr ? 'رابط غير صالح' : 'Invalid Link'}</CardTitle>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '8px' }}>
            {isAr ? 'الرابط الذي استخدمته غير صالح أو منتهي الصلاحية.' : 'The link you used is invalid or has expired.'}
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card variant="glass">
      <CardHeader style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CardTitle style={{ fontSize: '24px' }}>{isAr ? 'كلمة مرور جديدة' : 'New Password'}</CardTitle>
        <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '8px' }}>
          {isAr ? 'أدخل كلمة المرور الجديدة أدناه.' : "Enter your new password below."}
        </p>
      </CardHeader>
      
      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {isSuccess ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: '#10b981', marginBottom: '24px' }}>
              {isAr ? 'تم إعادة تعيين كلمة المرور الخاصة بك بنجاح. يمكنك الآن تسجيل الدخول.' : 'Your password has been reset successfully. You can now log in.'}
            </div>
            <Button variant="primary" style={{ width: '100%' }} onClick={() => router.push('/login')} icon={<ArrowRight size={18} />}>
              {isAr ? 'الذهاب لتسجيل الدخول' : 'Go to Login'}
            </Button>
          </div>
        ) : (
          <>
            <Input 
              label={isAr ? 'كلمة المرور الجديدة' : 'New Password'} 
              type="password" 
              placeholder="••••••••" 
              iconLeft={<Lock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input 
              label={isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'} 
              type="password" 
              placeholder="••••••••" 
              iconLeft={<Lock size={16} />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button size="lg" variant="primary" style={{ width: '100%', marginTop: '8px' }} icon={isLoading ? <Loader className="spin" size={18} /> : <Lock size={18} />} onClick={handleSubmit} disabled={isLoading}>
              {isAr ? 'حفظ كلمة المرور' : 'Save Password'}
            </Button>
          </>
        )}
      </CardBody>
    </Card>
  );
}
