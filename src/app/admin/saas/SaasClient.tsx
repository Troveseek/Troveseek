"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Search, Filter, Edit, Trash2, Users, DollarSign, TrendingDown, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/components/providers/CurrencyProvider';

const platformPills = (platforms: string[]) => (
  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
    {platforms.map(p => (
      <span key={p} style={{ padding: '2px 8px', fontSize: '11px', fontWeight: 600, borderRadius: '999px', background: 'rgba(124,111,255,0.12)', color: 'var(--clr-primary)' }}>
        {p === 'Web' ? '🌐' : p === 'Desktop' ? '💻' : p === 'Mobile' ? '📱' : '🔌'} {p}
      </span>
    ))}
  </div>
);

const churnColor = (rate: string) => {
  const n = parseFloat(rate);
  if (n < 3) return { color: 'var(--clr-accent)', fontWeight: 600 };
  if (n < 5) return { color: '#ffaa00', fontWeight: 600 };
  return { color: '#ff4444', fontWeight: 600 };
};

export default function SaaSAdminClient({ initialSaas }: { initialSaas: any[] }) {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [data, setData] = useState(initialSaas);
  const { formatPrice } = useCurrency();

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this SaaS product? This action cannot be undone.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/saas/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      setData(prev => prev.filter(s => s.id !== id));
      alert('SaaS product deleted successfully.');
    } catch (err: any) {
      alert(err.message || 'Error deleting SaaS product');
    }
  }, []);

  const totalMrr = data.reduce((acc, curr) => acc + (curr.monthlyPrice || 0), 0);
  const activeSaas = data.filter(s => s.status === 'ACTIVE').length;

  const kpiCards = [
    { title: 'Active SaaS Products', value: activeSaas.toString(), change: '-', positive: true, icon: Users },
    { title: 'Total SaaS MRR', value: formatPrice(totalMrr), change: '-', positive: true, icon: DollarSign },
    { title: 'Avg Churn Rate', value: '0.0%', change: '-', positive: true, icon: TrendingDown },
    { title: 'Trial Conversion', value: '0.0%', change: '-', positive: true, icon: RefreshCw },
  ];

  const formattedSaas = data.map(s => {
    let parsedPlans: any[] = [];
    try {
      let raw = JSON.parse(s.plans || '[]');
      if (typeof raw === 'string') raw = JSON.parse(raw);
      if (Array.isArray(raw)) parsedPlans = raw;
    } catch(e) {}

    const ratingValue = s.avgRating ?? null;
    const ratingCell = ratingValue !== null ? (
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ color: '#ffaa00', fontWeight: 700 }}>★</span>
        <span style={{ fontWeight: 600 }}>{ratingValue.toFixed(1)}</span>
        <span style={{ fontSize: '11px', color: 'var(--clr-text-muted)' }}>({s.reviewCount ?? 0})</span>
      </span>
    ) : <span style={{ color: 'var(--clr-text-muted)' }}>No reviews</span>;

    const hasYearly = parsedPlans.some((p: any) => p.yearlyPrice && p.yearlyPrice > 0);
    const churnCell = parsedPlans.length === 0
      ? <span style={{ color: 'var(--clr-text-muted)' }}>—</span>
      : hasYearly
        ? <span style={{ color: 'var(--clr-accent)', fontWeight: 600, fontSize: '12px' }}>Low Risk ↓</span>
        : <span style={{ color: '#ffaa00', fontWeight: 600, fontSize: '12px' }}>Medium Risk</span>;

    let imgUrl = null;
    try {
      const parsed = JSON.parse(s.images || '[]');
      if (parsed.length > 0) imgUrl = parsed[0];
    } catch(e) {}

    return {
      logo: imgUrl ? <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `url(${imgUrl}) center/cover`, border: '1px solid var(--clr-border)' }} /> : <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--clr-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px', border: '1px solid var(--clr-border)' }}>{s.name.substring(0,2).toUpperCase()}</div>,
      name: <span style={{ fontWeight: 600, color: 'var(--clr-text)' }}>{s.name}</span>,
      platform: platformPills([s.platform || 'Web App']),
      status: <Badge variant={s.status === 'ACTIVE' ? 'success' : s.status === 'ARCHIVED' ? 'default' : 'warning'}>{s.status}</Badge>,
      subscribers: <span>0 <span style={{ fontSize: '12px', color: 'var(--clr-accent)' }}>-</span></span>,
      mrr: `${formatPrice(s.monthlyPrice || 0)}/mo`,
      churn: churnCell,
      plans: <span style={{ color: 'var(--clr-text)' }}>{parsedPlans.length} plan{parsedPlans.length !== 1 ? 's' : ''}</span>,
      rating: ratingCell,
      actions: (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/admin/saas/${s.id}/edit`}><Button variant="ghost" size="sm" icon={<Edit size={14} />} /></Link>
          <Button onClick={() => handleDelete(s.id)} variant="ghost" size="sm" icon={<Trash2 size={14} color="#ff4444" />} />
        </div>
      ),
    };
  });

  const filteredSaas = React.useMemo(() => {
    return formattedSaas.filter((item) => {
      const nameText = typeof item.name === 'string' ? item.name : (item.name as any).props.children;
      const matchesSearch = nameText.toLowerCase().includes(search.toLowerCase());
      
      const statusText = typeof item.status === 'string' ? item.status : (item.status as any).props?.children;
      const matchesStatus = statusFilter === 'All' || (statusText && statusText.includes(statusFilter));

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, formattedSaas]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>SaaS Solutions</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage SaaS products, plans, and subscriptions</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin/saas/subscriptions">
            <Button variant="secondary" icon={<Users size={16} />}>Subscriptions</Button>
          </Link>
          <Link href="/admin/saas/new">
            <Button variant="primary" icon={<Plus size={16} />}>Add SaaS</Button>
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {kpiCards.map((kpi, i) => (
          <Card key={i}>
            <CardBody style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{kpi.title}</span>
                <kpi.icon size={16} color="var(--clr-primary)" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '26px', fontWeight: 700, color: 'var(--clr-text)', fontFamily: 'var(--font-display)' }}>{kpi.value}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: kpi.positive ? 'var(--clr-accent)' : '#ff4444' }}>{kpi.change}</span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader style={{ padding: '20px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
          <div style={{ display: 'flex', gap: '16px', flex: 1, maxWidth: '500px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }}>
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search SaaS products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '8px', padding: '10px 12px 10px 36px', color: 'var(--clr-text)', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Button variant="secondary" icon={<Filter size={16} />} onClick={() => setShowFilters(!showFilters)}>
                Filters {statusFilter !== 'All' && `(${statusFilter})`}
              </Button>
              {showFilters && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '200px',
                  background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)',
                  borderRadius: '12px', padding: '16px', zIndex: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Status</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['All', 'Live', 'Beta', 'Coming Soon'].map(s => (
                      <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="saasStatus" 
                          checked={statusFilter === s} 
                          onChange={() => { setStatusFilter(s); setShowFilters(false); }} 
                          style={{ accentColor: 'var(--clr-primary)' }}
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <DataTable
          columns={[
            { key: 'logo', label: '' },
            { key: 'name', label: 'SaaS Name' },
            { key: 'platform', label: 'Platform' },
            { key: 'status', label: 'Status' },
            { key: 'subscribers', label: 'Subscribers' },
            { key: 'mrr', label: 'MRR' },
            { key: 'churn', label: 'Churn Rate' },
            { key: 'plans', label: 'Plans' },
            { key: 'rating', label: 'Rating' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={filteredSaas}
        />
      </Card>

      <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)', textAlign: 'right' }}>
        Showing {filteredSaas.length} products · Live: {activeSaas} · Total MRR: {formatPrice(totalMrr)}
      </p>
    </div>
  );
}
