"use client";

import React, { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, FileText, DownloadCloud, Eye, Mail } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/components/providers/CurrencyProvider';

export default function InvoicesClient({ initialInvoices = [] }: { initialInvoices: any[] }) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isUpdating, setIsUpdating] = useState(false);
  const { formatPrice } = useCurrency();

  const markAsSent = async (id: string) => {
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SENT' }),
      });
      if (res.ok) {
        const json = await res.json();
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'SENT' } : inv));
      }
    } catch (err) {
      console.error('Failed to update invoice status', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedInvoices = invoices.map(inv => ({
    id: inv.invoiceNum || inv.id.substring(0, 12).toUpperCase(),
    customer: inv.order?.user?.name || inv.order?.user?.email || '—',
    orderId: inv.order?.orderNumber || '—',
    amount: formatPrice(inv.order?.totalAmount || 0),
    date: new Date(inv.issuedAt || inv.createdAt).toLocaleDateString(),
    status: (
      <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'SENT' ? 'warning' : inv.status === 'OVERDUE' ? 'danger' : 'default'}>
        {inv.status}
      </Badge>
    ),
    actions: (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Link href={`/admin/invoices/${inv.id}`}>
          <Button variant="ghost" size="sm" icon={<Eye size={14} />} title="View" />
        </Link>
        <Link href={`/admin/invoices/${inv.id}?download=true`} target="_blank">
          <Button variant="ghost" size="sm" icon={<DownloadCloud size={14} />} title="Download/Print" />
        </Link>
        <Button 
          variant="ghost" 
          size="sm" 
          icon={<Mail size={14} />} 
          onClick={() => markAsSent(inv.id)} 
          disabled={isUpdating || inv.status === 'SENT' || inv.status === 'PAID'}
          title="Mark as Sent"
        />
      </div>
    ),
    // Raw status for filtering
    rawStatus: inv.status,
  }));

  const filteredInvoices = React.useMemo(() => {
    return formattedInvoices.filter((invoice) => {
      const matchesSearch = invoice.customer.toLowerCase().includes(search.toLowerCase()) || 
                            invoice.id.toLowerCase().includes(search.toLowerCase()) ||
                            invoice.orderId.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || invoice.rawStatus.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, formattedInvoices]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Invoices</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Generate and manage customer invoices</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" icon={<DownloadCloud size={16} />}>Export ZIP</Button>
        </div>
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
                placeholder="Search invoices..." 
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
                    {['All', 'Paid', 'Sent', 'Overdue', 'Draft', 'Issued'].map(s => (
                      <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="status" 
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
            { key: 'id', label: 'Invoice #' },
            { key: 'customer', label: 'Customer' },
            { key: 'orderId', label: 'Order ID' },
            { key: 'amount', label: 'Amount' },
            { key: 'date', label: 'Issued Date' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={filteredInvoices}
        />
      </Card>
    </div>
  );
}
