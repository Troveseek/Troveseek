"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrency } from '@/components/providers/CurrencyProvider';

export default function RevenueChart({ data }: { data: any[] }) {
  const { formatPrice } = useCurrency();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <Line type="monotone" dataKey="revenue" stroke="var(--clr-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="name" stroke="var(--clr-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--clr-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatPrice(value)} />
        <Tooltip 
          contentStyle={{ backgroundColor: 'var(--clr-surface-2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
          itemStyle={{ color: '#fff' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
