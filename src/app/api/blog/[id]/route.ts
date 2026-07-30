import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(role)) return null;
  return session;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Support lookup by slug too
  const post = await db.blogPost.findFirst({ where: { OR: [{ id }, { slug: id }] } });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { 
    title, titleAr, slug, excerpt, excerptAr, content, contentAr, coverImage, authorName, authorImage, 
    category, readTime, status, tags, chapters, metaTitle, metaTitleAr, metaDescription, metaDescriptionAr 
  } = body;
  if (!title || !slug) return NextResponse.json({ error: 'Title and slug are required.' }, { status: 400 });

  const existing = await db.blogPost.findFirst({ where: { slug, NOT: { id } } });
  if (existing) return NextResponse.json({ error: 'Slug already in use.' }, { status: 409 });

  const post = await db.blogPost.update({
    where: { id },
    data: {
      title, titleAr: titleAr || null, slug, excerpt, excerptAr: excerptAr || null, 
      content, contentAr: contentAr || null, coverImage, authorName, authorImage, category, readTime,
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
  return NextResponse.json(post);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await db.blogPost.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
