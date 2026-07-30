"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus, Edit2, Trash2, Loader, Image as ImageIcon, MoveUp, MoveDown } from 'lucide-react';
import { toast } from 'sonner';

export default function GalleryAdminPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadImages = () => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => { setImages(data.data || []); setLoading(false); });
  };

  useEffect(() => { loadImages(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Image deleted');
      loadImages();
    } else {
      toast.error('Failed to delete');
    }
  };

  const moveOrder = async (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= images.length) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[index + direction];
    newImages[index + direction] = temp;
    
    setImages(newImages);
    
    await fetch(`/api/gallery/${newImages[index].id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newImages[index], displayOrder: index }) });
    await fetch(`/api/gallery/${newImages[index + direction].id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newImages[index + direction], displayOrder: index + direction }) });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Gallery CMS</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage the images in the "Behind the Scenes" gallery section.</p>
        </div>
        <Link href="/admin/gallery/new" style={{ textDecoration: 'none' }}>
          <Button variant="primary" icon={<Plus size={16} />}>Add Image</Button>
        </Link>
      </div>

      <Card style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}><Loader className="spin" /></div>
        ) : images.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>No images found. Add one to get started.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--clr-border)', background: 'var(--clr-surface-2)' }}>
                <th style={{ padding: '16px' }}>Order</th>
                <th style={{ padding: '16px' }}>Preview</th>
                <th style={{ padding: '16px' }}>Title</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {images.map((img, i) => (
                <tr key={img.id} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <Button variant="ghost" size="iconOnly" onClick={() => moveOrder(i, -1)} disabled={i === 0}><MoveUp size={14}/></Button>
                      <Button variant="ghost" size="iconOnly" onClick={() => moveOrder(i, 1)} disabled={i === images.length - 1}><MoveDown size={14}/></Button>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ width: '60px', height: '40px', borderRadius: '4px', background: `url(${img.imageUrl}) center/cover`, border: '1px solid var(--clr-border)' }} />
                  </td>
                  <td style={{ padding: '16px', fontWeight: 500, color: 'var(--clr-text)' }}>{img.title || '-'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: img.isActive ? 'rgba(0,229,176,0.1)' : 'rgba(255,68,68,0.1)', color: img.isActive ? '#00e5b0' : '#ff4444' }}>
                      {img.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <Link href={`/admin/gallery/${img.id}/edit`}>
                        <Button variant="ghost" size="sm" icon={<Edit2 size={14} />}>Edit</Button>
                      </Link>
                      <Button variant="ghost" size="sm" style={{ color: 'var(--clr-danger)' }} icon={<Trash2 size={14} />} onClick={() => handleDelete(img.id)}>Delete</Button>
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
