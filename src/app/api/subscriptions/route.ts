import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia' as any,
});

// GET /api/subscriptions - Fetch subscriptions for user (or all if admin)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(role);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  
  const where: any = {};
  if (!isAdmin) {
    where.userId = userId;
  }
  if (status) {
    where.status = status;
  }

  try {
    const subscriptions = await db.subscription.findMany({
      where,
      include: {
        saas: { select: { id: true, name: true, slug: true, logo: true } },
        user: isAdmin ? { select: { id: true, name: true, email: true } } : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: subscriptions });
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/subscriptions - Create a Stripe Checkout Session for a subscription
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const userEmail = (session.user as any).email;
  const userName = (session.user as any).name;

  try {
    let { saasId, planName, billingCycle, price, paymentMethod = 'stripe', transactionId, receiptUrl } = await req.json();

    if (!saasId || !planName || !billingCycle || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const numericPrice = parseFloat(price.toString());

    if ((paymentMethod === 'baridi' || paymentMethod === 'crypto') && !transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required for manual payments' }, { status: 400 });
    }

    const saas = await db.saaS.findUnique({ where: { id: saasId } });
    if (!saas) {
      return NextResponse.json({ error: 'SaaS product not found' }, { status: 404 });
    }

    // Determine site currency
    const siteCurrencyObj = await db.siteSetting.findUnique({ where: { key: 'site_currency' } });
    const siteCurrency = siteCurrencyObj?.value || 'USD';
    const currencyStr = siteCurrency.toLowerCase();

    if (paymentMethod === 'baridi' || paymentMethod === 'crypto') {
      const sub = await db.subscription.create({
        data: {
          userId,
          saasId,
          planName,
          billingCycle,
          price: numericPrice,
          currency: siteCurrency,
          status: 'PENDING',
          paymentMethod,
          transactionId,
          receiptUrl,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
        },
      });

      // Notify Admins
      const admins = await db.user.findMany({ where: { role: 'ADMIN' } });
      if (admins.length > 0) {
        await db.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            title: 'New Subscription Payment Verification Needed',
            message: `User ${userName} subscribed to ${saas.name} via ${paymentMethod}. Verification required.`,
            type: 'INFO',
            link: '/admin/saas/subscriptions',
          })),
        });
      }

      return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/profile?tab=subscriptions&success=true` });
    }

    // Always require a valid Stripe configuration for production subscriptions
    if (paymentMethod === 'stripe' && !process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured. Please contact the administrator.' }, { status: 500 });
    }

    let user = await db.user.findUnique({ where: { id: userId } });
    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        name: userName,
        metadata: { userId },
      });
      customerId = customer.id;
      await db.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const sessionCheckout = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: currencyStr,
            product_data: {
              name: `${saas.name} - ${planName} Plan (${billingCycle})`,
              description: saas.tagline || undefined,
            },
            unit_amount: Math.round(numericPrice * 100),
            recurring: {
              interval: billingCycle === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?tab=subscriptions&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/saas/${saas.slug}?canceled=true`,
      metadata: {
        userId,
        saasId,
        planName,
        billingCycle,
        price: numericPrice.toString(),
        currency: siteCurrency,
      },
    });

    return NextResponse.json({ url: sessionCheckout.url });
  } catch (error: any) {
    console.error('Subscription Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
