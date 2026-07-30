"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import styles from '../../form.module.css';

export default function NewSaaSPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  // Form State - General
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [tagline, setTagline] = useState('');
  const [taglineAr, setTaglineAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  
  // Settings
  const [status, setStatus] = useState('ACTIVE');
  const [platform, setPlatform] = useState('Web App');
  const [hasFreeTrial, setHasFreeTrial] = useState(false);
  
  // Dynamic Arrays
  const [images, setImages] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [featuresAr, setFeaturesAr] = useState<string[]>([]);
  const [plans, setPlans] = useState<any[]>([{ name: 'Starter', monthlyPrice: 0, yearlyPrice: 0, description: '', features: [''], isPopular: false }]);
  const [plansAr, setPlansAr] = useState<any[]>([{ name: '', description: '', features: [''] }]);
  const [whyChooseUs, setWhyChooseUs] = useState([{ title: '', desc: '', icon: 'Star' }]);
  const [whyChooseUsAr, setWhyChooseUsAr] = useState([{ title: '', desc: '' }]);

  // New Fields: SEO & FAQs
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [faqsAr, setFaqsAr] = useState<{ question: string; answer: string }[]>([]);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaTitleAr, setMetaTitleAr] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaDescriptionAr, setMetaDescriptionAr] = useState('');

  // Links
  const [documentationUrl, setDocumentationUrl] = useState('');
  const [communityUrl, setCommunityUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  // Category
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(j => setCategories(j.data ?? []))
      .catch(() => {});
  }, []);

  // Auto-fill meta title
  useEffect(() => {
    if (name && !metaTitle) setMetaTitle(name);
  }, [name]);

  // Handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    try {
      const newImages = [...images];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'saas');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          newImages.push(data.url);
        }
      }
      setImages(newImages);
    } catch (err) {
      console.error('Error uploading image', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const addFeature = () => { setFeatures([...features, '']); setFeaturesAr([...featuresAr, '']); };
  const updateFeature = (index: number, val: string) => {
    const newArr = [...features]; newArr[index] = val; setFeatures(newArr);
  };
  const updateFeatureAr = (index: number, val: string) => {
    const newArr = [...featuresAr]; if (newArr[index] !== undefined) newArr[index] = val; setFeaturesAr(newArr);
  };
  const removeFeature = (index: number) => { setFeatures(features.filter((_, i) => i !== index)); setFeaturesAr(featuresAr.filter((_, i) => i !== index)); };

  const handleAddPlan = () => { setPlans([...plans, { name: 'New Plan', monthlyPrice: 0, yearlyPrice: 0, description: '', features: [''], isPopular: false }]); setPlansAr([...plansAr, { name: '', description: '', features: [''] }]); };
  const handleUpdatePlan = (index: number, field: string, value: any) => {
    const newPlans = [...plans]; (newPlans[index] as any)[field] = value; setPlans(newPlans);
  };
  const handleUpdatePlanAr = (index: number, field: string, value: any) => {
    const newPlansAr = [...plansAr]; if(!newPlansAr[index]) newPlansAr[index] = {name:'', description:'', features:['']}; (newPlansAr[index] as any)[field] = value; setPlansAr(newPlansAr);
  };
  const handleRemovePlan = (index: number) => { setPlans(plans.filter((_, i) => i !== index)); setPlansAr(plansAr.filter((_, i) => i !== index)); };

  const handleAddPlanFeature = (planIndex: number) => {
    const newPlans = [...plans]; newPlans[planIndex].features = [...(newPlans[planIndex].features || []), '']; setPlans(newPlans);
    const newPlansAr = [...plansAr]; if(newPlansAr[planIndex]) { newPlansAr[planIndex].features = [...(newPlansAr[planIndex].features || []), '']; setPlansAr(newPlansAr); }
  };
  const handleUpdatePlanFeature = (planIndex: number, featureIndex: number, val: string) => {
    const newPlans = [...plans]; newPlans[planIndex].features[featureIndex] = val; setPlans(newPlans);
  };
  const handleUpdatePlanFeatureAr = (planIndex: number, featureIndex: number, val: string) => {
    const newPlansAr = [...plansAr]; if(newPlansAr[planIndex]) { newPlansAr[planIndex].features[featureIndex] = val; setPlansAr(newPlansAr); }
  };
  const handleRemovePlanFeature = (planIndex: number, featureIndex: number) => {
    const newPlans = [...plans]; newPlans[planIndex].features = newPlans[planIndex].features.filter((_: any, i: number) => i !== featureIndex); setPlans(newPlans);
    const newPlansAr = [...plansAr]; if(newPlansAr[planIndex]) { newPlansAr[planIndex].features = newPlansAr[planIndex].features.filter((_: any, i: number) => i !== featureIndex); setPlansAr(newPlansAr); }
  };

  const addWhy = () => { setWhyChooseUs([...whyChooseUs, { title: '', desc: '', icon: 'Star' }]); setWhyChooseUsAr([...whyChooseUsAr, { title: '', desc: '' }]); };
  const updateWhy = (index: number, field: string, value: string) => {
    const newArr = [...whyChooseUs]; (newArr[index] as any)[field] = value; setWhyChooseUs(newArr);
  };
  const updateWhyAr = (index: number, field: string, value: string) => {
    const newArr = [...whyChooseUsAr]; if(!newArr[index]) newArr[index] = {title:'', desc:''}; (newArr[index] as any)[field] = value; setWhyChooseUsAr(newArr);
  };
  const removeWhy = (index: number) => { setWhyChooseUs(whyChooseUs.filter((_, i) => i !== index)); setWhyChooseUsAr(whyChooseUsAr.filter((_, i) => i !== index)); };

  const addFaq = () => { setFaqs([...faqs, { question: '', answer: '' }]); setFaqsAr([...faqsAr, { question: '', answer: '' }]); };
  const updateFaq = (index: number, field: 'question'|'answer', value: string) => {
    const newFaqs = [...faqs]; newFaqs[index][field] = value; setFaqs(newFaqs);
  };
  const updateFaqAr = (index: number, field: 'question'|'answer', value: string) => {
    const newFaqs = [...faqsAr]; if(!newFaqs[index]) newFaqs[index] = {question:'', answer:''}; newFaqs[index][field] = value; setFaqsAr(newFaqs);
  };
  const removeFaq = (index: number) => { setFaqs(faqs.filter((_, i) => i !== index)); setFaqsAr(faqsAr.filter((_, i) => i !== index)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/saas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, nameAr, slug, tagline, taglineAr, description, descriptionAr, demoUrl, status, platform, hasFreeTrial,
          plans: JSON.stringify(plans),
          plansAr: JSON.stringify(plansAr),
          features: JSON.stringify(features.filter(f => f.trim() !== '')),
          featuresAr: JSON.stringify(featuresAr.filter(f => f.trim() !== '')),
          logo,
          images: JSON.stringify(images.filter(i => i.trim() !== '')),
          whyChooseUs: JSON.stringify(whyChooseUs.filter(w => w.title.trim() !== '')),
          whyChooseUsAr: JSON.stringify(whyChooseUsAr.filter(w => w.title.trim() !== '')),
          faqs: JSON.stringify(faqs.filter(f => f.question.trim() !== '' && f.answer.trim() !== '')),
          faqsAr: JSON.stringify(faqsAr.filter(f => f.question.trim() !== '' && f.answer.trim() !== '')),
          metaTitle, metaTitleAr, metaDescription, metaDescriptionAr,
          documentationUrl, communityUrl, githubUrl,
          monthlyPrice: plans.length > 0 ? (plans[0].monthlyPrice ?? 0) : 0,
          yearlyPrice: plans.length > 0 ? (plans[0].yearlyPrice ?? 0) : 0,
          categoryId: categoryId || undefined,
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create SaaS');
      }

      router.push('/admin/saas');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className={styles.formPage} onSubmit={handleSubmit}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Create SaaS Product</h1>
          <p className={styles.subtitle}>Add a new SaaS solution to the platform.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin/saas">
            <Button type="button" variant="secondary" icon={<ArrowLeft size={16} />}>Cancel</Button>
          </Link>
          <Button type="submit" icon={<Save size={16} />} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Create Product'}
          </Button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontSize: '14px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* TABS HEADER */}
      <div className={styles.tabs} style={{ marginBottom: '24px' }}>
        <button type="button" className={`${styles.tab} ${activeTab === 'general' ? styles.active : ''}`} onClick={() => setActiveTab('general')}>General Info</button>
        <button type="button" className={`${styles.tab} ${activeTab === 'pricing' ? styles.active : ''}`} onClick={() => setActiveTab('pricing')}>Pricing & Plans</button>
        <button type="button" className={`${styles.tab} ${activeTab === 'features' ? styles.active : ''}`} onClick={() => setActiveTab('features')}>Features & Benefits</button>
        <button type="button" className={`${styles.tab} ${activeTab === 'media' ? styles.active : ''}`} onClick={() => setActiveTab('media')}>Media</button>
        <button type="button" className={`${styles.tab} ${activeTab === 'seo' ? styles.active : ''}`} onClick={() => setActiveTab('seo')}>SEO & FAQs</button>
      </div>

      <div className={styles.formLayout}>
        {/* MAIN COLUMN */}
        <div className={styles.mainCol}>
          
          {/* --- GENERAL TAB --- */}
          {activeTab === 'general' && (
            <div className={styles.card}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                  <label className={styles.formLabel}>SaaS Name (EN) *</label>
                  <input type="text" className={styles.formInput} value={name} onChange={e => {
                    setName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }} required placeholder="e.g. CloudMetrics AI" />
                </div>
                <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                  <label className={styles.formLabel}>SaaS Name (AR)</label>
                  <input type="text" className={styles.formInput} dir="rtl" value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="اسم المنتج" />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>URL Slug *</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ padding: '10px 12px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRight: 'none', borderRadius: '8px 0 0 8px', color: 'var(--clr-text-muted)', fontSize: '13px' }}>/saas/</span>
                  <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required placeholder="cloudmetrics-ai" style={{ flex: 1, padding: '10px 12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '0 8px 8px 0', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                  <label className={styles.formLabel}>Tagline (EN)</label>
                  <input type="text" className={styles.formInput} value={tagline} onChange={e => setTagline(e.target.value)} placeholder="A short, catchy description" />
                </div>
                <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                  <label className={styles.formLabel}>Tagline (AR)</label>
                  <input type="text" className={styles.formInput} dir="rtl" value={taglineAr} onChange={e => setTaglineAr(e.target.value)} placeholder="شعار المنتج" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                  <label className={styles.formLabel}>Full Description (EN) *</label>
                  <textarea className={styles.formTextarea} value={description} onChange={e => setDescription(e.target.value)} required placeholder="Detailed description..." rows={8}></textarea>
                </div>
                <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                  <label className={styles.formLabel}>Full Description (AR)</label>
                  <textarea className={styles.formTextarea} dir="rtl" value={descriptionAr} onChange={e => setDescriptionAr(e.target.value)} placeholder="وصف كامل..." rows={8}></textarea>
                </div>
              </div>
            </div>
          )}

          {/* --- PRICING & PLANS TAB --- */}
          {activeTab === 'pricing' && (
            <div className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className={styles.cardTitle} style={{ margin: 0 }}>Subscription Plans</h2>
                <Button type="button" size="sm" variant="secondary" icon={<Plus size={14} />} onClick={handleAddPlan}>Add Plan</Button>
              </div>
              
              {plans.map((plan, index) => (
                <div key={index} style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', padding: '16px', marginBottom: '16px', background: 'var(--clr-surface-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 200px', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="text" className={styles.formInput} value={plan.name} onChange={e => handleUpdatePlan(index, 'name', e.target.value)} placeholder="Plan Name (EN)" required style={{ flex: 1 }} />
                        <input type="text" className={styles.formInput} dir="rtl" value={plansAr[index]?.name || ''} onChange={e => handleUpdatePlanAr(index, 'name', e.target.value)} placeholder="اسم الخطة (AR)" style={{ flex: 1 }} />
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--clr-text)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!plan.isPopular} onChange={e => handleUpdatePlan(index, 'isPopular', e.target.checked)} />
                        Most Popular Plan
                      </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Monthly ($)</span>
                        <input type="number" className={styles.formInput} value={plan.monthlyPrice} onChange={e => handleUpdatePlan(index, 'monthlyPrice', parseFloat(e.target.value))} style={{ width: '90px' }} required min="0" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Yearly ($)</span>
                        <input type="number" className={styles.formInput} value={plan.yearlyPrice} onChange={e => handleUpdatePlan(index, 'yearlyPrice', parseFloat(e.target.value))} style={{ width: '90px' }} required min="0" />
                      </div>
                      <button type="button" onClick={() => handleRemovePlan(index)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', marginLeft: '8px', marginTop: '16px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                    <textarea className={styles.formTextarea} style={{ flex: 1, minHeight: '60px' }} value={plan.description} onChange={e => handleUpdatePlan(index, 'description', e.target.value)} placeholder="Plan Description (EN)..."></textarea>
                    <textarea className={styles.formTextarea} dir="rtl" style={{ flex: 1, minHeight: '60px' }} value={plansAr[index]?.description || ''} onChange={e => handleUpdatePlanAr(index, 'description', e.target.value)} placeholder="وصف الخطة (AR)..."></textarea>
                  </div>
                  
                  <div style={{ background: 'var(--clr-surface-2)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Plan Features</h4>
                      <Button type="button" size="sm" variant="secondary" onClick={() => handleAddPlanFeature(index)} style={{ padding: '4px 8px', fontSize: '12px' }}><Plus size={12} /> Add Feature</Button>
                    </div>
                    {plan.features?.map((feat: string, fIndex: number) => (
                      <div key={fIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input type="text" className={styles.formInput} value={feat} onChange={e => handleUpdatePlanFeature(index, fIndex, e.target.value)} placeholder="e.g. 5 Users (EN)" style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }} />
                        <input type="text" className={styles.formInput} dir="rtl" value={plansAr[index]?.features?.[fIndex] || ''} onChange={e => handleUpdatePlanFeatureAr(index, fIndex, e.target.value)} placeholder="ميزة الخطة (AR)" style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }} />
                        <button type="button" onClick={() => handleRemovePlanFeature(index, fIndex)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* --- FEATURES & BENEFITS TAB --- */}
          {activeTab === 'features' && (
            <>
              <div className={styles.card} style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 className={styles.cardTitle} style={{ margin: 0 }}>What's Included</h2>
                  <Button type="button" size="sm" variant="secondary" icon={<Plus size={14} />} onClick={addFeature}>Add Feature</Button>
                </div>
                {features.map((feat, index) => (
                  <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <input type="text" className={styles.formInput} value={feat} onChange={e => updateFeature(index, e.target.value)} placeholder="EN Feature" style={{ flex: 1 }} />
                    <input type="text" className={styles.formInput} dir="rtl" value={featuresAr[index] || ''} onChange={e => updateFeatureAr(index, e.target.value)} placeholder="ميزة باللغة العربية" style={{ flex: 1 }} />
                    <button type="button" onClick={() => removeFeature(index)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '0 8px' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {features.length === 0 && <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)' }}>No features added.</p>}
              </div>

              <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 className={styles.cardTitle} style={{ margin: 0 }}>Why Choose Us?</h2>
                  <Button type="button" size="sm" variant="secondary" icon={<Plus size={14} />} onClick={addWhy}>Add Benefit</Button>
                </div>
                {whyChooseUs.map((item, index) => (
                  <div key={index} style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', padding: '16px', marginBottom: '16px', background: 'var(--clr-surface-3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', gap: '12px' }}>
                      <input type="text" className={styles.formInput} value={item.title} onChange={e => updateWhy(index, 'title', e.target.value)} style={{ flex: 1 }} placeholder="Title (EN)" required />
                      <input type="text" className={styles.formInput} dir="rtl" value={whyChooseUsAr[index]?.title || ''} onChange={e => updateWhyAr(index, 'title', e.target.value)} style={{ flex: 1 }} placeholder="العنوان (AR)" />
                      <button type="button" onClick={() => removeWhy(index)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', marginLeft: '8px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                      <input type="text" className={styles.formInput} value={item.icon} onChange={e => updateWhy(index, 'icon', e.target.value)} style={{ width: '120px' }} placeholder="Icon Name" />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <textarea className={styles.formTextarea} value={item.desc} onChange={e => updateWhy(index, 'desc', e.target.value)} style={{ flex: 1 }} placeholder="Description (EN)..." required />
                      <textarea className={styles.formTextarea} dir="rtl" value={whyChooseUsAr[index]?.desc || ''} onChange={e => updateWhyAr(index, 'desc', e.target.value)} style={{ flex: 1 }} placeholder="الوصف (AR)..." />
                    </div>
                  </div>
                ))}
                {whyChooseUs.length === 0 && <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)' }}>No benefits added.</p>}
              </div>
            </>
          )}

          {/* --- MEDIA TAB --- */}
          {activeTab === 'media' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 className={styles.cardTitle} style={{ margin: 0 }}><ImageIcon size={18} /> SaaS Logo</h2>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {logo ? (
                    <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: `url(${logo}) center/cover`, border: '1px solid var(--clr-border)', position: 'relative' }}>
                      <button type="button" onClick={() => setLogo('')} style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'rgba(255,0,0,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'var(--clr-surface-2)', border: '1px dashed var(--clr-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-text-muted)' }}>
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <input 
                      type="file" 
                      id="saas-logo-upload" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploading(true);
                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                          const res = await fetch('/api/upload', { method: 'POST', body: formData });
                          if (!res.ok) throw new Error('Upload failed');
                          const data = await res.json();
                          setLogo(data.url);
                        } catch (err) {
                          alert('Error uploading logo');
                        }
                        setIsUploading(false);
                      }}
                      disabled={isUploading}
                    />
                    <Button type="button" size="sm" variant="secondary" onClick={() => document.getElementById('saas-logo-upload')?.click()} disabled={isUploading}>
                      {isUploading ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                    <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginTop: '8px' }}>Recommended: Square image, transparent PNG or JPG, max 2MB.</p>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 className={styles.cardTitle} style={{ margin: 0 }}><ImageIcon size={18} /> Images / Screenshots</h2>
                  <div>
                    <input 
                      type="file" 
                      id="saas-image-upload" 
                    multiple 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  <Button type="button" size="sm" variant="secondary" icon={<Plus size={14} />} onClick={() => document.getElementById('saas-image-upload')?.click()} disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Upload Images'}
                  </Button>
                </div>
              </div>
              
              {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  {images.map((img, index) => (
                    <div key={index} style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--clr-border)' }}>
                      <img src={img} alt="Screenshot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => removeImage(index)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,0,0,0.8)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {images.length === 0 && <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)' }}>No images uploaded.</p>}
              </div>
            </div>
          )}

          {/* --- SEO & FAQs TAB --- */}
          {activeTab === 'seo' && (
            <>
              <div className={styles.card} style={{ marginBottom: '24px' }}>
                <h2 className={styles.cardTitle}>Search Engine Optimization (SEO)</h2>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                    <label className={styles.formLabel}>Meta Title (EN)</label>
                    <input type="text" className={styles.formInput} value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="Max 60 characters recommended" />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                    <label className={styles.formLabel}>Meta Title (AR)</label>
                    <input type="text" className={styles.formInput} dir="rtl" value={metaTitleAr} onChange={e => setMetaTitleAr(e.target.value)} placeholder="العنوان لمحركات البحث" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                    <label className={styles.formLabel}>Meta Description (EN)</label>
                    <textarea className={styles.formTextarea} rows={3} value={metaDescription} onChange={e => setMetaDescription(e.target.value)} placeholder="Max 160 characters recommended"></textarea>
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                    <label className={styles.formLabel}>Meta Description (AR)</label>
                    <textarea className={styles.formTextarea} dir="rtl" rows={3} value={metaDescriptionAr} onChange={e => setMetaDescriptionAr(e.target.value)} placeholder="الوصف لمحركات البحث"></textarea>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 className={styles.cardTitle} style={{ margin: 0 }}>Frequently Asked Questions</h2>
                  <Button type="button" size="sm" variant="secondary" icon={<Plus size={14} />} onClick={addFaq}>Add FAQ</Button>
                </div>

                {faqs.map((faq, index) => (
                  <div key={index} style={{ border: '1px solid var(--clr-border)', borderRadius: '8px', padding: '16px', marginBottom: '16px', background: 'var(--clr-surface-3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', gap: '12px' }}>
                      <input type="text" className={styles.formInput} value={faq.question} onChange={e => updateFaq(index, 'question', e.target.value)} style={{ flex: 1, fontWeight: 600 }} placeholder="Question (EN)..." required />
                      <input type="text" className={styles.formInput} dir="rtl" value={faqsAr[index]?.question || ''} onChange={e => updateFaqAr(index, 'question', e.target.value)} style={{ flex: 1, fontWeight: 600 }} placeholder="السؤال (AR)..." />
                      <button type="button" onClick={() => removeFaq(index)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <textarea className={styles.formTextarea} rows={3} value={faq.answer} onChange={e => updateFaq(index, 'answer', e.target.value)} placeholder="Answer (EN)..." style={{ flex: 1 }} required></textarea>
                      <textarea className={styles.formTextarea} dir="rtl" rows={3} value={faqsAr[index]?.answer || ''} onChange={e => updateFaqAr(index, 'answer', e.target.value)} placeholder="الجواب (AR)..." style={{ flex: 1 }}></textarea>
                    </div>
                  </div>
                ))}
                {faqs.length === 0 && <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)' }}>No FAQs added.</p>}
              </div>
            </>
          )}

        </div>

        {/* SIDEBAR COLUMN */}
        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Settings</h2>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Status</label>
              <select className={styles.formSelect} value={status} onChange={e => setStatus(e.target.value)}>
                <option value="ACTIVE">Live</option>
                <option value="INACTIVE">Coming Soon</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Category</label>
              <select className={styles.formSelect} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">Uncategorized</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Platform</label>
              <select className={styles.formSelect} value={platform} onChange={e => setPlatform(e.target.value)}>
                <option value="Web App">Web App</option>
                <option value="Desktop (Win/Mac)">Desktop (Win/Mac)</option>
                <option value="Mobile App">Mobile App</option>
                <option value="API Service">API Service</option>
              </select>
            </div>

            <div className={styles.toggleRow} onClick={() => setHasFreeTrial(!hasFreeTrial)} style={{ cursor: 'pointer' }}>
              <span className={styles.toggleLabel}>Has Free Trial</span>
              <div className={`${styles.toggleSwitch} ${hasFreeTrial ? styles.active : ''}`}>
                <div className={styles.toggleThumb}></div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}><LinkIcon size={18} /> External Links</h2>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Demo URL</label>
              <input type="url" className={styles.formInput} value={demoUrl} onChange={e => setDemoUrl(e.target.value)} placeholder="https://app.example.com" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Documentation URL</label>
              <input type="url" className={styles.formInput} value={documentationUrl} onChange={e => setDocumentationUrl(e.target.value)} placeholder="https://docs.example.com" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Community / Discord</label>
              <input type="url" className={styles.formInput} value={communityUrl} onChange={e => setCommunityUrl(e.target.value)} placeholder="https://community.example.com" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>GitHub (Open Source)</label>
              <input type="url" className={styles.formInput} value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/org/repo" />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
