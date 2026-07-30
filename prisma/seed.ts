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
  .then(async () => { await db.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
