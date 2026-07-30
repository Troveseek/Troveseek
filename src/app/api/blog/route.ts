import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

// GET /api/blog — public, returns published posts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get('all') === 'true'; // admin only
  const limit = parseInt(searchParams.get('limit') ?? '20');

  const posts = await db.blogPost.findMany({
    where: all ? undefined : { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
  return NextResponse.json({ data: posts });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { 
    title, titleAr, slug, excerpt, excerptAr, content, contentAr, coverImage, authorName, authorImage, 
    category, readTime, status, tags, chapters, metaTitle, metaTitleAr, metaDescription, metaDescriptionAr 
  } = body;
  if (!title || !slug) return NextResponse.json({ error: 'Title and slug are required.' }, { status: 400 });

  const existing = await db.blogPost.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: 'A post with this slug already exists.' }, { status: 409 });

  const post = await db.blogPost.create({
    data: {
      title,
      titleAr: titleAr || null,
      slug,
      excerpt: excerpt || null,
      excerptAr: excerptAr || null,
      content: content || null,
      contentAr: contentAr || null,
      coverImage: coverImage || null,
      authorName: authorName || null,
      authorImage: authorImage || null,
      category: category || null,
      readTime: readTime || null,
      status: status ?? 'DRAFT',
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
      tags: tags || '[]',
      chapters: chapters || '[]',
      metaTitle: metaTitle || null,
      metaTitleAr: metaTitleAr || null,
      metaDescription: metaDescription || null,
      metaDescriptionAr: metaDescriptionAr || null,
    },
  });
  return NextResponse.json(post, { status: 201 });
}
