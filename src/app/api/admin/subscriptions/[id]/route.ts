import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia' as any,
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { action } = await req.json();

    const subscription = await db.subscription.findUnique({ where: { id } });
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (action === 'cancel') {
      if (process.env.STRIPE_SECRET_KEY && subscription.stripeSubscriptionId && !subscription.stripeSubscriptionId.startsWith('mock_') && !subscription.stripeSubscriptionId.startsWith('free_')) {
        // Cancel in Stripe
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      }

      const updated = await db.subscription.update({
        where: { id },
        data: { status: 'CANCELED', currentPeriodEnd: new Date() }, // Instant cancellation for admin action
      });

      await sendNotification({
        userId: subscription.userId,
        title: 'Subscription Cancelled',
        message: `Your ${subscription.planName} subscription has been cancelled.`,
        type: 'WARNING',
        link: '/profile?tab=subscriptions',
      });

      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'extend') {
      // Admin manual extension (e.g., +30 days comp)
      const currentEnd = new Date(subscription.currentPeriodEnd);
      const newEnd = new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000); // Add 30 days
      
      const updated = await db.subscription.update({
        where: { id },
        data: { currentPeriodEnd: newEnd, status: 'ACTIVE' },
      });

      await sendNotification({
        userId: subscription.userId,
        title: 'Subscription Extended',
        message: `Your ${subscription.planName} subscription has been extended by 30 days.`,
        type: 'SUCCESS',
        link: '/profile?tab=subscriptions',
      });

      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'activate') {
      // Admin manual activation of a PENDING (BaridiMob/Crypto) subscription
      // Reset the start and end dates to "now" so they get their full month/year
      const currentStart = new Date();
      const currentEnd = new Date();
      if (subscription.billingCycle === 'yearly') {
        currentEnd.setFullYear(currentEnd.getFullYear() + 1);
      } else {
        currentEnd.setMonth(currentEnd.getMonth() + 1);
      }

      const updated = await db.subscription.update({
        where: { id },
        data: { 
          status: 'ACTIVE',
          currentPeriodStart: currentStart,
          currentPeriodEnd: currentEnd
        },
      });

      await sendNotification({
        userId: subscription.userId,
        title: 'Subscription Activated! 🎉',
        message: `Your ${subscription.planName} plan is now active. Enjoy all features!`,
        type: 'SUCCESS',
        link: '/profile?tab=subscriptions',
      });

      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Admin subscription patch error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
