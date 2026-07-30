"use client";

import React, { useState, useEffect, use } from 'react';
import SignaturePad from '@/components/ui/SignaturePad';
import styles from './page.module.css';

interface SpecData {
  title: string;
  specNumber: string;
  clientName: string;
  sections: string;
  totalPrice: number | null;
  currency: string;
  validUntil: string | null;
  serviceName: string | null;
  status: string;
  companySignature: string | null;
  companySignedAt: string | null;
}

export default function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [spec, setSpec] = useState<SpecData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<{ type: string; message: string } | null>(null);

  // Signing state
  const [signerName, setSignerName] = useState('');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Decline state
  const [showDecline, setShowDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [declining, setDeclining] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        const res = await fetch(`/api/tech-specs/sign/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setErrorState({ type: data.error, message: data.message || 'Something went wrong' });
          return;
        }

        setSpec(data);
      } catch {
        setErrorState({ type: 'error', message: 'Failed to load document' });
      } finally {
        setLoading(false);
      }
    };
    fetchSpec();
  }, [token]);

  const handleSign = async () => {
    if (!signerName || !signatureData || !agreed) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/tech-specs/sign/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signerName, signatureData }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to sign');
      }

      setSuccess(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    try {
      const res = await fetch(`/api/tech-specs/sign/${token}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: declineReason }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to decline');
      }

      setDeclined(true);
      setShowDecline(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeclining(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.signPage}>
        <div className={styles.container}>
          <div className={styles.brand}>
            <div className={styles.brandName}>TroveSeek</div>
            <div className={styles.brandSub}>Document Signing</div>
          </div>
          <div className={styles.docCard}>
            <div style={{ padding: '80px', textAlign: 'center', color: '#999' }}>Loading document...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (errorState) {
    return (
      <div className={styles.signPage}>
        <div className={styles.container}>
          <div className={styles.brand}>
            <div className={styles.brandName}>TroveSeek</div>
            <div className={styles.brandSub}>Document Signing</div>
          </div>
          <div className={styles.docCard}>
            <div className={styles.errorCard}>
              <div className={styles.errorIcon}>
                {errorState.type === 'already_signed' ? '✓' : errorState.type === 'expired' ? '⏰' : '✕'}
              </div>
              <h2 className={styles.errorTitle}>
                {errorState.type === 'already_signed' ? 'Already Signed' :
                 errorState.type === 'expired' ? 'Document Expired' :
                 errorState.type === 'declined' ? 'Document Declined' : 'Error'}
              </h2>
              <p className={styles.errorDesc}>{errorState.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className={styles.signPage}>
        <div className={styles.container}>
          <div className={styles.brand}>
            <div className={styles.brandName}>TroveSeek</div>
            <div className={styles.brandSub}>Document Signing</div>
          </div>
          <div className={styles.docCard}>
            <div className={styles.successCard}>
              <div className={styles.successIcon}>✓</div>
              <h2 className={styles.successTitle}>Document Signed Successfully!</h2>
              <p className={styles.successDesc}>
                Thank you, <strong>{signerName}</strong>. Your signature has been recorded. 
                You will receive a confirmation copy at your email.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Declined state
  if (declined) {
    return (
      <div className={styles.signPage}>
        <div className={styles.container}>
          <div className={styles.brand}>
            <div className={styles.brandName}>TroveSeek</div>
            <div className={styles.brandSub}>Document Signing</div>
          </div>
          <div className={styles.docCard}>
            <div className={styles.errorCard}>
              <div className={styles.errorIcon}>✕</div>
              <h2 className={styles.errorTitle}>Document Declined</h2>
              <p className={styles.errorDesc}>The specification has been declined. The admin has been notified.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!spec) return null;

  let sections: { title: string; content: string }[] = [];
  try { sections = JSON.parse(spec.sections || '[]'); } catch {}

  return (
    <div className={styles.signPage}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.brandName}>TroveSeek</div>
          <div className={styles.brandSub}>Document Signing</div>
        </div>

        <div className={styles.docCard}>
          {/* Header */}
          <div className={styles.docHeader}>
            <div className={styles.specNumber}>{spec.specNumber}</div>
            <h1 className={styles.docTitle}>{spec.title}</h1>
            <div className={styles.docMeta}>
              <span>Prepared for: <strong>{spec.clientName}</strong></span>
              {spec.serviceName && <span>Service: <strong>{spec.serviceName}</strong></span>}
            </div>
          </div>

          {/* Body */}
          <div className={styles.docBody}>
            {sections.map((section, idx) => (
              <div key={idx} className={styles.section}>
                <h2 className={styles.sectionTitle}>{idx + 1}. {section.title}</h2>
                {section.content ? (
                  <div dangerouslySetInnerHTML={{ __html: section.content }} className={styles.sectionContent} />
                ) : (
                  <p style={{ color: '#999', fontStyle: 'italic' }}>No content</p>
                )}
              </div>
            ))}

            {/* Price */}
            {spec.totalPrice && (
              <div className={styles.priceBox}>
                <div className={styles.priceLabel}>Total Project Cost</div>
                <div className={styles.priceValue}>{spec.currency} {spec.totalPrice.toLocaleString()}</div>
                {spec.validUntil && (
                  <div className={styles.validUntil}>Valid until {new Date(spec.validUntil).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                )}
              </div>
            )}
          </div>

          {/* Company Signature */}
          {spec.companySignature && (
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '2px solid #eee' }}>
              <div style={{ fontSize: '13px', color: '#999', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company Signature</div>
              <div>
                <img src={spec.companySignature} alt="Company Signature" style={{ maxWidth: '250px', maxHeight: '100px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '8px', padding: '8px' }} />
                <div style={{ fontSize: '13px', color: '#333', marginTop: '8px' }}>TroveSeek</div>
                {spec.companySignedAt && (
                  <div style={{ fontSize: '12px', color: '#999' }}>Signed on {new Date(spec.companySignedAt).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</div>
                )}
              </div>
            </div>
          )}

          {/* Signature Area */}
          <div className={styles.signatureArea}>
            <h3 className={styles.signTitle}>Sign this Document</h3>
            <p className={styles.signDesc}>By signing below, you agree to the terms and scope described in this specification.</p>

            <input
              type="text"
              className={styles.nameInput}
              value={signerName}
              onChange={e => setSignerName(e.target.value)}
              placeholder="Your full name"
            />

            <SignaturePad onSignatureChange={setSignatureData} />

            <label className={styles.checkbox}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              <span>I have read and agree to all terms outlined in this specification document.</span>
            </label>

            <div className={styles.actions}>
              <button
                className={styles.signBtn}
                onClick={handleSign}
                disabled={!signerName || !signatureData || !agreed || submitting}
              >
                {submitting ? 'Signing...' : '✍️ Sign Document'}
              </button>
              <button className={styles.declineBtn} onClick={() => setShowDecline(true)}>
                Decline
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#999' }}>
          This document is legally binding once signed. Your IP address and timestamp will be recorded.
        </div>
      </div>

      {/* Decline Modal */}
      {showDecline && (
        <div className={styles.modal} onClick={() => setShowDecline(false)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Decline Specification</h3>
            <p className={styles.modalDesc}>Are you sure you want to decline this specification? Please provide a reason (optional).</p>
            <textarea
              className={styles.nameInput}
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              placeholder="Reason for declining (optional)"
              rows={3}
              style={{ resize: 'vertical' }}
            />
            <div className={styles.modalActions}>
              <button
                className={styles.declineBtn}
                style={{ flex: 1, background: '#ff4444', color: '#fff', borderColor: '#ff4444' }}
                onClick={handleDecline}
                disabled={declining}
              >
                {declining ? 'Declining...' : 'Confirm Decline'}
              </button>
              <button className={styles.declineBtn} style={{ flex: 1 }} onClick={() => setShowDecline(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
