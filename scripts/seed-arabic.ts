import db from '../src/lib/db';

async function main() {
  console.log('Seeding Arabic data into existing records...');

  // 1. Product: "test product" (the one found is "test product", not "test produt" as typed by user)
  const product = await db.product.findFirst({ where: { name: { contains: 'test product' } } });
  if (product) {
    await db.product.update({
      where: { id: product.id },
      data: {
        nameAr: 'منتج تجريبي',
        descriptionAr: 'هذا منتج تجريبي مخصص لاختبار النظام وتقديم لمحة عن كيفية عمله.',
        fullDescriptionAr: 'هذا الوصف الكامل للمنتج التجريبي، ويحتوي على كافة التفاصيل والمميزات التي يقدمها المنتج للعملاء في بيئة تجريبية.',
        featuresAr: JSON.stringify(['ميزة 1', 'ميزة 2']),
        specificationsAr: JSON.stringify([{name: 'الوزن', value: '1 كجم'}]),
      }
    });
    console.log('Product seeded.');
  }

  // 2. SaaS: "test saas"
  const saas = await db.saaS.findFirst({ where: { name: { contains: 'test saas' } } });
  if (saas) {
    await db.saaS.update({
      where: { id: saas.id },
      data: {
        nameAr: 'برنامج ساس تجريبي',
        descriptionAr: 'برنامج خدمي سحابي متطور لتسهيل إدارة الأعمال وتحسين الإنتاجية.',
        taglineAr: 'حلول سحابية لشركتك',
        featuresAr: JSON.stringify(['إدارة المستخدمين', 'تقارير متقدمة']),
        plansAr: JSON.stringify([]),
      }
    });
    console.log('SaaS seeded.');
  }

  // 3. Service: "test service"
  const service = await db.service.findFirst({ where: { name: { contains: 'test service' } } });
  if (service) {
    await db.service.update({
      where: { id: service.id },
      data: {
        nameAr: 'خدمة تجريبية',
        descriptionAr: 'نقدم خدمات مخصصة تلبي احتياجات عملك بدقة واحترافية عالية.',
        taglineAr: 'نحن هنا لخدمتك',
        processAr: JSON.stringify(['التخطيط', 'التنفيذ', 'التسليم']),
      }
    });
    console.log('Service seeded.');
  }

  // 4. Category: "test-Category"
  const category = await db.category.findFirst({ where: { name: { contains: 'test-Category' } } });
  if (category) {
    await db.category.update({
      where: { id: category.id },
      data: {
        nameAr: 'فئة تجريبية',
        descriptionAr: 'تصنيف يضم جميع المنتجات والخدمات التجريبية ضمن النظام.',
      }
    });
    console.log('Category seeded.');
  }

  // 5. Blogs: "test post" and "post tilte"
  const blog1 = await db.blogPost.findFirst({ where: { title: { contains: 'test post' } } });
  if (blog1) {
    await db.blogPost.update({
      where: { id: blog1.id },
      data: {
        titleAr: 'مقال تجريبي',
        excerptAr: 'مقتطف سريع من المقال التجريبي لإظهار التصميم.',
        contentAr: 'محتوى المقال التجريبي الكامل، حيث يمكن سرد الأفكار ومناقشة المواضيع بأسلوب شيق وجذاب للقراء.',
      }
    });
    console.log('Blog 1 seeded.');
  }

  const blog2 = await db.blogPost.findFirst({ where: { title: { contains: 'post tilte' } } });
  if (blog2) {
    await db.blogPost.update({
      where: { id: blog2.id },
      data: {
        titleAr: 'عنوان المقال',
        excerptAr: 'نبذة عن المقال الثاني.',
        contentAr: 'النص الكامل للمقال الثاني.',
      }
    });
    console.log('Blog 2 seeded.');
  }

  // 6. Team: "djaber"
  const team = await db.teamMember.findFirst({ where: { name: { contains: 'djaber' } } });
  if (team) {
    await db.teamMember.update({
      where: { id: team.id },
      data: {
        nameAr: 'جابر',
        roleAr: 'مسؤول النظام',
        bioAr: 'مطور خبير بشغف نحو بناء أنظمة قوية وموثوقة.',
      }
    });
    console.log('Team seeded.');
  }

  // 7. Testimonials
  const testimonials = await db.testimonial.findMany();
  for (const testimonial of testimonials) {
    await db.testimonial.update({
      where: { id: testimonial.id },
      data: {
        nameAr: testimonial.name + ' (بالعربية)',
        quoteAr: 'تجربة رائعة جداً، لقد ساعدنا هذا النظام على تحقيق أهدافنا بشكل أسرع وأكثر كفاءة.',
        roleAr: 'عميل سعيد',
      }
    });
  }
  console.log('Testimonials seeded.');

  // 8. Gallery
  const gallery = await db.galleryImage.findMany();
  for (const img of gallery) {
    await db.galleryImage.update({
      where: { id: img.id },
      data: {
        titleAr: img.title ? img.title + ' (صورة)' : 'صورة تجريبية',
        captionAr: 'تفاصيل الصورة ووصفها باللغة العربية.',
      }
    });
  }
  console.log('Gallery seeded.');

  // 9. Page Heroes (Announcements)
  const heroes = await db.pageHero.findMany();
  for (const hero of heroes) {
    await db.pageHero.update({
      where: { id: hero.id },
      data: {
        titleAr: hero.title ? hero.title + ' (عنوان رئيسي)' : 'مرحباً بك',
        subtitleAr: 'رسالة الترحيب الخاصة بالصفحة مع وصف موجز لما تقدمه.',
      }
    });
  }
  console.log('Heroes seeded.');

  // 10. About Page Content (Assuming it's in SiteSetting)
  const aboutSetting = await db.siteSetting.findFirst({ where: { key: 'about_page' } });
  if (aboutSetting) {
    // If it's a JSON string, modify it. If it doesn't exist, maybe it's not a SiteSetting.
    // I will skip SiteSettings for now unless I know the exact structure.
  }

  console.log('All done!');
}

main().catch(console.error).finally(() => process.exit(0));
