"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Save, Loader, ArrowLeft, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import styles from '../../form.module.css';

export default function NewGalleryImagePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [captionAr, setCaptionAr] = useState('');
  const [isActive, setIsActive] = useState(true);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImageUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!imageUrl) {
      setError('Image URL is required');
      return;
    }
    
    setSaving(true);
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, titleAr, imageUrl, caption, captionAr, isActive }),
    });

    if (res.ok) {
      toast.success('Image added');
      router.push('/admin/gallery');
      router.refresh();
    } else {
      setError('Failed to add image');
      setSaving(false);
    }
  };

  return (
    <form className={styles.formPage} onSubmit={handleSave}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Add Gallery Image</h1>
          <p className={styles.subtitle}>Upload a new image to your gallery.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin/gallery">
            <Button type="button" variant="secondary" icon={<ArrowLeft size={16} />}>Cancel</Button>
          </Link>
          <Button type="submit" icon={saving ? <Loader size={16} className="spin" /> : <Save size={16} />} disabled={saving}>
            {saving ? 'Saving...' : 'Save Gallery Image'}
          </Button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className={styles.formLayout}>
        {/* Main Content */}
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Image Details</h3>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Title (EN) (Optional)</label>
                <input type="text" className={styles.formInput} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Office Retreat 2024" />
              </div>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Title (AR) (Optional)</label>
                <input type="text" className={styles.formInput} dir="rtl" value={titleAr} onChange={e => setTitleAr(e.target.value)} placeholder="العنوان" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Caption (EN) (Optional)</label>
                <input type="text" className={styles.formInput} value={caption} onChange={e => setCaption(e.target.value)} placeholder="e.g. The team enjoying the annual summer retreat." />
              </div>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Caption (AR) (Optional)</label>
                <input type="text" className={styles.formInput} dir="rtl" value={captionAr} onChange={e => setCaptionAr(e.target.value)} placeholder="الوصف" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={styles.sideCol}>
          {/* Status */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Status</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: 'var(--clr-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--clr-primary)' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--clr-text)' }}>Visible</div>
                <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Show on public site</div>
              </div>
            </label>
          </div>

          {/* Image Upload */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Gallery Image *</h3>
            
            <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            
            {imageUrl ? (
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9', border: '1px solid var(--clr-border)' }}>
                <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => imageInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setImageUrl(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                style={{ border: '2px dashed var(--clr-border)', borderRadius: '12px', padding: '32px 20px', textAlign: 'center', background: 'var(--clr-surface)', cursor: 'pointer' }}
              >
                <ImageIcon size={32} style={{ margin: '0 auto 12px auto', color: 'var(--clr-text-muted)' }} />
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>Upload Image</h4>
                <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)', marginBottom: '16px' }}>Drag & drop or click</p>
                <div onClick={e => e.stopPropagation()}>
                  <Button type="button" variant="secondary" size="sm" onClick={() => imageInputRef.current?.click()}>Browse</Button>
                </div>
              </div>
            )}
            
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--clr-text-muted)', marginBottom: '4px' }}>Or paste image URL:</label>
              <input type="text" className={styles.formInput} value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
