import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/orders/[id] - Fetch a single order by ID or orderNumber
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const order = await db.order.findFirst({
    where: {
      OR: [
        { id },
        { orderNumber: id }
      ]
    },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      items: true,
      invoice: true,
    }
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ data: order });
}

// PATCH /api/orders/[id] - Update order details (tracking, status, etc)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user as any).role;
  if (!['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SUPPORT'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    const updatedOrder = await db.order.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.paymentStatus && { paymentStatus: body.paymentStatus }),
        ...(body.trackingNumber !== undefined && { trackingNumber: body.trackingNumber })
      }
    });

    // Notify Client
    if (body.status || body.trackingNumber !== undefined) {
      const message = body.status 
        ? `Your order ${updatedOrder.orderNumber} status is now ${body.status}` 
        : `Tracking number added to order ${updatedOrder.orderNumber}`;

      await db.notification.create({
        data: {
          userId: updatedOrder.userId,
          title: 'Order Updated',
          message,
          type: 'INFO',
          link: `/profile`,
        }
      });
    }

    return NextResponse.json({ data: updatedOrder });
  } catch (error) {
    console.error('Failed to update order', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE /api/orders/[id] - Delete an order
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user as any).role;
  if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    await db.order.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete order', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
