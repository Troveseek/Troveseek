"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import { Plus, Search, Filter, Edit, Trash2, Loader } from 'lucide-react';
import Link from 'next/link';

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { formatPrice } = useCurrency();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (statusFilter !== 'All') params.set('status', statusFilter.toUpperCase());
        
        const res = await fetch(`/api/products?${params}`);
        if (res.ok) {
          const json = await res.json();
          setProducts(json.data ?? []);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [search, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert('Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting');
    }
  };

  const tableData = useMemo(() => {
    if (isLoading) {
      return [{
        id: '-',
        logo: '-',
        name: <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--clr-text-muted)' }}><Loader className="spin" size={16} /> Loading products...</div>,
        category: '-', price: '-', sales: '-', status: '-', actions: '-'
      }];
    }
    
    if (products.length === 0) {
      return [{
        id: '-',
        logo: '-',
        name: 'No products found.',
        category: '-', price: '-', sales: '-', status: '-', actions: '-'
      }];
    }
    
    return products.map((product) => {
      let imgUrl = null;
      try {
        const parsed = JSON.parse(product.images);
        if (parsed.length > 0) imgUrl = parsed[0];
      } catch(e) {}

      return {
        id: product.id.slice(0, 8),
        logo: imgUrl ? <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: `url(${imgUrl}) center/cover`, border: '1px solid var(--clr-border)' }} /> : <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--clr-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, border: '1px solid var(--clr-border)' }}>{product.name.substring(0,2).toUpperCase()}</div>,
        name: product.name,
        category: product.category?.name || 'Uncategorized',
      price: formatPrice(product.price),
      sales: product.stock, // Placeholder for sales, mapping to stock for now since sales count isn't readily available
      status: <Badge variant={product.status === 'ACTIVE' ? 'success' : product.status === 'DRAFT' ? 'warning' : 'default'}>{product.status}</Badge>,
      actions: (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/admin/products/${product.id}/edit`}>
            <Button variant="ghost" size="sm" icon={<Edit size={14} />} />
          </Link>
          <Button variant="ghost" size="sm" icon={<Trash2 size={14} color="#ff4444" />} onClick={() => handleDelete(product.id)} />
        </div>
      ),
      };
    });
  }, [products, isLoading]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Products</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage your digital products catalog</p>
        </div>
        <Link href="/admin/products/new"><Button variant="primary" icon={<Plus size={16} />}>Add Product</Button></Link>
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
                placeholder="Search products..." 
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
            { key: 'name', label: 'Product Name' },
            { key: 'category', label: 'Category' },
            { key: 'price', label: 'Price' },
            { key: 'sales', label: 'Sales' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={tableData}
        />
      </Card>
    </div>
  );
}
