import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia' as any,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    
    if (!user?.stripeCustomerId) {
      return NextResponse.json({ 
        url: null, 
        message: 'Manual billing detected. Please contact support to manage manual subscriptions.' 
      }, { status: 200 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      // Mock portal response
      return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/profile?tab=subscriptions&mockPortal=true` });
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?tab=subscriptions`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Stripe Portal Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
