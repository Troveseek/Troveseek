import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ data: coupons });
  } catch (error) {
    console.error('Coupons GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    // In production, ensure session user is admin
    const body = await req.json();
    const { code, discount, type, appliesTo, maxUsage, expiry, status } = body;

    const newCoupon = await db.coupon.create({
      data: {
        code,
        discount: Number(discount),
        type,
        appliesTo,
        maxUsage: maxUsage ? Number(maxUsage) : null,
        expiry: expiry ? new Date(expiry) : null,
        status: status || 'ACTIVE',
      }
    });

    return NextResponse.json({ data: newCoupon });
  } catch (error: any) {
    console.error('Coupons POST Error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
