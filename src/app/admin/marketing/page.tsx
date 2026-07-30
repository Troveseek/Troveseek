"use client";

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Plus, CheckCircle2, AlertCircle, Mail } from 'lucide-react';

export default function MarketingAdminPage() {
  // All data is empty until real SEO, coupon, and campaign data is stored in the DB
  const coupons: any[] = [];
  const campaigns: any[] = [];

  const seoChecks = [
    { label: 'Sitemap not yet generated', severity: 'warning' },
    { label: 'No meta descriptions analyzed yet', severity: 'warning' },
    { label: 'Run a full audit to populate SEO data', severity: 'warning' },
  ];

  const seoTab = (
    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* SEO Health */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: 'conic-gradient(var(--clr-border) 0% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
          <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: 'var(--clr-surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '36px', fontWeight: 700, color: 'var(--clr-text)' }}>—</span>
            <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>/ 100</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>SEO Health — Not Analyzed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {seoChecks.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={16} color="#ffaa00" />
                <span style={{ fontSize: '14px' }}>{item.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <Button variant="primary">Regenerate Sitemap</Button>
            <Button variant="secondary">Run Full Audit</Button>
          </div>
        </div>
      </div>

      {/* Per-page SEO table - empty until audit runs */}
      <Card>
        <CardHeader style={{ padding: '20px', borderBottom: '1px solid var(--clr-border)', flexDirection: 'row', display: 'flex', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>Per-Page SEO Scores</h4>
        </CardHeader>
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
          <CheckCircle2 size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ margin: 0 }}>Run a full SEO audit to populate page scores</p>
        </div>
      </Card>
    </div>
  );

  const couponsTab = (
    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>All Coupons</h3>
        <Button variant="primary" icon={<Plus size={16} />}>Create Coupon</Button>
      </div>
      <Card>
        <DataTable
          columns={[
            { key: 'code', label: 'Code' },
            { key: 'discount', label: 'Discount' },
            { key: 'appliesTo', label: 'Applies To' },
            { key: 'usage', label: 'Usage' },
            { key: 'expiry', label: 'Expiry' },
            { key: 'status', label: 'Status' },
          ]}
          data={coupons}
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
    <div style={{ marginTop: '24px', display: 'flex', gap: '24px' }}>
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Email Campaigns</h3>
          <Button variant="primary" icon={<Mail size={16} />}>Compose Campaign</Button>
        </div>
        <Card>
          <DataTable
            columns={[
              { key: 'subject', label: 'Subject' },
              { key: 'sent', label: 'Sent Date' },
              { key: 'opens', label: 'Open Rate' },
              { key: 'clicks', label: 'Click Rate' },
              { key: 'status', label: 'Status' },
            ]}
            data={campaigns}
          />
          {campaigns.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
              <p style={{ margin: 0 }}>No campaigns yet. Compose your first email campaign.</p>
            </div>
          )}
        </Card>
      </div>

      <div style={{ flex: 1 }}>
        <Card>
          <CardBody style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '16px' }}>Subscriber Stats</h4>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <p style={{ fontSize: '36px', fontWeight: 700, margin: 0, color: 'var(--clr-text)' }}>0</p>
              <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)', margin: '4px 0 0 0' }}>Total subscribers</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--clr-surface-elevated)', borderRadius: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--clr-text-muted)' }}>New this month</span>
              <span style={{ fontWeight: 600, color: 'var(--clr-accent)' }}>+0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--clr-surface-elevated)', borderRadius: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--clr-text-muted)' }}>Avg open rate</span>
              <span style={{ fontWeight: 600 }}>—</span>
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
