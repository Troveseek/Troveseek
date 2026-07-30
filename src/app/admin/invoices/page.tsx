import React from 'react';
import db from '@/lib/db';
import InvoicesClient from './InvoicesClient';

export default async function InvoicesAdminPage() {
  const invoices = await db.invoice.findMany({
    orderBy: { issuedAt: 'desc' },
    include: {
      order: {
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }
    }
  });

  return <InvoicesClient initialInvoices={invoices} />;
}
