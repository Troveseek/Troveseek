import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  mapUrl: z.string().url().optional().nullable().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') !== 'false'; // default to active only

    const where = activeOnly ? { isActive: true } : {};

    const locations = await db.officeLocation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: locations });
  } catch (error) {
    console.error('[GET /api/locations]', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Treat empty string email as null to avoid zod email validation failure
    if (body.email === '') body.email = null;

    const data = schema.parse(body);

    const location = await db.officeLocation.create({
      data,
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('[POST /api/locations]', error);
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
}
