"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Search } from 'lucide-react';
import styles from './page.module.css';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';

export default function BlogPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('latest');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/blog?status=PUBLISHED&limit=50');
        const data = await res.json();
        setPosts(data.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Derive categories and tags dynamically from posts
  const categories = useMemo(() => {
    const map: Record<string, number> = {};
    posts.forEach(p => { if (p.category) map[p.category] = (map[p.category] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const popularTags = useMemo(() => {
    const allTags: string[] = [];
    posts.forEach(p => {
      if (p.tags) {
        try { allTags.push(...JSON.parse(p.tags)); } catch { /* no tags field */ }
      }
      // Fall back to using category as a tag
      if (p.category) allTags.push(p.category);
    });
    const unique = [...new Set(allTags)];
    return unique.slice(0, 12);
  }, [posts]);

  const filtered = useMemo(() => {
    let list = [...posts];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (isAr ? (p.titleAr || p.title) : p.title)?.toLowerCase().includes(q) ||
        (isAr ? (p.excerptAr || p.excerpt) : p.excerpt)?.toLowerCase().includes(q) ||
        (isAr ? (p.authorNameAr || p.authorName) : p.authorName)?.toLowerCase().includes(q) ||
        (isAr ? (p.categoryAr || p.category) : p.category)?.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      list = list.filter(p => p.category === selectedCategory);
    }
    if (sort === 'popular') {
      // No view count, just keep latest order as proxy
    }
    return list;
  }, [posts, search, selectedCategory, sort]);

  const featuredPost = filtered.length > 0 ? filtered[0] : null;
  const regularPosts = filtered.length > 1 ? filtered.slice(1) : [];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setIsSubscribing(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (isAr ? 'فشل' : 'Failed'));
      toast.success(data.message || (isAr ? 'تم الاشتراك!' : 'Subscribed!'));
      setNewsletterEmail('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '96px', color: 'var(--clr-text-muted)' }}>
        {isAr ? 'جاري تحميل المقالات...' : 'Loading articles...'}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '96px', color: 'var(--clr-text-muted)' }}>
        {isAr ? 'لم يتم نشر أي مقالات بعد. عد قريباً!' : 'No blog posts published yet. Check back soon!'}
      </div>
    );
  }

  return (
    <div className={styles.blogPage}>
      {/* Featured Post */}
      {featuredPost ? (
        <Link href={`/blog/${featuredPost.slug}`} style={{ textDecoration: 'none' }}>
          <div className={styles.featuredPost}>
            {featuredPost.coverImage ? (
              <div className={styles.featuredImg} style={{ background: `url(${featuredPost.coverImage}) center/cover` }} />
            ) : (
              <div className={styles.featuredImg} style={{ background: 'linear-gradient(135deg, var(--clr-surface-2), var(--clr-surface-3))' }} />
            )}
            <div className={styles.featuredContent}>
              <div className={styles.metaRow}>
                {featuredPost.category && <span className={styles.categoryBadge}>{isAr ? (featuredPost.categoryAr || featuredPost.category) : featuredPost.category}</span>}
                <span>{featuredPost.publishedAt ? format(new Date(featuredPost.publishedAt), 'MMMM d, yyyy') : (isAr ? 'مؤخراً' : 'Recently')}</span>
                {featuredPost.readTime && <span>{featuredPost.readTime}</span>}
              </div>
              <h2 className={styles.featuredTitle}>{isAr ? (featuredPost.titleAr || featuredPost.title) : featuredPost.title}</h2>
              <p className={styles.featuredDesc}>
                {isAr ? (featuredPost.excerptAr || featuredPost.excerpt || (featuredPost.contentAr || featuredPost.content ? (featuredPost.contentAr || featuredPost.content).substring(0, 150) + '...' : '')) : (featuredPost.excerpt || (featuredPost.content ? featuredPost.content.substring(0, 150) + '...' : ''))}
              </p>
              <div className={styles.authorRow}>
                {featuredPost.authorImage ? (
                  <div className={styles.authorAvatar} style={{ background: `url(${featuredPost.authorImage}) center/cover` }} />
                ) : (
                  <div className={styles.authorAvatar} style={{ background: 'var(--clr-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 600 }}>
                    {featuredPost.authorName ? featuredPost.authorName.charAt(0) : 'T'}
                  </div>
                )}
                <div>
                  <div className={styles.authorName}>{isAr ? (featuredPost.authorNameAr || featuredPost.authorName || 'فريق TroveSeek') : (featuredPost.authorName || 'TroveSeek Team')}</div>
                  <div className={styles.authorRole}>{isAr ? 'الكاتب' : 'Author'}</div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ) : null}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBar}>
          <Search size={16} color="var(--clr-text-muted)" />
          <input
            type="text"
            placeholder={isAr ? 'ابحث عن مقالات...' : 'Search articles...'}
            className={styles.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="">{isAr ? 'جميع التصنيفات' : 'All Categories'}</option>
            {categories.map(([name]) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select
            className={styles.filterSelect}
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="latest">{isAr ? 'الترتيب: الأحدث' : 'Sort: Latest'}</option>
            <option value="popular">{isAr ? 'الترتيب: الشائع' : 'Sort: Popular'}</option>
          </select>
        </div>
      </div>

      <div className={styles.mainLayout}>
        {/* Posts Grid */}
        <div className={styles.postsColumn}>
          {regularPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', color: 'var(--clr-text-muted)' }}>
              {search || selectedCategory ? (isAr ? 'لا توجد مقالات تطابق بحثك.' : 'No posts match your search.') : (isAr ? 'لا توجد مقالات أخرى متاحة.' : 'No other posts available.')}
            </div>
          ) : (
            <>
              <div className={styles.postGrid}>
                {regularPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div className={styles.postCard}>
                      {post.coverImage ? (
                        <div className={styles.postImg} style={{ background: `url(${post.coverImage}) center/cover` }} />
                      ) : (
                        <div className={styles.postImg} style={{ background: 'linear-gradient(135deg, var(--clr-surface-2), var(--clr-surface-3))' }} />
                      )}
                      <div className={styles.postContent}>
                        <div className={styles.metaRow} style={{ marginBottom: '10px' }}>
                          {post.category && <span className={styles.categoryBadge}>{isAr ? (post.categoryAr || post.category) : post.category}</span>}
                        </div>
                        <h3 className={styles.postTitle}>{isAr ? (post.titleAr || post.title) : post.title}</h3>
                        <p className={styles.postDesc}>
                          {isAr ? (post.excerptAr || post.excerpt || (post.contentAr || post.content ? (post.contentAr || post.content).substring(0, 100) + '...' : '')) : (post.excerpt || (post.content ? post.content.substring(0, 100) + '...' : ''))}
                        </p>
                        <div className={styles.postAuthorRow}>
                          {post.authorImage ? (
                            <div className={styles.smallAvatar} style={{ background: `url(${post.authorImage}) center/cover` }} />
                          ) : (
                            <div className={styles.smallAvatar} style={{ background: 'var(--clr-surface-3)' }} />
                          )}
                          <div>
                            <div className={styles.postAuthorName}>{isAr ? (post.authorNameAr || post.authorName || 'فريق TroveSeek') : (post.authorName || 'TroveSeek Team')}</div>
                            <div className={styles.postMeta}>
                              {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : (isAr ? 'مؤخراً' : 'Recently')}
                              {post.readTime ? ` · ${post.readTime}` : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          {/* Categories */}
          {categories.length > 0 && (
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarTitle}>{isAr ? 'التصنيفات' : 'Categories'}</div>
              <div className={styles.catList}>
                <div
                  className={styles.catItem}
                  onClick={() => setSelectedCategory('')}
                  style={{ cursor: 'pointer', fontWeight: !selectedCategory ? 600 : 400 }}
                >
                  <span>{isAr ? 'الكل' : 'All'}</span>
                  <span className={styles.catCount}>{posts.length}</span>
                </div>
                {categories.map(([name, count]) => (
                  <div
                    key={name}
                    className={styles.catItem}
                    onClick={() => setSelectedCategory(name === selectedCategory ? '' : name)}
                    style={{ cursor: 'pointer', fontWeight: selectedCategory === name ? 600 : 400, color: selectedCategory === name ? 'var(--clr-primary)' : undefined }}
                  >
                    <span>{name}</span>
                    <span className={styles.catCount}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Tags */}
          {popularTags.length > 0 && (
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarTitle}>{isAr ? 'العلامات الشائعة' : 'Popular Tags'}</div>
              <div className={styles.tagCloud}>
                {popularTags.map((tag) => (
                  <span
                    key={tag}
                    className={styles.tag}
                    onClick={() => setSearch(tag)}
                    style={{ cursor: 'pointer' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarTitle}>{isAr ? 'النشرة الإخبارية' : 'Newsletter'}</div>
            <p className={styles.newsletterSubtext}>
              {isAr ? 'احصل على أحدث المقالات والرؤى مباشرة في بريدك الوارد.' : 'Get the latest articles and insights delivered straight to your inbox.'}
            </p>
            <form onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder={isAr ? 'عنوان بريدك الإلكتروني' : 'Your email address'}
                className={styles.newsletterInput}
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                required
              />
              <Button variant="primary" style={{ width: '100%' }} disabled={isSubscribing}>
                {isSubscribing ? (isAr ? 'جاري الاشتراك...' : 'Subscribing...') : (isAr ? 'اشترك' : 'Subscribe')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
