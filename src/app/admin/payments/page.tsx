import React from 'react';
import db from '@/lib/db';
import PaymentsAdminClient from './PaymentsClient';

export default async function PaymentsPage() {
  // Fetch physical product orders
  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      items: true,
      invoice: { select: { id: true, invoiceNum: true } }
    }
  });

  // Fetch SaaS subscriptions
  const subscriptions = await db.subscription.findMany({
    where: { price: { gt: 0 } },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      saas: { select: { id: true, name: true, slug: true, logo: true, tagline: true } }
    }
  });

  // Fetch Service Payments (Tech Specs)
  const servicePayments = await db.servicePayment.findMany({
    where: { amount: { gt: 0 } },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      techSpec: {
        select: {
          id: true,
          specNumber: true,
          title: true,
          clientName: true,
          clientEmail: true,
          serviceId: true,
          service: { select: { id: true, name: true, slug: true } }
        }
      }
    }
  });

  // Combine and sort by date descending
  const combinedPayments: any[] = [
    ...orders.map(o => ({
      id: o.id,
      order: { orderNumber: o.orderNumber },
      gateway: o.paymentMethod ? o.paymentMethod.toUpperCase() : (o.paymentIntent ? 'STRIPE' : 'MANUAL'),
      amount: o.totalAmount,
      currency: o.currency || 'USD',
      createdAt: o.createdAt,
      type: 'Order',
      status: (o.paymentStatus || '').toUpperCase() === 'PAID' ? 'SUCCEEDED'
            : ['PENDING', 'UNPAID', 'PROCESSING'].includes((o.paymentStatus || '').toUpperCase()) ? 'PROCESSING'
            : ['FAILED', 'REFUNDED', 'CANCELED'].includes((o.paymentStatus || '').toUpperCase()) ? 'FAILED'
            : 'UNKNOWN',
      rawPaymentStatus: o.paymentStatus,
      transactionId: o.transactionId || o.paymentIntent,
      receiptUrl: o.receiptUrl,
      billingInfo: o.billingInfo,
      user: o.user,
      orderItems: o.items,
      invoice: o.invoice,
      entityLink: `/admin/orders/${o.id}`,
      entityTitle: `Order #${o.orderNumber}`,
    })),
    ...subscriptions.map(s => ({
      id: s.id,
      order: { orderNumber: `SAAS-${s.saas?.name || s.saasId.substring(0, 8).toUpperCase()}` },
      gateway: s.paymentMethod ? s.paymentMethod.toUpperCase() : (s.stripeSubscriptionId ? 'STRIPE' : 'MANUAL'),
      amount: s.price,
      currency: s.currency || 'USD',
      createdAt: s.createdAt,
      type: 'Subscription',
      status: s.status === 'ACTIVE' ? 'SUCCEEDED'
            : s.status === 'PENDING' ? 'PROCESSING'
            : ['CANCELED', 'PAST_DUE'].includes(s.status) ? 'FAILED'
            : 'UNKNOWN',
      rawPaymentStatus: s.status,
      transactionId: s.transactionId || s.stripeSubscriptionId,
      receiptUrl: s.receiptUrl,
      billingInfo: null,
      user: s.user,
      saas: s.saas,
      planName: s.planName,
      billingCycle: s.billingCycle,
      currentPeriodEnd: s.currentPeriodEnd,
      entityLink: s.saas?.slug ? `/saas/${s.saas.slug}` : `/admin/saas/subscriptions`,
      entityAdminLink: `/admin/saas/subscriptions`,
      entityTitle: `${s.saas?.name || 'SaaS'} (${s.planName} - ${s.billingCycle})`,
    })),
    ...servicePayments.map(sp => ({
      id: sp.id,
      order: { orderNumber: `TS-${sp.techSpec.specNumber}` },
      gateway: sp.paymentMethod ? sp.paymentMethod.toUpperCase() : 'MANUAL / BARIDIMOB',
      amount: sp.amount,
      currency: sp.currency || 'USD',
      createdAt: sp.createdAt,
      type: 'Service',
      status: sp.status === 'PAID' ? 'SUCCEEDED'
            : sp.status === 'PROCESSING' ? 'PROCESSING'
            : sp.status === 'UNPAID' ? 'PROCESSING'
            : sp.status === 'REFUNDED' || sp.status === 'CANCELED' ? 'FAILED'
            : 'UNKNOWN',
      rawPaymentStatus: sp.status,
      transactionId: sp.transactionId,
      receiptUrl: sp.receiptUrl,
      billingInfo: null,
      user: {
        name: sp.techSpec.clientName,
        email: sp.techSpec.clientEmail,
      },
      techSpec: sp.techSpec,
      paymentTitle: sp.title,
      entityLink: `/admin/tech-specs/${sp.techSpec.id}/edit`,
      entityPreviewLink: `/admin/tech-specs/${sp.techSpec.id}/preview`,
      serviceLink: sp.techSpec.service?.slug ? `/services/${sp.techSpec.service.slug}` : null,
      entityTitle: `${sp.techSpec.title} (${sp.title})`,
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
