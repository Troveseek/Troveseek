"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Save, Loader, ShieldAlert, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    code: '',
    discount: 0,
    type: 'PERCENTAGE',
    appliesTo: 'ALL',
    maxUsage: '',
    expiry: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetch(`/api/marketing/coupons/${id}`)
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          setForm({
            code: res.data.code,
            discount: res.data.discount,
            type: res.data.type,
            appliesTo: res.data.appliesTo,
            maxUsage: res.data.maxUsage || '',
            expiry: res.data.expiry ? res.data.expiry.split('T')[0] : '',
            status: res.data.status
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!form.code || form.discount <= 0) {
      setError('Please provide a valid code and discount amount.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/marketing/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          maxUsage: form.maxUsage ? parseInt(form.maxUsage) : null,
          expiry: form.expiry ? new Date(form.expiry).toISOString() : null,
        })
      });

      if (!res.ok) throw new Error('Failed to update');
      
      toast.success('Coupon updated successfully');
      router.push('/admin/marketing');
      router.refresh();
    } catch (e: any) {
      setError(e.message);
      toast.error('Failed to update coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await fetch(`/api/marketing/coupons/${id}`, { method: 'DELETE' });
      toast.success('Coupon deleted');
      router.push('/admin/marketing');
      router.refresh();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}><Loader className="spin" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Link href="/admin/marketing" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--clr-text-muted)', fontSize: '14px', textDecoration: 'none', marginBottom: '8px' }}>
            <ArrowLeft size={14} /> Back to Marketing
          </Link>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Edit Coupon</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="danger" icon={<Trash2 size={16} />} onClick={handleDelete}>Delete</Button>
          <Button variant="primary" icon={isSubmitting ? <Loader className="spin" size={16} /> : <Save size={16} />} onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
          <ShieldAlert size={18} /> {error}
        </div>
      )}

      <Card>
        <CardBody style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* General Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', borderBottom: '1px solid var(--clr-border)', paddingBottom: '12px' }}>Coupon Details</h3>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Coupon Code *</label>
                <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px', textTransform: 'uppercase' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Discount Amount *</label>
                  <input type="number" value={form.discount} onChange={e => setForm({...form, discount: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Discount Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Applies To</label>
                <select value={form.appliesTo} onChange={e => setForm({...form, appliesTo: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }}>
                  <option value="ALL">All Categories</option>
                  <option value="PRODUCTS">Physical Products Only</option>
                  <option value="SAAS">SaaS Only</option>
                  <option value="SERVICES">Services Only</option>
                </select>
              </div>
            </div>

            {/* Usage & Expiry */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', borderBottom: '1px solid var(--clr-border)', paddingBottom: '12px' }}>Limits & Expiry</h3>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Max Usages (Optional)</label>
                <input type="number" value={form.maxUsage} onChange={e => setForm({...form, maxUsage: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }} placeholder="Leave blank for unlimited" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Expiry Date (Optional)</label>
                <input type="date" value={form.expiry} onChange={e => setForm({...form, expiry: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }}>
                  <option value="ACTIVE">Active</option>
                  <option value="DISABLED">Disabled</option>
                </select>
              </div>
            </div>
          </div>
          
        </CardBody>
      </Card>
    </div>
  );
}
