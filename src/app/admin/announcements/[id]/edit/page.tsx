"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Save, Plus, Trash2, Loader, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import styles from '../../../form.module.css';

export default function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [page, setPage] = useState('SAAS');
  const [label, setLabel] = useState('');
  const [labelAr, setLabelAr] = useState('');
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [subtitleAr, setSubtitleAr] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [buttons, setButtons] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/page-heroes')
      .then(res => res.json())
      .then(data => {
        const hero = (data.data || []).find((h: any) => h.id === id);
        if (hero) {
          setPage(hero.page);
          setLabel(hero.label || '');
          setLabelAr(hero.labelAr || '');
          setTitle(hero.title);
          setTitleAr(hero.titleAr || '');
          setSubtitle(hero.subtitle || '');
          setSubtitleAr(hero.subtitleAr || '');
          setIsActive(hero.isActive);
          try {
            setButtons(JSON.parse(hero.buttons || '[]'));
          } catch { setButtons([]); }
        }
        setLoading(false);
      });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title) {
      setError('Title (EN) is required');
      return;
    }
    
    setSaving(true);
    const res = await fetch(`/api/page-heroes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, label, labelAr, title, titleAr, subtitle, subtitleAr, buttons, isActive }),
    });

    if (res.ok) {
      toast.success('Announcement updated');
      router.push('/admin/announcements');
      router.refresh();
    } else {
      setError('Failed to update announcement');
      setSaving(false);
    }
  };

  const addButton = () => setButtons([...buttons, { label: 'New Button', labelAr: '', url: '/', variant: 'primary', isActive: true }]);
  const updateButton = (index: number, key: string, value: any) => {
    const newBtns = [...buttons];
    newBtns[index][key] = value;
    setButtons(newBtns);
  };
  const removeButton = (index: number) => setButtons(buttons.filter((_, i) => i !== index));

  if (loading) return <div style={{ padding: '48px', textAlign: 'center' }}><Loader className="spin" /></div>;

  return (
    <form className={styles.formPage} onSubmit={handleSave}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Edit Announcement</h1>
          <p className={styles.subtitle}>Update this page hero or announcement section.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin/announcements">
            <Button type="button" variant="secondary" icon={<ArrowLeft size={16} />}>Cancel</Button>
          </Link>
          <Button type="submit" icon={saving ? <Loader size={16} className="spin" /> : <Save size={16} />} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
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
            <h3 className={styles.cardTitle}>Content Details</h3>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Main Title (EN) *</label>
                <input type="text" className={styles.formInput} value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Main Title (AR)</label>
                <input type="text" className={styles.formInput} dir="rtl" value={titleAr} onChange={e => setTitleAr(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Eyebrow Label (EN) (Optional)</label>
                <input type="text" className={styles.formInput} value={label} onChange={e => setLabel(e.target.value)} />
              </div>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Eyebrow Label (AR) (Optional)</label>
                <input type="text" className={styles.formInput} dir="rtl" value={labelAr} onChange={e => setLabelAr(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Subtitle / Description (EN)</label>
                <textarea className={styles.formTextarea} value={subtitle} onChange={e => setSubtitle(e.target.value)} rows={4}></textarea>
              </div>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Subtitle / Description (AR)</label>
                <textarea className={styles.formTextarea} dir="rtl" value={subtitleAr} onChange={e => setSubtitleAr(e.target.value)} rows={4}></textarea>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>Call to Action Buttons</h3>
              <Button type="button" variant="secondary" size="sm" icon={<Plus size={14}/>} onClick={addButton}>Add Button</Button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {buttons.map((btn, i) => (
                <div key={i} style={{ background: 'var(--clr-surface-2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--clr-border)', position: 'relative' }}>
                  <Button type="button" variant="ghost" size="iconOnly" style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--clr-danger)' }} onClick={() => removeButton(i)} icon={<Trash2 size={16}/>} />
                  
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', paddingRight: '40px' }}>
                    <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                      <label className={styles.formLabel}>Button Label (EN)</label>
                      <input type="text" className={styles.formInput} value={btn.label} onChange={e => updateButton(i, 'label', e.target.value)} />
                    </div>
                    <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                      <label className={styles.formLabel}>Button Label (AR)</label>
                      <input type="text" className={styles.formInput} dir="rtl" value={btn.labelAr || ''} onChange={e => updateButton(i, 'labelAr', e.target.value)} />
                    </div>
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                    <label className={styles.formLabel}>URL</label>
                    <input type="text" className={styles.formInput} value={btn.url} onChange={e => updateButton(i, 'url', e.target.value)} />
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                      <label className={styles.formLabel}>Variant</label>
                      <select className={styles.formInput} value={btn.variant} onChange={e => updateButton(i, 'variant', e.target.value)}>
                        <option value="primary">Primary Variant</option>
                        <option value="secondary">Secondary Variant</option>
                      </select>
                    </div>
                    <div className={styles.formGroup} style={{ flex: 1, margin: 0, display: 'flex', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={btn.isActive} onChange={e => updateButton(i, 'isActive', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--clr-primary)' }} />
                        <span style={{ fontSize: '14px', color: 'var(--clr-text)' }}>Active</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              {buttons.length === 0 && <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)', margin: 0 }}>No buttons added. The section will display without CTAs.</p>}
            </div>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Configuration</h3>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Target Page</label>
              <select className={styles.formInput} value={page} onChange={e => setPage(e.target.value)}>
                <option value="HOME">Home Page Banner</option>
                <option value="SAAS">SaaS Page</option>
                <option value="SERVICES">Services Page</option>
                <option value="SHOP">Shop Page</option>
                <option value="BLOG">Blog Page</option>
              </select>
            </div>

            <div style={{ marginTop: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: 'var(--clr-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
                <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--clr-primary)' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--clr-text)' }}>Visible</div>
                  <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Show on target page</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
