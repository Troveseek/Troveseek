import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (!['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SUPPORT'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const techSpec = await db.techSpec.findUnique({
      where: { id },
      include: {
        service: true,
        payments: true,
      }
    });

    if (!techSpec) {
      return NextResponse.json({ error: 'Tech Spec not found' }, { status: 404 });
    }

    // Check if an order & invoice already exists for this tech spec order number
    const orderNumber = `TS-${techSpec.specNumber}`;
    let existingOrder = await db.order.findUnique({
      where: { orderNumber },
      include: { invoice: true }
    });

    if (existingOrder?.invoice) {
      return NextResponse.json({
        success: true,
        message: 'Invoice already exists',
        invoiceId: existingOrder.invoice.id,
        invoiceNum: existingOrder.invoice.invoiceNum,
        orderId: existingOrder.id,
      });
    }

    // Find or locate customer User by clientEmail
    let user = await db.user.findUnique({
      where: { email: techSpec.clientEmail }
    });

    if (!user) {
      // Find admin or default to current user as creator/owner
      user = await db.user.findUnique({
        where: { id: (session.user as any).id }
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User context not found' }, { status: 400 });
    }

    const totalAmount = techSpec.totalPrice || techSpec.payments.reduce((sum, p) => sum + p.amount, 0) || 0;
    const isPaid = techSpec.status === 'SIGNED' && techSpec.payments.length > 0 && techSpec.payments.every(p => p.status === 'PAID');

    // Create or update the Order
    if (!existingOrder) {
      existingOrder = await db.order.create({
        data: {
          orderNumber,
          userId: user.id,
          status: techSpec.status === 'SIGNED' ? 'COMPLETED' : 'PENDING',
          totalAmount,
          currency: techSpec.currency || 'USD',
          paymentStatus: isPaid ? 'PAID' : 'UNPAID',
          paymentMethod: 'tech_spec_billing',
          billingInfo: JSON.stringify({
            clientName: techSpec.clientName,
            clientEmail: techSpec.clientEmail,
            notes: techSpec.notes,
          }),
          items: {
            create: techSpec.payments.length > 0
              ? techSpec.payments.map(p => ({
                  itemName: `${techSpec.title} - ${p.title}`,
                  quantity: 1,
                  unitPrice: p.amount,
                  totalPrice: p.amount,
                }))
              : [
                  {
                    itemName: `${techSpec.title} (${techSpec.specNumber})`,
                    quantity: 1,
                    unitPrice: totalAmount,
                    totalPrice: totalAmount,
                  }
                ]
          }
        },
        include: { invoice: true }
      });
    }

    // Generate unique invoice number: INV-TS-YYYY-NNN or INV-2026-XXXX
    const invoiceNum = `INV-${techSpec.specNumber}`;
    const dueDate = techSpec.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const invoice = await db.invoice.create({
      data: {
        invoiceNum,
        orderId: existingOrder.id,
        dueDate,
        status: isPaid ? 'PAID' : 'ISSUED',
      }
    });

    // Create Audit Log
    await db.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'CREATE_TECH_SPEC_INVOICE',
        resource: 'Invoice',
        resourceId: invoice.id,
        details: JSON.stringify({
          techSpecId: techSpec.id,
          specNumber: techSpec.specNumber,
          invoiceNum: invoice.invoiceNum,
          totalAmount,
        }),
      }
    });

    return NextResponse.json({
      success: true,
      invoiceId: invoice.id,
      invoiceNum: invoice.invoiceNum,
      orderId: existingOrder.id,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Failed to generate tech spec invoice:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate invoice' }, { status: 500 });
  }
}
