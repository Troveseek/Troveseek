"use client";

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Star } from 'lucide-react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

export default function CommentsSection({ postId }: { postId: string }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // We could fetch reviews from a new GET /api/blog/[id]/reviews if we created one, 
    // but the reviews can also be passed as props. However, since the user wants real-time updates when submitting,
    // let's assume we pass them as props initially, and append.
    // Actually, to make it simple without an extra GET endpoint, we will just manage the newly added ones here
    // But since it's a Server Component above, we can fetch all reviews in `page.tsx` and pass them down!
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName || !comment) {
      toast.error(isAr ? 'يرجى تقديم اسم وتعليق.' : 'Please provide a name and comment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/blog/${postId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, authorName })
      });

      if (!res.ok) throw new Error(isAr ? 'فشل إرسال التعليق' : 'Failed to submit comment');
      const newReview = await res.json();
      
      toast.success(isAr ? 'تم إرسال التعليق بنجاح!' : 'Comment submitted!');
      setComment('');
      setRating(5);
      
      // We will tell the parent to refresh or just append locally if we had them.
      // Since Next.js App Router, we can call router.refresh() to refetch Server Components.
      window.location.reload(); 
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '48px', paddingTop: '48px', borderTop: '1px solid var(--clr-border)' }}>
      <h3>{isAr ? 'التعليقات والتقييم' : 'Comments & Rating'}</h3>
      <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginBottom: '24px' }}>
        {isAr ? 'اترك تعليقًا وقيّم هذا المقال!' : 'Leave a comment and rate this article!'}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>{isAr ? 'التقييم' : 'Rating'}</label>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <Star 
                key={star} 
                size={20} 
                fill={star <= rating ? "#f59e0b" : "transparent"} 
                color={star <= rating ? "#f59e0b" : "var(--clr-border)"} 
                onClick={() => setRating(star)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>{isAr ? 'الاسم *' : 'Name *'}</label>
          <input 
            type="text" 
            value={authorName} 
            onChange={e => setAuthorName(e.target.value)} 
            placeholder={isAr ? 'اسمك' : 'Your name'}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>{isAr ? 'التعليق *' : 'Comment *'}</label>
          <textarea 
            rows={4}
            value={comment} 
            onChange={e => setComment(e.target.value)} 
            placeholder={isAr ? 'ما رأيك في هذا المقال؟' : 'What did you think of this article?'}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface)', fontFamily: 'inherit' }}
          />
        </div>

        <Button variant="primary" type="submit" disabled={isSubmitting} style={{ alignSelf: 'flex-start' }}>
          {isSubmitting ? (isAr ? 'جاري الإرسال...' : 'Submitting...') : (isAr ? 'إرسال التعليق' : 'Submit Comment')}
        </Button>
      </form>
    </div>
  );
}
