import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { rating, comment, authorName } = body;

  if (!rating || !comment || !authorName) {
    return NextResponse.json({ error: 'Rating, comment, and name are required.' }, { status: 400 });
  }

  const session = await auth();
  const userId = session?.user?.id;

  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: 'Blog post not found.' }, { status: 404 });
  }

  const review = await db.review.create({
    data: {
      rating: parseInt(rating),
      comment,
      authorName,
      blogPostId: id,
      userId: userId || null,
      isApproved: true, // Auto-approve for now, or false if you want moderation
    },
  });

  // Calculate new average rating
  const allReviews = await db.review.findMany({ where: { blogPostId: id, isApproved: true } });
  const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

  await db.blogPost.update({
    where: { id },
    data: {
      avgRating,
      reviewCount: allReviews.length,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
