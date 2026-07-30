import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { getLocale } from 'next-intl/server';

export default async function ForgotPasswordPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  return (
    <Card variant="glass">
      <CardHeader style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CardTitle style={{ fontSize: '24px' }}>{isAr ? 'إعادة تعيين كلمة المرور' : 'Reset password'}</CardTitle>
        <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '8px' }}>
          {isAr ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.' : "Enter your email address and we'll send you a link to reset your password."}
        </p>
      </CardHeader>
      
      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Input 
          label={isAr ? 'البريد الإلكتروني' : 'Email Address'} 
          type="email" 
          placeholder="name@company.com" 
          iconLeft={<Mail size={16} />}
        />

        <Button size="lg" variant="primary" style={{ width: '100%', marginTop: '8px' }} icon={<Send size={18} />}>
          {isAr ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link'}
        </Button>
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
