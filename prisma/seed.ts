/**
 * TroveSeek Enterprise - Database Seeder
 * 
 * Empty for clean initialization.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';

const dbUrl = process.env.DATABASE_URL ?? `file:${path.join(__dirname, 'dev.db')}`;
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🌱 Database is intentionally left completely empty.');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
