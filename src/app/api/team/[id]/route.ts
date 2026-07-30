import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(role)) return null;
  return session;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { name, nameAr, role: memberRole, roleAr, bio, bioAr, imageUrl, email, website, linkedIn, displayOrder, isActive } = body;
  if (!name || !memberRole) return NextResponse.json({ error: 'Name and role are required.' }, { status: 400 });
  const member = await db.teamMember.update({ where: { id }, data: { name, nameAr: nameAr || null, role: memberRole, roleAr: roleAr || null, bio, bioAr: bioAr || null, imageUrl, email, website, linkedIn, displayOrder: displayOrder ?? 0, isActive: isActive ?? true } });
  return NextResponse.json(member);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await db.teamMember.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
