"use client";

import React, { useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Save, Loader, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const METHOD_COLORS: Record<string, string> = {
  'Stripe': 'var(--clr-primary)',
  'Baridi Mob': '#00e5b0',
  'Crypto': '#ffaa00',
  'Binance': '#f3ba2f',
};
const ALL_METHODS = ['Stripe', 'Baridi Mob', 'Binance', 'Crypto'];

export default function NewCountryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [editForm, setEditForm] = useState({
    code: '',
    name: '',
    nameAr: '',
    currency: 'USD',
    taxRate: 0,
    methods: '[]',
    defaultLanguage: 'en',
    isActive: true
  });

  const handleMethodToggle = (method: string) => {
    try {
      let current = JSON.parse(editForm.methods || '[]');
      if (current.includes(method)) {
        current = current.filter((m: string) => m !== method);
      } else {
        current.push(method);
      }
      setEditForm({ ...editForm, methods: JSON.stringify(current) });
    } catch (e) {
      setEditForm({ ...editForm, methods: JSON.stringify([method]) });
    }
  };

  const handleSubmit = async () => {
    if (!editForm.name || !editForm.code || !editForm.currency) {
      setError('Please fill in all required fields (Name, Code, Currency).');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (!res.ok) throw new Error('Failed to save');
      
      toast.success('Country added successfully');
      router.push('/admin/countries');
      router.refresh();
    } catch (e) {
      setError('Failed to add country. Please try again.');
      toast.error('Failed to save country');
    } finally {
      setIsSubmitting(false);
    }
  };

  let parsedMethods: string[] = [];
  try {
    parsedMethods = JSON.parse(editForm.methods || '[]');
  } catch(e) {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Link href="/admin/countries" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--clr-text-muted)', fontSize: '14px', textDecoration: 'none', marginBottom: '8px' }}>
            <ArrowLeft size={14} /> Back to Countries
          </Link>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Add New Country</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="primary" icon={isSubmitting ? <Loader className="spin" size={16} /> : <Save size={16} />} onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Country'}
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
              <h3 style={{ margin: 0, fontSize: '18px', borderBottom: '1px solid var(--clr-border)', paddingBottom: '12px' }}>General Information</h3>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Country Name (EN) *</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }} placeholder="e.g. United States" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Country Name (AR)</label>
                <input type="text" dir="rtl" value={editForm.nameAr || ''} onChange={e => setEditForm({...editForm, nameAr: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }} placeholder="الولايات المتحدة" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>ISO Code *</label>
                  <input type="text" value={editForm.code} onChange={e => setEditForm({...editForm, code: e.target.value.toLowerCase()})} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px', textTransform: 'lowercase' }} placeholder="us" maxLength={2} />
                  <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)', marginTop: '6px' }}>2-letter ISO code</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Default Language</label>
                  <select value={editForm.defaultLanguage} onChange={e => setEditForm({...editForm, defaultLanguage: e.target.value})} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }}>
                    <option value="en">English (en)</option>
                    <option value="ar">Arabic (ar)</option>
                    <option value="fr">French (fr)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial & Settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', borderBottom: '1px solid var(--clr-border)', paddingBottom: '12px' }}>Financial & Settings</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Currency *</label>
                  <input type="text" value={editForm.currency} onChange={e => setEditForm({...editForm, currency: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px', textTransform: 'uppercase' }} placeholder="USD" maxLength={3} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Tax Rate (%)</label>
                  <input type="number" value={editForm.taxRate} onChange={e => setEditForm({...editForm, taxRate: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '12px', color: 'var(--clr-text-muted)' }}>Enabled Payment Methods</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {ALL_METHODS.map(method => {
                    const active = parsedMethods.includes(method);
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => handleMethodToggle(method)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '999px',
                          border: `1px solid ${active ? (METHOD_COLORS[method] || 'var(--clr-primary)') : 'var(--clr-border)'}`,
                          background: active ? `${METHOD_COLORS[method] || 'var(--clr-primary)'}15` : 'transparent',
                          color: active ? (METHOD_COLORS[method] || 'var(--clr-primary)') : 'var(--clr-text-muted)',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--clr-surface-elevated)', borderRadius: '8px', marginTop: 'auto' }}>
                <div>
                  <span style={{ fontSize: '15px', fontWeight: 500, display: 'block' }}>Country Active</span>
                  <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>Users from this country can place orders</span>
                </div>
                <input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm({...editForm, isActive: e.target.checked})} style={{ accentColor: 'var(--clr-primary)', width: '20px', height: '20px', cursor: 'pointer' }} />
              </div>
            </div>
          </div>
          
        </CardBody>
      </Card>
    </div>
  );
}
