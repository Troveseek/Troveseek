import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia' as any,
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const payment = await db.servicePayment.findUnique({
      where: { id },
      include: {
        techSpec: {
          select: { title: true, clientName: true, clientEmail: true }
        }
      }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    console.error('Fetch service payment error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const body = await req.json();
    const { paymentMethod, transactionId, receiptUrl } = body;

    const payment = await db.servicePayment.findUnique({ where: { id } });
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    
    if (payment.status === 'PAID') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
    }

    if (paymentMethod === 'card') {
      // Mock stripe charge
      const updated = await db.servicePayment.update({
        where: { id },
        data: {
          status: 'PAID',
          paymentMethod: 'stripe',
          transactionId: 'mock_stripe_' + Math.random().toString(36).substr(2, 9)
        }
      });
      return NextResponse.json({ success: true, payment: updated });
    } else if (paymentMethod === 'baridi' || paymentMethod === 'crypto') {
      if (!transactionId) {
        return NextResponse.json({ error: 'Transaction ID is required for manual payments' }, { status: 400 });
      }

      const updated = await db.servicePayment.update({
        where: { id },
        data: {
          status: 'PROCESSING', // Pending admin approval
          paymentMethod,
          transactionId,
          receiptUrl
        }
      });
      return NextResponse.json({ success: true, payment: updated });
    }

    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });

  } catch (error: any) {
    console.error('Process service payment error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
