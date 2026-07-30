import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reviews = await db.review.findMany({
      where: { saasId: id, isApproved: true },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, image: true } } },
    });
    return NextResponse.json({ data: reviews });
  } catch (error) {
    console.error('[GET /api/saas/[id]/reviews]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { rating, comment, authorName } = body;

    if (!rating || !comment || !authorName) {
      return NextResponse.json({ error: 'rating, comment, and authorName are required' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const saas = await db.saaS.findUnique({ where: { id } });
    if (!saas) return NextResponse.json({ error: 'SaaS not found' }, { status: 404 });

    const review = await db.review.create({
      data: {
        rating,
        comment,
        authorName,
        saasId: id,
        isApproved: false, // Pending moderation
      },
    });

    return NextResponse.json({ data: review, message: 'Review submitted for moderation!' }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/saas/[id]/reviews]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
