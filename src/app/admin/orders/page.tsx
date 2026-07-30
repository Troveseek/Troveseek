import React from 'react';
import db from '@/lib/db';
import OrdersClient from './OrdersClient';

export default async function OrdersPage() {
  const totalVolumeData = await db.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: { not: 'CANCELLED' } }
  });
  
  const totalOrders = await db.order.count();
  const pendingFulfillment = await db.order.count({ where: { status: 'PENDING' } });

  const stats = {
    totalVolume: totalVolumeData._sum.totalAmount || 0,
    totalOrders,
    pendingFulfillment
  };

  return <OrdersClient initialStats={stats} />;
}
