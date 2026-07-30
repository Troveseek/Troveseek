/**
 * TroveSeek Enterprise - Database Seeder
 * 
 * Empty for clean initialization.
 */

import db from '../src/lib/db';

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
