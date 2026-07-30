import db from './src/lib/db';
import { hashPassword } from './src/lib/auth/password';

async function createSuperAdmin() {
  const email = 'admin@troveseek.com';
  const password = 'Admin@TroveSeek#2024!';
  
  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      console.log('Superadmin already exists. Updating password...');
      const passwordHash = await hashPassword(password);
      await db.user.update({
        where: { email },
        data: {
          passwordHash,
          role: 'SUPER_ADMIN',
          isActive: true
        }
      });
      console.log('Superadmin updated successfully!');
    } else {
      console.log('Creating superadmin...');
      const passwordHash = await hashPassword(password);
      await db.user.create({
        data: {
          name: 'Super Admin',
          email,
          passwordHash,
          role: 'SUPER_ADMIN',
          isActive: true
        }
      });
      console.log('Superadmin created successfully!');
    }
  } catch (err) {
    console.error('Failed to create superadmin:', err);
  } finally {
    process.exit(0);
  }
}

createSuperAdmin();
