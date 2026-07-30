"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import {
  ArrowLeft, Save, UploadCloud, BarChart2, Tag, Truck,
  CheckCircle2, Loader, ShieldAlert, X, Bold, Italic, List,
  Image as ImageIcon, Search, TrendingUp, Eye, ShoppingCart, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useCurrency } from '@/components/providers/CurrencyProvider';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [productType, setProductType] = useState('download');
  const { formatPrice } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const descTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [fullDescriptionAr, setFullDescriptionAr] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [bulkPricing, setBulkPricing] = useState<{ minQty: number | string; maxQty: number | string | null; discountPercent: number | string }[]>([]);
  const [stock, setStock] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [logo, setLogo] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [faqsAr, setFaqsAr] = useState<{ question: string; answer: string }[]>([]);
  const [fileUrl, setFileUrl] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaTitleAr, setMetaTitleAr] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaDescriptionAr, setMetaDescriptionAr] = useState('');
  const [orders, setOrders] = useState(0);
  const [features, setFeatures] = useState<string[]>([]);
  const [featuresAr, setFeaturesAr] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<{ name: string; value: string }[]>([]);
  const [specificationsAr, setSpecificationsAr] = useState<{ name: string; value: string }[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [requirementsAr, setRequirementsAr] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productRes, catsRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch('/api/categories'),
        ]);

        const catsJson = await catsRes.json();
        setCategories(catsJson.data ?? []);

        if (!productRes.ok) throw new Error('Failed to fetch product');
        const json = await productRes.json();
        const p = json.data;

        setName(p.name || '');
        setNameAr(p.nameAr || '');
        setSlug(p.slug || '');
        setDescription(p.description || '');
        setDescriptionAr(p.descriptionAr || '');
        setFullDescription(p.fullDescription || '');
        setFullDescriptionAr(p.fullDescriptionAr || '');
        setStatus(p.status || 'DRAFT');
        setPrice(p.price?.toString() || '');
        setSalePrice(p.salePrice?.toString() || '');
        setStock(p.stock?.toString() || '0');
        setCategoryId(p.categoryId || '');
        setMetaTitle(p.metaTitle || p.name || '');
        setMetaTitleAr(p.metaTitleAr || p.nameAr || '');
        setMetaDescription(p.metaDescription || p.description || '');
        setMetaDescriptionAr(p.metaDescriptionAr || p.descriptionAr || '');
        setLogo(p.logo || '');
        setFileUrl(p.fileUrl || '');

        try {
          const parsedBulk = JSON.parse(p.bulkPricing || '[]');
          setBulkPricing(Array.isArray(parsedBulk) ? parsedBulk : []);
        } catch { setBulkPricing([]); }

        try {
          const parsedImages = JSON.parse(p.images || '[]');
          setImages(Array.isArray(parsedImages) ? parsedImages : []);
        } catch { setImages([]); }

        try {
          const parsedTags = JSON.parse(p.tags || '[]');
          setTags(Array.isArray(parsedTags) ? parsedTags : []);
        } catch { setTags([]); }

        try {
          const parsedFaqs = JSON.parse(p.faqs || '[]');
          setFaqs(Array.isArray(parsedFaqs) ? parsedFaqs : []);
          const parsedFaqsAr = JSON.parse(p.faqsAr || '[]');
          setFaqsAr(Array.isArray(parsedFaqsAr) ? parsedFaqsAr : []);
        } catch { setFaqs([]); setFaqsAr([]); }

        try {
          const parsedFeatures = JSON.parse(p.features || '[]');
          setFeatures(Array.isArray(parsedFeatures) ? parsedFeatures : []);
          const parsedFeaturesAr = JSON.parse(p.featuresAr || '[]');
          setFeaturesAr(Array.isArray(parsedFeaturesAr) ? parsedFeaturesAr : []);
        } catch { setFeatures([]); setFeaturesAr([]); }

        try {
          const parsedSpecs = JSON.parse(p.specifications || '[]');
          setSpecifications(Array.isArray(parsedSpecs) ? parsedSpecs : []);
          const parsedSpecsAr = JSON.parse(p.specificationsAr || '[]');
          setSpecificationsAr(Array.isArray(parsedSpecsAr) ? parsedSpecsAr : []);
        } catch { setSpecifications([]); setSpecificationsAr([]); }

        try {
          const parsedReqs = JSON.parse(p.requirements || '[]');
          setRequirements(Array.isArray(parsedReqs) ? parsedReqs : []);
          const parsedReqsAr = JSON.parse(p.requirementsAr || '[]');
          setRequirementsAr(Array.isArray(parsedReqsAr) ? parsedReqsAr : []);
        } catch { setRequirements([]); setRequirementsAr([]); }

        // Estimate orders from order items
        setOrders(p._count?.orderItems ?? 0);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, '');
      if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setImages(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setFileUrl(data.url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyFormat = (format: 'bold' | 'italic' | 'list') => {
    const textarea = descTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = fullDescription.substring(start, end);
    let replacement = '';
    if (format === 'bold') replacement = `**${selected || 'bold text'}**`;
    else if (format === 'italic') replacement = `_${selected || 'italic text'}_`;
    else if (format === 'list') replacement = `\n- ${selected || 'list item'}\n- `;
    const newText = fullDescription.substring(0, start) + replacement + fullDescription.substring(end);
    setFullDescription(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!name || !price) { setError('Name and price are required.'); return; }
    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          nameAr,
          slug,
          description: description || name,
          descriptionAr,
          fullDescription,
          fullDescriptionAr,
          price: parseFloat(price),
          salePrice: salePrice ? parseFloat(salePrice) : null,
          bulkPricing: JSON.stringify(bulkPricing),
          currency: 'USD',
          stock: parseInt(stock, 10),
          status: status,
          categoryId: categoryId || undefined,
          logo: logo || null,
          images: JSON.stringify(images),
          tags: JSON.stringify(tags),
          faqs: JSON.stringify(faqs),
          faqsAr: JSON.stringify(faqsAr),
          features: JSON.stringify(features),
          featuresAr: JSON.stringify(featuresAr),
          specifications: JSON.stringify(specifications),
          specificationsAr: JSON.stringify(specificationsAr),
          requirements: JSON.stringify(requirements),
          requirementsAr: JSON.stringify(requirementsAr),
          metaTitle: metaTitle || null,
          metaTitleAr: metaTitleAr || null,
          metaDescription: metaDescription || null,
          metaDescriptionAr: metaDescriptionAr || null,
          fileUrl: fileUrl || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update product');
      }
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  // -------------------------
  // TAB: General
  // -------------------------
  const generalTab = (
    <div style={{ display: 'flex', gap: '32px', marginTop: '24px', flexWrap: 'wrap' }}>
      <div style={{ flex: '3', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Input label="Product Name (EN) *" placeholder="e.g. Next.js SaaS Starter Kit" value={name} onChange={e => setName(e.target.value)} />
        <Input label="Product Name (AR)" placeholder="الاسم بالعربية" value={nameAr} onChange={e => setNameAr(e.target.value)} dir="rtl" />

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--clr-text)' }}>URL Slug *</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ padding: '10px 12px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRight: 'none', borderRadius: '8px 0 0 8px', color: 'var(--clr-text-muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>troveseek.com/shop/</span>
            <input type="text" value={slug} onChange={e => setSlug(e.target.value)} style={{ flex: 1, padding: '10px 12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '0 8px 8px 0', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--clr-text)' }}>Short Description (EN)</label>
          <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--clr-text)' }}>Short Description (AR)</label>
          <textarea rows={3} dir="rtl" value={descriptionAr} onChange={e => setDescriptionAr(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--clr-text)' }}>Full Description (EN)</label>
          <div style={{ border: '1px solid var(--clr-border)', borderRadius: '8px', overflow: 'hidden' }}>
            <textarea
              ref={descTextareaRef}
              placeholder="Write detailed product description in English..."
              rows={5}
              value={fullDescription}
              onChange={e => setFullDescription(e.target.value)}
              style={{ width: '100%', padding: '16px', background: 'var(--clr-surface)', border: 'none', color: 'var(--clr-text)', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7 }}
            />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--clr-text)' }}>Full Description (AR)</label>
          <div style={{ border: '1px solid var(--clr-border)', borderRadius: '8px', overflow: 'hidden' }}>
            <textarea
              placeholder="وصف كامل للمنتج بالعربية..."
              dir="rtl"
              rows={5}
              value={fullDescriptionAr}
              onChange={e => setFullDescriptionAr(e.target.value)}
              style={{ width: '100%', padding: '16px', background: 'var(--clr-surface)', border: 'none', color: 'var(--clr-text)', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7 }}
            />
          </div>
        </div>
      </div>

      <div style={{ flex: '2', minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: 'var(--clr-surface-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Published (Active)</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div style={{ background: 'var(--clr-surface-elevated)', padding: '20px', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Organization</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Category</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={{ width: '100%', padding: '10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }}>
                <option value="">— No Category —</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {categories.length === 0 && (
                <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)', marginTop: '6px' }}>
                  No categories yet. <a href="/admin/categories" style={{ color: 'var(--clr-primary)' }}>Create one first.</a>
                </p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: 'var(--clr-text-muted)' }}>Tags</label>
              <input
                type="text"
                placeholder="Type a tag and press Enter..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={addTag}
                style={{ width: '100%', padding: '10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {tags.map(tag => (
                    <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: 'var(--clr-primary)', color: 'white', fontSize: '12px', borderRadius: '999px' }}>
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // -------------------------
  // TAB: Pricing
  // -------------------------
  const pricingTab = (
    <div style={{ maxWidth: '680px', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}><Input label="Regular Price (USD) *" type="number" placeholder="49.99" value={price} onChange={e => setPrice(e.target.value)} /></div>
        <div style={{ flex: 1 }}><Input label="Sale Price (Optional)" type="number" placeholder="39.99" value={salePrice} onChange={e => setSalePrice(e.target.value)} /></div>
        <div style={{ flex: 1 }}><Input label="Stock / Quantity" type="number" placeholder="0 = Unlimited" value={stock} onChange={e => setStock(e.target.value)} /></div>
      </div>
      <div style={{ padding: '16px', background: 'rgba(124,111,255,0.08)', border: '1px solid var(--clr-primary)', borderRadius: '10px', fontSize: '14px', color: 'var(--clr-text-muted)' }}>
        <strong style={{ color: 'var(--clr-text)' }}>Note:</strong> Stock of <code>0</code> means unlimited. Set a number above 0 to enable inventory tracking.
      </div>
      
      <div style={{ background: 'var(--clr-surface-elevated)', padding: '24px', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '15px' }}>Bulk Pricing Tiers</h4>
          <Button variant="secondary" size="sm" onClick={() => setBulkPricing([...bulkPricing, { minQty: 10, maxQty: null, discountPercent: 10 }])}>Add Tier</Button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bulkPricing.length === 0 && <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)', margin: 0 }}>No bulk pricing configured. Customers will pay the base or sale price.</p>}
          {bulkPricing.map((tier, index) => (
            <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input type="number" placeholder="Min Qty" value={tier.minQty} onChange={e => { const newB = [...bulkPricing]; newB[index].minQty = e.target.value === '' ? '' : parseInt(e.target.value); setBulkPricing(newB); }} style={{ width: '80px', padding: '8px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none' }} />
              <span style={{ fontSize: '13px' }}>to</span>
              <input type="number" placeholder="Max (Optional)" value={tier.maxQty || ''} onChange={e => { const newB = [...bulkPricing]; newB[index].maxQty = e.target.value === '' ? null : parseInt(e.target.value); setBulkPricing(newB); }} style={{ width: '110px', padding: '8px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none' }} />
              <span style={{ fontSize: '13px' }}>→</span>
              <input type="number" placeholder="% Off" value={tier.discountPercent} onChange={e => { const newB = [...bulkPricing]; newB[index].discountPercent = e.target.value === '' ? '' : parseInt(e.target.value); setBulkPricing(newB); }} style={{ width: '80px', padding: '8px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none' }} />
              <span style={{ color: 'var(--clr-text-muted)', fontSize: '13px' }}>% discount</span>
              <button type="button" onClick={() => setBulkPricing(bulkPricing.filter((_, i) => i !== index))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', marginLeft: 'auto' }}><X size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // -------------------------
  // TAB: Delivery
  // -------------------------
  const deliveryTab = (
    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)' }}>Choose how the customer receives this product after purchase.</p>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {[
          { type: 'download', label: 'Downloadable File', icon: <UploadCloud size={24} />, desc: 'Upload a ZIP, PDF, or any file.' },
          { type: 'key', label: 'License Key', icon: <Tag size={24} />, desc: 'Provide serial / license keys.' },
          { type: 'account', label: 'Account Access', icon: <Truck size={24} />, desc: 'Manually deliver account credentials.' },
        ].map(({ type, label, icon, desc }) => (
          <div key={type} onClick={() => setProductType(type)} style={{ flex: '1 1 180px', padding: '20px', borderRadius: '12px', border: productType === type ? '2px solid var(--clr-primary)' : '1px solid var(--clr-border)', background: productType === type ? 'rgba(124,111,255,0.05)' : 'var(--clr-surface-elevated)', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ color: productType === type ? 'var(--clr-primary)' : 'var(--clr-text-muted)', marginBottom: '10px' }}>{icon}</div>
            <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: productType === type ? 'var(--clr-text)' : 'var(--clr-text-muted)' }}>{label}</h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--clr-text-muted)' }}>{desc}</p>
          </div>
        ))}
      </div>

      {productType === 'download' && (
        <div>
          <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
          <div 
            onClick={() => !isSubmitting && fileInputRef.current?.click()} 
            onDragOver={e => e.preventDefault()} 
            onDrop={async (e) => { 
              e.preventDefault(); 
              if (isSubmitting) return;
              const file = e.dataTransfer.files[0]; 
              if (!file) return;
              try {
                setIsSubmitting(true);
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', 'products');
          
                const res = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData,
                });
          
                if (!res.ok) throw new Error('Upload failed');
                const data = await res.json();
                setFileUrl(data.url);
              } catch (err: any) {
                setError(err.message || 'Failed to upload file');
              } finally {
                setIsSubmitting(false);
              }
            }} 
            style={{ border: '2px dashed var(--clr-border)', borderRadius: '12px', padding: '48px', textAlign: 'center', background: 'var(--clr-surface-elevated)', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
          >
            <UploadCloud size={40} style={{ margin: '0 auto 16px auto', color: fileUrl ? 'var(--clr-primary)' : 'var(--clr-text-muted)' }} />
            <h4 style={{ fontSize: '16px', margin: '0 0 8px 0', color: fileUrl ? 'var(--clr-primary)' : 'var(--clr-text)' }}>{fileUrl ? `✓ ${fileUrl}` : 'Upload product file'}</h4>
            <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)', marginBottom: '16px' }}>Drag & drop any file here, or click to browse.</p>
            <div onClick={e => e.stopPropagation()}>
              <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>Browse Files</Button>
            </div>
          </div>
        </div>
      )}
      {productType === 'key' && (
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--clr-text)' }}>Paste one key per line</label>
          <textarea placeholder={'XXXX-XXXX-XXXX-XXXX\nYYYY-YYYY-YYYY-YYYY'} rows={10} style={{ width: '100%', padding: '16px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontFamily: 'monospace', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
      )}
      {productType === 'account' && (
        <div style={{ padding: '24px', background: 'var(--clr-surface-elevated)', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>After purchase, you will be notified to manually deliver the account credentials to the customer through the Messages system.</p>
        </div>
      )}
    </div>
  );

  // -------------------------
  // TAB: Media
  // -------------------------
  const mediaTab = (
    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Media Box */}
      <div style={{ border: '1px solid var(--clr-border)', borderRadius: '16px', padding: '32px', background: 'var(--clr-surface)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}><ImageIcon size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '8px' }}/> Media</h3>
        
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
          {logo ? (
            <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: `url(${logo}) center/cover`, border: '1px solid var(--clr-border)', position: 'relative' }}>
              <button type="button" onClick={() => setLogo('')} style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'rgba(255,0,0,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} />
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
              id="product-logo-upload" 
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
            <Button type="button" size="sm" variant="secondary" onClick={() => document.getElementById('product-logo-upload')?.click()}>
              Upload Logo
            </Button>
            <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginTop: '8px' }}>Recommended: Square image, transparent PNG or JPG, max 2MB.</p>
          </div>
        </div>

        <input ref={imageInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageUpload} />
        <div onClick={() => imageInputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); Array.from(e.dataTransfer.files).forEach(file => { const r = new FileReader(); r.onload = ev => setImages(p => [...p, ev.target?.result as string]); r.readAsDataURL(file); }); }} style={{ border: '2px dashed var(--clr-border)', borderRadius: '12px', padding: '40px', textAlign: 'center', background: 'var(--clr-surface-elevated)', cursor: 'pointer' }}>
          <ImageIcon size={40} style={{ margin: '0 auto 16px auto', color: 'var(--clr-text-muted)' }} />
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Upload Gallery Images</h4>
          <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)', marginBottom: '16px' }}>Drag & drop images here, or click to browse. PNG, JPG, WebP supported.</p>
          <div onClick={e => e.stopPropagation()}>
            <Button type="button" variant="secondary" onClick={() => imageInputRef.current?.click()}>Choose Images</Button>
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div>
          <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '12px' }}>Uploaded Images ({images.length})</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {images.map((src, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1', border: '1px solid var(--clr-border)' }}>
                <img src={src} alt={`Product image ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                  <X size={12} />
                </button>
                {i === 0 && <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'var(--clr-primary)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>Main</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // -------------------------
  // TAB: SEO
  // -------------------------
  const seoTab = (
    <div style={{ maxWidth: '680px', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--clr-text)' }}>
          <Search size={14} style={{ display: 'inline', marginRight: '6px' }} />Meta Title (EN)
        </label>
        <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} maxLength={70} style={{ width: '100%', padding: '10px 12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--clr-text)' }}>Meta Title (AR)</label>
        <input type="text" dir="rtl" value={metaTitleAr} onChange={e => setMetaTitleAr(e.target.value)} maxLength={70} style={{ width: '100%', padding: '10px 12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--clr-text)' }}>Meta Description (EN)</label>
        <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} maxLength={170} rows={3} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--clr-text)' }}>Meta Description (AR)</label>
        <textarea dir="rtl" value={metaDescriptionAr} onChange={e => setMetaDescriptionAr(e.target.value)} maxLength={170} rows={3} style={{ width: '100%', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
      </div>

      <div style={{ padding: '20px', background: 'var(--clr-surface-elevated)', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Google Search Preview</p>
        <div style={{ fontFamily: 'Arial, sans-serif' }}>
          <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginBottom: '4px' }}>troveseek.com › shop › {slug}</div>
          <div style={{ fontSize: '18px', color: '#1a0dab', marginBottom: '4px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{metaTitle || name || 'Product Name | TroveSeek'}</div>
          <div style={{ fontSize: '14px', color: '#4d5156', lineHeight: 1.5 }}>{(metaDescription || description || 'Your product description will appear here in Google search results.').slice(0, 160)}</div>
        </div>
      </div>
    </div>
  );

  // -------------------------
  // TAB: FAQs
  // -------------------------
  const faqsTab = (
    <div style={{ maxWidth: '680px', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ background: 'var(--clr-surface-elevated)', padding: '24px', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '15px' }}>Frequently Asked Questions</h4>
          <Button variant="secondary" size="sm" onClick={() => { setFaqs([...faqs, { question: '', answer: '' }]); setFaqsAr([...faqsAr, { question: '', answer: '' }]); }}>Add FAQ</Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.length === 0 && <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)', margin: 0 }}>No FAQs added. The FAQ section will be hidden on the product page.</p>}
          {faqs.map((faq, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input type="text" placeholder="Question (EN)" value={faq.question} onChange={e => { const newF = [...faqs]; newF[index].question = e.target.value; setFaqs(newF); }} style={{ width: '100%', padding: '10px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none' }} />
                <input type="text" placeholder="السؤال (AR)" dir="rtl" value={faqsAr[index]?.question || ''} onChange={e => { const newF = [...faqsAr]; if(!newF[index]) newF[index] = {question: '', answer: ''}; newF[index].question = e.target.value; setFaqsAr(newF); }} style={{ width: '100%', padding: '10px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <textarea placeholder="Answer (EN)" rows={2} value={faq.answer} onChange={e => { const newF = [...faqs]; newF[index].answer = e.target.value; setFaqs(newF); }} style={{ width: '100%', padding: '10px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none', resize: 'vertical' }} />
                <textarea placeholder="الإجابة (AR)" dir="rtl" rows={2} value={faqsAr[index]?.answer || ''} onChange={e => { const newF = [...faqsAr]; if(!newF[index]) newF[index] = {question: '', answer: ''}; newF[index].answer = e.target.value; setFaqsAr(newF); }} style={{ width: '100%', padding: '10px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none', resize: 'vertical' }} />
              </div>
              <button type="button" onClick={() => { setFaqs(faqs.filter((_, i) => i !== index)); setFaqsAr(faqsAr.filter((_, i) => i !== index)); }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><X size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // -------------------------
  // TAB: Attributes (Features, Specs, Requirements)
  // -------------------------
  const attributesTab = (
    <div style={{ maxWidth: '680px', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Features */}
      <div style={{ background: 'var(--clr-surface-elevated)', padding: '24px', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '15px' }}>Features</h4>
          <Button type="button" variant="secondary" size="sm" onClick={() => { setFeatures([...features, '']); setFeaturesAr([...featuresAr, '']); }}>Add Feature</Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {features.length === 0 && <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)', margin: 0 }}>No features added.</p>}
          {features.map((feature, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="text" placeholder="EN Feature" value={feature} onChange={e => { const newF = [...features]; newF[index] = e.target.value; setFeatures(newF); }} style={{ flex: 1, padding: '10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none' }} />
              <input type="text" placeholder="AR Feature" dir="rtl" value={featuresAr[index] || ''} onChange={e => { const newF = [...featuresAr]; newF[index] = e.target.value; setFeaturesAr(newF); }} style={{ flex: 1, padding: '10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none' }} />
              <button type="button" onClick={() => { setFeatures(features.filter((_, i) => i !== index)); setFeaturesAr(featuresAr.filter((_, i) => i !== index)); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><X size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Specifications */}
      <div style={{ background: 'var(--clr-surface-elevated)', padding: '24px', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '15px' }}>Specifications</h4>
          <Button type="button" variant="secondary" size="sm" onClick={() => { setSpecifications([...specifications, { name: '', value: '' }]); setSpecificationsAr([...specificationsAr, { name: '', value: '' }]); }}>Add Spec</Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {specifications.length === 0 && <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)', margin: 0 }}>No specifications added.</p>}
          {specifications.map((spec, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="EN Name" value={spec.name} onChange={e => { const newS = [...specifications]; newS[index].name = e.target.value; setSpecifications(newS); }} style={{ flex: 1, padding: '10px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none' }} />
                  <input type="text" placeholder="EN Value" value={spec.value} onChange={e => { const newS = [...specifications]; newS[index].value = e.target.value; setSpecifications(newS); }} style={{ flex: 1, padding: '10px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="AR Name" dir="rtl" value={specificationsAr[index]?.name || ''} onChange={e => { const newS = [...specificationsAr]; if(!newS[index]) newS[index] = {name:'', value:''}; newS[index].name = e.target.value; setSpecificationsAr(newS); }} style={{ flex: 1, padding: '10px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none' }} />
                  <input type="text" placeholder="AR Value" dir="rtl" value={specificationsAr[index]?.value || ''} onChange={e => { const newS = [...specificationsAr]; if(!newS[index]) newS[index] = {name:'', value:''}; newS[index].value = e.target.value; setSpecificationsAr(newS); }} style={{ flex: 1, padding: '10px', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none' }} />
                </div>
              </div>
              <button type="button" onClick={() => { setSpecifications(specifications.filter((_, i) => i !== index)); setSpecificationsAr(specificationsAr.filter((_, i) => i !== index)); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><X size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div style={{ background: 'var(--clr-surface-elevated)', padding: '24px', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '15px' }}>Requirements</h4>
          <Button type="button" variant="secondary" size="sm" onClick={() => { setRequirements([...requirements, '']); setRequirementsAr([...requirementsAr, '']); }}>Add Requirement</Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {requirements.length === 0 && <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)', margin: 0 }}>No requirements added.</p>}
          {requirements.map((req, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="text" placeholder="EN Req" value={req} onChange={e => { const newR = [...requirements]; newR[index] = e.target.value; setRequirements(newR); }} style={{ flex: 1, padding: '10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none' }} />
              <input type="text" placeholder="AR Req" dir="rtl" value={requirementsAr[index] || ''} onChange={e => { const newR = [...requirementsAr]; newR[index] = e.target.value; setRequirementsAr(newR); }} style={{ flex: 1, padding: '10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)', outline: 'none' }} />
              <button type="button" onClick={() => { setRequirements(requirements.filter((_, i) => i !== index)); setRequirementsAr(requirementsAr.filter((_, i) => i !== index)); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><X size={16} /></button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );

  // -------------------------
  // TAB: Analytics
  // -------------------------
  const analyticsTab = (
    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Total Orders', value: orders > 0 ? orders.toString() : '—', icon: <ShoppingCart size={20} />, color: '#00e5b0' },
          { label: 'Estimated Revenue', value: orders > 0 ? formatPrice(orders * parseFloat(price || '0')) : '—', icon: <TrendingUp size={20} />, color: '#f59e0b' },
          { label: 'Status', value: status, icon: <Eye size={20} />, color: 'var(--clr-primary)' },
          { label: 'Stock Left', value: parseInt(stock) === 0 ? '∞' : stock, icon: <BarChart2 size={20} />, color: '#ec4899' },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '20px', background: 'var(--clr-surface-elevated)', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
            <div style={{ color: stat.color, marginBottom: '12px' }}>{stat.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{stat.value}</div>
            <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '8px', color: 'var(--clr-text-muted)' }}><Loader className="spin" size={24} /> Loading product...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Link href="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--clr-text-muted)', fontSize: '14px', textDecoration: 'none', marginBottom: '8px' }}>
            <ArrowLeft size={14} /> Back to Products
          </Link>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0 }}>Edit Product</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="ghost" icon={<Trash2 size={16} />} onClick={handleDelete} disabled={isSubmitting} style={{ color: '#ef4444' }}>
            Delete
          </Button>
          <Button variant="primary" icon={isSubmitting ? <Loader className="spin" size={16} /> : <Save size={16} />} onClick={() => handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
          <ShieldAlert size={18} /> {error}
        </div>
      )}

      <Card>
        <CardBody style={{ padding: '32px' }}>
          <Tabs
            items={[
              { id: 'general', label: 'General', content: generalTab },
              { id: 'pricing', label: 'Pricing', content: pricingTab },
              { id: 'delivery', label: 'Delivery', content: deliveryTab },
              { id: 'media', label: 'Media', content: mediaTab },
              { id: 'attributes', label: 'Attributes', content: attributesTab },
              { id: 'faqs', label: 'FAQs', content: faqsTab },
              { id: 'seo', label: 'SEO', content: seoTab },
              { id: 'analytics', label: 'Analytics', content: analyticsTab },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
