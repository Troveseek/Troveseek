"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus, Edit2, Trash2, Loader, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

export default function AnnouncementsAdminPage() {
  const [heroes, setHeroes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHeroes = () => {
    fetch('/api/page-heroes')
      .then(res => res.json())
      .then(data => { setHeroes(data.data || []); setLoading(false); });
  };

  useEffect(() => { loadHeroes(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    const res = await fetch(`/api/page-heroes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Announcement deleted');
      loadHeroes();
    } else {
      toast.error('Failed to delete');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Page Banners / Heroes</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage the hero banners across different pages (e.g., Home, SaaS, Services).</p>
        </div>
        <Link href="/admin/announcements/new" style={{ textDecoration: 'none' }}>
          <Button variant="primary" icon={<Plus size={16} />}>Create Banner</Button>
        </Link>
      </div>

      <Card style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}><Loader className="spin" /></div>
        ) : heroes.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>No announcements found. Add one to get started.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--clr-border)', background: 'var(--clr-surface-2)' }}>
                <th style={{ padding: '16px' }}>Target Page</th>
                <th style={{ padding: '16px' }}>Title</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {heroes.map((hero) => (
                <tr key={hero.id} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{hero.page}</td>
                  <td style={{ padding: '16px', color: 'var(--clr-text)' }}>{hero.title}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: hero.isActive ? 'rgba(0,229,176,0.1)' : 'rgba(255,68,68,0.1)', color: hero.isActive ? '#00e5b0' : '#ff4444' }}>
                      {hero.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <Link href={`/admin/announcements/${hero.id}/edit`}>
                        <Button variant="ghost" size="sm" icon={<Edit2 size={14} />}>Edit</Button>
                      </Link>
                      <Button variant="ghost" size="sm" style={{ color: 'var(--clr-danger)' }} icon={<Trash2 size={14} />} onClick={() => handleDelete(hero.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
