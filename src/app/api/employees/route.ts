import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { hashPassword } from '@/lib/auth/password';

// GET /api/employees - List all employees/managers
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user as any).role;
  // Only Super Admin and Admin can view employee roster
  if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const department = searchParams.get('department');
  const employeeRole = searchParams.get('role');

  const STAFF_ROLES = [
    'CONTENT_EDITOR', 'SUPPORT', 'MARKETING',
    'FINANCE', 'SALES_MANAGER', 'ADMIN', 'SUPER_ADMIN',
    'CUSTOM', 'EMPLOYEE'
  ];

  const where: any = {
    role: { in: STAFF_ROLES },
  };
  if (department) where.department = department;
  if (employeeRole) where.role = employeeRole;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const employees = await db.user.findMany({
    where,
    select: {
      id: true, name: true, email: true, role: true,
      department: true, isActive: true, image: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ data: employees });
}

// POST /api/employees - Create a new employee account (Super Admin only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user as any).role;
  if (role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Only Super Admins can create employee accounts' }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, password, employeeRole, department } = body;

  if (!name || !email || !password || !employeeRole) {
    return NextResponse.json({
      error: 'Missing required fields: name, email, password, employeeRole',
    }, { status: 400 });
  }

  // Check for duplicate email
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const employee = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: employeeRole,
      department: department ?? null,
      isActive: true,
      emailVerified: new Date(),
    },
    select: {
      id: true, name: true, email: true,
      role: true, department: true, isActive: true, createdAt: true,
    },
  });

  // Write to audit log
  await db.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'CREATE_EMPLOYEE',
      resource: 'User',
      resourceId: employee.id,
      details: JSON.stringify({ name, email, role: employeeRole, department }),
      ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
    },
  });

  return NextResponse.json({ data: employee }, { status: 201 });
}
