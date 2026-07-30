"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Save, Loader, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import styles from '../../form.module.css';

export default function NewTeamMemberPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [role, setRole] = useState('');
  const [roleAr, setRoleAr] = useState('');
  const [bio, setBio] = useState('');
  const [bioAr, setBioAr] = useState('');
  const [imageUrl, setImageUrl] = useState('');
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
    if (!name || !role) return toast.error('Name and role are required');
    
    setSaving(true);
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, nameAr, role, roleAr, bio, bioAr, imageUrl, isActive }),
    });

    if (res.ok) {
      toast.success('Team member added');
      router.push('/admin/team');
      router.refresh();
    } else {
      toast.error('Failed to add member');
      setSaving(false);
    }
  };

  return (
    <form className={styles.formPage} onSubmit={handleSave}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Add Team Member</h1>
          <p className={styles.subtitle}>Create a new member profile.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin/team">
            <Button type="button" variant="secondary" icon={<ArrowLeft size={16} />}>Cancel</Button>
          </Link>
          <Button type="submit" icon={saving ? <Loader className="spin" size={16} /> : <Save size={16} />} disabled={saving}>
            {saving ? 'Saving...' : 'Save Member'}
          </Button>
        </div>
      </div>

      <div className={styles.formLayout}>
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Full Name (EN) *</label>
                <input type="text" className={styles.formInput} value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Jane Doe" />
              </div>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Full Name (AR)</label>
                <input type="text" className={styles.formInput} dir="rtl" value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="الاسم الكامل" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Job Title / Role (EN) *</label>
                <input type="text" className={styles.formInput} value={role} onChange={e => setRole(e.target.value)} required placeholder="e.g. Lead Designer" />
              </div>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Job Title / Role (AR)</label>
                <input type="text" className={styles.formInput} dir="rtl" value={roleAr} onChange={e => setRoleAr(e.target.value)} placeholder="المسمى الوظيفي" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Biography (EN)</label>
                <textarea className={styles.formTextarea} value={bio} onChange={e => setBio(e.target.value)} placeholder="Write a short bio..." rows={5}></textarea>
              </div>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Biography (AR)</label>
                <textarea className={styles.formTextarea} dir="rtl" value={bioAr} onChange={e => setBioAr(e.target.value)} placeholder="نبذة مختصرة..." rows={5}></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Status</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: 'var(--clr-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--clr-primary)' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--clr-text)' }}>Active Member</div>
                <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Visible on the public site</div>
              </div>
            </label>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Profile Photo</h3>
            <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            {imageUrl ? (
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1', border: '1px solid var(--clr-border)' }}>
                <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => setImageUrl('')} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div onClick={() => imageInputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => setImageUrl(ev.target?.result as string); reader.readAsDataURL(file); } }} style={{ border: '2px dashed var(--clr-border)', borderRadius: '12px', padding: '32px 20px', textAlign: 'center', background: 'var(--clr-surface)', cursor: 'pointer' }}>
                <ImageIcon size={32} style={{ margin: '0 auto 12px auto', color: 'var(--clr-text-muted)' }} />
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>Upload Photo</h4>
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
