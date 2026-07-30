"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Check, X, Trash2, Search, Loader, Star } from 'lucide-react';
import Link from 'next/link';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !currentStatus })
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0 }}>Review Management</h1>
          <p style={{ color: 'var(--clr-text-muted)', margin: '4px 0 0' }}>Moderate and manage customer reviews.</p>
        </div>
      </div>

      <Card style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '10px', background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '6px', color: 'var(--clr-text)' }}
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
          <Button variant="secondary" icon={<Search size={16} />} onClick={fetchReviews}>Refresh</Button>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader className="spin" size={24} /></div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--clr-text-muted)' }}>
            No reviews found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--clr-border)', color: 'var(--clr-text-muted)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500, fontSize: '13px' }}>Author</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500, fontSize: '13px' }}>Product</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500, fontSize: '13px' }}>Rating</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500, fontSize: '13px' }}>Comment</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500, fontSize: '13px' }}>Date</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500, fontSize: '13px' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500, fontSize: '13px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(review => (
                  <tr key={review.id} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                    <td style={{ padding: '16px' }}>{review.authorName}</td>
                    <td style={{ padding: '16px' }}>
                      <Link href={`/shop/${review.product?.slug}`} target="_blank" style={{ color: 'var(--clr-primary)', textDecoration: 'none' }}>
                        {review.product?.name}
                      </Link>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--clr-primary)' }}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </td>
                    <td style={{ padding: '16px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {review.comment}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--clr-text-muted)', fontSize: '13px' }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {review.isApproved 
                        ? <span style={{ background: 'var(--clr-success-dim)', color: 'var(--clr-success)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>Approved</span>
                        : <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>Pending</span>
                      }
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Button 
                          variant={review.isApproved ? 'secondary' : 'primary'}
                          size="sm"
                          icon={review.isApproved ? <X size={14} /> : <Check size={14} />}
                          onClick={() => handleToggleApproval(review.id, review.isApproved)}
                        >
                          {review.isApproved ? 'Reject' : 'Approve'}
                        </Button>
                        <button 
                          onClick={() => handleDelete(review.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
