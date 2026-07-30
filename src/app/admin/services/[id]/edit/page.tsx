"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Loader } from 'lucide-react';
import Link from 'next/link';
import styles from '../../../form.module.css';

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Form State - General
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [taglineAr, setTaglineAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  
  // Settings
  const [basePrice, setBasePrice] = useState('500');
  const [estimatedDays, setEstimatedDays] = useState('14');
  const [status, setStatus] = useState('ACTIVE');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  // Dynamic Arrays
  const [logo, setLogo] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [process, setProcess] = useState([{ step: '1', title: 'Discovery', desc: '' }]);
  const [processAr, setProcessAr] = useState([{ step: '1', title: '', desc: '' }]);
  const [portfolio, setPortfolio] = useState<{ client: string; project: string; desc: string; tags: string; image: string; link?: string }[]>([]);
  const [testimonials, setTestimonials] = useState<{ quote: string; author: string; role: string }[]>([]);
  const [tiers, setTiers] = useState<{ name: string; price: number; duration: string; features: string[]; isPopular: boolean }[]>([
    { name: 'Basic', price: 500, duration: '5-7 days', features: [''], isPopular: false }
  ]);
  const [tiersAr, setTiersAr] = useState<{ name: string; duration: string; features: string[]; }[]>([
    { name: '', duration: '', features: [''] }
  ]);

  // SEO
  const [metaTitle, setMetaTitle] = useState('');
  const [metaTitleAr, setMetaTitleAr] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaDescriptionAr, setMetaDescriptionAr] = useState('');

  // Category
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(j => setCategories(j.data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`/api/services/${id}`);
        if (!res.ok) throw new Error('Service not found');
        const data = await res.json();
        const service = data.data;

        setName(service.name || '');
        setNameAr(service.nameAr || '');
        setSlug(service.slug || '');
        setTagline(service.tagline || '');
        setTaglineAr(service.taglineAr || '');
        setDescription(service.description || '');
        setDescriptionAr(service.descriptionAr || '');
        setBasePrice(service.basePrice?.toString() || '');
        setEstimatedDays(service.estimatedDays?.toString() || '');
        setStatus(service.status || 'ACTIVE');
        setContactEmail(service.contactEmail || '');
        setContactPhone(service.contactPhone || '');
        setMetaTitle(service.metaTitle || '');
        setMetaTitleAr(service.metaTitleAr || '');
        setMetaDescription(service.metaDescription || '');
        setMetaDescriptionAr(service.metaDescriptionAr || '');
        setCategoryId(service.categoryId || '');
        setLogo(service.logo || '');

        try { if (service.images) setImages(JSON.parse(service.images)); } catch(e){}
        try { if (service.process && service.process !== "[]") setProcess(JSON.parse(service.process)); } catch(e){}
        try { if (service.processAr && service.processAr !== "[]") setProcessAr(JSON.parse(service.processAr)); } catch(e){}
        try { if (service.portfolio && service.portfolio !== "[]") setPortfolio(JSON.parse(service.portfolio)); } catch(e){}
        try { if (service.testimonials && service.testimonials !== "[]") setTestimonials(JSON.parse(service.testimonials)); } catch(e){}
        try { if (service.tiers && service.tiers !== "[]") setTiers(JSON.parse(service.tiers)); } catch(e){}
        try { if (service.tiersAr && service.tiersAr !== "[]") setTiersAr(JSON.parse(service.tiersAr)); } catch(e){}

      } catch (err) {
        setError('Failed to load service');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchService();
  }, [id]);


  const handleSave = async () => {
    if (!name || !slug || !description) {
      setError('Please fill in required fields (Name, Slug, Description)');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const payload = {
        name,
        nameAr,
        slug,
        tagline,
        taglineAr,
        description,
        descriptionAr,
        basePrice: parseFloat(basePrice || '0'),
        estimatedDays: parseInt(estimatedDays || '0', 10),
        status,
        contactEmail,
        contactPhone,
        logo,
        images: JSON.stringify(images),
        process: JSON.stringify(process),
        processAr: JSON.stringify(processAr),
        portfolio: JSON.stringify(portfolio),
        testimonials: JSON.stringify(testimonials),
        tiers: JSON.stringify(tiers),
        tiersAr: JSON.stringify(tiersAr),
        metaTitle,
        metaTitleAr,
        metaDescription,
        metaDescriptionAr,
        categoryId: categoryId || undefined,
      };

      const res = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update');
      }

      router.push('/admin/services');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setImages(prev => [...prev, data.url]);
    } catch (err) {
      alert('Failed to upload image');
    }
  };

  const handlePortfolioImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const newPortfolio = [...portfolio];
      newPortfolio[index].image = data.url;
      setPortfolio(newPortfolio);
    } catch (err) {
      alert('Failed to upload image');
    }
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'tiers', label: 'Pricing Tiers' },
    { id: 'process', label: 'Process' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'media', label: 'Media & SEO' },
  ];

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Loader className="spin" size={32} /></div>;
  }

  return (
    <form className={styles.formPage} onSubmit={e => { e.preventDefault(); handleSave(); }}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Edit Service: {name}</h1>
          <p className={styles.subtitle}>Update your service offering details.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin/services">
            <Button type="button" variant="secondary" icon={<ArrowLeft size={16} />}>Cancel</Button>
          </Link>
          <Button type="submit" variant="primary" icon={isSaving ? <Loader className="spin" size={16} /> : <Save size={16} />} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '24px' }}>{error}</div>}

      <div className={styles.formLayout}>
        <div className={styles.mainCol}>
          
          <div className={styles.card} style={{ padding: '0 24px' }}>
            <div className={styles.tabs} style={{ borderBottom: 'none', margin: 0 }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'general' && (
            <div className={styles.card}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                  <label className={styles.formLabel}>Service Name (EN) *</label>
                  <input 
                    type="text" 
                    className={styles.formInput}
                    value={name} 
                    onChange={e => {
                      setName(e.target.value);
                      if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }}
                    placeholder="e.g. Enterprise Web Development"
                  />
                </div>
                <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                  <label className={styles.formLabel}>Service Name (AR)</label>
                  <input type="text" className={styles.formInput} dir="rtl" value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="اسم الخدمة بالعربية" />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Slug *</label>
                <input type="text" className={styles.formInput} value={slug} onChange={e => setSlug(e.target.value)} />
              </div>
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                  <label className={styles.formLabel}>Tagline (EN)</label>
                  <input type="text" className={styles.formInput} value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Short, catchy phrase" />
                </div>
                <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                  <label className={styles.formLabel}>Tagline (AR)</label>
                  <input type="text" className={styles.formInput} dir="rtl" value={taglineAr} onChange={e => setTaglineAr(e.target.value)} placeholder="شعار الخدمة بالعربية" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                  <label className={styles.formLabel}>Description (EN) *</label>
                  <textarea 
                    className={styles.formTextarea}
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    rows={6}
                    placeholder="Full service description..."
                  />
                </div>
                <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                  <label className={styles.formLabel}>Description (AR)</label>
                  <textarea 
                    className={styles.formTextarea}
                    dir="rtl"
                    value={descriptionAr} 
                    onChange={e => setDescriptionAr(e.target.value)} 
                    rows={6}
                    placeholder="وصف الخدمة بالعربية..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                  <label className={styles.formLabel}>Contact Email</label>
                  <input type="email" className={styles.formInput} value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                </div>
                <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                  <label className={styles.formLabel}>Contact Phone</label>
                  <input type="text" className={styles.formInput} value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tiers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 className={styles.cardTitle} style={{ margin: 0 }}>Pricing Tiers</h2>
                <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => { setTiers([...tiers, { name: 'New Tier', price: 0, duration: '', features: [''], isPopular: false }]); setTiersAr([...tiersAr, { name: '', duration: '', features: [''] }]); }}>
                  Add Tier
                </Button>
              </div>
              
              {tiers.map((tier, index) => (
                <div key={index} className={styles.card} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Tier {index + 1}</h4>
                    <button type="button" onClick={() => { setTiers(tiers.filter((_, i) => i !== index)); setTiersAr(tiersAr.filter((_, i) => i !== index)); }} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                      <label className={styles.formLabel}>Tier Name (EN)</label>
                      <input type="text" className={styles.formInput} value={tier.name} onChange={e => {
                        const newTiers = [...tiers]; newTiers[index].name = e.target.value; setTiers(newTiers);
                      }} placeholder="e.g. Standard" />
                    </div>
                    <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                      <label className={styles.formLabel}>Tier Name (AR)</label>
                      <input type="text" className={styles.formInput} dir="rtl" value={tiersAr[index]?.name || ''} onChange={e => {
                        const newTiers = [...tiersAr]; if(!newTiers[index]) newTiers[index] = {name:'', duration:'', features:['']}; newTiers[index].name = e.target.value; setTiersAr(newTiers);
                      }} placeholder="اسم الباقة" />
                    </div>
                    <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                      <label className={styles.formLabel}>Price ($)</label>
                      <input type="number" className={styles.formInput} value={tier.price} onChange={e => {
                        const newTiers = [...tiers]; newTiers[index].price = parseFloat(e.target.value); setTiers(newTiers);
                      }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '16px' }}>
                    <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                      <label className={styles.formLabel}>Duration (EN)</label>
                      <input type="text" className={styles.formInput} value={tier.duration} onChange={e => {
                        const newTiers = [...tiers]; newTiers[index].duration = e.target.value; setTiers(newTiers);
                      }} placeholder="e.g. 2-3 weeks" />
                    </div>
                    <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                      <label className={styles.formLabel}>Duration (AR)</label>
                      <input type="text" className={styles.formInput} dir="rtl" value={tiersAr[index]?.duration || ''} onChange={e => {
                        const newTiers = [...tiersAr]; if(!newTiers[index]) newTiers[index] = {name:'', duration:'', features:['']}; newTiers[index].duration = e.target.value; setTiersAr(newTiers);
                      }} placeholder="المدة الزمنية" />
                    </div>
                    <div style={{ flex: 1, paddingBottom: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                        <input type="checkbox" checked={tier.isPopular} onChange={e => {
                          const newTiers = [...tiers];
                          if (e.target.checked) newTiers.forEach(t => t.isPopular = false);
                          newTiers[index].isPopular = e.target.checked;
                          setTiers(newTiers);
                        }} />
                        Mark as Most Popular
                      </label>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Features</label>
                    {tier.features.map((feat, fIndex) => (
                      <div key={fIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input type="text" className={styles.formInput} placeholder="EN Feature" value={feat} onChange={e => {
                          const newTiers = [...tiers]; newTiers[index].features[fIndex] = e.target.value; setTiers(newTiers);
                        }} style={{ flex: 1 }} />
                        <input type="text" className={styles.formInput} placeholder="AR Feature" dir="rtl" value={tiersAr[index]?.features[fIndex] || ''} onChange={e => {
                          const newTiers = [...tiersAr]; if(!newTiers[index]) newTiers[index] = {name:'', duration:'', features:['']}; newTiers[index].features[fIndex] = e.target.value; setTiersAr(newTiers);
                        }} style={{ flex: 1 }} />
                        <Button type="button" variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={() => {
                          const newTiers = [...tiers]; newTiers[index].features = newTiers[index].features.filter((_, i) => i !== fIndex); setTiers(newTiers);
                          const newTiersAr = [...tiersAr]; if(newTiersAr[index]) { newTiersAr[index].features = newTiersAr[index].features.filter((_, i) => i !== fIndex); setTiersAr(newTiersAr); }
                        }} />
                      </div>
                    ))}
                    <Button type="button" variant="secondary" size="sm" onClick={() => {
                      const newTiers = [...tiers]; newTiers[index].features.push(''); setTiers(newTiers);
                      const newTiersAr = [...tiersAr]; if(newTiersAr[index]) { newTiersAr[index].features.push(''); setTiersAr(newTiersAr); }
                    }}>+ Add Feature</Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'process' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 className={styles.cardTitle} style={{ margin: 0 }}>Service Process</h2>
                <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => { setProcess([...process, { step: `${process.length + 1}`, title: '', desc: '' }]); setProcessAr([...processAr, { step: `${processAr.length + 1}`, title: '', desc: '' }]); }}>
                  Add Step
                </Button>
              </div>

              {process.map((step, index) => (
                <div key={index} className={styles.card} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Step {index + 1}</h4>
                    <button type="button" onClick={() => { setProcess(process.filter((_, i) => i !== index)); setProcessAr(processAr.filter((_, i) => i !== index)); }} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                      <label className={styles.formLabel}>Step Number</label>
                      <input type="text" className={styles.formInput} value={step.step} onChange={e => {
                        const newP = [...process]; newP[index].step = e.target.value; setProcess(newP);
                        const newPAr = [...processAr]; if(newPAr[index]) newPAr[index].step = e.target.value; setProcessAr(newPAr);
                      }} placeholder="01" />
                    </div>
                    <div className={styles.formGroup} style={{ flex: 2, margin: 0 }}>
                      <label className={styles.formLabel}>Title (EN)</label>
                      <input type="text" className={styles.formInput} value={step.title} onChange={e => {
                        const newP = [...process]; newP[index].title = e.target.value; setProcess(newP);
                      }} placeholder="e.g. Discovery" />
                    </div>
                    <div className={styles.formGroup} style={{ flex: 2, margin: 0 }}>
                      <label className={styles.formLabel}>Title (AR)</label>
                      <input type="text" className={styles.formInput} dir="rtl" value={processAr[index]?.title || ''} onChange={e => {
                        const newP = [...processAr]; if(!newP[index]) newP[index] = {step:'', title:'', desc:''}; newP[index].title = e.target.value; setProcessAr(newP);
                      }} placeholder="اسم الخطوة" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                      <label className={styles.formLabel}>Description (EN)</label>
                      <textarea className={styles.formTextarea} value={step.desc} onChange={e => {
                          const newP = [...process]; newP[index].desc = e.target.value; setProcess(newP);
                      }} rows={3} />
                    </div>
                    <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                      <label className={styles.formLabel}>Description (AR)</label>
                      <textarea className={styles.formTextarea} dir="rtl" value={processAr[index]?.desc || ''} onChange={e => {
                          const newP = [...processAr]; if(!newP[index]) newP[index] = {step:'', title:'', desc:''}; newP[index].desc = e.target.value; setProcessAr(newP);
                      }} rows={3} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 className={styles.cardTitle} style={{ margin: 0 }}>Recent Projects</h2>
                <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setPortfolio([...portfolio, { client: '', project: '', desc: '', tags: '', image: '', link: '' }])}>
                  Add Project
                </Button>
              </div>

              {portfolio.map((proj, index) => (
                <div key={index} className={styles.card} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Project {index + 1}</h4>
                    <button type="button" onClick={() => setPortfolio(portfolio.filter((_, i) => i !== index))} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                      <label className={styles.formLabel}>Client Name</label>
                      <input type="text" className={styles.formInput} value={proj.client} onChange={e => {
                        const newP = [...portfolio]; newP[index].client = e.target.value; setPortfolio(newP);
                      }} placeholder="e.g. NexoBank" />
                    </div>
                    <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                      <label className={styles.formLabel}>Project Name</label>
                      <input type="text" className={styles.formInput} value={proj.project} onChange={e => {
                        const newP = [...portfolio]; newP[index].project = e.target.value; setPortfolio(newP);
                      }} placeholder="e.g. Fintech Dashboard" />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Description</label>
                    <textarea className={styles.formTextarea} value={proj.desc} onChange={e => {
                        const newP = [...portfolio]; newP[index].desc = e.target.value; setPortfolio(newP);
                    }} rows={2} />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tech Stack / Tags (Comma separated)</label>
                    <input type="text" className={styles.formInput} value={proj.tags} onChange={e => {
                        const newP = [...portfolio]; newP[index].tags = e.target.value; setPortfolio(newP);
                    }} placeholder="React, Node.js, Stripe" />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Project Link (URL)</label>
                    <input type="text" className={styles.formInput} value={proj.link || ''} onChange={e => {
                        const newP = [...portfolio]; newP[index].link = e.target.value; setPortfolio(newP);
                    }} placeholder="https://..." />
                  </div>

                  <div className={styles.formGroup} style={{ margin: 0 }}>
                    <label className={styles.formLabel}>Project Image URL</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" className={styles.formInput} value={proj.image} onChange={e => {
                          const newP = [...portfolio]; newP[index].image = e.target.value; setPortfolio(newP);
                      }} style={{ flex: 1 }} />
                      <input type="file" id={`portfolio-img-${index}`} hidden accept="image/*" onChange={(e) => handlePortfolioImageUpload(e, index)} />
                      <Button type="button" variant="secondary" onClick={() => document.getElementById(`portfolio-img-${index}`)?.click()} icon={<ImageIcon size={16} />}>Upload</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'testimonials' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 className={styles.cardTitle} style={{ margin: 0 }}>Client Feedback</h2>
                <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setTestimonials([...testimonials, { quote: '', author: '', role: '' }])}>
                  Add Testimonial
                </Button>
              </div>

              {testimonials.map((test, index) => (
                <div key={index} className={styles.card} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Testimonial {index + 1}</h4>
                    <button type="button" onClick={() => setTestimonials(testimonials.filter((_, i) => i !== index))} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Quote</label>
                    <textarea className={styles.formTextarea} value={test.quote} onChange={e => {
                        const newT = [...testimonials]; newT[index].quote = e.target.value; setTestimonials(newT);
                    }} rows={3} />
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                      <label className={styles.formLabel}>Author Name</label>
                      <input type="text" className={styles.formInput} value={test.author} onChange={e => {
                        const newT = [...testimonials]; newT[index].author = e.target.value; setTestimonials(newT);
                      }} placeholder="e.g. James Holloway" />
                    </div>
                    <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                      <label className={styles.formLabel}>Author Role</label>
                      <input type="text" className={styles.formInput} value={test.role} onChange={e => {
                        const newT = [...testimonials]; newT[index].role = e.target.value; setTestimonials(newT);
                      }} placeholder="e.g. VP Engineering @ NexoBank" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'media' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 className={styles.cardTitle} style={{ margin: 0 }}><ImageIcon size={18} /> Service Logo</h2>
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
                      id="service-logo-upload" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
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
                      }}
                    />
                    <Button type="button" size="sm" variant="secondary" onClick={() => document.getElementById('service-logo-upload')?.click()}>
                      Upload Logo
                    </Button>
                    <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginTop: '8px' }}>Recommended: Square image, transparent PNG or JPG, max 2MB.</p>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 className={styles.cardTitle} style={{ margin: 0 }}><ImageIcon size={18} /> Images / Screenshots</h2>
                  <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById('image-upload')?.click()}>Add Image</Button>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {images.map((img, i) => (
                    <div key={i} style={{ position: 'relative', width: '120px', height: '120px', border: '1px solid var(--clr-border)', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={img} alt={`Image ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => setImages(images.filter((_, index) => index !== i))} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <input type="file" id="image-upload" hidden accept="image/*" onChange={handleImageUpload} />
                {images.length === 0 && <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)' }}>No images uploaded.</p>}
              </div>

              <div className={styles.card}>
              <h2 className={styles.cardTitle}>SEO Settings</h2>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                  <label className={styles.formLabel}>Meta Title (EN)</label>
                  <input type="text" className={styles.formInput} value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="Title for search engines" />
                </div>
                <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                  <label className={styles.formLabel}>Meta Title (AR)</label>
                  <input type="text" className={styles.formInput} dir="rtl" value={metaTitleAr} onChange={e => setMetaTitleAr(e.target.value)} placeholder="عنوان محركات البحث" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                  <label className={styles.formLabel}>Meta Description (EN)</label>
                  <textarea className={styles.formTextarea} value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={3} placeholder="Description for search engines" />
                </div>
                <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                  <label className={styles.formLabel}>Meta Description (AR)</label>
                  <textarea className={styles.formTextarea} dir="rtl" value={metaDescriptionAr} onChange={e => setMetaDescriptionAr(e.target.value)} rows={3} placeholder="وصف محركات البحث" />
                </div>
              </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Settings</h2>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Status</label>
              <select className={styles.formSelect} value={status} onChange={e => setStatus(e.target.value)}>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Category</label>
              <select className={styles.formSelect} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">No Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Starting Price ($)</label>
              <input type="number" className={styles.formInput} value={basePrice} onChange={e => setBasePrice(e.target.value)} />
            </div>
            
            <div className={styles.formGroup} style={{ margin: 0 }}>
              <label className={styles.formLabel}>Estimated Days</label>
              <input type="number" className={styles.formInput} value={estimatedDays} onChange={e => setEstimatedDays(e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
