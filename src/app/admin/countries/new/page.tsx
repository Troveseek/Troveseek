"use client";

import React, { useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ArrowLeft, Save, Loader, ShieldAlert, Sparkles, Plus, 
  X, Globe, DollarSign, Percent, CheckCircle2, CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  COUNTRY_PRESETS, POPULAR_CURRENCIES, STANDARD_PAYMENT_METHODS, 
  getCountryFlag, parsePaymentMethods 
} from '@/lib/data/countries';

export default function NewCountryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    code: '',
    name: '',
    nameAr: '',
    currency: 'USD',
    taxRate: 0,
    methods: ['Stripe'] as string[],
    defaultLanguage: 'en',
    isActive: true
  });

  const [customMethodInput, setCustomMethodInput] = useState('');

  const handleApplyPreset = (code: string) => {
    const preset = COUNTRY_PRESETS.find(p => p.code.toLowerCase() === code.toLowerCase());
    if (!preset) return;

    setForm({
      code: preset.code,
      name: preset.name,
      nameAr: preset.nameAr || '',
      currency: preset.currency,
      taxRate: preset.taxRate,
      methods: [...preset.methods],
      defaultLanguage: preset.defaultLanguage,
      isActive: true
    });
    setError('');
    toast.success(`Loaded preset for ${preset.name}`);
  };

  const handleToggleMethod = (method: string) => {
    setForm(prev => {
      const exists = prev.methods.includes(method);
      return {
        ...prev,
        methods: exists ? prev.methods.filter(m => m !== method) : [...prev.methods, method]
      };
    });
  };

  const handleAddCustomMethod = () => {
    const trimmed = customMethodInput.trim();
    if (!trimmed) return;
    if (form.methods.includes(trimmed)) {
      toast.error('Payment method already added');
      return;
    }
    setForm(prev => ({ ...prev, methods: [...prev.methods, trimmed] }));
    setCustomMethodInput('');
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.code.trim() || !form.currency.trim()) {
      setError('Please fill in Country Name, 2-letter ISO Code, and Currency.');
      return;
    }
    
    if (form.code.trim().length !== 2) {
      setError('ISO Code must be exactly 2 letters (e.g. DZ, US, GB, AE, SA).');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.toLowerCase().trim(),
          name: form.name.trim(),
          nameAr: form.nameAr.trim() || null,
          currency: form.currency.toUpperCase().trim(),
          taxRate: Number(form.taxRate) || 0,
          methods: form.methods,
          defaultLanguage: form.defaultLanguage,
          isActive: form.isActive
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create country');
      
      toast.success(`Country "${form.name}" created successfully`);
      router.push('/admin/countries');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to add country. Please try again.');
      toast.error(err.message || 'Failed to save country');
    } finally {
      setIsSubmitting(false);
    }
  };

  const flagEmoji = getCountryFlag(form.code);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Link href="/admin/countries" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--clr-text-muted)', fontSize: '14px', textDecoration: 'none', marginBottom: '8px' }}>
            <ArrowLeft size={14} /> Back to Countries
          </Link>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 700, margin: 0, color: 'var(--clr-text)' }}>
            Add New Country & Market
          </h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px', marginBottom: 0 }}>
            Configure localized pricing, tax rules, and localized payment gateways.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="ghost" onClick={() => router.push('/admin/countries')} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" icon={isSubmitting ? <Loader className="spin" size={16} /> : <Save size={16} />} onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving Country...' : 'Save & Publish Country'}
          </Button>
        </div>
      </div>

      {/* Quick Preset Selector Banner */}
      <Card style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--clr-text)' }}>
                Quick-Fill from Preset
              </div>
              <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                Select a country to instantly populate official ISO codes, Arabic names, currencies, and gateways.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              onChange={e => e.target.value && handleApplyPreset(e.target.value)}
              defaultValue=""
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--clr-border)',
                background: 'var(--clr-surface)',
                color: 'var(--clr-text)',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="" disabled>Choose a Preset...</option>
              {COUNTRY_PRESETS.map(p => (
                <option key={p.code} value={p.code}>
                  {getCountryFlag(p.code)} {p.name} ({p.currency} - {p.code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(239,68,68,0.3)' }}>
          <ShieldAlert size={20} /> {error}
        </div>
      )}

      {/* Main Grid: Form Left, Live Preview Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* General Information Card */}
          <Card>
            <CardBody style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--clr-border)', paddingBottom: '12px' }}>
                <Globe size={18} color="var(--clr-primary)" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--clr-text)' }}>Country Identity & Locale</h3>
              </div>

              {/* English Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--clr-text)' }}>
                  Country Name (English) *
                </label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }} 
                  placeholder="e.g. Algeria, United States, Saudi Arabia" 
                />
              </div>

              {/* Arabic Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--clr-text)' }}>
                  Country Name (Arabic)
                </label>
                <input 
                  type="text" 
                  dir="rtl" 
                  value={form.nameAr} 
                  onChange={e => setForm({ ...form, nameAr: e.target.value })} 
                  style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px', fontFamily: 'var(--font-arabic, inherit)' }} 
                  placeholder="مثال: الجزائر، المملكة العربية السعودية" 
                />
              </div>

              {/* ISO Code & Language */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--clr-text)' }}>
                    ISO 2-Letter Code *
                  </label>
                  <input 
                    type="text" 
                    value={form.code} 
                    onChange={e => setForm({ ...form, code: e.target.value.toLowerCase() })} 
                    style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px', textTransform: 'lowercase' }} 
                    placeholder="dz" 
                    maxLength={2} 
                  />
                  <p style={{ fontSize: '11px', color: 'var(--clr-text-muted)', marginTop: '4px' }}>
                    ISO-3166-1 alpha-2 (e.g. dz, us, gb, sa)
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--clr-text)' }}>
                    Default Language
                  </label>
                  <select 
                    value={form.defaultLanguage} 
                    onChange={e => setForm({ ...form, defaultLanguage: e.target.value })} 
                    style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }}
                  >
                    <option value="en">English (EN)</option>
                    <option value="ar">Arabic (العربية)</option>
                    <option value="fr">French (Français)</option>
                    <option value="de">German (Deutsch)</option>
                    <option value="es">Spanish (Español)</option>
                    <option value="tr">Turkish (Türkçe)</option>
                  </select>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Financial & Tax Settings */}
          <Card>
            <CardBody style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--clr-border)', paddingBottom: '12px' }}>
                <DollarSign size={18} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--clr-text)' }}>Currency & Taxation</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Currency */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--clr-text)' }}>
                    Currency Code (ISO 4217) *
                  </label>
                  <input 
                    type="text" 
                    value={form.currency} 
                    onChange={e => setForm({ ...form, currency: e.target.value.toUpperCase() })} 
                    style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px', textTransform: 'uppercase' }} 
                    placeholder="USD" 
                    maxLength={3} 
                  />
                  {/* Quick currency presets */}
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {POPULAR_CURRENCIES.slice(0, 5).map(c => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setForm({ ...form, currency: c.code })}
                        style={{
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontWeight: 700,
                          borderRadius: '4px',
                          border: '1px solid var(--clr-border)',
                          background: form.currency === c.code ? 'var(--clr-primary)' : 'var(--clr-surface-elevated)',
                          color: form.currency === c.code ? '#fff' : 'var(--clr-text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {c.code}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tax Rate */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--clr-text)' }}>
                    Tax Rate / VAT (%)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      step="0.1"
                      value={form.taxRate} 
                      onChange={e => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })} 
                      style={{ width: '100%', padding: '12px 36px 12px 12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '14px' }} 
                    />
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)', fontWeight: 700 }}>
                      %
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--clr-text-muted)', marginTop: '4px' }}>
                    0 for tax-free, or e.g. 19 for 19% VAT
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Gateways & Live Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Payment Gateways Card */}
          <Card>
            <CardBody style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--clr-border)', paddingBottom: '12px' }}>
                <CreditCard size={18} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--clr-text)' }}>
                  Enabled Payment Gateways ({form.methods.length})
                </h3>
              </div>

              {/* Standard Methods Toggle Grid */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {STANDARD_PAYMENT_METHODS.map(method => {
                  const active = form.methods.includes(method.id);
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => handleToggleMethod(method.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '999px',
                        border: `1.5px solid ${active ? method.color : 'var(--clr-border)'}`,
                        background: active ? `${method.color}18` : 'var(--clr-surface-elevated)',
                        color: active ? method.color : 'var(--clr-text-muted)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: active ? method.color : 'var(--clr-text-muted)' }} />
                      {method.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom Method Input */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--clr-text-muted)' }}>
                  Add Custom Local Gateway / Method
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="e.g. SADAD, KNet, Cash On Delivery..."
                    value={customMethodInput}
                    onChange={e => setCustomMethodInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomMethod())}
                    style={{ flex: 1, padding: '10px 14px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', outline: 'none', fontSize: '13px' }}
                  />
                  <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={handleAddCustomMethod}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Selected Methods Pills */}
              {form.methods.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px dashed var(--clr-border)' }}>
                  {form.methods.map(m => (
                    <span 
                      key={m}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'var(--clr-surface-elevated)',
                        border: '1px solid var(--clr-border)',
                        color: 'var(--clr-text)',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {m}
                      <button
                        type="button"
                        onClick={() => handleToggleMethod(m)}
                        style={{ background: 'none', border: 'none', padding: 0, color: 'var(--clr-text-muted)', cursor: 'pointer', display: 'flex' }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Country Active Switch */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--clr-surface-elevated)', borderRadius: '12px', border: '1px solid var(--clr-border)', marginTop: '8px' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 700, display: 'block', color: 'var(--clr-text)' }}>Active for Checkout</span>
                  <span style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Customers from this region can checkout</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={form.isActive} 
                  onChange={e => setForm({ ...form, isActive: e.target.checked })} 
                  style={{ accentColor: 'var(--clr-primary)', width: '22px', height: '22px', cursor: 'pointer' }} 
                />
              </div>
            </CardBody>
          </Card>

          {/* Live Preview Card */}
          <Card style={{ background: 'var(--clr-surface-elevated)', border: '1px dashed var(--clr-border)' }}>
            <CardBody style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--clr-text-muted)' }}>
                Live Storefront & Checkout Preview
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--clr-surface)', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
                <div style={{ fontSize: '36px', width: '52px', height: '52px', borderRadius: '12px', background: 'var(--clr-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {flagEmoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--clr-text)' }}>
                      {form.name || 'Country Name'}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                      {form.code.toUpperCase() || 'ISO'}
                    </span>
                  </div>
                  {form.nameAr && (
                    <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)', fontFamily: 'var(--font-arabic, inherit)' }}>
                      {form.nameAr}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                    <span>Currency: <strong>{form.currency.toUpperCase() || 'USD'}</strong></span>
                    <span>•</span>
                    <span>Tax: <strong>{form.taxRate}%</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                Supported payment options at checkout: <strong>{form.methods.join(', ') || 'None selected'}</strong>
              </div>
            </CardBody>
          </Card>

        </div>

      </div>

    </div>
  );
}
