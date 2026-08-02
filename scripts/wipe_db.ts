import db from './src/lib/db';
import bcrypt from 'bcryptjs';

const prisma = db;

async function main() {
  console.log('Wiping database...');
  
  // Dependency order:
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  
  await prisma.orderItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.order.deleteMany();
  
  await prisma.servicePayment.deleteMany();
  await prisma.techSpec.deleteMany();
  
  await prisma.subscription.deleteMany();
  await prisma.review.deleteMany();
  
  await prisma.product.deleteMany();
  await prisma.saaS.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  
  await prisma.blogPost.deleteMany();
  await prisma.galleryImage.deleteMany();
  await prisma.testimonial.deleteMany();
  
  await prisma.officeLocation.deleteMany();
  await prisma.country.deleteMany();
  
  await prisma.teamMember.deleteMany();
  await prisma.pageHero.deleteMany();
  await prisma.siteSetting.deleteMany();
  
  await prisma.coupon.deleteMany();
  await prisma.campaign.deleteMany();
  
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  
  await prisma.user.deleteMany();

  console.log('Database wiped completely.');
  console.log('Creating new admin...');
  
  const hash = await bcrypt.hash('HadaHowaPassTa3Comp123!@#', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'djaber.bouketir@troveseek.com',
      name: 'Djaber Bouketir',
      passwordHash: hash,
      role: 'SUPER_ADMIN',
      isActive: true,
      notifyEmailOrders: true,
      notifyMarketing: true,
      notifySecurity: true
    }
  });

  console.log(`Successfully created admin: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
