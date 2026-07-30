import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';

    let where = {};
    if (filter === 'pending') {
      where = { isApproved: false };
    } else if (filter === 'approved') {
      where = { isApproved: true };
    }

    const reviews = await db.review.findMany({
      where,
      include: {
        product: {
          select: { name: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
