const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});
prisma.siteSetting.findMany().then(res => {
  console.log('OK site settings:', res.length);
  process.exit(0);
}).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
