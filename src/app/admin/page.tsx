import React from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import db from '@/lib/db';
import RevenueChart from './RevenueChart';
import { formatServerPrice } from '@/lib/currency';
import { getLocale } from 'next-intl/server';

export default async function AdminDashboard() {
  const locale = await getLocale();
  // Fetch real data
  const usersCount = await db.user.count();
  const ordersCount = await db.order.count();
  const totalRevenueData = await db.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: { not: 'CANCELLED' } }
  });

  const currencySetting = await db.siteSetting.findUnique({ where: { key: 'site_currency' } });
  const siteCurrency = currencySetting?.value || 'USD';
  
  const recentOrders = await db.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  const recentAudits = await db.auditLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  const totalRevenue = totalRevenueData._sum.totalAmount || 0;

  // Daily revenue + signups for last 7 days
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const chartData = await Promise.all(
    days.map(async (day) => {
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      
      const revResult = await db.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: 'PAID', createdAt: { gte: start, lte: end } }
      });
      
      return {
        name: day.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: revResult._sum.totalAmount || 0,
      };
    })
  );

  const stats = [
    { title: 'Total Revenue', value: formatServerPrice(totalRevenue, siteCurrency, locale), change: '0.0%', icon: DollarSign },
    { title: 'Active Users', value: usersCount.toString(), change: '0.0%', icon: Users },
    { title: 'Total Orders', value: ordersCount.toString(), change: '0.0%', icon: TrendingUp },
    { title: 'System Status', value: 'Healthy', change: '0 errors', icon: Activity, down: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0 }}>Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardBody style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--clr-text-muted)', fontSize: '14px', fontWeight: 500 }}>{stat.title}</span>
                <stat.icon size={16} color="var(--clr-primary)" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--clr-text)' }}>{stat.value}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: stat.down ? 'var(--clr-danger)' : 'var(--clr-accent)' }}>
                  {stat.change}
                </span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardBody style={{ height: '350px' }}>
            <RevenueChart data={chartData} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {recentOrders.length === 0 ? (
                <div style={{ color: 'var(--clr-text-muted)', fontSize: '14px' }}>No orders yet.</div>
              ) : recentOrders.map((order) => (
                <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {order.user?.name ? order.user.name.charAt(0) : 'U'}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--clr-text)' }}>{order.user?.name || 'Unknown User'}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--clr-text-muted)' }}>{order.orderNumber}</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--clr-accent)' }}>{formatServerPrice(order.totalAmount, siteCurrency, locale)}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity Logs</CardTitle>
        </CardHeader>
        <DataTable 
          columns={[
            { label: 'Action', key: 'action' },
            { label: 'Resource', key: 'resource' },
            { label: 'User', key: 'user' },
            { label: 'Time', key: 'time' },
          ]}
          data={recentAudits.map(row => ({
            action: row.action,
            resource: row.resource,
            user: row.user?.name || row.userId,
            time: new Date(row.createdAt).toLocaleString(),
          }))}
        />
      </Card>
    </div>
  );
}
