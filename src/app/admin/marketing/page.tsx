"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Plus, CheckCircle2, AlertCircle, Mail, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function MarketingAdminPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [seoScore, setSeoScore] = useState<number | null>(null);
  const [seoIssues, setSeoIssues] = useState<any[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    fetch('/api/marketing/coupons').then(res => res.json()).then(res => setCoupons(res.data || []));
    fetch('/api/marketing/campaigns').then(res => res.json()).then(res => setCampaigns(res.data || []));
  }, []);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/marketing/seo/audit', { method: 'POST' });
      const { data } = await res.json();
      setSeoScore(data.score);
      setSeoIssues(data.issues);
      toast.success('Audit complete');
    } catch (e) {
      toast.error('Failed to run audit');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleGenerateSitemap = async () => {
    setIsGenerating(true);
    try {
      await fetch('/api/marketing/seo/sitemap', { method: 'POST' });
      toast.success('Sitemap regenerated');
    } catch (e) {
      toast.error('Failed to generate sitemap');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await fetch(`/api/marketing/campaigns/${id}`, { method: 'DELETE' });
      setCampaigns(prev => prev.filter(c => c.id !== id));
      toast.success('Campaign deleted');
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const seoTab = (
    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: seoScore !== null ? (seoScore > 80 ? 'conic-gradient(var(--clr-primary) 0% 100%)' : 'conic-gradient(#ffaa00 0% 100%)') : 'conic-gradient(var(--clr-border) 0% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
          <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: 'var(--clr-surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '36px', fontWeight: 700, color: seoScore !== null ? (seoScore > 80 ? 'var(--clr-primary)' : '#ffaa00') : 'var(--clr-text)' }}>{seoScore !== null ? seoScore : '—'}</span>
            <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>/ 100</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>SEO Health {seoScore !== null ? '' : '— Not Analyzed'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {seoIssues.length === 0 && seoScore !== null ? (
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={16} color="var(--clr-primary)" />
                <span style={{ fontSize: '14px' }}>All pages have good SEO metadata!</span>
              </div>
            ) : seoScore === null ? (
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={16} color="#ffaa00" />
                <span style={{ fontSize: '14px' }}>Run a full audit to populate SEO data</span>
              </div>
            ) : (
              <span style={{ fontSize: '14px' }}>Found {seoIssues.length} items with missing metadata.</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <Button variant="primary" onClick={handleGenerateSitemap} disabled={isGenerating}>{isGenerating ? 'Generating...' : 'Regenerate Sitemap'}</Button>
            <Button variant="secondary" onClick={handleRunAudit} disabled={isAuditing}>{isAuditing ? 'Auditing...' : 'Run Full Audit'}</Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader style={{ padding: '20px', borderBottom: '1px solid var(--clr-border)', flexDirection: 'row', display: 'flex', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>Audit Results</h4>
        </CardHeader>
        {seoScore === null ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
            <CheckCircle2 size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ margin: 0 }}>Run a full SEO audit to populate page scores</p>
          </div>
        ) : (
           <DataTable
            columns={[
              { key: 'type', label: 'Type' },
              { key: 'name', label: 'Item Name' },
              { key: 'issues', label: 'Issues' },
            ]}
            data={seoIssues.map(issue => ({
              id: issue.name,
              type: <Badge variant="default">{issue.type}</Badge>,
              name: issue.name,
              issues: <span style={{ color: '#ef4444', fontSize: '13px' }}>{issue.issues.join(', ')}</span>
            }))}
          />
        )}
      </Card>
    </div>
  );

  const couponsTab = (
    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>All Coupons</h3>
        <Link href="/admin/marketing/coupons/new" style={{ textDecoration: 'none' }}>
          <Button variant="primary" icon={<Plus size={16} />}>Create Coupon</Button>
        </Link>
      </div>
      <Card>
        <DataTable
          columns={[
            { key: 'code', label: 'Code' },
            { key: 'discount', label: 'Discount' },
            { key: 'appliesTo', label: 'Applies To' },
            { key: 'usage', label: 'Usage' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: '' },
          ]}
          data={coupons.map(c => ({
            id: c.id,
            code: <strong>{c.code}</strong>,
            discount: c.type === 'PERCENTAGE' ? `${c.discount}%` : `$${c.discount}`,
            appliesTo: c.appliesTo,
            usage: `${c.usage} ${c.maxUsage ? `/ ${c.maxUsage}` : ''}`,
            status: <Badge variant={c.status === 'ACTIVE' ? 'success' : 'default'}>{c.status}</Badge>,
            actions: (
              <Link href={`/admin/marketing/coupons/${c.id}/edit`} style={{ color: 'var(--clr-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Edit size={14} /> Edit
              </Link>
            )
          }))}
        />
        {coupons.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
            <p style={{ margin: 0 }}>No coupons yet. Create your first coupon to get started.</p>
          </div>
        )}
      </Card>
    </div>
  );

  const newsletterTab = (
    <div style={{ marginTop: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Email Campaigns</h3>
          <Link href="/admin/marketing/campaigns/new" style={{ textDecoration: 'none' }}>
             <Button variant="primary" icon={<Mail size={16} />}>Compose Campaign</Button>
          </Link>
        </div>
        <Card>
          <DataTable
            columns={[
              { key: 'subject', label: 'Subject' },
              { key: 'sent', label: 'Sent Date' },
              { key: 'status', label: 'Status' },
              { key: 'actions', label: '' },
            ]}
            data={campaigns.map(c => ({
              id: c.id,
              subject: c.subject,
              sent: c.sentAt ? new Date(c.sentAt).toLocaleDateString() : '—',
              status: <Badge variant={c.status === 'SENT' ? 'success' : 'warning'}>{c.status}</Badge>,
              actions: (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Link href={`/admin/marketing/campaigns/${c.id}/edit`} style={{ color: 'var(--clr-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Edit size={14} /> Edit
                  </Link>
                  <button onClick={() => handleDeleteCampaign(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )
            }))}
          />
          {campaigns.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
              <p style={{ margin: 0 }}>No campaigns yet. Compose your first email campaign.</p>
            </div>
          )}
        </Card>
      </div>

      <div style={{ flex: '1 1 300px' }}>
        <Card>
          <CardBody style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '16px' }}>Subscriber Stats</h4>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <p style={{ fontSize: '36px', fontWeight: 700, margin: 0, color: 'var(--clr-text)' }}>?</p>
              <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)', margin: '4px 0 0 0' }}>Total subscribers</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Marketing &amp; SEO</h1>
        <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage SEO health, coupons, and email campaigns</p>
      </div>

      <Card>
        <CardBody style={{ padding: '32px' }}>
          <Tabs
            items={[
              { id: 'seo', label: 'SEO Dashboard', content: seoTab },
              { id: 'coupons', label: 'Coupons', content: couponsTab },
              { id: 'newsletter', label: 'Newsletter', content: newsletterTab },
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
