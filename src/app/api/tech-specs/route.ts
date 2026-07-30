import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

// GET — List all tech specs (admin)
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { clientName: { contains: search } },
        { specNumber: { contains: search } },
        { clientEmail: { contains: search } },
      ];
    }
    if (status && status !== 'All') {
      where.status = status;
    }

    const specs = await db.techSpec.findMany({
      where,
      include: { service: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: specs });
  } catch (error) {
    console.error('Error fetching tech specs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST — Create a new tech spec
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    if (!data.title || !data.clientName || !data.clientEmail) {
      return NextResponse.json({ error: 'Title, Client Name, and Client Email are required' }, { status: 400 });
    }

    // Generate spec number: TS-YYYY-NNN
    const year = new Date().getFullYear();
    const count = await db.techSpec.count({
      where: { specNumber: { startsWith: `TS-${year}` } },
    });
    const specNumber = `TS-${year}-${String(count + 1).padStart(3, '0')}`;

    const spec = await db.techSpec.create({
      data: {
        specNumber,
        title: data.title,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        sections: data.sections || '[]',
        totalPrice: data.totalPrice ? parseFloat(data.totalPrice) : null,
        currency: data.currency || 'USD',
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        notes: data.notes || null,
        signatureToken: randomUUID(),
        serviceId: data.serviceId || null,
        companySignature: data.companySignature || null,
        companySignedAt: data.companySignature ? new Date() : null,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_TECH_SPEC',
        resource: 'TechSpec',
        resourceId: spec.id,
        details: JSON.stringify({ specNumber: spec.specNumber, title: spec.title }),
      },
    });

    return NextResponse.json(spec, { status: 201 });
  } catch (error: any) {
    console.error('Error creating tech spec:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
