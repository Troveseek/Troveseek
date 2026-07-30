import React from 'react';
import db from '@/lib/db';
import SupportClient from './SupportClient';

export default async function SupportAdminPage() {
  const sessions = await db.chatSession.findMany({
    include: {
      user: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let open = 0;
  let urgent = 0;
  let resolvedToday = 0;

  sessions.forEach(s => {
    if (s.status === 'OPEN') open++;
    if (s.status === 'URGENT') urgent++;
    if (s.status === 'RESOLVED' && s.updatedAt >= startOfToday) resolvedToday++;
  });

  const initialStats = {
    open,
    urgent,
    resolvedToday,
    avgResponseTime: '—', // Hard to compute without parsing all messages for each session
  };

  return (
    <SupportClient 
      initialStats={initialStats} 
      initialTickets={sessions} 
    />
  );
}
