"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus, Edit, Trash2, Loader, AlertCircle, Quote } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function TestimonialsAdminPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchTestimonials = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/testimonials');
      if (res.ok) {
        const json = await res.json();
        setTestimonials(json.data ?? []);
      }
    } catch {
      setError('Failed to load testimonials.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete testimonial from "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    setError('');
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      await fetchTestimonials();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (t: Testimonial) => {
    try {
      await fetch(`/api/testimonials/${t.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...t, isActive: !t.isActive }),
      });
      await fetchTestimonials();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0 }}>Testimonials</h1>
          <p style={{ color: 'var(--clr-text-muted)', marginTop: '4px' }}>
            Manage customer reviews and testimonials shown on the homepage.
          </p>
        </div>
        <Link href="/admin/testimonials/new">
          <Button variant="primary" icon={<Plus size={16} />}>New Testimonial</Button>
        </Link>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '8px', color: '#ff6b6b', fontSize: '14px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--clr-text-muted)' }}>
          <Loader size={32} className="spin" style={{ margin: '0 auto 16px' }} />
          <p>Loading testimonials...</p>
        </div>
      ) : testimonials.length === 0 ? (
        <Card>
          <CardBody style={{ textAlign: 'center', padding: '64px' }}>
            <Quote size={48} color="var(--clr-border)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No testimonials yet</h3>
            <p style={{ color: 'var(--clr-text-muted)', marginBottom: '24px' }}>
              Add testimonials to build social proof on your homepage.
            </p>
            <Link href="/admin/testimonials/new">
              <Button variant="primary" icon={<Plus size={16} />}>Add First Testimonial</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {testimonials.map((t) => (
            <Card key={t.id}>
              <CardBody style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px' }}>
                {t.avatarUrl ? (
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `url(${t.avatarUrl}) center/cover`, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--clr-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 600, flexShrink: 0 }}>
                    {t.name.charAt(0)}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '15px' }}>{t.name}</span>
                    {t.role && <span style={{ color: 'var(--clr-text-muted)', fontSize: '13px' }}>{t.role}</span>}
                    <Badge variant={t.isActive ? 'success' : 'default'}>{t.isActive ? 'Active' : 'Hidden'}</Badge>
                  </div>
                  <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', fontStyle: 'italic', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    "{t.quote}"
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <Button variant="ghost" size="sm" onClick={() => handleToggleActive(t)}>
                    {t.isActive ? 'Hide' : 'Show'}
                  </Button>
                  <Link href={`/admin/testimonials/${t.id}/edit`}>
                    <Button variant="ghost" size="sm" icon={<Edit size={14} />} />
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={deletingId === t.id ? <Loader size={14} className="spin" /> : <Trash2 size={14} color="#ff4444" />}
                    onClick={() => handleDelete(t.id, t.name)}
                    disabled={deletingId === t.id}
                  />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
