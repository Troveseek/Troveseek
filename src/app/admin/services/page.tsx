import React from 'react';
import db from '@/lib/db';
import ServicesAdminClient from './ServicesClient';

export default async function ServicesPage() {
  const servicesData = await db.service.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <ServicesAdminClient initialServices={servicesData} />;
}
