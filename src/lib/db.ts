import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

function createPrismaClient() {
  const envUrl = process.env.DATABASE_URL;
  const dbUrl = (!envUrl || envUrl === 'undefined') ? 'file:./dev.db' : envUrl;

  let adapter: any;
  if (dbUrl.startsWith('postgres') || dbUrl.startsWith('postgresql')) {
    const pool = new Pool({ connectionString: dbUrl });
    adapter = new PrismaPg(pool);
  } else {
    adapter = new PrismaLibSql({ url: dbUrl });
  }
  
  return new PrismaClient({ adapter } as any);
}

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | PrismaClient;
}

const db = globalThis.prismaGlobal ?? createPrismaClient();

export default db;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db;
