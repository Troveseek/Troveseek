import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Verify review exists
    const review = await db.review.findUnique({
      where: { id }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Update review approval status
    const updated = await db.review.update({
      where: { id },
      data: {
        isApproved: body.isApproved,
      }
    });

    return NextResponse.json({ review: updated });
  } catch (error) {
    console.error('Failed to update review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify review exists
    const review = await db.review.findUnique({
      where: { id }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Delete review
    await db.review.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
