import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbUrl = process.env.DATABASE_URL ?? `file:${path.join(__dirname, '../dev.db')}`;
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  let admin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });
  if (admin) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { passwordHash: hash }
    });
    console.log(`Admin email: ${admin.email}`);
    console.log(`Admin password: admin123`);
  } else {
    admin = await prisma.user.create({
      data: {
        email: 'admin@troveseek.com',
        name: 'Admin',
        passwordHash: hash,
        role: 'SUPER_ADMIN',
        isActive: true
      }
    });
    console.log(`Admin email: ${admin.email}`);
    console.log(`Admin password: admin123`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
