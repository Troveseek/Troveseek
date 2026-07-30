"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import styles from '../../form.module.css';
import TiptapEditor from '@/components/ui/TiptapEditor';

export default function NewBlogPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // General
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [excerptAr, setExcerptAr] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [category, setCategory] = useState('');
  const [readTime, setReadTime] = useState('');
  const [status, setStatus] = useState('DRAFT');
  
  // Content
  const [content, setContent] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [authorImage, setAuthorImage] = useState('');
  
  // SEO & Tags
  const [metaTitle, setMetaTitle] = useState('');
  const [metaTitleAr, setMetaTitleAr] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaDescriptionAr, setMetaDescriptionAr] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Chapters
  const [chapters, setChapters] = useState<{ id: string; title: string }[]>([]);

  const handleSave = async () => {
    if (!title || !slug) {
      setError('Please fill in required fields (Title, Slug)');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const payload = {
        title, titleAr, slug, excerpt, excerptAr, content, contentAr, coverImage, authorName, authorImage, 
        category, readTime, status, 
        tags: JSON.stringify(tags),
        chapters: JSON.stringify(chapters),
        metaTitle, metaTitleAr, metaDescription, metaDescriptionAr
      };

      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      router.push('/admin/blog');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setter(data.url);
    } catch (err) {
      alert('Failed to upload image');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'content', label: 'Content' },
    { id: 'seo', label: 'SEO & Tags' },
  ];

  return (
    <div className={styles.formPage}>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/admin/blog">
            <Button variant="ghost" icon={<ArrowLeft size={18} />} />
          </Link>
          <div>
            <h1 className={styles.pageTitle}>Create Blog Post</h1>
            <p className={styles.pageDescription}>Publish a new article to your blog</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin/blog"><Button variant="secondary">Cancel</Button></Link>
          <Button variant="primary" icon={<Save size={16} />} onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Post'}
          </Button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', background: '#fff0f0', color: '#ff4444', borderRadius: '8px', border: '1px solid #ffcccc', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <div className={styles.formLayout}>
        <div className={styles.mainCol}>
          <div className={styles.tabs}>
            {tabs.map(t => (
              <button key={t.id} className={`${styles.tab} ${activeTab === t.id ? styles.activeTab : ''}`} onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'general' && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>General Information</h3>
                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label>Post Title (EN) *</label>
                    <input type="text" className={styles.formInput} value={title} onChange={e => {
                      setTitle(e.target.value);
                      if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                    }} placeholder="e.g. 10 Tips for Better SaaS Growth" />
                  </div>
                  <div className={styles.field}>
                    <label>Post Title (AR)</label>
                    <input type="text" className={styles.formInput} dir="rtl" value={titleAr} onChange={e => setTitleAr(e.target.value)} placeholder="عنوان المقال" />
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Slug *</label>
                  <input type="text" className={styles.formInput} value={slug} onChange={e => setSlug(e.target.value)} placeholder="10-tips-saas-growth" />
                </div>

                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label>Excerpt (EN)</label>
                    <textarea className={styles.formInput} rows={3} value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="A brief summary of the post..." />
                  </div>
                  <div className={styles.field}>
                    <label>Excerpt (AR)</label>
                    <textarea className={styles.formInput} dir="rtl" rows={3} value={excerptAr} onChange={e => setExcerptAr(e.target.value)} placeholder="مقتطف قصير للمقال..." />
                  </div>
                </div>

                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label>Category</label>
                    <input type="text" className={styles.formInput} value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Marketing" />
                  </div>
                  <div className={styles.field}>
                    <label>Read Time</label>
                    <input type="text" className={styles.formInput} value={readTime} onChange={e => setReadTime(e.target.value)} placeholder="e.g. 5 min read" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Content</h3>
                  <div className={styles.grid2}>
                    <div className={styles.field}>
                      <label>Full Content (EN) (Rich Text Editor)</label>
                      <div style={{ background: '#fff', color: '#000', borderRadius: '8px' }}>
                        <TiptapEditor value={content} onChange={setContent} />
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label>Full Content (AR) (Rich Text Editor)</label>
                      <div style={{ background: '#fff', color: '#000', borderRadius: '8px' }} dir="rtl">
                        <TiptapEditor value={contentAr} onChange={setContentAr} />
                      </div>
                    </div>
                  </div>
                </div>



                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Media & Author</h3>
                  <div className={styles.field}>
                    <label>Cover Image URL</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input type="text" className={styles.formInput} value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="/uploads/..." />
                      <label className={styles.uploadBtn}>
                        <ImageIcon size={16} /> Upload
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, setCoverImage)} />
                      </label>
                    </div>
                    {coverImage && <img src={coverImage} alt="Cover" style={{ marginTop: '12px', height: '120px', borderRadius: '8px', objectFit: 'cover' }} />}
                  </div>

                  <div className={styles.grid2}>
                    <div className={styles.field}>
                      <label>Author Name</label>
                      <input type="text" className={styles.formInput} value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="John Doe" />
                    </div>
                    <div className={styles.field}>
                      <label>Author Image URL</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="text" className={styles.formInput} value={authorImage} onChange={e => setAuthorImage(e.target.value)} placeholder="/uploads/..." />
                        <label className={styles.uploadBtn}>
                          <ImageIcon size={16} /> Upload
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, setAuthorImage)} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>SEO & Tags</h3>
                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label>Meta Title (EN)</label>
                    <input type="text" className={styles.formInput} value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="SEO Title (defaults to post title)" />
                  </div>
                  <div className={styles.field}>
                    <label>Meta Title (AR)</label>
                    <input type="text" className={styles.formInput} dir="rtl" value={metaTitleAr} onChange={e => setMetaTitleAr(e.target.value)} placeholder="عنوان محركات البحث" />
                  </div>
                </div>
                <div className={styles.grid2}>
                  <div className={styles.field}>
                    <label>Meta Description (EN)</label>
                    <textarea className={styles.formInput} rows={3} value={metaDescription} onChange={e => setMetaDescription(e.target.value)} placeholder="SEO description (defaults to excerpt)" />
                  </div>
                  <div className={styles.field}>
                    <label>Meta Description (AR)</label>
                    <textarea className={styles.formInput} dir="rtl" rows={3} value={metaDescriptionAr} onChange={e => setMetaDescriptionAr(e.target.value)} placeholder="وصف محركات البحث" />
                  </div>
                </div>
                
                <div className={styles.field}>
                  <label>Tags</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input type="text" className={styles.formInput} value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add a tag and press Enter" />
                    <Button variant="secondary" onClick={addTag}>Add</Button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {tags.map(tag => (
                      <div key={tag} style={{ padding: '4px 12px', background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: '999px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {tag}
                        <Trash2 size={12} style={{ cursor: 'pointer', color: 'var(--clr-text-muted)' }} onClick={() => removeTag(tag)} />
                      </div>
                    ))}
                    {tags.length === 0 && <span style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>No tags added yet.</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Publishing</h3>
            <div className={styles.field}>
              <label>Status</label>
              <select className={styles.formInput} value={status} onChange={e => setStatus(e.target.value)}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)', lineHeight: 1.5, marginTop: '16px' }}>
              Publishing will immediately make this post visible on the client-facing blog.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
