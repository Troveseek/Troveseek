"use client";

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Sparkles, TrendingUp, Users, DollarSign, DownloadCloud, Activity } from 'lucide-react';
import { useCurrency } from '@/components/providers/CurrencyProvider';

export default function AnalyticsAdminPage({ totalRevenue, totalUsers, avgOrderValue, dailyData, salesData, insights }: {
  totalRevenue: number;
  totalUsers: number;
  avgOrderValue: number;
  dailyData: { name: string; revenue: number; users: number }[];
  salesData: { name: string; value: number }[];
  insights: { type: string; title: string; description: string }[];
}) {
  const { formatPrice } = useCurrency();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--clr-text)' }}>Analytics & AI Insights</h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '14px', marginTop: '4px' }}>Business performance and automated recommendations</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" icon={<DownloadCloud size={16} />}>Export Report</Button>
          <Button variant="primary" icon={<Sparkles size={16} />}>Refresh Insights</Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Main Analytics Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <Card>
              <CardBody style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--clr-text-muted)', fontSize: '14px', fontWeight: 500 }}>Total Visitors</span>
                  <Users size={16} color="var(--clr-primary)" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--clr-text)' }}>{totalUsers.toLocaleString()}</span>
                   <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--clr-accent)' }}>live</span>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--clr-text-muted)', fontSize: '14px', fontWeight: 500 }}>Total Revenue</span>
                  <DollarSign size={16} color="var(--clr-primary)" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--clr-text)' }}>{formatPrice(totalRevenue)}</span>
                   <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--clr-accent)' }}>live</span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--clr-text-muted)', fontSize: '14px', fontWeight: 500 }}>Avg Order Value</span>
                  <Activity size={16} color="var(--clr-primary)" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--clr-text)' }}>{formatPrice(avgOrderValue)}</span>
                   <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--clr-text-muted)' }}>per order</span>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Traffic Chart */}
          <Card>
            <CardHeader style={{ padding: '24px 24px 0' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Revenue &amp; Signups (7 Days)</h3>
            </CardHeader>
            <CardBody style={{ padding: '24px' }}>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={dailyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--clr-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--clr-primary)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--clr-accent)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--clr-accent)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--clr-border)" />
                     <XAxis dataKey="name" stroke="var(--clr-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke="var(--clr-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                     <Tooltip 
                       contentStyle={{ background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)' }}
                       itemStyle={{ color: 'var(--clr-text)' }}
                     />
                     <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="var(--clr-accent)" fillOpacity={1} fill="url(#colorViews)" />
                     <Area type="monotone" dataKey="users" name="New Users" stroke="var(--clr-primary)" fillOpacity={1} fill="url(#colorVisitors)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
          
          {/* Sales Distribution */}
          <Card>
            <CardHeader style={{ padding: '24px 24px 0' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Revenue by Category</h3>
            </CardHeader>
            <CardBody style={{ padding: '24px' }}>
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--clr-border)" />
                    <XAxis dataKey="name" stroke="var(--clr-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--clr-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ background: 'var(--clr-surface-elevated)', border: '1px solid var(--clr-border)', borderRadius: '8px', color: 'var(--clr-text)' }}
                      cursor={{ fill: 'var(--clr-surface-elevated)' }}
                    />
                    <Bar dataKey="value" fill="var(--clr-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Sidebar - AI Insights */}
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(124, 111, 255, 0.1), rgba(0, 229, 176, 0.1))', borderRadius: '16px', padding: '2px' }}>
            <div style={{ background: 'var(--clr-surface)', borderRadius: '14px', padding: '24px', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Gemini Insights</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--clr-text-muted)' }}>AI-driven business analysis</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {insights.map((insight, i) => (
                  <div key={i} style={{ 
                    padding: '16px', 
                    borderRadius: '12px', 
                    background: 'var(--clr-surface-elevated)',
                    border: '1px solid var(--clr-border)',
                    borderLeft: `3px solid ${
                      insight.type === 'opportunity' ? 'var(--clr-accent)' : 
                      insight.type === 'warning' ? '#ffaa00' : 
                      'var(--clr-primary)'
                    }`
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: 'var(--clr-text)' }}>
                      {insight.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--clr-text-muted)', lineHeight: 1.5 }}>
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>
              
              <Button variant="primary" style={{ width: '100%', marginTop: '24px' }}>Ask Gemini a Question</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
