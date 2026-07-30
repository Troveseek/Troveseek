"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, CreditCard, DollarSign, DownloadCloud, Activity, Eye, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/components/providers/CurrencyProvider';

export default function PaymentsAdminClient({ initialStats, initialPayments }: { initialStats: any, initialPayments: any[] }) {
  const [search, setSearch] = useState('');
  const [payments, setPayments] = useState(initialPayments);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isUpdating, setIsUpdating] = useState(false);
  const { formatPrice } = useCurrency();

  // Stats calculate based on local state to be dynamic
  const stats = useMemo(() => {
    let totalRev = 0;
    let proc = 0;
    let ref = 0;
    
    payments.forEach(p => {
      if (p.status === 'SUCCEEDED') totalRev += p.amount;
      if (p.status === 'PROCESSING') proc += p.amount;
      if (p.status === 'FAILED') ref += p.amount;
    });
    
    return [
      { title: 'Total Revenue', value: formatPrice(totalRev), icon: DollarSign },
      { title: 'Processing', value: formatPrice(proc), icon: Activity },
      { title: 'Refunded / Failed', value: formatPrice(ref), icon: CreditCard },
    ];
  }, [payments]);

  const updatePaymentStatus = async (paymentId: string, paymentStatus: string, localStatus: string, type: string) => {
    if (!confirm(`Are you sure you want to mark this payment as ${paymentStatus}?`)) return;
    try {
      setIsUpdating(true);
      
      let endpoint = `/api/orders/${paymentId}`;
      let body: any = { paymentStatus };
      
      if (type === 'Service') {
        endpoint = `/api/admin/service-payments/${paymentId}`;
        body = { status: paymentStatus };
      }
      
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: localStatus } : p));
      }
    } catch (err) {
      console.error('Failed to update payment status', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const exportCsv = () => {
    const headers = ['Transaction ID', 'Order Number', 'Type', 'Gateway', 'Amount', 'Date', 'Status'];
    const rows = payments.map(p => [
      p.id.substring(0, 12).toUpperCase(),
      p.order?.orderNumber || '—',
      p.type || 'Order',
      p.gateway || 'Unknown',
      p.amount.toFixed(2),
      new Date(p.createdAt).toLocaleDateString(),
      p.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payments_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paymentsData = useMemo(() => {
    return payments
      .filter(p => {
        const matchesSearch = p.id.toLowerCase().includes(search.toLowerCase()) || (p.order?.orderNumber || '').toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .map(p => ({
        id: p.id.substring(0, 12).toUpperCase(),
        orderId: p.order?.orderNumber || '—',
        type: p.type || 'Order',
        gateway: p.gateway || 'Unknown',
        amount: formatPrice(p.amount),
        date: new Date(p.createdAt).toLocaleDateString(),
        status: (
          <Badge variant={p.status === 'SUCCEEDED' ? 'success' : p.status === 'PROCESSING' ? 'warning' : p.status === 'FAILED' ? 'danger' : 'default'}>
            {p.status}
          </Badge>
        ),
        actions: (
          <div style={{ display: 'flex', gap: '8px' }}>
            {p.type === 'Subscription' ? (
              <Link href={`/admin/saas/subscriptions`}>
                <Button variant="ghost" size="sm" icon={<Eye size={14} />} title="View Subscriptions" />
              </Link>
            ) : p.type === 'Service' ? (
              <Link href={`/admin/tech-specs`}>
                <Button variant="ghost" size="sm" icon={<Eye size={14} />} title="View Tech Specs" />
              </Link>
            ) : (
              <Link href={`/admin/orders/${p.id}`}>
                <Button variant="ghost" size="sm" icon={<Eye size={14} />} title="View Order" />
              </Link>
            )}
            
            {p.status === 'PROCESSING' && p.type !== 'Subscription' && (
              <Button variant="ghost" size="sm" icon={<CheckCircle size={14} color="#10b981" />} onClick={() => updatePaymentStatus(p.id, 'PAID', 'SUCCEEDED', p.type || 'Order')} disabled={isUpdating} title="Mark as Paid" />
            )}
            {p.status === 'SUCCEEDED' && p.type !== 'Subscription' && (
              <Button variant="ghost" size="sm" icon={<XCircle size={14} color="#ef4444" />} onClick={() => updatePaymentStatus(p.id, 'REFUNDED', 'FAILED', p.type || 'Order')} disabled={isUpdating} title="Refund Payment" />
            )}
          </div>
        )
      }));
  }, [payments, search, statusFilter, isUpdating]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Payments</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Monitor transactions across all payment gateways</p>
        </div>
        <Button variant="secondary" icon={<DownloadCloud size={16} />} onClick={exportCsv}>Export Report</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardBody style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--clr-text-muted)', fontSize: '14px', fontWeight: 500 }}>{stat.title}</span>
                <stat.icon size={16} color="var(--clr-primary)" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--clr-text)' }}>{stat.value}</div>
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
                placeholder="Search transactions..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                    {['All', 'SUCCEEDED', 'PROCESSING', 'FAILED'].map(s => (
                      <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="status" 
                          checked={statusFilter === s} 
                          onChange={() => { setStatusFilter(s); setShowFilters(false); }} 
                          style={{ accentColor: 'var(--clr-primary)' }}
                        />
                        {s === 'SUCCEEDED' ? 'Succeeded' : s === 'PROCESSING' ? 'Processing' : s === 'FAILED' ? 'Failed' : 'All'}
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
            { key: 'id', label: 'Transaction ID' },
            { key: 'orderId', label: 'Order ID' },
            { key: 'type', label: 'Type' },
            { key: 'gateway', label: 'Gateway' },
            { key: 'amount', label: 'Amount' },
            { key: 'date', label: 'Date' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: '' }
          ]}
          data={paymentsData}
        />
      </Card>
    </div>
  );
}
