import React from 'react';
import db from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import InvoiceDetailClient from '@/app/admin/invoices/[id]/InvoiceDetailClient';

export default async function ClientInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

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

  // Ensure the logged in user actually owns this invoice
  if (invoice.order.user.email !== session.user.email) {
    notFound();
  }

  return (
    <div style={{ padding: '40px 24px', background: 'var(--clr-background)', minHeight: '100vh' }}>
      <InvoiceDetailClient invoice={invoice} backLink="/profile" />
    </div>
  );
}
