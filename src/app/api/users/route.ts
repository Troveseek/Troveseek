import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/users - Fetch registered clients/users
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user as any).role;
  if (!['SUPER_ADMIN', 'ADMIN', 'SUPPORT'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '20');

  const where: any = {
    role: { in: ['GUEST', 'CLIENT'] },
  };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, image: true,
        isActive: true, emailVerified: true, createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({
    data: users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// PATCH /api/users - Update user status (activate/deactivate)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user as any).role;
  if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id, isActive } = await req.json();
  if (!id || isActive === undefined) {
    return NextResponse.json({ error: 'Missing required fields: id, isActive' }, { status: 400 });
  }

  const user = await db.user.update({
    where: { id },
    data: { isActive },
    select: { id: true, name: true, email: true, isActive: true },
  });

  await db.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      resource: 'User',
      resourceId: id,
      details: JSON.stringify({ isActive }),
      ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
    },
  });

  return NextResponse.json({ data: user });
}
