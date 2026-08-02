import React from 'react';
import Link from 'next/link';
import db from '@/lib/db';
import { format } from 'date-fns';
import { getLocale } from 'next-intl/server';

export async function BlogSection() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const posts = await db.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  });

  if (posts.length === 0) return null; // Hide if empty

  return (
    <section className="section-padding" style={{ background: 'var(--clr-surface-2)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(24px, 3.5vw, 40px)', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              {isAr ? 'أخبار ورؤى' : 'Insights & News'}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 2.4vw + 6px, 32px)', fontWeight: 700, margin: 0 }}>{isAr ? 'أحدث المقالات' : 'Latest from the Blog'}</h2>
          </div>
          <Link href="/blog" style={{ color: 'var(--clr-primary)', fontWeight: 600, fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isAr ? 'قراءة جميع المقالات ←' : 'Read All Posts →'}
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(16px, 2.5vw, 24px)' }}>
          {posts.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'var(--transition)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {post.coverImage ? (
                  <div style={{ height: 'clamp(160px, 16vw, 190px)', background: `url(${post.coverImage}) center/cover` }} />
                ) : (
                  <div style={{ height: 'clamp(160px, 16vw, 190px)', background: 'linear-gradient(135deg, var(--clr-surface-2), var(--clr-surface-3))' }} />
                )}
                
                <div style={{ padding: 'clamp(18px, 2.5vw, 24px)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {post.category && (
                    <span style={{ display: 'inline-block', background: 'var(--clr-primary-dim)', color: 'var(--clr-primary)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', padding: '3px 10px', borderRadius: '999px', marginBottom: '12px', alignSelf: 'flex-start' }}>
                      {post.category}
                    </span>
                  )}
                  <h3 style={{ fontSize: 'clamp(16px, 1.1vw + 4px, 18px)', fontWeight: 600, marginBottom: '10px', color: 'var(--clr-text)', lineHeight: 1.35 }}>{isAr ? (post.titleAr || post.title) : post.title}</h3>
                  <p style={{ color: 'var(--clr-text-muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
                    {isAr ? (post.excerptAr || post.contentAr?.substring(0, 100) || post.excerpt || post.content?.substring(0, 100)) : (post.excerpt || post.content?.substring(0, 100))}...
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--clr-border)' }}>
                    {post.authorImage ? (
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `url(${post.authorImage}) center/cover` }} />
                    ) : (
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--clr-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'var(--clr-text-muted)' }}>
                        {post.authorName ? post.authorName.charAt(0) : 'T'}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--clr-text)' }}>{post.authorName || 'TroveSeek Team'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                        {post.publishedAt ? format(new Date(post.publishedAt), 'MMMM d, yyyy') : (isAr ? 'مؤخراً' : 'Recently')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
