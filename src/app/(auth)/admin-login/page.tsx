"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Mail, Lock, ArrowRight, Loader, ShieldAlert } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        loginType: 'admin',
      });

      if (result?.error) {
        throw new Error(result.error || 'Invalid credentials');
      }

      // Use getSession() which correctly reads the freshly-set session cookie
      const session = await getSession();
      const role = (session?.user as any)?.role;

      if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'EMPLOYEE') {
        router.push('/admin');
        router.refresh();
      } else {
        setError('Access denied. Insufficient privileges.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="glass">
      <CardHeader style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ background: 'var(--clr-primary-dim)', color: 'var(--clr-primary)', padding: '8px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ShieldAlert size={14} /> Admin Portal
        </div>
        <CardTitle style={{ fontSize: '24px' }}>Administrator Login</CardTitle>
        <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '8px' }}>
          Authorized personnel only.
        </p>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{ padding: '12px 16px', background: 'var(--clr-danger-light, #fee2e2)', color: 'var(--clr-danger, #ef4444)', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} /> {error}
            </div>
          )}

          <Input 
            label="Work Email Address" 
            type="email" 
            placeholder="admin@troveseek.com" 
            iconLeft={<Mail size={16} />}
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isLoading}
          />
          
          <div>
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              iconLeft={<Lock size={16} />}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" size="lg" variant="primary" style={{ width: '100%', marginTop: '8px' }} icon={isLoading ? <Loader className="spin" size={18} /> : <ArrowRight size={18} />} disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Access Dashboard'}
          </Button>
        </CardBody>
      </form>
    </Card>
  );
}
