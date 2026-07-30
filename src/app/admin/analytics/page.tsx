import React from 'react';
import db from '@/lib/db';
import AnalyticsClient from './AnalyticsClient';
import { formatServerPrice } from '@/lib/currency';
import { getLocale } from 'next-intl/server';

export default async function AnalyticsPage() {
  const locale = await getLocale();
  const paidStatuses = ['PAID', 'SUCCEEDED', 'paid', 'Succeeded', 'succeeded'];

  // Total Revenue & Orders
  const currencySetting = await db.siteSetting.findUnique({ where: { key: 'site_currency' } });
  const siteCurrency = currencySetting?.value || 'USD';

  const revenueResult = await db.order.aggregate({
    _sum: { totalAmount: true },
    _count: { id: true },
    where: { paymentStatus: { in: paidStatuses } }
  });
  const totalRevenue = revenueResult._sum.totalAmount || 0;
  const totalPaidOrders = revenueResult._count.id || 0;
  const avgOrderValue = totalPaidOrders > 0 ? totalRevenue / totalPaidOrders : 0;

  const totalUsers = await db.user.count();

  // Daily revenue + signups for last 7 days
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const dailyData = await Promise.all(
    days.map(async (day) => {
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      
      const revResult = await db.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: { in: paidStatuses }, createdAt: { gte: start, lte: end } }
      });
      const userCount = await db.user.count({
        where: { createdAt: { gte: start, lte: end } }
      });
      
      return {
        name: day.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: revResult._sum.totalAmount || 0,
        users: userCount,
      };
    })
  );

  // Category Sales Distribution
  const paidOrders = await db.order.findMany({
    where: { paymentStatus: { in: paidStatuses } },
    include: {
      items: {
        include: {
          product: {
            include: { category: true }
          }
        }
      }
    }
  });

  const categoryMap: Record<string, number> = {};
  paidOrders.forEach(order => {
    order.items.forEach(item => {
      const categoryName = item.product?.category?.name || 'Uncategorized';
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + item.totalPrice;
    });
  });

  let salesData = Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  if (salesData.length === 0) {
    salesData = [
      { name: 'Products', value: 0 },
      { name: 'SaaS', value: 0 },
      { name: 'Services', value: 0 },
    ];
  }

  // AI Insights Generation
  const insights = [];
  
  if (totalRevenue === 0) {
    insights.push({ type: 'warning', title: 'Awaiting First Sale', description: 'Your platform is live but no revenue has been recorded yet. Consider reviewing your marketing or product pricing.' });
  } else {
    // Compare last 3 days to previous 3 days
    const recentRev = dailyData.slice(-3).reduce((sum, d) => sum + d.revenue, 0);
    const prevRev = dailyData.slice(-6, -3).reduce((sum, d) => sum + d.revenue, 0);
    
    if (recentRev > prevRev) {
      insights.push({ type: 'opportunity', title: 'Revenue is Trending Up!', description: `Revenue over the last 3 days (${formatServerPrice(recentRev, siteCurrency, locale)}) is higher than the preceding 3 days (${formatServerPrice(prevRev, siteCurrency, locale)}). Great momentum!` });
    } else if (recentRev < prevRev) {
      insights.push({ type: 'warning', title: 'Revenue Dip Detected', description: `Revenue over the last 3 days (${formatServerPrice(recentRev, siteCurrency, locale)}) has dropped compared to the preceding 3 days (${formatServerPrice(prevRev, siteCurrency, locale)}). Keep an eye on sales.` });
    }

    if (salesData.length > 0 && salesData[0].value > 0) {
      insights.push({ type: 'trend', title: 'Top Performer', description: `Your best selling category is "${salesData[0].name}", accounting for ${formatServerPrice(salesData[0].value, siteCurrency, locale)} in total revenue.` });
    }
  }

  if (totalUsers < 10) {
    insights.push({ type: 'opportunity', title: 'Grow your user base', description: 'User count is currently low. Consider sharing your platform on social media to drive traffic.' });
  } else {
    const recentUsers = dailyData.slice(-3).reduce((sum, d) => sum + d.users, 0);
    if (recentUsers > 0) {
      insights.push({ type: 'trend', title: 'Active Signups', description: `${recentUsers} new users joined in the last 3 days.` });
    }
  }

  return (
    <AnalyticsClient
      totalRevenue={totalRevenue}
      totalUsers={totalUsers}
      avgOrderValue={avgOrderValue}
      dailyData={dailyData}
      salesData={salesData}
      insights={insights}
    />
  );
}
