import React from 'react';
import { notFound } from 'next/navigation';
import db from '@/lib/db';
import { getLocale } from 'next-intl/server';
import Button from '@/components/ui/Button';
import { Mail, Globe, Link2, MessageCircle, ArrowLeft } from 'lucide-react';
import styles from './page.module.css';
import Link from 'next/link';
import ShareButtons from './ShareButtons';
import CommentsSection from './CommentsSection';
import { format } from 'date-fns';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const isAr = locale === 'ar';
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: 'Not Found' };

  return {
    title: (isAr ? (post.metaTitleAr || post.titleAr) : (post.metaTitle || post.title)) || post.title,
    description: (isAr ? (post.metaDescriptionAr || post.excerptAr) : (post.metaDescription || post.excerpt)) || post.excerpt,
    openGraph: {
      images: post.coverImage ? [post.coverImage] : [],
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getLocale();
  const isAr = locale === 'ar';
  const { slug } = await params;
  const post = await db.blogPost.findUnique({ 
    where: { slug, status: 'PUBLISHED' },
    include: { reviews: { where: { isApproved: true }, orderBy: { createdAt: 'desc' } } }
  });

  if (!post) return notFound();

  let tags: string[] = [];
  try { tags = JSON.parse((isAr ? post.tagsAr : post.tags) || post.tags || '[]'); } catch (e) {}

  let chapters: { id: string, title: string, level: number }[] = [];
  let htmlWithIds = (isAr ? post.contentAr : post.content) || post.content || '';

  htmlWithIds = htmlWithIds.replace(/<h([2-3])(?: [^>]+)?>([^<]+)<\/h\1>/gi, (match, level, text) => {
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    chapters.push({ id, title: text, level: parseInt(level) });
    return `<h${level} id="${id}">${text}</h${level}>`;
  });

  return (
    <div className={styles.postPage}>
      <div className={styles.breadcrumb}>
        <Link href="/">{isAr ? 'الرئيسية' : 'Home'}</Link> / <Link href="/blog">{isAr ? 'المدونة' : 'Blog'}</Link> {post.category ? `/ ${post.category}` : ''} / {isAr ? (post.titleAr || post.title) : post.title}
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.meta}>
          {post.category && <span className={styles.categoryBadge}>{post.category}</span>}
          <span>{post.publishedAt ? format(new Date(post.publishedAt), 'MMMM d, yyyy') : (isAr ? 'مؤخراً' : 'Recently')}</span>
          {post.readTime && <span>{post.readTime}</span>}
          {post.reviewCount > 0 && <span>★ {post.avgRating?.toFixed(1)} ({post.reviewCount})</span>}
        </div>
        <h1 className={styles.title}>{isAr ? (post.titleAr || post.title) : post.title}</h1>

        <div className={styles.authorCard}>
          {post.authorImage ? (
            <div className={styles.authorAvatar} style={{ backgroundImage: `url(${post.authorImage})`, backgroundSize: 'cover' }} />
          ) : (
            <div className={styles.authorAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-surface-3)' }}>
              {post.authorName ? post.authorName.charAt(0) : 'T'}
            </div>
          )}
          <div>
            <div className={styles.authorName}>{post.authorName || (isAr ? 'فريق TroveSeek' : 'TroveSeek Team')}</div>
            <div className={styles.authorBio}>{isAr ? 'المؤلف' : 'Author'}</div>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {post.coverImage ? (
        <div className={styles.coverImage} style={{ backgroundImage: `url(${post.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', border: 'none' }} />
      ) : (
        <div className={styles.coverImage} style={{ background: 'linear-gradient(135deg, var(--clr-surface-2), var(--clr-surface-3))', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-text-muted)' }}>
          {isAr ? 'لا توجد صورة غلاف' : 'No Cover Image'}
        </div>
      )}

      {/* Main Layout */}
      <div className={styles.mainLayout}>
        {/* Article Content */}
        <div className={styles.content}>
          {htmlWithIds ? (
            <div dangerouslySetInnerHTML={{ __html: htmlWithIds }} className="rich-text-content" />
          ) : (
            <p style={{ color: 'var(--clr-text-muted)', fontStyle: 'italic' }}>{isAr ? 'لا يوجد محتوى في هذه المشاركة بعد.' : 'This post has no content yet.'}</p>
          )}

          {tags.length > 0 && (
            <div className={styles.tagsRow} style={{ marginTop: '48px' }}>
              {tags.map((t) => (
                <Link key={t} href={`/blog?search=${t}`} className={styles.tag}>{t}</Link>
              ))}
            </div>
          )}

          {/* Author card */}
          <div className={styles.bottomAuthorCard} style={{ marginTop: '48px' }}>
            {post.authorImage ? (
              <div className={styles.bigAvatar} style={{ backgroundImage: `url(${post.authorImage})`, backgroundSize: 'cover' }} />
            ) : (
              <div className={styles.bigAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-surface-3)', fontSize: '24px', fontWeight: 600 }}>
                {post.authorName ? post.authorName.charAt(0) : 'T'}
              </div>
            )}
            <div>
              <div className={styles.bigAuthorName}>{post.authorName || (isAr ? 'فريق TroveSeek' : 'TroveSeek Team')}</div>
              <div className={styles.bigAuthorBio}>{isAr ? 'شكراً لقراءة هذا المقال. إذا وجدته مفيداً، ففكر في مشاركته مع شبكتك!' : 'Thank you for reading this article. If you found it helpful, consider sharing it with your network!'}</div>
              <div className={styles.authorSocials}>
                <div className={styles.socialIcon}><Globe size={18} /></div>
                <div className={styles.socialIcon}><Mail size={18} /></div>
              </div>
            </div>
          </div>

          <div className={styles.shareRow}>
            <h3>{isAr ? 'شارك هذا المقال' : 'Share this article'}</h3>
            <ShareButtons title={post.title} />
          </div>

          {/* Existing Comments */}
          {post.reviews.length > 0 && (
            <div style={{ marginTop: '48px' }}>
              <h3>{isAr ? `${post.reviewCount} تعليق` : `${post.reviewCount} Comments`}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
                {post.reviews.map(review => (
                  <div key={review.id} style={{ padding: '24px', background: 'var(--clr-surface)', borderRadius: '12px', border: '1px solid var(--clr-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ fontWeight: 500 }}>{review.authorName}</div>
                      <div style={{ color: '#f59e0b' }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                    </div>
                    <p style={{ color: 'var(--clr-text-muted)', lineHeight: 1.6 }}>{review.comment}</p>
                    <div style={{ fontSize: '12px', color: 'var(--clr-text-muted)', marginTop: '12px' }}>
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Comment Form */}
          <CommentsSection postId={post.id} />
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          {chapters.length > 0 && (
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarTitle}>{isAr ? 'جدول المحتويات' : 'Table of Contents'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {chapters.map((ch, idx) => (
                  <a 
                    key={idx} 
                    href={`#${ch.id}`} 
                    style={{ 
                      fontSize: '14px', 
                      color: 'var(--clr-primary)', 
                      textDecoration: 'none', 
                      transition: 'color 0.2s',
                      marginLeft: ch.level === 3 ? '16px' : '0'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--clr-primary-hover)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--clr-primary)'}
                  >
                    • {ch.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className={styles.sidebarCard} style={{ marginTop: chapters.length > 0 ? '24px' : '0' }}>
            <div className={styles.sidebarTitle}>{isAr ? 'النشرة الإخبارية' : 'Newsletter'}</div>
            <p style={{ fontSize: '14px', color: 'var(--clr-text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
              {isAr ? 'هل تستمتع بهذا المقال؟ اشترك للحصول على المزيد مثله في صندوق الوارد الخاص بك.' : 'Enjoying this post? Subscribe to get more like it delivered to your inbox.'}
            </p>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="email"
                placeholder={isAr ? 'عنوان بريدك الإلكتروني' : 'Your email address'}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--clr-border)', background: 'var(--clr-surface-elevated)' }}
              />
              <Button variant="primary" style={{ width: '100%' }}>{isAr ? 'اشتراك' : 'Subscribe'}</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
