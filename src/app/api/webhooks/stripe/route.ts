import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import db from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia' as any,
});

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription') {
          const { userId, saasId, planName, billingCycle, price, currency } = session.metadata || {};
          
          if (userId && saasId) {
            const subscriptionId = typeof session.subscription === 'string' ? session.subscription : (session.subscription as any)?.id;
            
            const sub = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;

            await db.subscription.create({
              data: {
                userId,
                saasId,
                planName: planName || 'Unknown',
                billingCycle: billingCycle || 'monthly',
                price: parseFloat(price || '0'),
                currency: currency || 'USD',
                status: 'ACTIVE',
                stripeSubscriptionId: subscriptionId,
                currentPeriodStart: new Date((sub as any).current_period_start * 1000),
                currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
              },
            });
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await db.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status === 'active' ? 'ACTIVE' : (subscription.status === 'past_due' ? 'PAST_DUE' : 'CANCELED'),
            currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await db.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'CANCELED',
            cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
          },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if ((invoice as any).subscription) {
          await db.subscription.updateMany({
            where: { stripeSubscriptionId: (invoice as any).subscription as string },
            data: { status: 'PAST_DUE' },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler failed:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
