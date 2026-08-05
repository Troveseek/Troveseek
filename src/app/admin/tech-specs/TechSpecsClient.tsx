"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Search, Edit, Trash2, Send, Eye, Copy, Check, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

const statusVariantMap: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'blue'> = {
  DRAFT: 'default',
  SENT: 'blue',
  VIEWED: 'warning',
  SIGNED: 'success',
  EXPIRED: 'danger',
  DECLINED: 'danger',
};

export default function TechSpecsClient({ initialSpecs }: { initialSpecs: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [data, setData] = useState(initialSpecs);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [generatingInvoiceId, setGeneratingInvoiceId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleDelete = useCallback(async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/tech-specs/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete');
      }
      setData(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting spec');
    }
  }, []);

  const handleSend = useCallback(async (id: string) => {
    setSendingId(id);
    try {
      const res = await fetch(`/api/tech-specs/${id}/send`, { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to send');

      // Copy signing URL to clipboard
      await navigator.clipboard.writeText(result.signingUrl);
      setCopiedUrl(id);
      setTimeout(() => setCopiedUrl(null), 3000);

      // Update local state
      setData(prev => prev.map(s => s.id === id ? { ...s, status: 'SENT' } : s));
      alert(`Spec sent! Signing URL copied to clipboard:\n${result.signingUrl}`);
    } catch (err: any) {
      alert(err.message || 'Error sending spec');
    } finally {
      setSendingId(null);
    }
  }, []);

  const handleGenerateInvoice = useCallback(async (id: string, specNumber: string) => {
    setGeneratingInvoiceId(id);
    try {
      const res = await fetch(`/api/tech-specs/${id}/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to generate invoice');

      // Navigate directly to the generated invoice view
      router.push(`/admin/invoices/${result.invoiceId}`);
    } catch (err: any) {
      alert(err.message || 'Error generating invoice');
    } finally {
      setGeneratingInvoiceId(null);
    }
  }, [router]);

  const formattedSpecs = useMemo(() => data.map(spec => ({
    _rawId: spec.id,
    _rawStatus: spec.status,
    specNumber: spec.specNumber,
    title: spec.title,
    client: (
      <div>
        <div style={{ fontWeight: 500 }}>{spec.clientName}</div>
        <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>{spec.clientEmail}</div>
      </div>
    ),
    service: spec.service?.name || '—',
    status: <Badge variant={statusVariantMap[spec.status] || 'default'}>{spec.status}</Badge>,
    created: format(new Date(spec.createdAt), 'MMM d, yyyy'),
    signed: spec.signedAt ? format(new Date(spec.signedAt), 'MMM d, yyyy') : '—',
    actions: (
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <Link href={`/admin/tech-specs/${spec.id}/preview`}>
          <Button variant="ghost" size="sm" icon={<Eye size={14} />} title="Preview Document" />
        </Link>
        <Link href={`/admin/tech-specs/${spec.id}/edit`}>
          <Button variant="ghost" size="sm" icon={<Edit size={14} />} title="Edit Spec & Installments" />
        </Link>

        {/* Generate Invoice Action */}
        <Button
          variant="ghost"
          size="sm"
          icon={generatingInvoiceId === spec.id ? <Loader2 size={14} className="spin" /> : <FileText size={14} color="var(--clr-primary)" />}
          onClick={() => handleGenerateInvoice(spec.id, spec.specNumber)}
          disabled={generatingInvoiceId === spec.id}
          title="Generate Official Invoice"
        />

        {spec.status === 'DRAFT' && (
          <Button
            variant="ghost"
            size="sm"
            icon={sendingId === spec.id ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
            onClick={() => handleSend(spec.id)}
            disabled={sendingId === spec.id}
            title="Send to Client for Signature"
          />
        )}
        {spec.status !== 'DRAFT' && (
          <Button
            variant="ghost"
            size="sm"
            icon={copiedUrl === spec.id ? <Check size={14} color="var(--clr-accent)" /> : <Copy size={14} />}
            onClick={async () => {
              const baseUrl = window.location.origin;
              await navigator.clipboard.writeText(`${baseUrl}/sign/${spec.signatureToken}`);
              setCopiedUrl(spec.id);
              setTimeout(() => setCopiedUrl(null), 2000);
            }}
            title="Copy Client Signing Link"
          />
        )}
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 size={14} color="#ff4444" />}
          onClick={() => handleDelete(spec.id, spec.title)}
          title="Delete Tech Spec"
        />
      </div>
    ),
  })), [data, handleDelete, handleSend, handleGenerateInvoice, sendingId, generatingInvoiceId, copiedUrl]);

  const filteredSpecs = useMemo(() => {
    return formattedSpecs.filter(spec => {
      const matchesSearch =
        spec.specNumber.toLowerCase().includes(search.toLowerCase()) ||
        spec.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || spec._rawStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, formattedSpecs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Tech Specs & E-Signatures</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Create, send, manage technical specifications, and generate client invoices</p>
        </div>
        <Link href="/admin/tech-specs/new"><Button variant="primary" icon={<Plus size={16} />}>Create New Spec</Button></Link>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
        {['All', 'DRAFT', 'SENT', 'VIEWED', 'SIGNED', 'DECLINED'].map(s => {
          const count = s === 'All' ? data.length : data.filter(d => d.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '16px',
                background: statusFilter === s ? 'var(--clr-primary-dim)' : 'var(--clr-surface-2)',
                border: statusFilter === s ? '1px solid var(--clr-primary)' : '1px solid var(--clr-border)',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--clr-text)',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{count}</div>
              <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>{s}</div>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader style={{ padding: '20px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
          <div style={{ flex: 1, position: 'relative', maxWidth: '400px' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }}><Search size={16} /></div>
            <input
              type="text"
              placeholder="Search specs by title, number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--clr-surface-elevated)',
                border: '1px solid var(--clr-border)',
                borderRadius: '8px',
                padding: '10px 12px 10px 36px',
                color: 'var(--clr-text)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
        </CardHeader>
        <DataTable
          columns={[
            { key: 'specNumber', label: 'Spec #' },
            { key: 'title', label: 'Title' },
            { key: 'client', label: 'Client' },
            { key: 'service', label: 'Service' },
            { key: 'status', label: 'Status' },
            { key: 'created', label: 'Created' },
            { key: 'signed', label: 'Signed' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={filteredSpecs}
        />
      </Card>
    </div>
  );
}
