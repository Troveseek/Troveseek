"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../../form.module.css';

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!slug) setSlug(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      setError('Name and slug are required.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, nameAr, slug, description, descriptionAr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      setSuccess(true);
      setTimeout(() => router.push('/admin/categories'), 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.formPage} onSubmit={handleSubmit}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>New Category</h1>
          <p className={styles.subtitle}>Create a new category for products, SaaS, or services.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin/categories">
            <Button type="button" variant="secondary" icon={<ArrowLeft size={16} />}>Cancel</Button>
          </Link>
          <Button type="submit" icon={<Save size={16} />} disabled={isSubmitting || success}>
            {isSubmitting ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
      
      {success && (
        <div style={{ padding: '12px 16px', background: '#dcfce7', color: '#22c55e', borderRadius: '8px', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> Category created successfully! Redirecting...
        </div>
      )}

      <div className={styles.formLayout}>
        {/* MAIN COLUMN */}
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Category Name (EN) *</label>
                <input type="text" className={styles.formInput} value={name} onChange={handleNameChange} required placeholder="e.g. Web Development Tools" />
              </div>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Category Name (AR)</label>
                <input type="text" className={styles.formInput} dir="rtl" value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="أدوات تطوير الويب" />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>URL Slug *</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ padding: '10px 12px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRight: 'none', borderRadius: '8px 0 0 8px', color: 'var(--clr-text-muted)', fontSize: '13px' }}>/categories/</span>
                <input type="text" value={slug} onChange={e => setSlug(slugify(e.target.value))} required placeholder="web-development-tools" style={{ flex: 1, padding: '10px 12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '0 8px 8px 0', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }} />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)', marginTop: '6px' }}>
                Auto-generated from name. Used in URLs.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Description (EN)</label>
                <textarea className={styles.formTextarea} value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description..." rows={4}></textarea>
              </div>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Description (AR)</label>
                <textarea className={styles.formTextarea} dir="rtl" value={descriptionAr} onChange={e => setDescriptionAr(e.target.value)} placeholder="وصف قصير..." rows={4}></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR COLUMN */}
        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Help & Info</h2>
            <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)', lineHeight: 1.6, margin: 0 }}>
              Categories help organize your products, SaaS subscriptions, and services. Once created, they will appear in the dropdown when creating new items.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
