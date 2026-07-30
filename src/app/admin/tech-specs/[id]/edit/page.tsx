"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Loader, CheckCircle2, Clock, Eye, XCircle, Send } from 'lucide-react';
import Link from 'next/link';
import styles from '../../../form.module.css';
import TiptapEditor from '@/components/ui/TiptapEditor';
import SignaturePad from '@/components/ui/SignaturePad';
import { format } from 'date-fns';

export default function EditTechSpecPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // General
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');

  // Sections
  const [sections, setSections] = useState<{ title: string; content: string }[]>([]);

  // Meta (read-only)
  const [specNumber, setSpecNumber] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [viewedAt, setViewedAt] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signerName, setSignerName] = useState<string | null>(null);
  const [declinedAt, setDeclinedAt] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState<string | null>(null);
  const [signatureToken, setSignatureToken] = useState('');
  const [companySignature, setCompanySignature] = useState<string | null>(null);
  const [companySignedAt, setCompanySignedAt] = useState<string | null>(null);
  const [isEditingSignature, setIsEditingSignature] = useState(false);

  // Services list
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);

  // Payments
  const [payments, setPayments] = useState<any[]>([]);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPaymentTitle, setNewPaymentTitle] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specRes, servRes, paymentsRes] = await Promise.all([
          fetch(`/api/tech-specs/${id}`),
          fetch('/api/services'),
          fetch(`/api/admin/tech-specs/${id}/payments`),
        ]);

        if (!specRes.ok) throw new Error('Failed to load spec');

        const spec = await specRes.json();
        setTitle(spec.title);
        setClientName(spec.clientName);
        setClientEmail(spec.clientEmail);
        setServiceId(spec.serviceId || '');
        setTotalPrice(spec.totalPrice?.toString() || '');
        setCurrency(spec.currency || 'USD');
        setValidUntil(spec.validUntil ? spec.validUntil.split('T')[0] : '');
        setNotes(spec.notes || '');
        setSpecNumber(spec.specNumber);
        setStatus(spec.status);
        setSignedAt(spec.signedAt);
        setViewedAt(spec.viewedAt);
        setSignatureData(spec.signatureData);
        setSignerName(spec.signerName);
        setDeclinedAt(spec.declinedAt);
        setDeclineReason(spec.declineReason);
        setSignatureToken(spec.signatureToken);
        setCompanySignature(spec.companySignature || null);
        setCompanySignedAt(spec.companySignedAt || null);
        setIsEditingSignature(!spec.companySignature);

        try {
          const parsed = JSON.parse(spec.sections || '[]');
          setSections(parsed.length > 0 ? parsed : [{ title: '', content: '' }]);
        } catch { setSections([{ title: '', content: '' }]); }

        if (servRes.ok) {
          const servData = await servRes.json();
          const list = Array.isArray(servData) ? servData : (servData.data ?? []);
          setServices(list.map((s: any) => ({ id: s.id, name: s.name })));
        }

        if (paymentsRes.ok) {
          const pData = await paymentsRes.json();
          if (pData.success) {
            setPayments(pData.payments);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
        serviceId: serviceId || null,
        totalPrice: totalPrice ? parseFloat(totalPrice) : null,
        currency,
        validUntil: validUntil || null,
        notes: notes || null,
        sections: JSON.stringify(sections),
        companySignature: companySignature || null,
      };

      const res = await fetch(`/api/tech-specs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setIsEditingSignature(false);
      setSuccess('Saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
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

  if (isLoading) {
    return <div style={{ padding: '48px', textAlign: 'center' }}><Loader className="spin" /></div>;
  }

  const isEditable = status === 'DRAFT';
  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'sections', label: 'Document Sections' },
    { id: 'tracking', label: 'Tracking & Signature' },
    { id: 'payments', label: 'Payments & Installments' },
  ];

  const statusColor: Record<string, string> = {
    DRAFT: '#888',
    SENT: 'var(--clr-primary)',
    VIEWED: '#f59e0b',
    SIGNED: 'var(--clr-accent)',
    EXPIRED: '#ff4444',
    DECLINED: '#ff4444',
  };

  return (
    <div className={styles.formPage}>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/admin/tech-specs">
            <Button variant="ghost" icon={<ArrowLeft size={18} />} />
          </Link>
          <div>
            <h1 className={styles.title}>Edit Tech Spec — {specNumber}</h1>
            <p className={styles.subtitle}>Update specification details</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin/tech-specs"><Button variant="secondary">Cancel</Button></Link>
          <Button variant="primary" icon={<Save size={16} />} onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
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

          {activeTab === 'general' && (
            <>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Client & Project Details</h3>
              <div className={styles.twoCols}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Document Title *</label>
                  <input type="text" className={styles.formInput} value={title} onChange={e => setTitle(e.target.value)} disabled={!isEditable} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Linked Service</label>
                  <select className={styles.formSelect} value={serviceId} onChange={e => setServiceId(e.target.value)} disabled={!isEditable}>
                    <option value="">None</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.twoCols}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Client Name *</label>
                  <input type="text" className={styles.formInput} value={clientName} onChange={e => setClientName(e.target.value)} disabled={!isEditable} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Client Email *</label>
                  <input type="email" className={styles.formInput} value={clientEmail} onChange={e => setClientEmail(e.target.value)} disabled={!isEditable} />
                </div>
              </div>
              <div className={styles.twoCols}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Total Price</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="number" className={styles.formInput} value={totalPrice} onChange={e => setTotalPrice(e.target.value)} disabled={!isEditable} style={{ flex: 1 }} />
                    <select className={styles.formSelect} value={currency} onChange={e => setCurrency(e.target.value)} disabled={!isEditable} style={{ width: '100px' }}>
                      <option>USD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                      <option>MAD</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Valid Until</label>
                  <input type="date" className={styles.formInput} value={validUntil} onChange={e => setValidUntil(e.target.value)} disabled={!isEditable} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Internal Notes</label>
                <textarea className={styles.formTextarea} rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
            
            <div className={styles.card} style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className={styles.cardTitle} style={{ margin: 0 }}>Your Company Signature / Stamp</h3>
                {companySignedAt && (
                  <span style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                    Signed on {format(new Date(companySignedAt), 'MMM d, yyyy h:mm a')}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginBottom: '16px' }}>
                Optionally sign this document now or upload your company stamp before sending it to the client.
              </p>
              {!isEditingSignature && companySignature ? (
                <div style={{ padding: '16px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee', display: 'inline-block' }}>
                  <img src={companySignature} alt="Company Signature" style={{ maxHeight: '100px', maxWidth: '300px' }} />
                  <div style={{ marginTop: '12px' }}>
                    <Button variant="secondary" size="sm" onClick={() => setIsEditingSignature(true)}>Change Signature</Button>
                  </div>
                </div>
              ) : (
                <div style={{ maxWidth: '400px' }}>
                  <SignaturePad 
                    onSignatureChange={setCompanySignature} 
                    width={400} 
                    height={150} 
                  />
                  {companySignature && (
                    <div style={{ marginTop: '12px', padding: '8px', background: '#f0f9f0', color: '#2e7d32', borderRadius: '6px', fontSize: '13px', border: '1px solid #c8e6c9' }}>
                      <CheckCircle2 size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
                      Signature ready to save
                    </div>
                  )}
                  {companySignature && isEditingSignature && status !== 'DRAFT' && (
                    <div style={{ marginTop: '12px' }}>
                      <Button variant="ghost" size="sm" onClick={() => { setIsEditingSignature(false); setCompanySignature(specNumber ? companySignature : null); }}>Cancel Change</Button>
                    </div>
                  )}
                </div>
              )}
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
                    {isEditable && sections.length > 1 && (
                      <Button variant="ghost" size="sm" icon={<Trash2 size={14} color="#ff4444" />} onClick={() => setSections(prev => prev.filter((_, i) => i !== idx))} />
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Section Title</label>
                    <input type="text" className={styles.formInput} value={section.title} onChange={e => updateSection(idx, 'title', e.target.value)} disabled={!isEditable} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Content</label>
                    <div style={{ background: '#fff', color: '#000', borderRadius: '8px' }}>
                      <TiptapEditor value={section.content} onChange={(val) => updateSection(idx, 'content', val)} />
                    </div>
                  </div>
                </div>
              ))}
              {isEditable && (
                <Button variant="secondary" icon={<Plus size={14} />} onClick={() => setSections(prev => [...prev, { title: '', content: '' }])}>Add Section</Button>
              )}
            </div>
          )}

          {activeTab === 'tracking' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Timeline */}
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Document Timeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { label: 'Created', done: true, icon: <CheckCircle2 size={18} />, detail: 'Spec number: ' + specNumber },
                    { label: 'Sent to Client', done: ['SENT', 'VIEWED', 'SIGNED'].includes(status), icon: <Send size={18} />, detail: clientEmail },
                    { label: 'Viewed by Client', done: !!viewedAt, icon: <Eye size={18} />, detail: viewedAt ? format(new Date(viewedAt), 'MMM d, yyyy h:mm a') : '—' },
                    { label: status === 'DECLINED' ? 'Declined' : 'Signed', done: !!signedAt || !!declinedAt, icon: status === 'DECLINED' ? <XCircle size={18} /> : <CheckCircle2 size={18} />, detail: signedAt ? format(new Date(signedAt), 'MMM d, yyyy h:mm a') : (declinedAt ? format(new Date(declinedAt), 'MMM d, yyyy h:mm a') : '—') },
                  ].map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: step.done ? 'rgba(0,229,176,0.1)' : 'var(--clr-surface-3)',
                        color: step.done ? 'var(--clr-accent)' : 'var(--clr-text-muted)',
                        border: step.done ? '1px solid rgba(0,229,176,0.3)' : '1px solid var(--clr-border)',
                        flexShrink: 0,
                      }}>
                        {step.done ? step.icon : <Clock size={18} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{step.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>{step.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature */}
              {signatureData && (
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Client Signature</h3>
                  <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                    <img src={signatureData} alt="Signature" style={{ maxWidth: '300px', height: 'auto' }} />
                    <p style={{ color: '#666', fontSize: '13px', marginTop: '8px' }}>Signed by: <strong>{signerName}</strong></p>
                    {signedAt && <p style={{ color: '#999', fontSize: '12px' }}>on {format(new Date(signedAt), 'MMMM d, yyyy h:mm a')}</p>}
                  </div>
                </div>
              )}

              {/* Decline Info */}
              {declinedAt && (
                <div className={styles.card} style={{ borderColor: '#ff4444' }}>
                  <h3 className={styles.cardTitle} style={{ color: '#ff4444' }}>Declined</h3>
                  <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)' }}>
                    The client declined this document on {format(new Date(declinedAt), 'MMMM d, yyyy h:mm a')}.
                  </p>
                  {declineReason && (
                    <div style={{ marginTop: '12px', padding: '12px', background: 'var(--clr-surface-3)', borderRadius: '8px', fontSize: '14px' }}>
                      <strong>Reason:</strong> {declineReason}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {activeTab === 'payments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 className={styles.cardTitle} style={{ margin: 0 }}>Milestone Payments</h3>
                  <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsAddingPayment(true)}>
                    Request Payment
                  </Button>
                </div>
                
                {isAddingPayment && (
                  <div style={{ background: 'var(--clr-surface-3)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--clr-border)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>New Payment Request</h4>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ flex: 2 }}>
                        <label className={styles.formLabel}>Title (e.g., Primary Deposit)</label>
                        <input type="text" className={styles.formInput} value={newPaymentTitle} onChange={e => setNewPaymentTitle(e.target.value)} placeholder="Title" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className={styles.formLabel}>Amount ({currency})</label>
                        <input type="number" className={styles.formInput} value={newPaymentAmount} onChange={e => setNewPaymentAmount(e.target.value)} placeholder="0.00" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Button variant="secondary" size="sm" onClick={() => setIsAddingPayment(false)}>Cancel</Button>
                      <Button variant="primary" size="sm" onClick={async () => {
                        if (!newPaymentTitle || !newPaymentAmount) return alert('Please enter title and amount');
                        try {
                          const res = await fetch(`/api/admin/tech-specs/${id}/payments`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title: newPaymentTitle, amount: parseFloat(newPaymentAmount), currency })
                          });
                          if (!res.ok) throw new Error('Failed to create payment');
                          const data = await res.json();
                          setPayments([data.payment, ...payments]);
                          setIsAddingPayment(false);
                          setNewPaymentTitle('');
                          setNewPaymentAmount('');
                        } catch (e: any) {
                          alert(e.message);
                        }
                      }}>Create Request</Button>
                    </div>
                  </div>
                )}

                {payments.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--clr-text-muted)', background: 'var(--clr-surface-3)', borderRadius: '8px' }}>
                    No payments requested yet. Click "Request Payment" to start billing the client.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {payments.map(p => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--clr-surface-3)', borderRadius: '8px', border: '1px solid var(--clr-border)' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '15px' }}>{p.title}</div>
                          <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginTop: '4px' }}>
                            {p.amount.toLocaleString()} {p.currency} • {new Date(p.createdAt).toLocaleDateString()}
                          </div>
                          {p.status === 'UNPAID' && (
                            <div style={{ marginTop: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)', background: 'var(--clr-surface)', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--clr-border)' }}>
                              <span style={{ color: 'var(--clr-text-muted)', marginRight: '8px' }}>Link:</span>
                              {typeof window !== 'undefined' ? `${window.location.origin}/pay/${p.id}` : `/pay/${p.id}`}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          <span style={{
                            padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                            background: p.status === 'PAID' ? '#dcfce7' : p.status === 'PROCESSING' ? '#fef3c7' : '#f1f5f9',
                            color: p.status === 'PAID' ? '#166534' : p.status === 'PROCESSING' ? '#92400e' : '#475569',
                          }}>
                            {p.status}
                          </span>
                          {p.status === 'UNPAID' && (
                            <Button variant="ghost" size="sm" onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/pay/${p.id}`);
                              alert('Payment link copied!');
                            }}>Copy Link</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--clr-surface-3)', borderRadius: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor[status] || '#888' }} />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{status}</span>
            </div>
          </div>

          {signatureToken && status !== 'DRAFT' && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Signing Link</h3>
              <div style={{ fontSize: '12px', wordBreak: 'break-all', color: 'var(--clr-text-muted)', background: 'var(--clr-surface-3)', padding: '10px', borderRadius: '6px', fontFamily: 'var(--font-mono)' }}>
                {typeof window !== 'undefined' ? `${window.location.origin}/sign/${signatureToken}` : `/sign/${signatureToken}`}
              </div>
              <Button
                variant="secondary"
                size="sm"
                style={{ marginTop: '8px', width: '100%' }}
                onClick={async () => {
                  await navigator.clipboard.writeText(`${window.location.origin}/sign/${signatureToken}`);
                  alert('Signing URL copied!');
                }}
              >
                Copy Link
              </Button>
            </div>
          )}

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--clr-text-muted)' }}>Spec #</span>
                <span style={{ fontWeight: 500 }}>{specNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--clr-text-muted)' }}>Client</span>
                <span style={{ fontWeight: 500 }}>{clientName}</span>
              </div>
              {totalPrice && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--clr-text-muted)' }}>Price</span>
                  <span style={{ fontWeight: 500 }}>{currency} {parseFloat(totalPrice).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
