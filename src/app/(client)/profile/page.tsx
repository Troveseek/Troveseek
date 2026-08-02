import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  // Fetch fresh user data from DB
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  fileUrl: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    redirect('/login');
  }

  // Fetch invoices for this user
  const invoices = await db.invoice.findMany({
    where: { order: { userId: user.id } },
    orderBy: { issuedAt: 'desc' },
    include: { order: true }
  });

  // Pass plain objects to client component
  const userProps = {
    id: user.id,
    name: user.name || 'User',
    email: user.email || '',
    image: user.image || '',
    invoices: invoices.map(inv => ({
      id: inv.id,
      invoiceNum: inv.invoiceNum,
      pdfUrl: inv.pdfUrl,
      issuedAt: inv.issuedAt.toISOString(),
      dueDate: inv.dueDate.toISOString(),
      status: inv.status,
      order: {
        orderNumber: inv.order.orderNumber,
        totalAmount: inv.order.totalAmount
      }
    })),
    orders: user.orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map(item => ({
        id: item.id,
        itemName: item.itemName,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        fileUrl: item.product?.fileUrl || null
      }))
    }))
  };

  return (
    <Suspense fallback={<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <ProfileClient user={userProps} />
    </Suspense>
  );
}

