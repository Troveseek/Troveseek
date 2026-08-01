"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Save, Loader, ShieldAlert, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    subject: '',
    content: '',
    status: 'DRAFT'
  });

  useEffect(() => {
    fetch(`/api/marketing/campaigns/${id}`)
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          setForm({
            subject: res.data.subject,
            content: res.data.content,
            status: res.data.status
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (isDraft: boolean) => {
    if (!form.subject || !form.content) {
      setError('Subject and content are required.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/marketing/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
        })
      });

      if (!res.ok) throw new Error('Failed to update');
      
      if (!isDraft && form.status !== 'SENT') {
        const sendRes = await fetch(`/api/marketing/campaigns/${id}/send`, { method: 'POST' });
        if (!sendRes.ok) {
          toast.error('Saved, but failed to send email');
        } else {
          toast.success('Campaign sent successfully');
        }
      } else {
        toast.success('Campaign updated');
      }

      router.push('/admin/marketing');
      router.refresh();
    } catch (e: any) {
      setError(e.message || 'Failed to update campaign.');
    } finally {
      setIsSubmitting(false);
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
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Edit Campaign</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {form.status === 'DRAFT' && (
            <>
              <Button variant="secondary" icon={isSubmitting ? <Loader className="spin" size={16} /> : <Save size={16} />} onClick={() => handleSubmit(true)} disabled={isSubmitting}>
                Save Draft
              </Button>
              <Button variant="primary" icon={<Send size={16} />} onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                Send to Subscribers
              </Button>
            </>
          )}
          {form.status === 'SENT' && (
             <Button variant="secondary" icon={<ArrowLeft size={16} />} onClick={() => router.push('/admin/marketing')}>
                Go Back
             </Button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
          <ShieldAlert size={18} /> {error}
        </div>
      )}
      
      {form.status === 'SENT' && (
        <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          This campaign has already been sent and is read-only.
        </div>
      )}

      <Card>
        <CardBody style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Email Subject *</label>
            <input type="text" value={form.subject} disabled={form.status === 'SENT'} onChange={e => setForm({...form, subject: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px', opacity: form.status === 'SENT' ? 0.6 : 1 }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Email Content (HTML allowed) *</label>
            <textarea value={form.content} disabled={form.status === 'SENT'} onChange={e => setForm({...form, content: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px', minHeight: '300px', fontFamily: 'monospace', opacity: form.status === 'SENT' ? 0.6 : 1 }} />
          </div>
          
        </CardBody>
      </Card>
    </div>
  );
}
