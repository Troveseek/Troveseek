import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

// GET /api/team - public
export async function GET() {
  try {
    const members = await db.teamMember.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
    return NextResponse.json({ data: members });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}

// GET /api/team?all=true - admin only, returns all including inactive
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { name, nameAr, role: memberRole, roleAr, bio, bioAr, imageUrl, email, website, linkedIn, displayOrder, isActive } = body;
    if (!name || !memberRole) return NextResponse.json({ error: 'Name and role are required.' }, { status: 400 });
    const member = await db.teamMember.create({
      data: { name, nameAr: nameAr || null, role: memberRole, roleAr: roleAr || null, bio, bioAr: bioAr || null, imageUrl, email, website, linkedIn, displayOrder: displayOrder ?? 0, isActive: isActive ?? true },
    });
    return NextResponse.json(member, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
