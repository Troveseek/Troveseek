import React from 'react';
import db from '@/lib/db';
import { notFound } from 'next/navigation';
import InvoiceDetailClient from './InvoiceDetailClient';

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Search by either actual ID or invoiceNum
  const invoice = await db.invoice.findFirst({
    where: {
      OR: [
        { id },
        { invoiceNum: id }
      ]
    },
    include: {
      order: {
        include: {
          user: true,
          items: true
        }
      }
    }
  });

  if (!invoice) {
    notFound();
  }

  return <InvoiceDetailClient invoice={invoice} />;
}
