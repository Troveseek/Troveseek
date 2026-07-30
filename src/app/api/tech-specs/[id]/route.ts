import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

// GET — Single tech spec
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const spec = await db.techSpec.findUnique({
      where: { id },
      include: { service: { select: { id: true, name: true } } },
    });

    if (!spec) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(spec);
  } catch (error) {
    console.error('Error fetching tech spec:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT — Update tech spec
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    const spec = await db.techSpec.update({
      where: { id },
      data: {
        title: data.title,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        sections: data.sections,
        totalPrice: data.totalPrice != null ? parseFloat(data.totalPrice) : null,
        currency: data.currency || 'USD',
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        notes: data.notes || null,
        serviceId: data.serviceId || null,
        status: data.status || undefined,
        ...(data.companySignature !== undefined && { 
          companySignature: data.companySignature,
          companySignedAt: data.companySignature ? new Date() : null,
        }),
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_TECH_SPEC',
        resource: 'TechSpec',
        resourceId: spec.id,
        details: JSON.stringify({ specNumber: spec.specNumber, title: spec.title }),
      },
    });

    return NextResponse.json(spec);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Tech spec not found' }, { status: 404 });
    }
    console.error('Error updating tech spec:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE — Delete tech spec
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const spec = await db.techSpec.delete({ where: { id } });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_TECH_SPEC',
        resource: 'TechSpec',
        resourceId: id,
        details: JSON.stringify({ specNumber: spec.specNumber }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Tech spec not found' }, { status: 404 });
    }
    console.error('Error deleting tech spec:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
