"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Save, Loader, ArrowLeft, AlertCircle, Image as ImageIcon, X } from 'lucide-react';
import Link from 'next/link';
import styles from '../../../form.module.css';

export default function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    quote: '',
    quoteAr: '',
    name: '',
    nameAr: '',
    role: '',
    roleAr: '',
    avatarUrl: '',
    isActive: true,
  });

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    params.then(async ({ id: paramId }) => {
      setId(paramId);
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      const found = (data.data || []).find((t: any) => t.id === paramId);
      if (found) {
        setForm({
          quote: found.quote || '',
          quoteAr: found.quoteAr || '',
          name: found.name || '',
          nameAr: found.nameAr || '',
          role: found.role || '',
          roleAr: found.roleAr || '',
          avatarUrl: found.avatarUrl || '',
          isActive: found.isActive,
        });
      } else {
        setError('Testimonial not found.');
      }
      setIsLoading(false);
    });
  }, [params]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => handleChange('avatarUrl', ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.quote || !form.name) {
      setError('Quote and name are required.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update testimonial');
      router.push('/admin/testimonials');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div style={{ textAlign: 'center', padding: '64px' }}>
      <Loader size={32} className="spin" style={{ margin: '0 auto' }} />
    </div>
  );

  return (
    <form className={styles.formPage} onSubmit={handleSubmit}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Edit Testimonial</h1>
          <p className={styles.subtitle}>Update customer feedback details.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin/testimonials">
            <Button type="button" variant="secondary" icon={<ArrowLeft size={16} />}>Cancel</Button>
          </Link>
          <Button type="submit" icon={isSaving ? <Loader size={16} className="spin" /> : <Save size={16} />} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className={styles.formLayout}>
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Quote (EN) *</label>
                <textarea className={styles.formTextarea} value={form.quote} onChange={e => handleChange('quote', e.target.value)} placeholder="What did this customer say about your service?" rows={5} required></textarea>
              </div>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Quote (AR)</label>
                <textarea className={styles.formTextarea} dir="rtl" value={form.quoteAr} onChange={e => handleChange('quoteAr', e.target.value)} placeholder="رأي العميل في خدمتك..." rows={5}></textarea>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Customer Name (EN) *</label>
                <input type="text" className={styles.formInput} value={form.name} onChange={e => handleChange('name', e.target.value)} required placeholder="e.g. Sarah Jenkins" />
              </div>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Customer Name (AR)</label>
                <input type="text" className={styles.formInput} dir="rtl" value={form.nameAr} onChange={e => handleChange('nameAr', e.target.value)} placeholder="اسم العميل" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Title / Company (EN)</label>
                <input type="text" className={styles.formInput} value={form.role} onChange={e => handleChange('role', e.target.value)} placeholder="e.g. CTO, DataTech Industries" />
              </div>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Title / Company (AR)</label>
                <input type="text" className={styles.formInput} dir="rtl" value={form.roleAr} onChange={e => handleChange('roleAr', e.target.value)} placeholder="المنصب / الشركة" />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Status</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: 'var(--clr-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
              <input type="checkbox" checked={form.isActive} onChange={e => handleChange('isActive', e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--clr-primary)' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--clr-text)' }}>Visible</div>
                <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Show on public site</div>
              </div>
            </label>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Customer Avatar</h3>
            <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            {form.avatarUrl ? (
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1', border: '1px solid var(--clr-border)' }}>
                <img src={form.avatarUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => handleChange('avatarUrl', '')} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div onClick={() => imageInputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => handleChange('avatarUrl', ev.target?.result as string); reader.readAsDataURL(file); } }} style={{ border: '2px dashed var(--clr-border)', borderRadius: '12px', padding: '32px 20px', textAlign: 'center', background: 'var(--clr-surface)', cursor: 'pointer' }}>
                <ImageIcon size={32} style={{ margin: '0 auto 12px auto', color: 'var(--clr-text-muted)' }} />
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>Upload Avatar</h4>
                <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)', marginBottom: '16px' }}>Drag & drop or click</p>
                <div onClick={e => e.stopPropagation()}>
                  <Button type="button" variant="secondary" size="sm" onClick={() => imageInputRef.current?.click()}>Browse</Button>
                </div>
              </div>
            )}
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--clr-text-muted)', marginBottom: '4px' }}>Or paste image URL:</label>
              <input type="text" className={styles.formInput} value={form.avatarUrl} onChange={e => handleChange('avatarUrl', e.target.value)} placeholder="https://..." />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
