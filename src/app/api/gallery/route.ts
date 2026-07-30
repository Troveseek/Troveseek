import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(role)) return null;
  return session;
}

export async function GET() {
  const images = await db.galleryImage.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
  return NextResponse.json({ data: images });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { title, titleAr, imageUrl, caption, captionAr, displayOrder, isActive } = body;
  if (!imageUrl) return NextResponse.json({ error: 'Image URL is required.' }, { status: 400 });
  const image = await db.galleryImage.create({
    data: { title, titleAr, imageUrl, caption, captionAr, displayOrder: displayOrder ?? 0, isActive: isActive ?? true },
  });
  return NextResponse.json(image, { status: 201 });
}
