import db from '../src/lib/db';

async function main() {
  console.log('Seeding Gallery and Heroes with Arabic translations...');

  // 1. Seed Gallery Image
  await db.galleryImage.create({
    data: {
      title: 'Our Modern Workspace',
      titleAr: 'مساحة العمل الحديثة لدينا',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
      caption: 'A glimpse into our collaborative and innovative environment.',
      captionAr: 'لمحة عن بيئة عملنا التعاونية والمبتكرة.',
      displayOrder: 1,
      isActive: true,
    }
  });
  console.log('Gallery seeded.');

  // 2. Seed Announcements / Page Heroes for the SAAS page specifically
  await db.pageHero.create({
    data: {
      page: 'SAAS',
      label: 'SaaS Catalog',
      labelAr: 'كتالوج SaaS',
      title: 'Enterprise Software, Simplified',
      titleAr: 'برمجيات المؤسسات، مبسطة',
      subtitle: 'Discover SaaS solutions for every business need.',
      subtitleAr: 'اكتشف حلول SaaS لكل احتياجات الأعمال.',
      buttons: JSON.stringify([{ label: 'Browse Solutions', url: '/saas', variant: 'primary', isActive: true }]),
      buttonsAr: JSON.stringify([{ label: 'تصفح الحلول', url: '/saas', variant: 'primary', isActive: true }]),
      isActive: true,
    }
  });
  console.log('Heroes seeded.');
}

main().catch(console.error).finally(() => process.exit(0));
