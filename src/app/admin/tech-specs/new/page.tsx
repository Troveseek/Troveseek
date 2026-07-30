"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react';
import Link from 'next/link';
import styles from '../../form.module.css';
import TiptapEditor from '@/components/ui/TiptapEditor';
import SignaturePad from '@/components/ui/SignaturePad';

export default function NewTechSpecPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // General
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [companySignature, setCompanySignature] = useState<string | null>(null);

  // Sections
  const [sections, setSections] = useState<{ title: string; content: string }[]>([
    { title: 'Project Overview', content: '' },
    { title: 'Scope of Work', content: '' },
    { title: 'Deliverables', content: '' },
    { title: 'Pricing & Payment Terms', content: '' },
    { title: 'Terms & Conditions', content: '' },
  ]);

  // Services list for dropdown
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(j => {
        const data = Array.isArray(j) ? j : (j.data ?? []);
        setServices(data.map((s: any) => ({ id: s.id, name: s.name })));
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!title || !clientName || !clientEmail) {
      setError('Please fill in Title, Client Name, and Client Email');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const payload = {
        title,
        clientName,
        clientEmail,
        serviceId: serviceId || undefined,
        totalPrice: totalPrice ? parseFloat(totalPrice) : undefined,
        currency,
        validUntil: validUntil || undefined,
        notes: notes || undefined,
        sections: JSON.stringify(sections),
        companySignature: companySignature || undefined,
      };

      const res = await fetch('/api/tech-specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      router.push('/admin/tech-specs');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSection = (index: number, field: 'title' | 'content', value: string) => {
    setSections(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addSection = () => {
    setSections(prev => [...prev, { title: '', content: '' }]);
  };

  const removeSection = (index: number) => {
    setSections(prev => prev.filter((_, i) => i !== index));
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'sections', label: 'Document Sections' },
    { id: 'preview', label: 'Preview' },
  ];

  return (
    <div className={styles.formPage}>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/admin/tech-specs">
            <Button variant="ghost" icon={<ArrowLeft size={18} />} />
          </Link>
          <div>
            <h1 className={styles.title}>Create Tech Spec</h1>
            <p className={styles.subtitle}>Draft a new technical specification document</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin/tech-specs"><Button variant="secondary">Cancel</Button></Link>
          <Button variant="primary" icon={<Save size={16} />} onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Draft'}
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
              <button key={t.id} className={`${styles.tab} ${activeTab === t.id ? styles.active : ''}`} onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'general' && (
              <>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Client & Project Details</h3>
                  <div className={styles.twoCols}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Document Title *</label>
                    <input type="text" className={styles.formInput} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Web Platform Development Spec" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Linked Service</label>
                    <select className={styles.formSelect} value={serviceId} onChange={e => setServiceId(e.target.value)}>
                      <option value="">None</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className={styles.twoCols}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Client Name *</label>
                    <input type="text" className={styles.formInput} value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Acme Corp" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Client Email *</label>
                    <input type="email" className={styles.formInput} value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="client@acme.com" />
                  </div>
                </div>

                <div className={styles.twoCols}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Total Price</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="number" className={styles.formInput} value={totalPrice} onChange={e => setTotalPrice(e.target.value)} placeholder="0.00" style={{ flex: 1 }} />
                      <select className={styles.formSelect} value={currency} onChange={e => setCurrency(e.target.value)} style={{ width: '100px' }}>
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                        <option>MAD</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Valid Until</label>
                    <input type="date" className={styles.formInput} value={validUntil} onChange={e => setValidUntil(e.target.value)} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Internal Notes</label>
                  <textarea className={styles.formTextarea} rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes visible only to admins..." />
                </div>
              </div>
              
              <div className={styles.card} style={{ marginTop: '24px' }}>
                <h3 className={styles.cardTitle}>Your Company Signature / Stamp</h3>
                <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginBottom: '16px' }}>
                  Optionally sign this document now or upload your company stamp before sending it to the client.
                </p>
                <div style={{ maxWidth: '400px' }}>
                  <SignaturePad onSignatureChange={setCompanySignature} width={400} height={150} />
                </div>
              </div>
            </>
            )}

            {activeTab === 'sections' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {sections.map((section, idx) => (
                  <div key={idx} className={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <GripVertical size={16} style={{ color: 'var(--clr-text-muted)' }} />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--clr-primary)', fontFamily: 'var(--font-mono)' }}>SECTION {idx + 1}</span>
                      </div>
                      {sections.length > 1 && (
                        <Button variant="ghost" size="sm" icon={<Trash2 size={14} color="#ff4444" />} onClick={() => removeSection(idx)} />
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Section Title</label>
                      <input type="text" className={styles.formInput} value={section.title} onChange={e => updateSection(idx, 'title', e.target.value)} placeholder="e.g. Scope of Work" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Content</label>
                      <div style={{ background: '#fff', color: '#000', borderRadius: '8px' }}>
                        <TiptapEditor value={section.content} onChange={(val) => updateSection(idx, 'content', val)} />
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="secondary" icon={<Plus size={14} />} onClick={addSection}>Add Section</Button>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Document Preview</h3>
                <div style={{ padding: '32px', background: '#fff', color: '#1a1a2e', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                  {/* Header */}
                  <div style={{ textAlign: 'center', marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid #eee' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#1a1a2e' }}>{title || 'Untitled Specification'}</h1>
                    <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>Prepared for: <strong>{clientName || '—'}</strong></p>
                    {totalPrice && (
                      <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
                        Total: <strong>{currency} {parseFloat(totalPrice).toLocaleString()}</strong>
                      </p>
                    )}
                    {validUntil && (
                      <p style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>Valid until: {validUntil}</p>
                    )}
                  </div>

                  {/* Sections */}
                  {sections.map((section, idx) => (
                    <div key={idx} style={{ marginBottom: '28px' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>
                        {idx + 1}. {section.title || 'Untitled Section'}
                      </h2>
                      {section.content ? (
                        <div dangerouslySetInnerHTML={{ __html: section.content }} style={{ lineHeight: 1.7, color: '#333', fontSize: '14px' }} />
                      ) : (
                        <p style={{ color: '#999', fontStyle: 'italic', fontSize: '14px' }}>No content yet</p>
                      )}
                    </div>
                  ))}

                  {/* Signature Area */}
                  <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '2px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>Client Signature</p>
                        <div style={{ width: '200px', height: '60px', borderBottom: '1px solid #333' }} />
                        <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{clientName || 'Client Name'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>Date</p>
                        <div style={{ width: '150px', height: '60px', borderBottom: '1px solid #333' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--clr-surface-3)', borderRadius: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#888' }} />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Draft</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)', marginTop: '12px' }}>
              Save as draft first, then send to the client for e-signature.
            </p>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Quick Tips</h3>
            <ul style={{ fontSize: '13px', color: 'var(--clr-text-muted)', lineHeight: 1.8, paddingLeft: '16px', margin: 0 }}>
              <li>Fill in all sections before sending</li>
              <li>Add a total price for clarity</li>
              <li>Set a validity date to auto-expire</li>
              <li>Use the preview tab to check formatting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
