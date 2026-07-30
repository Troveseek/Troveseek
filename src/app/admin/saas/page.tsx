import React from 'react';
import db from '@/lib/db';
import SaaSAdminClient from './SaasClient';

export default async function SaasPage() {
  const saasData = await db.saaS.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { reviews: true } },
      reviews: {
        where: { isApproved: true },
        select: { rating: true },
      },
    },
  });

  // Compute average rating per product
  const saasWithRating = saasData.map((s: any) => {
    const approvedReviews = s.reviews ?? [];
    const avgRating =
      approvedReviews.length > 0
        ? approvedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          approvedReviews.length
        : null;
    return { ...s, avgRating, reviewCount: approvedReviews.length };
  });

  return <SaaSAdminClient initialSaas={saasWithRating} />;
}
