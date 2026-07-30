"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/components/providers/CurrencyProvider';

export default function ServicesAdminClient({ initialServices }: { initialServices: any[] }) {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [data, setData] = useState(initialServices);
  const { formatPrice } = useCurrency();

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete');
      }
      setData(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting service');
    }
  }, []);

  const formattedServices = useMemo(() => data.map(service => {
    let imgUrl = null;
    try {
      const parsed = JSON.parse(service.images || '[]');
      if (parsed.length > 0) imgUrl = parsed[0];
    } catch(e) {}

    return {
      _rawId: service.id,
      _rawStatus: service.status,
      logo: imgUrl ? <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: `url(${imgUrl}) center/cover`, border: '1px solid var(--clr-border)' }} /> : <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--clr-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, border: '1px solid var(--clr-border)' }}>{service.name.substring(0,2).toUpperCase()}</div>,
      id: service.id.substring(0, 8).toUpperCase(),
      name: service.name,
      category: service.categoryId || 'Uncategorized',
      price: formatPrice(service.basePrice),
      activeOrders: 0,
      status: <Badge variant={service.status === 'ACTIVE' ? 'success' : 'warning'}>{service.status}</Badge>,
    actions: (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Link href={`/admin/services/${service.id}/edit`}><Button variant="ghost" size="sm" icon={<Edit size={14} />} /></Link>
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 size={14} color="#ff4444" />}
          onClick={() => handleDelete(service.id, service.name)}
        />
      </div>
    ),
    };
  }), [data, handleDelete]);

  const filteredServices = useMemo(() => {
    return formattedServices.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase()) || 
                            service.category.toLowerCase().includes(search.toLowerCase()) ||
                            service.id.toLowerCase().includes(search.toLowerCase());
      
      const statusText = service._rawStatus;
      const matchesStatus = statusFilter === 'All' || statusText === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, formattedServices]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Services</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage service offerings and pricing tiers</p>
        </div>
        <Link href="/admin/services/new"><Button variant="primary" icon={<Plus size={16} />}>Add Service</Button></Link>
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
                placeholder="Search services..." 
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
                    {['All', 'Active', 'Draft'].map(s => (
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
            { key: 'logo', label: '' },
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Service Name' },
            { key: 'category', label: 'Category' },
            { key: 'price', label: 'Base Pricing' },
            { key: 'activeOrders', label: 'Active Orders' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={filteredServices}
        />
      </Card>
    </div>
  );
}
