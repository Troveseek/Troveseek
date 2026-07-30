"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit, Trash2, Tag, Loader, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { products: number; saas: number; services: number };
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const json = await res.json();
        setCategories(json.data ?? []);
      }
    } catch {
      setError('Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    setError('');
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      await fetchCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const tableData = isLoading
    ? [{ name: <span style={{ color: 'var(--clr-text-muted)' }}><Loader size={14} className="spin" /> Loading...</span>, slug: '-', description: '-', items: '-', actions: '-' }]
    : categories.length === 0
    ? [{ name: 'No categories yet. Create your first one.', slug: '-', description: '-', items: '-', actions: '-' }]
    : categories.map((cat) => ({
        name: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={14} color="var(--clr-primary)" />
            <span style={{ fontWeight: 600 }}>{cat.name}</span>
          </div>
        ),
        slug: <code style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{cat.slug}</code>,
        description: cat.description || <span style={{ color: 'var(--clr-text-muted)' }}>—</span>,
        items: (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <Badge variant="default">{cat._count.products} Products</Badge>
            <Badge variant="blue">{cat._count.saas} SaaS</Badge>
            <Badge variant="warning">{cat._count.services} Services</Badge>
          </div>
        ),
        actions: (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href={`/admin/categories/${cat.id}/edit`}>
              <Button variant="ghost" size="sm" icon={<Edit size={14} />} />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              icon={deletingId === cat.id ? <Loader size={14} className="spin" /> : <Trash2 size={14} color="#ff4444" />}
              onClick={() => handleDelete(cat.id, cat.name)}
              disabled={deletingId === cat.id}
            />
          </div>
        ),
      }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0 }}>Categories</h1>
          <p style={{ color: 'var(--clr-text-muted)', marginTop: '4px' }}>
            Organize products, SaaS, and services into categories.
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button variant="primary" icon={<Plus size={16} />}>New Category</Button>
        </Link>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '8px', color: '#ff6b6b', fontSize: '14px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Categories ({categories.length})</CardTitle>
        </CardHeader>
        <DataTable
          columns={[
            { key: 'name', label: 'Category Name' },
            { key: 'slug', label: 'Slug' },
            { key: 'description', label: 'Description' },
            { key: 'items', label: 'Linked Items' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={tableData}
        />
      </Card>
    </div>
  );
}
