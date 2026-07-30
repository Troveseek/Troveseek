import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

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
    const validStatuses = ['DRAFT', 'ISSUED', 'SENT', 'PAID', 'OVERDUE', 'VOID'];
    if (body.status && !validStatuses.includes(body.status.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedInvoice = await db.invoice.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status.toUpperCase() }),
      }
    });

    return NextResponse.json({ data: updatedInvoice });
  } catch (error) {
    console.error('Failed to update invoice', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}
