import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';
import db from '@/lib/db';

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const DB_PATH = path.join(process.cwd(), 'dev.db');

export async function GET() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const STAFF_ROLES = ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SALES_MANAGER'];

  if (!session || !STAFF_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const files = await fs.readdir(BACKUP_DIR);
    
    const backups = await Promise.all(
      files.filter(f => f.endsWith('.db') || f.endsWith('.zip')).map(async (file) => {
        const stats = await fs.stat(path.join(BACKUP_DIR, file));
        return {
          name: file,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      })
    );

    // Sort newest first
    backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json(backups);
  } catch (error: any) {
    console.error('Failed to list backups', error);
    return NextResponse.json({ error: 'Failed to list backups' }, { status: 500 });
  }
}

export async function POST() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const STAFF_ROLES = ['SUPER_ADMIN', 'ADMIN'];

  if (!session || !STAFF_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `db-backup-${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    // Perform copy
    await fs.copyFile(DB_PATH, backupPath);

    // Cleanup old backups based on retention policy
    const settings = await db.siteSetting.findMany({ where: { key: 'backup_retention_days' } });
    const retentionDays = parseInt(settings[0]?.value || '30', 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const files = await fs.readdir(BACKUP_DIR);
    for (const file of files) {
      if (file.endsWith('.db')) {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = await fs.stat(filePath);
        if (stats.birthtime < cutoffDate) {
          await fs.unlink(filePath);
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Backup created successfully', file: backupName });
  } catch (error: any) {
    console.error('Backup failed', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}
