"use client";

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Save, Loader } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../form.module.css';

export default function AboutAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [subtitleAr, setSubtitleAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [mission, setMission] = useState('');
  const [missionAr, setMissionAr] = useState('');
  const [vision, setVision] = useState('');
  const [visionAr, setVisionAr] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaLabelAr, setCtaLabelAr] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');

  // Stats State
  const [stat1Value, setStat1Value] = useState('');
  const [stat1Label, setStat1Label] = useState('');
  const [stat1LabelAr, setStat1LabelAr] = useState('');
  const [stat2Value, setStat2Value] = useState('');
  const [stat2Label, setStat2Label] = useState('');
  const [stat2LabelAr, setStat2LabelAr] = useState('');
  const [stat3Value, setStat3Value] = useState('');
  const [stat3Label, setStat3Label] = useState('');
  const [stat3LabelAr, setStat3LabelAr] = useState('');
  const [stat4Value, setStat4Value] = useState('');
  const [stat4Label, setStat4Label] = useState('');
  const [stat4LabelAr, setStat4LabelAr] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setTitle(data.about_title || '');
        setTitleAr(data.about_title_ar || '');
        setSubtitle(data.about_subtitle || '');
        setSubtitleAr(data.about_subtitle_ar || '');
        setDescription(data.about_description || '');
        setDescriptionAr(data.about_description_ar || '');
        setMission(data.about_mission || '');
        setMissionAr(data.about_mission_ar || '');
        setVision(data.about_vision || '');
        setVisionAr(data.about_vision_ar || '');
        setCtaLabel(data.about_cta_label || '');
        setCtaLabelAr(data.about_cta_label_ar || '');
        setCtaUrl(data.about_cta_url || '');
        
        setStat1Value(data.about_stat1_value || '150+');
        setStat1Label(data.about_stat1_label || 'Countries Served');
        setStat1LabelAr(data.about_stat1_label_ar || '');
        setStat2Value(data.about_stat2_value || '10,000+');
        setStat2Label(data.about_stat2_label || 'Digital Products');
        setStat2LabelAr(data.about_stat2_label_ar || '');
        setStat3Value(data.about_stat3_value || '500+');
        setStat3Label(data.about_stat3_label || 'SaaS Solutions');
        setStat3LabelAr(data.about_stat3_label_ar || '');
        setStat4Value(data.about_stat4_value || '99.9%');
        setStat4Label(data.about_stat4_label || 'Uptime');
        setStat4LabelAr(data.about_stat4_label_ar || '');
        
        setLoading(false);
      });
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    const settings = [
      { key: 'about_title', value: title },
      { key: 'about_title_ar', value: titleAr },
      { key: 'about_subtitle', value: subtitle },
      { key: 'about_subtitle_ar', value: subtitleAr },
      { key: 'about_description', value: description },
      { key: 'about_description_ar', value: descriptionAr },
      { key: 'about_mission', value: mission },
      { key: 'about_mission_ar', value: missionAr },
      { key: 'about_vision', value: vision },
      { key: 'about_vision_ar', value: visionAr },
      { key: 'about_cta_label', value: ctaLabel },
      { key: 'about_cta_label_ar', value: ctaLabelAr },
      { key: 'about_cta_url', value: ctaUrl },
      
      { key: 'about_stat1_value', value: stat1Value },
      { key: 'about_stat1_label', value: stat1Label },
      { key: 'about_stat1_label_ar', value: stat1LabelAr },
      { key: 'about_stat2_value', value: stat2Value },
      { key: 'about_stat2_label', value: stat2Label },
      { key: 'about_stat2_label_ar', value: stat2LabelAr },
      { key: 'about_stat3_value', value: stat3Value },
      { key: 'about_stat3_label', value: stat3Label },
      { key: 'about_stat3_label_ar', value: stat3LabelAr },
      { key: 'about_stat4_value', value: stat4Value },
      { key: 'about_stat4_label', value: stat4Label },
      { key: 'about_stat4_label_ar', value: stat4LabelAr },
    ];
    
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });

    if (res.ok) {
      toast.success('About page settings updated');
    } else {
      toast.error('Failed to update settings');
    }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: '48px', textAlign: 'center' }}><Loader className="spin" /></div>;

  return (
    <form className={styles.formPage} onSubmit={handleSave}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>About Page Content</h1>
          <p className={styles.subtitle}>Manage the content for your public About section.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button type="submit" icon={saving ? <Loader className="spin" size={16} /> : <Save size={16} />} disabled={saving}>
            {saving ? 'Publishing...' : 'Publish Changes'}
          </Button>
        </div>
      </div>

      <div className={styles.formLayout}>
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Main Information</h3>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Page Title (EN)</label>
                <input type="text" className={styles.formInput} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Empowering Your Digital Transformation" />
              </div>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Page Title (AR)</label>
                <input type="text" className={styles.formInput} dir="rtl" value={titleAr} onChange={e => setTitleAr(e.target.value)} placeholder="عنوان الصفحة" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Eyebrow / Subtitle (EN)</label>
                <input type="text" className={styles.formInput} value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="e.g. About TroveSeek" />
              </div>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Eyebrow / Subtitle (AR)</label>
                <input type="text" className={styles.formInput} dir="rtl" value={subtitleAr} onChange={e => setSubtitleAr(e.target.value)} placeholder="العنوان الفرعي" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Main Description (EN)</label>
                <textarea className={styles.formTextarea} value={description} onChange={e => setDescription(e.target.value)} rows={6}></textarea>
              </div>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Main Description (AR)</label>
                <textarea className={styles.formTextarea} dir="rtl" value={descriptionAr} onChange={e => setDescriptionAr(e.target.value)} rows={6}></textarea>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Core Values</h3>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Mission Statement (EN)</label>
                <textarea className={styles.formTextarea} value={mission} onChange={e => setMission(e.target.value)} rows={4}></textarea>
              </div>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Mission Statement (AR)</label>
                <textarea className={styles.formTextarea} dir="rtl" value={missionAr} onChange={e => setMissionAr(e.target.value)} rows={4}></textarea>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Vision Statement (EN)</label>
                <textarea className={styles.formTextarea} value={vision} onChange={e => setVision(e.target.value)} rows={4}></textarea>
              </div>
              <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                <label className={styles.formLabel}>Vision Statement (AR)</label>
                <textarea className={styles.formTextarea} dir="rtl" value={visionAr} onChange={e => setVisionAr(e.target.value)} rows={4}></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Call to Action</h3>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Button Label (EN)</label>
              <input type="text" className={styles.formInput} value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} placeholder="e.g. Learn More About Us" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Button Label (AR)</label>
              <input type="text" className={styles.formInput} dir="rtl" value={ctaLabelAr} onChange={e => setCtaLabelAr(e.target.value)} placeholder="نص الزر" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Button URL</label>
              <input type="text" className={styles.formInput} value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} placeholder="e.g. /contact" />
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Key Statistics</h3>
            
            {/* Stat 1 */}
            <div style={{ borderBottom: '1px solid var(--clr-border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '8px' }}>
                <label className={styles.formLabel}>Stat 1 Value</label>
                <input type="text" className={styles.formInput} value={stat1Value} onChange={e => setStat1Value(e.target.value)} placeholder="e.g. 150+" />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}><input type="text" className={styles.formInput} value={stat1Label} onChange={e => setStat1Label(e.target.value)} placeholder="Label (EN)" /></div>
                <div style={{ flex: 1 }}><input type="text" className={styles.formInput} dir="rtl" value={stat1LabelAr} onChange={e => setStat1LabelAr(e.target.value)} placeholder="Label (AR)" /></div>
              </div>
            </div>

            {/* Stat 2 */}
            <div style={{ borderBottom: '1px solid var(--clr-border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '8px' }}>
                <label className={styles.formLabel}>Stat 2 Value</label>
                <input type="text" className={styles.formInput} value={stat2Value} onChange={e => setStat2Value(e.target.value)} placeholder="e.g. 10k" />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}><input type="text" className={styles.formInput} value={stat2Label} onChange={e => setStat2Label(e.target.value)} placeholder="Label (EN)" /></div>
                <div style={{ flex: 1 }}><input type="text" className={styles.formInput} dir="rtl" value={stat2LabelAr} onChange={e => setStat2LabelAr(e.target.value)} placeholder="Label (AR)" /></div>
              </div>
            </div>

            {/* Stat 3 */}
            <div style={{ borderBottom: '1px solid var(--clr-border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div className={styles.formGroup} style={{ marginBottom: '8px' }}>
                <label className={styles.formLabel}>Stat 3 Value</label>
                <input type="text" className={styles.formInput} value={stat3Value} onChange={e => setStat3Value(e.target.value)} placeholder="e.g. 500+" />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}><input type="text" className={styles.formInput} value={stat3Label} onChange={e => setStat3Label(e.target.value)} placeholder="Label (EN)" /></div>
                <div style={{ flex: 1 }}><input type="text" className={styles.formInput} dir="rtl" value={stat3LabelAr} onChange={e => setStat3LabelAr(e.target.value)} placeholder="Label (AR)" /></div>
              </div>
            </div>

            {/* Stat 4 */}
            <div>
              <div className={styles.formGroup} style={{ marginBottom: '8px' }}>
                <label className={styles.formLabel}>Stat 4 Value</label>
                <input type="text" className={styles.formInput} value={stat4Value} onChange={e => setStat4Value(e.target.value)} placeholder="e.g. 99%" />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}><input type="text" className={styles.formInput} value={stat4Label} onChange={e => setStat4Label(e.target.value)} placeholder="Label (EN)" /></div>
                <div style={{ flex: 1 }}><input type="text" className={styles.formInput} dir="rtl" value={stat4LabelAr} onChange={e => setStat4LabelAr(e.target.value)} placeholder="Label (AR)" /></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </form>
  );
}
