import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

// GET /api/page-heroes?page=SAAS  OR all
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page');
  const heroes = await db.pageHero.findMany({
    where: page ? { page, isActive: true } : undefined,
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ data: heroes });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { page, label, labelAr, title, titleAr, subtitle, subtitleAr, buttons, isActive } = body;
  if (!page || !title) return NextResponse.json({ error: 'Page and title are required.' }, { status: 400 });
  const hero = await db.pageHero.create({
    data: {
      page,
      label: label || null,
      labelAr: labelAr || null,
      title,
      titleAr: titleAr || null,
      subtitle: subtitle || null,
      subtitleAr: subtitleAr || null,
      buttons: JSON.stringify(buttons ?? []),
      isActive: isActive ?? true,
    },
  });
  return NextResponse.json(hero, { status: 201 });
}
