const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const path = require('path');

const dbUrl = process.env.DATABASE_URL ?? `file:${path.join(__dirname, 'dev.db')}`;
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany();
  
  if (users.length === 0) {
    console.log("❌ No users found in the database. Please go to /register and create an account first.");
    process.exit(1);
  }

  const userToPromote = users[0]; // Promotes the first registered user
  
  await prisma.user.update({
    where: { id: userToPromote.id },
    data: { role: 'SUPER_ADMIN' }
  });

  console.log(`✅ Successfully promoted user ${userToPromote.email} to SUPER_ADMIN!`);
  console.log("You can now log in to the admin dashboard.");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
