import React from 'react';
import db from '@/lib/db';
import PaymentsAdminClient from './PaymentsClient';

export default async function PaymentsPage() {
  // Fetch physical product orders
  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: true }
  });

  // Fetch SaaS subscriptions
  const subscriptions = await db.subscription.findMany({
    where: { price: { gt: 0 } },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: true, saas: true }
  });

  // Fetch Service Payments (Tech Specs)
  const servicePayments = await db.servicePayment.findMany({
    where: { amount: { gt: 0 } },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { techSpec: true }
  });

  // Combine and sort by date descending
  const combinedPayments: any[] = [
    ...orders.map(o => ({
      id: o.id,
      order: { orderNumber: o.orderNumber },
      gateway: o.paymentIntent ? 'External' : 'Pending',
      amount: o.totalAmount,
      createdAt: o.createdAt,
      type: 'Order',
      status: (o.paymentStatus || '').toUpperCase() === 'PAID' ? 'SUCCEEDED'
            : ['PENDING', 'UNPAID', 'PROCESSING'].includes((o.paymentStatus || '').toUpperCase()) ? 'PROCESSING'
            : ['FAILED', 'REFUNDED', 'CANCELED'].includes((o.paymentStatus || '').toUpperCase()) ? 'FAILED'
            : 'UNKNOWN',
    })),
    ...subscriptions.map(s => ({
      id: s.id,
      order: { orderNumber: `SAAS-${s.saasId.substring(0, 8).toUpperCase()}` }, // Use SaaS ID as mock order number
      gateway: s.paymentMethod ? s.paymentMethod.toUpperCase() : (s.stripeSubscriptionId ? 'Stripe' : 'External'),
      amount: s.price,
      createdAt: s.createdAt,
      type: 'Subscription',
      status: s.status === 'ACTIVE' ? 'SUCCEEDED'
            : s.status === 'PENDING' ? 'PROCESSING'
            : ['CANCELED', 'PAST_DUE'].includes(s.status) ? 'FAILED'
            : 'UNKNOWN',
    })),
    ...servicePayments.map(sp => ({
      id: sp.id,
      order: { orderNumber: `TS-${sp.techSpec.specNumber}` },
      gateway: sp.paymentMethod ? sp.paymentMethod.toUpperCase() : 'Pending',
      amount: sp.amount,
      createdAt: sp.createdAt,
      type: 'Service',
      status: sp.status === 'PAID' ? 'SUCCEEDED'
            : sp.status === 'PROCESSING' ? 'PROCESSING'
            : sp.status === 'UNPAID' ? 'PROCESSING' // Or UNPAID if you prefer
            : 'UNKNOWN'
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Calculate dynamic stats
  let totalRev = 0;
  let processing = 0;
  let refunded = 0;
  
  for (const p of combinedPayments) {
    if (p.status === 'SUCCEEDED') totalRev += p.amount;
    if (p.status === 'PROCESSING') processing += p.amount;
    if (p.status === 'FAILED') refunded += p.amount;
  }

  return (
    <PaymentsAdminClient
      initialStats={{
        totalRevenue: totalRev,
        processing: processing,
        refunded: refunded
      }}
      initialPayments={combinedPayments}
    />
  );
}
