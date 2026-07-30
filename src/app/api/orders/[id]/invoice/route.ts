import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Generate a random invoice number
    const invoiceNum = `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const invoice = await db.invoice.create({
      data: {
        invoiceNum,
        orderId: id,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'ISSUED',
      }
    });

    // Also update order status to PAID or leave it as is.
    // We just return the invoice so the client can update state
    const order = await db.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        items: true,
        invoice: true,
      }
    });

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Failed to generate invoice', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
