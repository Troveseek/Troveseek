import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(3, "Comment must be at least 3 characters"),
  authorName: z.string().min(2, "Name must be at least 2 characters"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await req.json();
    
    // Validate request body
    const result = reviewSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { rating, comment, authorName } = result.data;

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Create review (isApproved defaults to false via schema)
    const review = await db.review.create({
      data: {
        rating,
        comment,
        authorName,
        productId,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
