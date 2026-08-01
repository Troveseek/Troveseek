import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

function createPrismaClient() {
  const envUrl = process.env.DATABASE_URL;
  const dbUrl = (!envUrl || envUrl === 'undefined') ? 'postgresql://postgres:postgres@localhost:5432/postgres' : envUrl;

  const pool = new Pool({
    connectionString: dbUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.warn('[PostgreSQL Pool Warning]', err.message);
  });

  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter } as any);
}

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | PrismaClient;
}

const db = globalThis.prismaGlobal ?? createPrismaClient();

export default db;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db;
