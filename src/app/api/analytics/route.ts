import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = parseInt(searchParams.get('range') || '7');

    const paidStatuses = ['PAID', 'SUCCEEDED', 'paid', 'Succeeded', 'succeeded'];
    const now = new Date();
    
    const days = Array.from({ length: range }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (range - 1 - i));
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
          name: range <= 7 ? day.toLocaleDateString('en-US', { weekday: 'short' }) : day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: revResult._sum.totalAmount || 0,
          users: userCount,
        };
      })
    );

    // Total for this range
    const startDate = days[0];
    startDate.setHours(0, 0, 0, 0);

    const revenueResult = await db.order.aggregate({
      _sum: { totalAmount: true },
      _count: { id: true },
      where: { paymentStatus: { in: paidStatuses }, createdAt: { gte: startDate } }
    });
    const totalRevenue = revenueResult._sum.totalAmount || 0;
    const totalPaidOrders = revenueResult._count.id || 0;
    const avgOrderValue = totalPaidOrders > 0 ? totalRevenue / totalPaidOrders : 0;
    const totalUsers = await db.user.count({ where: { createdAt: { gte: startDate } } });

    // Category Sales Distribution for this range
    const paidOrders = await db.order.findMany({
      where: { paymentStatus: { in: paidStatuses }, createdAt: { gte: startDate } },
      include: { items: { include: { product: { include: { category: true } } } } }
    });

    const categoryMap: Record<string, number> = {};
    paidOrders.forEach(order => {
      order.items.forEach(item => {
        const categoryName = item.product?.category?.name || 'Uncategorized';
        categoryMap[categoryName] = (categoryMap[categoryName] || 0) + item.totalPrice;
      });
    });

    let salesData = Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    return NextResponse.json({ 
      data: {
        totalRevenue,
        totalUsers,
        avgOrderValue,
        dailyData,
        salesData
      }
    });
  } catch (error) {
    console.error('Analytics GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
