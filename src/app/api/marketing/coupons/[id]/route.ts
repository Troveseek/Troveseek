import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const coupon = await db.coupon.findUnique({ where: { id } });
    if (!coupon) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: coupon });
  } catch (error) {
    console.error('Coupons GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const { id } = await params;
    const body = await req.json();
    const { code, discount, type, appliesTo, maxUsage, expiry, status } = body;

    const updated = await db.coupon.update({
      where: { id },
      data: {
        code,
        discount: Number(discount),
        type,
        appliesTo,
        maxUsage: maxUsage ? Number(maxUsage) : null,
        expiry: expiry ? new Date(expiry) : null,
        status,
      }
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Coupons PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const { id } = await params;
    
    await db.coupon.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Coupons DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
