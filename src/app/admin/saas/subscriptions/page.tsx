"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, AlertTriangle, Users, TrendingUp, RefreshCw, DownloadCloud, MoreVertical, X, Check, ArrowUpRight, ArrowDownRight, CreditCard, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SaasSubscriptionsPage() {
  const { formatPrice } = useCurrency();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/subscriptions')
      .then(r => r.json())
      .then(d => {
        setSubscriptions(d.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute KPIs
  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE');
  const mrr = activeSubs.reduce((sum, s) => {
    const monthlyPrice = s.billingCycle === 'yearly' ? s.price / 12 : s.price;
    return sum + monthlyPrice;
  }, 0);
  const arpu = activeSubs.length > 0 ? mrr / activeSubs.length : 0;
  
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const canceledThisMonth = subscriptions.filter(s => s.status === 'CANCELED' && new Date(s.updatedAt) >= thisMonth).length;
  const churnRate = subscriptions.length > 0 ? (canceledThisMonth / subscriptions.length) * 100 : 0;

  // Chart Data (Mock trend using actual MRR as current month)
  const chartData = [
    { name: 'Jan', mrr: mrr * 0.5 },
    { name: 'Feb', mrr: mrr * 0.6 },
    { name: 'Mar', mrr: mrr * 0.7 },
    { name: 'Apr', mrr: mrr * 0.85 },
    { name: 'May', mrr: mrr * 0.95 },
    { name: 'Jun', mrr: mrr },
  ];

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      if (statusFilter !== 'All' && sub.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (search && !sub.user?.email?.toLowerCase().includes(search.toLowerCase()) && !sub.saas?.name?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [subscriptions, search, statusFilter]);

  const handleExportCSV = () => {
    const headers = ['ID', 'User', 'Email', 'Product', 'Plan', 'Billing Cycle', 'Price', 'Status', 'Start Date', 'End Date'];
    const rows = filteredSubscriptions.map(s => [
      s.id,
      s.user?.name || 'N/A',
      s.user?.email || 'N/A',
      s.saas?.name || 'N/A',
      s.planName,
      s.billingCycle,
      s.price,
      s.status,
      new Date(s.createdAt).toISOString().split('T')[0],
      new Date(s.currentPeriodEnd).toISOString().split('T')[0],
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "subscriptions_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAction = async (action: 'cancel' | 'extend' | 'activate') => {
    if (!selectedSub) return;
    if (action === 'cancel' && !confirm('Are you sure you want to cancel this subscription? The user will lose access immediately.')) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${selectedSub.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        alert(`Subscription ${action}ed successfully.`);
        setSelectedSub(null);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Action failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Subscriptions Overview</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '15px', marginTop: '4px' }}>Enterprise analytics and subscriber management.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={fetchData}>Refresh</Button>
          <Button variant="primary" icon={<DownloadCloud size={16} />} onClick={handleExportCSV}>Export CSV</Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <Card>
          <CardBody style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--clr-primary-dim)', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} /></div>
              <Badge variant="success"><ArrowUpRight size={12} style={{ marginRight: '4px' }} /> 12%</Badge>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--clr-text-muted)', fontWeight: 600 }}>Active Subscriptions</div>
            <div style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{activeSubs.length}</div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--clr-accent-dim)', color: 'var(--clr-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={20} /></div>
              <Badge variant="success"><ArrowUpRight size={12} style={{ marginRight: '4px' }} /> 8.5%</Badge>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--clr-text-muted)', fontWeight: 600 }}>Monthly Recurring Revenue</div>
            <div style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{formatPrice(mrr)}</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0, 204, 255, 0.1)', color: '#00ccff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CreditCard size={20} /></div>
              <Badge variant="success"><ArrowUpRight size={12} style={{ marginRight: '4px' }} /> 2%</Badge>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--clr-text-muted)', fontWeight: 600 }}>Average Revenue Per User</div>
            <div style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{formatPrice(arpu)}</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw size={20} /></div>
              <Badge variant={churnRate > 5 ? 'danger' : 'success'}>{churnRate > 5 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {churnRate.toFixed(1)}%</Badge>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--clr-text-muted)', fontWeight: 600 }}>Churn Rate (This Month)</div>
            <div style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{churnRate.toFixed(1)}%</div>
          </CardBody>
        </Card>
      </div>

      {/* CHARTS & TABLE LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        <Card>
          <CardHeader>
            <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 600 }}>MRR Growth (YTD)</h3>
          </CardHeader>
          <CardBody style={{ padding: '24px', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--clr-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--clr-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--clr-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--clr-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatPrice(v)} />
                <Tooltip 
                  contentStyle={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)' }}
                  itemStyle={{ color: 'var(--clr-primary)', fontWeight: 700 }}
                  formatter={(value: any) => [formatPrice(Number(value) || 0), 'MRR']}
                />
                <Area type="monotone" dataKey="mrr" stroke="var(--clr-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Subscriber Directory</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative', width: '250px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search user or product..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface-2)', color: 'var(--clr-text)', fontSize: '14px' }}
                />
              </div>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface-2)', color: 'var(--clr-text)', fontSize: '14px', cursor: 'pointer' }}
              >
                <option value="All">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending (Manual)</option>
                <option value="CANCELED">Canceled</option>
                <option value="PAST_DUE">Past Due</option>
              </select>
            </div>
          </CardHeader>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--clr-border)', background: 'var(--clr-surface-2)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--clr-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Customer</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--clr-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Plan</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--clr-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>MRR</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--clr-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--clr-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Next Billing</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--clr-text-muted)', fontWeight: 600, textTransform: 'uppercase', width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--clr-text-muted)' }}>Loading subscriptions...</td></tr>
                ) : filteredSubscriptions.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--clr-text-muted)' }}>No subscriptions found.</td></tr>
                ) : (
                  filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid var(--clr-border)', transition: 'background 0.2s', cursor: 'pointer' }} onClick={() => setSelectedSub(sub)} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--clr-surface-2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--clr-primary-dim)', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                            {sub.user?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--clr-text)', fontSize: '14px' }}>{sub.user?.name || 'Unknown'}</div>
                            <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>{sub.user?.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--clr-text)' }}>{sub.saas?.name || 'Product'}</div>
                        <div style={{ fontSize: '13px', color: 'var(--clr-text-muted)' }}>{sub.planName} ({sub.billingCycle})</div>
                      </td>
                      <td style={{ padding: '16px 24px', fontWeight: 600, fontSize: '14px' }}>
                        {formatPrice(sub.billingCycle === 'yearly' ? sub.price / 12 : sub.price)}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Badge variant={sub.status === 'ACTIVE' ? 'success' : sub.status === 'CANCELED' ? 'danger' : 'warning'}>{sub.status}</Badge>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--clr-text-muted)' }}>
                        {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <Button variant="ghost" size="sm" icon={<MoreVertical size={16} />} onClick={(e) => { e.stopPropagation(); setSelectedSub(sub); }} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* DETAILED SIDE-DRAWER */}
      {selectedSub && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} onClick={() => setSelectedSub(null)} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', maxWidth: '100%', background: 'var(--clr-surface)', zIndex: 1000, boxShadow: '-8px 0 32px rgba(0,0,0,0.1)', overflowY: 'auto', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            
            <div style={{ padding: '24px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--clr-surface-2)', position: 'sticky', top: 0, zIndex: 10 }}>
              <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', margin: 0 }}>Subscription Details</h2>
              <button onClick={() => setSelectedSub(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-text-muted)' }}><X size={24} /></button>
            </div>
            
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Profile Block */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--clr-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700 }}>
                  {selectedSub.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px' }}>{selectedSub.user?.name || 'Unknown User'}</h3>
                  <div style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>{selectedSub.user?.email || 'No email provided'}</div>
                  <div style={{ color: 'var(--clr-text-muted)', fontSize: '12px', marginTop: '4px' }}>ID: {selectedSub.userId}</div>
                </div>
              </div>

              {/* Status Banner */}
              <div style={{ background: selectedSub.status === 'ACTIVE' ? 'rgba(0,229,176,0.1)' : 'rgba(255,68,68,0.1)', border: `1px solid ${selectedSub.status === 'ACTIVE' ? '#00e5b0' : '#ff4444'}`, borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {selectedSub.status === 'ACTIVE' ? <Check size={24} color="#00e5b0" /> : <AlertTriangle size={24} color="#ff4444" />}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: selectedSub.status === 'ACTIVE' ? '#00e5b0' : '#ff4444' }}>Status</div>
                    <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedSub.status}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Monthly Revenue</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--clr-text)' }}>{formatPrice(selectedSub.billingCycle === 'yearly' ? selectedSub.price / 12 : selectedSub.price)}</div>
                </div>
              </div>

              {/* Details List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Plan Information</h4>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--clr-border)', paddingBottom: '12px' }}>
                  <span style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>Product</span>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{selectedSub.saas?.name || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--clr-border)', paddingBottom: '12px' }}>
                  <span style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>Plan Tier</span>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{selectedSub.planName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--clr-border)', paddingBottom: '12px' }}>
                  <span style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>Billing Cycle</span>
                  <span style={{ fontWeight: 600, fontSize: '14px', textTransform: 'capitalize' }}>{selectedSub.billingCycle}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--clr-border)', paddingBottom: '12px' }}>
                  <span style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>Started On</span>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{new Date(selectedSub.createdAt).toLocaleDateString()}</span>
                </div>
                {selectedSub.status === 'ACTIVE' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--clr-border)', paddingBottom: '12px' }}>
                    <span style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>Current Period End</span>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{new Date(selectedSub.currentPeriodEnd).toLocaleDateString()}</span>
                  </div>
                )}
                
                {/* Payment Information */}
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '8px 0 0' }}>Payment Info</h4>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--clr-border)', paddingBottom: '12px' }}>
                  <span style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>Method</span>
                  <span style={{ fontWeight: 600, fontSize: '14px', textTransform: 'capitalize' }}>{selectedSub.paymentMethod || 'Stripe'}</span>
                </div>
                
                {(selectedSub.paymentMethod === 'baridi' || selectedSub.paymentMethod === 'crypto') && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>Transaction ID</span>
                      <code style={{ fontSize: '12px', background: 'var(--clr-surface-2)', padding: '6px 12px', borderRadius: '6px', color: 'var(--clr-accent)', overflowWrap: 'break-word' }}>
                        {selectedSub.transactionId || 'N/A'}
                      </code>
                    </div>
                    {selectedSub.receiptUrl && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                        <span style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>Receipt Screenshot</span>
                        <a href={selectedSub.receiptUrl} target="_blank" rel="noopener noreferrer">
                          <img src={selectedSub.receiptUrl} alt="Receipt" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--clr-border)' }} />
                        </a>
                      </div>
                    )}
                  </>
                )}

                {(!selectedSub.paymentMethod || selectedSub.paymentMethod === 'stripe') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>Stripe ID</span>
                    <code style={{ fontSize: '12px', background: 'var(--clr-surface-2)', padding: '6px 12px', borderRadius: '6px', color: 'var(--clr-accent)', overflowWrap: 'break-word' }}>
                      {selectedSub.stripeSubscriptionId || 'N/A'}
                    </code>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div style={{ padding: '24px', background: 'var(--clr-surface-2)', borderTop: '1px solid var(--clr-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Admin Actions</h4>
              
              {selectedSub.status === 'PENDING' && (
                <>
                  <Button variant="primary" style={{ width: '100%', justifyContent: 'center', background: '#00e5b0', color: '#000' }} onClick={() => handleAction('activate')} disabled={actionLoading}>
                    <CheckCircle size={16} style={{ marginRight: '8px' }} /> Approve & Activate Subscription
                  </Button>
                  <Button variant="danger" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleAction('cancel')} disabled={actionLoading}>
                    <X size={16} style={{ marginRight: '8px' }} /> Reject Payment & Cancel
                  </Button>
                </>
              )}
              
              {selectedSub.status === 'ACTIVE' && (
                <>
                  <Button variant="secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleAction('extend')} disabled={actionLoading}>
                    <Shield size={16} style={{ marginRight: '8px' }} /> Comp 30 Days Access
                  </Button>
                  <Button variant="danger" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleAction('cancel')} disabled={actionLoading}>
                    <X size={16} style={{ marginRight: '8px' }} /> Cancel Subscription Instantly
                  </Button>
                </>
              )}
              {selectedSub.status !== 'ACTIVE' && selectedSub.status !== 'PENDING' && (
                <div style={{ fontSize: '14px', color: 'var(--clr-text-muted)', textAlign: 'center', padding: '12px' }}>
                  No actions available for canceled or past due subscriptions.
                </div>
              )}
            </div>

          </div>
        </>
      )}
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
