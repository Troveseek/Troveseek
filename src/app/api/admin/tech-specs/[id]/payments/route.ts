import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { title, amount, currency } = body;

    if (!title || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid title or amount' }, { status: 400 });
    }

    const techSpec = await db.techSpec.findUnique({ where: { id } });
    if (!techSpec) {
      return NextResponse.json({ error: 'Tech spec not found' }, { status: 404 });
    }

    const payment = await db.servicePayment.create({
      data: {
        techSpecId: id,
        title,
        amount,
        currency: currency || 'USD',
        status: 'UNPAID',
      },
    });

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (error: any) {
    console.error('Create service payment error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const payments = await db.servicePayment.findMany({
      where: { techSpecId: id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, payments });
  } catch (error: any) {
    console.error('Fetch service payments error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
