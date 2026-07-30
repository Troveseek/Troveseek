"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '@/app/admin/form.module.css';

export default function InviteUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'CLIENT',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const json = await res.json();
      if (res.ok) {
        alert('User invited successfully! Their temporary password is: TempPassword123!');
        router.push('/admin/users');
      } else {
        setError(json.error || 'Failed to invite user');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/admin/users">
          <Button variant="ghost" icon={<ArrowLeft size={20} />} />
        </Link>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>
          Invite User
        </h1>
      </div>

      <Card>
        <CardHeader style={{ padding: '24px', borderBottom: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={20} color="var(--clr-primary)" />
          <div>
            <h2 style={{ margin: 0, fontSize: '18px' }}>Account Details</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--clr-text-muted)' }}>
              Create a new account for a client or employee.
            </p>
          </div>
        </CardHeader>
        <CardBody style={{ padding: '24px' }}>
          {error && (
            <div style={{ padding: '12px', background: 'rgba(255, 60, 60, 0.1)', color: '#ff4444', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className={styles.formGrid} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full Name</label>
              <input 
                type="text" 
                className={styles.formInput} 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Jane Doe"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email Address</label>
              <input 
                type="email" 
                className={styles.formInput} 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="jane@example.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Role / Access Level</label>
              <select 
                className={styles.formInput} 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="CLIENT">Client (Customer Access Only)</option>
                <option value="GUEST">Guest (Limited Access)</option>
                <option value="EMPLOYEE">Employee (Internal Tools)</option>
                <option value="ADMIN">Admin (Full Dashboard Access)</option>
                <option value="SUPER_ADMIN">Super Admin (System Settings)</option>
              </select>
            </div>
            
            <div style={{ marginTop: '12px', padding: '16px', background: 'var(--clr-surface-elevated)', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🔑</span>
                The new user will be assigned a temporary password automatically: <strong>TempPassword123!</strong>
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending Invite...' : 'Create Account'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
