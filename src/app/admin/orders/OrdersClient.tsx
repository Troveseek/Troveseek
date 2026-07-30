"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, Eye, MoreHorizontal, DownloadCloud, TrendingUp, Package, Clock, Loader } from 'lucide-react';

import Link from 'next/link';

export default function OrdersAdminClient({ initialStats }: { initialStats: any }) {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const stats = [
    { title: 'Total Volume', value: formatPrice(initialStats.totalVolume), icon: TrendingUp },
    { title: 'Total Orders', value: initialStats.totalOrders.toString(), icon: Package },
    { title: 'Pending Fulfillment', value: initialStats.pendingFulfillment.toString(), icon: Clock },
  ];

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'All') params.set('status', statusFilter.toUpperCase());
      
      const res = await fetch(`/api/orders?${params}`);
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data ?? []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchOrders, 300);
    return () => clearTimeout(debounce);
  }, [search, statusFilter]);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const tableData = useMemo(() => {
    if (isLoading) {
      return [{
        id: '-',
        customer: <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--clr-text-muted)' }}><Loader className="spin" size={16} /> Loading orders...</div>,
        type: '-', amount: '-', date: '-', status: '-', actions: '-'
      }];
    }
    
    if (orders.length === 0) {
      return [{
        id: '-',
        customer: 'No orders found.',
        type: '-', amount: '-', date: '-', status: '-', actions: '-'
      }];
    }
    
    return orders.map((order) => ({
      id: order.orderNumber,
      customer: order.user?.name || order.user?.email || 'Unknown Customer',
      type: 'Order',
      amount: formatPrice(order.totalAmount),
      date: new Date(order.createdAt).toLocaleDateString(),
      status: <Badge variant={order.status === 'DELIVERED' || order.status === 'SHIPPED' ? 'success' : order.status === 'PENDING' ? 'warning' : 'default'}>{order.status}</Badge>,
      actions: (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href={`/admin/orders/${order.id}`}>
            <Button variant="ghost" size="sm" icon={<Eye size={14} />} />
          </Link>
          <select 
            value={order.status}
            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid var(--clr-border)',
              background: 'var(--clr-surface)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      ),
    }));
  }, [orders, isLoading]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Orders Dashboard</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Track and fulfill customer orders</p>
        </div>
        <Button variant="secondary" icon={<DownloadCloud size={16} />}>Export CSV</Button>
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
                placeholder="Search orders..." 
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
                    {['All', 'Completed', 'Processing', 'Pending'].map(s => (
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
            { key: 'id', label: 'Order ID' },
            { key: 'customer', label: 'Customer' },
            { key: 'type', label: 'Type' },
            { key: 'amount', label: 'Amount' },
            { key: 'date', label: 'Date' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={tableData}
        />
      </Card>
    </div>
  );
}
