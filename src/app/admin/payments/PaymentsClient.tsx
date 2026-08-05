"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Search, Filter, CreditCard, DollarSign, DownloadCloud, Activity, Eye, 
  CheckCircle, XCircle, X, ExternalLink, User, Calendar, FileText, 
  Copy, Check, Layers, Image as ImageIcon, Sparkles, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/components/providers/CurrencyProvider';

export default function PaymentsAdminClient({ initialStats, initialPayments }: { initialStats: any, initialPayments: any[] }) {
  const [search, setSearch] = useState('');
  const [payments, setPayments] = useState(initialPayments);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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
      { title: 'Processing / Pending', value: formatPrice(proc), icon: Activity },
      { title: 'Refunded / Failed', value: formatPrice(ref), icon: CreditCard },
    ];
  }, [payments, formatPrice]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const updatePaymentStatus = async (paymentId: string, paymentStatus: string, localStatus: string, type: string) => {
    if (!confirm(`Are you sure you want to mark this payment as ${paymentStatus}?`)) return;
    try {
      setIsUpdating(true);
      
      let endpoint = `/api/orders/${paymentId}`;
      let body: any = { paymentStatus };
      
      if (type === 'Service') {
        endpoint = `/api/admin/service-payments/${paymentId}`;
        body = { status: paymentStatus };
      } else if (type === 'Subscription') {
        endpoint = `/api/admin/subscriptions/${paymentId}`;
        body = { action: paymentStatus === 'PAID' || paymentStatus === 'ACTIVE' ? 'activate' : 'cancel' };
      }
      
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setPayments(prev => prev.map(p => {
          if (p.id === paymentId) {
            const updated = { ...p, status: localStatus, rawPaymentStatus: paymentStatus };
            if (selectedPayment && selectedPayment.id === paymentId) {
              setSelectedPayment(updated);
            }
            return updated;
          }
          return p;
        }));
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'Failed to update payment status');
      }
    } catch (err) {
      console.error('Failed to update payment status', err);
      alert('Network error while updating payment');
    } finally {
      setIsUpdating(false);
    }
  };

  const exportCsv = () => {
    const headers = ['Transaction ID', 'Order/Ref Number', 'Type', 'Entity', 'Gateway', 'Customer', 'Amount', 'Date', 'Status'];
    const rows = payments.map(p => [
      p.id,
      p.order?.orderNumber || '—',
      p.type || 'Order',
      p.entityTitle || '—',
      p.gateway || 'Unknown',
      p.user?.name || p.user?.email || 'Guest',
      p.amount.toFixed(2),
      new Date(p.createdAt).toISOString(),
      p.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payments_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const q = search.toLowerCase();
      const matchesSearch = 
        p.id.toLowerCase().includes(q) || 
        (p.order?.orderNumber || '').toLowerCase().includes(q) ||
        (p.entityTitle || '').toLowerCase().includes(q) ||
        (p.user?.name || '').toLowerCase().includes(q) ||
        (p.user?.email || '').toLowerCase().includes(q) ||
        (p.transactionId || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesType = typeFilter === 'All' || p.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [payments, search, statusFilter, typeFilter]);

  const paymentsData = useMemo(() => {
    return filteredPayments.map(p => ({
      id: (
        <span 
          style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--clr-primary)', cursor: 'pointer' }}
          onClick={() => setSelectedPayment(p)}
          title="Click to inspect transaction details"
        >
          {p.id.substring(0, 10).toUpperCase()}...
        </span>
      ),
      orderId: (
        <span style={{ fontWeight: 600, color: 'var(--clr-text)' }}>
          {p.order?.orderNumber || '—'}
        </span>
      ),
      type: (
        <Badge variant={p.type === 'Subscription' ? 'blue' : p.type === 'Service' ? 'primary' : 'default'}>
          {p.type || 'Order'}
        </Badge>
      ),
      customer: (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--clr-text)' }}>
            {p.user?.name || 'Guest / Unnamed'}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>
            {p.user?.email || '—'}
          </span>
        </div>
      ),
      gateway: (
        <span style={{ fontSize: '13px', color: 'var(--clr-text-secondary)', fontWeight: 500 }}>
          {p.gateway || 'Unknown'}
        </span>
      ),
      amount: (
        <span style={{ fontWeight: 700, color: 'var(--clr-accent)', fontSize: '15px' }}>
          {formatPrice(p.amount)}
        </span>
      ),
      date: new Date(p.createdAt).toLocaleDateString(),
      status: (
        <Badge variant={p.status === 'SUCCEEDED' ? 'success' : p.status === 'PROCESSING' ? 'warning' : p.status === 'FAILED' ? 'danger' : 'default'}>
          {p.status}
        </Badge>
      ),
      receipt: (
        p.receiptUrl ? (
          <button 
            onClick={() => setPreviewImage(p.receiptUrl)}
            style={{ 
              background: 'var(--clr-surface-3)', border: '1px solid var(--clr-border)', 
              borderRadius: '6px', padding: '4px 8px', display: 'flex', alignItems: 'center', 
              gap: '4px', cursor: 'pointer', color: 'var(--clr-primary)', fontSize: '12px', fontWeight: 600
            }}
            title="View Receipt Proof"
          >
            <ImageIcon size={14} /> Receipt
          </button>
        ) : (
          <span style={{ color: 'var(--clr-text-muted)', fontSize: '12px' }}>—</span>
        )
      ),
      actions: (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Button 
            variant="ghost" 
            size="sm" 
            icon={<Eye size={15} />} 
            onClick={() => setSelectedPayment(p)} 
            title="Inspect Transaction Details" 
          />
          
          {p.status === 'PROCESSING' && (
            <Button 
              variant="ghost" 
              size="sm" 
              icon={<CheckCircle size={15} color="#10b981" />} 
              onClick={() => updatePaymentStatus(p.id, p.type === 'Subscription' ? 'ACTIVE' : 'PAID', 'SUCCEEDED', p.type || 'Order')} 
              disabled={isUpdating} 
              title="Confirm Payment (Mark as Paid)" 
            />
          )}
          {p.status === 'SUCCEEDED' && (
            <Button 
              variant="ghost" 
              size="sm" 
              icon={<XCircle size={15} color="#ef4444" />} 
              onClick={() => updatePaymentStatus(p.id, p.type === 'Subscription' ? 'CANCELED' : 'REFUNDED', 'FAILED', p.type || 'Order')} 
              disabled={isUpdating} 
              title="Refund / Cancel Payment" 
            />
          )}
        </div>
      )
    }));
  }, [filteredPayments, formatPrice, isUpdating]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Payments & Transactions</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Inspect client transactions, view receipts, and navigate directly to connected services, SaaS products, and orders.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" icon={<DownloadCloud size={16} />} onClick={exportCsv}>Export CSV</Button>
        </div>
      </div>

      {/* KPI Stats */}
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

      {/* Main Table Card */}
      <Card>
        <CardHeader style={{ padding: '20px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '280px', maxWidth: '650px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }}>
                <Search size={16} />
              </div>
              <input 
                type="text" 
                placeholder="Search by ID, order #, client, item, or tx hash..." 
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
            
            {/* Filter Dropdown Toggle */}
            <div style={{ position: 'relative' }}>
              <Button variant="secondary" icon={<Filter size={16} />} onClick={() => setShowFilters(!showFilters)}>
                Filters {(statusFilter !== 'All' || typeFilter !== 'All') && `(Active)`}
              </Button>

              {showFilters && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '240px',
                  background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)',
                  borderRadius: '12px', padding: '16px', zIndex: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                  display: 'flex', flexDirection: 'column', gap: '16px'
                }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', textTransform: 'uppercase', color: 'var(--clr-text-muted)' }}>Status</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {['All', 'SUCCEEDED', 'PROCESSING', 'FAILED'].map(s => (
                        <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            name="status" 
                            checked={statusFilter === s} 
                            onChange={() => setStatusFilter(s)} 
                            style={{ accentColor: 'var(--clr-primary)' }}
                          />
                          {s === 'SUCCEEDED' ? 'Succeeded / Paid' : s === 'PROCESSING' ? 'Processing / Pending' : s === 'FAILED' ? 'Failed / Refunded' : 'All Statuses'}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', textTransform: 'uppercase', color: 'var(--clr-text-muted)' }}>Payment Type</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {['All', 'Order', 'Subscription', 'Service'].map(t => (
                        <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            name="type" 
                            checked={typeFilter === t} 
                            onChange={() => setTypeFilter(t)} 
                            style={{ accentColor: 'var(--clr-primary)' }}
                          />
                          {t === 'All' ? 'All Types' : t === 'Order' ? 'Store Orders' : t === 'Subscription' ? 'SaaS Subscriptions' : 'Tech Specs / Services'}
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => { setStatusFilter('All'); setTypeFilter('All'); setShowFilters(false); }}>
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <DataTable 
          columns={[
            { key: 'id', label: 'Transaction ID' },
            { key: 'orderId', label: 'Ref / Order #' },
            { key: 'type', label: 'Type' },
            { key: 'customer', label: 'Customer' },
            { key: 'gateway', label: 'Gateway' },
            { key: 'amount', label: 'Amount' },
            { key: 'date', label: 'Date' },
            { key: 'status', label: 'Status' },
            { key: 'receipt', label: 'Receipt' },
            { key: 'actions', label: 'Actions' }
          ]}
          data={paymentsData}
        />
      </Card>

      {/* TRANSACTION INSPECTION DRAWER / MODAL */}
      {selectedPayment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'flex-end', zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            width: '100%', maxWidth: '620px', height: '100%',
            background: 'var(--clr-surface-elevated)', borderLeft: '1px solid var(--clr-border)',
            display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.3)',
            overflowY: 'auto'
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: '24px', borderBottom: '1px solid var(--clr-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              position: 'sticky', top: 0, background: 'var(--clr-surface-elevated)', zIndex: 10
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Badge variant={selectedPayment.type === 'Subscription' ? 'blue' : selectedPayment.type === 'Service' ? 'primary' : 'default'}>
                    {selectedPayment.type} Payment
                  </Badge>
                  <Badge variant={selectedPayment.status === 'SUCCEEDED' ? 'success' : selectedPayment.status === 'PROCESSING' ? 'warning' : 'danger'}>
                    {selectedPayment.status}
                  </Badge>
                </div>
                <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>
                  Transaction Inspector
                </h2>
                <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                  ID: {selectedPayment.id}
                </div>
              </div>

              <button 
                onClick={() => setSelectedPayment(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--clr-text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Highlight Amount Card */}
              <div style={{
                background: 'var(--clr-surface-3)', border: '1px solid var(--clr-border)',
                borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>Amount Paid / Billed</span>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--clr-accent)', marginTop: '2px' }}>
                    {formatPrice(selectedPayment.amount)}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--clr-text-secondary)' }}>
                    Currency: {selectedPayment.currency || 'USD'}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>Gateway / Method</span>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--clr-text)', marginTop: '2px' }}>
                    {selectedPayment.gateway}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--clr-text-secondary)' }}>
                    {new Date(selectedPayment.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* QUICK DIRECT NAVIGATION BUTTONS */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Connected Entity & Direct Navigation
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* For SERVICE / TECH SPEC PAYMENTS */}
                  {selectedPayment.type === 'Service' && selectedPayment.techSpec && (
                    <>
                      <div style={{ padding: '16px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <span style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Tech Spec Reference</span>
                            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--clr-text)' }}>
                              {selectedPayment.techSpec.title} ({selectedPayment.techSpec.specNumber})
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)', marginTop: '2px' }}>
                              Installment: {selectedPayment.paymentTitle}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                          <Link href={`/admin/tech-specs/${selectedPayment.techSpec.id}/edit`}>
                            <Button variant="primary" size="sm" icon={<ExternalLink size={14} />}>
                              View Tech Spec Details
                            </Button>
                          </Link>
                          
                          <Link href={`/admin/tech-specs/${selectedPayment.techSpec.id}/preview`} target="_blank">
                            <Button variant="secondary" size="sm" icon={<FileText size={14} />}>
                              Preview Document
                            </Button>
                          </Link>

                          {selectedPayment.serviceLink && (
                            <Link href={selectedPayment.serviceLink} target="_blank">
                              <Button variant="ghost" size="sm" icon={<ExternalLink size={14} />}>
                                View Linked Service Page
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* For SAAS SUBSCRIPTION PAYMENTS */}
                  {selectedPayment.type === 'Subscription' && (
                    <div style={{ padding: '16px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>SaaS Product & Plan</span>
                          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--clr-text)' }}>
                            {selectedPayment.saas?.name || 'SaaS Product'} — {selectedPayment.planName} Plan ({selectedPayment.billingCycle})
                          </div>
                          {selectedPayment.currentPeriodEnd && (
                            <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)', marginTop: '4px' }}>
                              Period End: {new Date(selectedPayment.currentPeriodEnd).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        <Link href="/admin/saas/subscriptions">
                          <Button variant="primary" size="sm" icon={<ExternalLink size={14} />}>
                            Manage in Subscriptions
                          </Button>
                        </Link>
                        
                        {selectedPayment.saas?.slug && (
                          <Link href={`/saas/${selectedPayment.saas.slug}`} target="_blank">
                            <Button variant="secondary" size="sm" icon={<ExternalLink size={14} />}>
                              View Live SaaS Product
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  {/* For STORE ORDERS */}
                  {selectedPayment.type === 'Order' && (
                    <div style={{ padding: '16px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Order Details</span>
                          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--clr-text)' }}>
                            Order #{selectedPayment.order?.orderNumber}
                          </div>
                          {selectedPayment.orderItems && (
                            <div style={{ fontSize: '13px', color: 'var(--clr-text-secondary)', marginTop: '4px' }}>
                              {selectedPayment.orderItems.length} item(s): {selectedPayment.orderItems.map((i: any) => `${i.itemName} (x${i.quantity})`).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        <Link href={`/admin/orders/${selectedPayment.id}`}>
                          <Button variant="primary" size="sm" icon={<ExternalLink size={14} />}>
                            View Order Management
                          </Button>
                        </Link>

                        {selectedPayment.invoice ? (
                          <Link href={`/admin/invoices/${selectedPayment.invoice.id}`}>
                            <Button variant="secondary" size="sm" icon={<FileText size={14} />}>
                              View Order Invoice
                            </Button>
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* CLIENT UPLOADED RECEIPT / PAYMENT PROOF IMAGE */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Client Payment Proof / Uploaded Receipt
                </h4>
                
                {selectedPayment.receiptUrl ? (
                  <div style={{
                    background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
                    borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px'
                  }}>
                    <div 
                      style={{ 
                        position: 'relative', width: '100%', maxHeight: '360px', 
                        overflow: 'hidden', borderRadius: '8px', background: '#000',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'zoom-in'
                      }}
                      onClick={() => setPreviewImage(selectedPayment.receiptUrl)}
                    >
                      <img 
                        src={selectedPayment.receiptUrl} 
                        alt="Payment Receipt" 
                        style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain' }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Click image to zoom in full view</span>
                      <a href={selectedPayment.receiptUrl} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm" icon={<ExternalLink size={14} />}>
                          Open In New Tab
                        </Button>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '24px', background: 'var(--clr-surface)', border: '1px dashed var(--clr-border)',
                    borderRadius: '12px', textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: '14px'
                  }}>
                    No receipt proof image uploaded for this transaction. (Automated payment gateway or card checkout)
                  </div>
                )}
              </div>

              {/* TRANSACTION IDENTIFIERS & METADATA */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Transaction Identifiers & Customer Details
                </h4>

                <div style={{
                  background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
                  borderRadius: '12px', display: 'flex', flexDirection: 'column'
                }}>
                  {/* Customer Info */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>Customer Name</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--clr-text)' }}>
                      {selectedPayment.user?.name || 'Guest User'}
                    </span>
                  </div>

                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>Customer Email</span>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--clr-text)' }}>
                      {selectedPayment.user?.email || 'Not provided'}
                    </span>
                  </div>

                  {/* Transaction ID */}
                  {selectedPayment.transactionId && (
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>Transaction Hash / Reference</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--clr-accent)', fontWeight: 600 }}>
                          {selectedPayment.transactionId}
                        </span>
                        <button 
                          onClick={() => copyToClipboard(selectedPayment.transactionId, 'tx')}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)' }}
                          title="Copy Transaction Hash"
                        >
                          {copiedField === 'tx' ? <Check size={14} color="var(--clr-accent)" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Internal Payment ID */}
                  <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>System Record ID</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                        {selectedPayment.id}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(selectedPayment.id, 'id')}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)' }}
                        title="Copy System ID"
                      >
                        {copiedField === 'id' ? <Check size={14} color="var(--clr-accent)" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS (UPDATE STATUS) */}
              <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                {selectedPayment.status === 'PROCESSING' && (
                  <Button 
                    variant="primary" 
                    icon={<CheckCircle size={16} />}
                    onClick={() => updatePaymentStatus(selectedPayment.id, selectedPayment.type === 'Subscription' ? 'ACTIVE' : 'PAID', 'SUCCEEDED', selectedPayment.type || 'Order')}
                    disabled={isUpdating}
                  >
                    Confirm & Mark as Paid
                  </Button>
                )}

                {selectedPayment.status === 'SUCCEEDED' && (
                  <Button 
                    variant="danger" 
                    icon={<XCircle size={16} />}
                    onClick={() => updatePaymentStatus(selectedPayment.id, selectedPayment.type === 'Subscription' ? 'CANCELED' : 'REFUNDED', 'FAILED', selectedPayment.type || 'Order')}
                    disabled={isUpdating}
                  >
                    Refund / Cancel Transaction
                  </Button>
                )}

                <Button variant="secondary" onClick={() => setSelectedPayment(null)}>
                  Close Inspector
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE PREVIEW LIGHTBOX */}
      {previewImage && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000,
            padding: '24px'
          }}
          onClick={() => setPreviewImage(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button 
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute', top: '-40px', right: '0',
                background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
                borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
            <img 
              src={previewImage} 
              alt="Receipt Preview" 
              style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
