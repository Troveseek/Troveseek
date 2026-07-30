import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

const BACKUP_DIR = path.join(process.cwd(), 'backups');

export async function GET(req: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const STAFF_ROLES = ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SALES_MANAGER'];

  if (!session || !STAFF_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get('file');

  if (!fileName || typeof fileName !== 'string' || fileName.includes('..') || fileName.includes('/')) {
    return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
  }

  const filePath = path.join(BACKUP_DIR, fileName);

  try {
    const stat = await fs.stat(filePath);
    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': stat.size.toString(),
      },
    });
  } catch (error) {
    console.error('File download error:', error);
    return NextResponse.json({ error: 'File not found or access denied' }, { status: 404 });
  }
}
