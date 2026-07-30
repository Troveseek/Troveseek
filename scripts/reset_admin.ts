import db from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  let admin = await db.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });
  if (admin) {
    await db.user.update({
      where: { id: admin.id },
      data: { passwordHash: hash }
    });
    console.log(`Admin email: ${admin.email}`);
    console.log(`Admin password: admin123`);
  } else {
    admin = await db.user.create({
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

main().catch(console.error).finally(() => db.$disconnect());
