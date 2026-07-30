"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Search, Filter, Edit, Trash2, FileText, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function BlogClient({ initialPosts }: { initialPosts: any[] }) {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [data, setData] = useState(initialPosts);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      setData(prev => prev.filter(p => p.id !== id));
      alert('Blog post deleted successfully.');
    } catch (err: any) {
      alert(err.message || 'Error deleting blog post');
    }
  };

  const activePosts = data.filter(p => p.status === 'PUBLISHED').length;
  const draftPosts = data.filter(p => p.status === 'DRAFT').length;

  const kpiCards = [
    { title: 'Total Posts', value: data.length.toString(), change: '-', positive: true, icon: FileText },
    { title: 'Published', value: activePosts.toString(), change: '-', positive: true, icon: CheckCircle },
    { title: 'Drafts', value: draftPosts.toString(), change: '-', positive: true, icon: Edit },
    { title: 'Total Views', value: '0', change: '-', positive: true, icon: Eye }, // Placeholder
  ];

  const formattedPosts = data.map(p => {
    return {
      image: p.featuredImage ? (
        <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--clr-border)' }}>
          <img src={p.featuredImage} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px' }}>
          {p.title.substring(0,2).toUpperCase()}
        </div>
      ),
      title: <span style={{ fontWeight: 600, color: 'var(--clr-text)' }}>{p.title}</span>,
      category: <span style={{ color: 'var(--clr-text-muted)' }}>{p.category || '-'}</span>,
      status: <Badge variant={p.status === 'PUBLISHED' ? 'success' : 'default'}>{p.status}</Badge>,
      author: <span style={{ color: 'var(--clr-text)' }}>{p.authorName || '-'}</span>,
      date: <span style={{ color: 'var(--clr-text-muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</span>,
      actions: (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/admin/blog/${p.id}/edit`}><Button variant="ghost" size="sm" icon={<Edit size={14} />} /></Link>
          <Button onClick={() => handleDelete(p.id)} variant="ghost" size="sm" icon={<Trash2 size={14} color="#ff4444" />} />
        </div>
      ),
    };
  });

  const filteredPosts = React.useMemo(() => {
    return formattedPosts.filter((item) => {
      const titleText = typeof item.title === 'string' ? item.title : (item.title as any).props.children;
      const matchesSearch = titleText.toLowerCase().includes(search.toLowerCase());
      
      const statusText = typeof item.status === 'string' ? item.status : (item.status as any).props?.children;
      const matchesStatus = statusFilter === 'All' || (statusText && statusText.includes(statusFilter));

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, formattedPosts]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Blog CMS</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage your blog articles and publications.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin/blog/new">
            <Button variant="primary" icon={<Plus size={16} />}>Create Post</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
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

      {/* Table */}
      <Card>
        <CardHeader style={{ padding: '20px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
          <div style={{ display: 'flex', gap: '16px', flex: 1, maxWidth: '500px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }}>
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search posts..."
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
                  position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '200px',
                  background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)',
                  borderRadius: '12px', padding: '16px', zIndex: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Status</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['All', 'PUBLISHED', 'DRAFT'].map(s => (
                      <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="statusFilter" 
                          checked={statusFilter === s} 
                          onChange={() => { setStatusFilter(s); setShowFilters(false); }} 
                          style={{ accentColor: 'var(--clr-primary)' }}
                        />
                        {s === 'PUBLISHED' ? 'Published' : s === 'DRAFT' ? 'Draft' : 'All'}
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
            { key: 'image', label: '' },
            { key: 'title', label: 'Title' },
            { key: 'category', label: 'Category' },
            { key: 'status', label: 'Status' },
            { key: 'author', label: 'Author' },
            { key: 'date', label: 'Date' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={filteredPosts}
        />
      </Card>
    </div>
  );
}
