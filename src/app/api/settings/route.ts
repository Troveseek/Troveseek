import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

// GET /api/settings?keys=about_title,about_stats  OR  /api/settings (all)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keys = searchParams.get('keys')?.split(',').filter(Boolean);
  const settings = await db.siteSetting.findMany(keys?.length ? { where: { key: { in: keys } } } : undefined);
  // Return as plain object { key: value }
  const result: Record<string, string> = {};
  for (const s of settings) result[s.key] = s.value;
  return NextResponse.json(result);
}

// POST /api/settings — body: { key: string, value: string }[] OR { key, value }
export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const entries: { key: string; value: string }[] = Array.isArray(body) ? body : [body];
  for (const { key, value } of entries) {
    await db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true });
}
