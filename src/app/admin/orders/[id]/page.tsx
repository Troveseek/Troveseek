import React from 'react';
import db from '@/lib/db';
import OrderDetailClient from './OrderDetailClient';
import { notFound } from 'next/navigation';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const order = await db.order.findFirst({
    where: {
      OR: [
        { id },
        { orderNumber: id }
      ]
    },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      items: true,
      invoice: true,
    }
  });

  if (!order) {
    notFound();
  }

  return <OrderDetailClient initialOrder={order} />;
}
