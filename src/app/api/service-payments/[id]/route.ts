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

    const payment = await db.servicePayment.findUnique({ 
      where: { id },
      include: { techSpec: true }
    });
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    
    if (payment.status === 'PAID') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
    }

    if (paymentMethod === 'card') {
      if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: 'Stripe is not configured. Please contact the administrator.' }, { status: 500 });
      }

      // Determine site currency
      const siteCurrencyObj = await db.siteSetting.findUnique({ where: { key: 'site_currency' } });
      const siteCurrency = (siteCurrencyObj?.value || 'USD').toLowerCase();

      // Create Stripe Checkout Session
      const sessionCheckout = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: siteCurrency,
              product_data: {
                name: `Milestone Payment: ${payment.techSpec?.title || 'Service'}`,
                description: `Payment for ${payment.techSpec?.clientName || 'Client'}`,
              },
              unit_amount: Math.round(payment.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pay/${id}?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pay/${id}?canceled=true`,
        metadata: {
          servicePaymentId: id,
        },
      });

      return NextResponse.json({ success: true, url: sessionCheckout.url });
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
