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
  const { page, label, labelAr, title, titleAr, subtitle, subtitleAr, buttons, isActive } = body;
  if (!page || !title) return NextResponse.json({ error: 'Page and title are required.' }, { status: 400 });
  const hero = await db.pageHero.update({
    where: { id },
    data: { page, label, labelAr, title, titleAr, subtitle, subtitleAr, buttons: JSON.stringify(buttons ?? []), isActive: isActive ?? true },
  });
  return NextResponse.json(hero);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await db.pageHero.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
