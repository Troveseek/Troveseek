"use client";

import React, { useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Save, Loader, ShieldAlert, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NewCampaignPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    subject: '',
    content: '',
  });

  const handleSubmit = async (isDraft: boolean) => {
    if (!form.subject || !form.content) {
      setError('Subject and content are required.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status: 'DRAFT',
        })
      });

      if (!res.ok) throw new Error('Failed to save');
      
      const { data } = await res.json();
      
      if (!isDraft) {
        // Send it
        const sendRes = await fetch(`/api/marketing/campaigns/${data.id}/send`, { method: 'POST' });
        if (!sendRes.ok) {
          toast.error('Saved as draft, but failed to send email');
        } else {
          toast.success('Campaign sent successfully');
        }
      } else {
        toast.success('Campaign draft saved');
      }

      router.push('/admin/marketing');
      router.refresh();
    } catch (e: any) {
      setError(e.message || 'Failed to save campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Link href="/admin/marketing" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--clr-text-muted)', fontSize: '14px', textDecoration: 'none', marginBottom: '8px' }}>
            <ArrowLeft size={14} /> Back to Marketing
          </Link>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Compose Campaign</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={isSubmitting ? <Loader className="spin" size={16} /> : <Save size={16} />} onClick={() => handleSubmit(true)} disabled={isSubmitting}>
            Save Draft
          </Button>
          <Button variant="primary" icon={<Send size={16} />} onClick={() => handleSubmit(false)} disabled={isSubmitting}>
            Send to Subscribers
          </Button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
          <ShieldAlert size={18} /> {error}
        </div>
      )}

      <Card>
        <CardBody style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Email Subject *</label>
            <input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }} placeholder="Big Summer Sale!" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Email Content (HTML allowed) *</label>
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px', minHeight: '300px', fontFamily: 'monospace' }} placeholder="<h1>Hello!</h1>..." />
          </div>
          
        </CardBody>
      </Card>
    </div>
  );
}
