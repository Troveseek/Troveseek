import db from '../src/lib/db';

async function main() {
  console.log('Seeding Arabic data for About Page...');

  const settingsToSeed = [
    { key: 'about_title_ar', value: 'متخصصون في العقارات الصناعية' },
    { key: 'about_subtitle_ar', value: 'من نحن' },
    { key: 'about_description_ar', value: 'بناءً على عقود من الخبرة في العقارات الصناعية، نحن ملتزمون بتزويد العملاء بحلول عقارية تلبي احتياجاتهم التشغيلية.' },
    { key: 'about_mission_ar', value: 'مهمتنا هي توفير أفضل الحلول التكنولوجية لعملائنا لمساعدتهم في النمو والازدهار في بيئة تنافسية.' },
    { key: 'about_vision_ar', value: 'رؤيتنا هي أن نكون الشريك الرائد في تقديم البرمجيات المبتكرة والخدمات الرقمية المتكاملة.' },
    { key: 'about_cta_label_ar', value: 'تواصل معنا الآن' },
    { key: 'about_stat1_label_ar', value: 'دولة مدعومة' },
    { key: 'about_stat2_label_ar', value: 'منتج رقمي' },
    { key: 'about_stat3_label_ar', value: 'حلول سحابية' },
    { key: 'about_stat4_label_ar', value: 'جاهزية النظام' },
  ];

  for (const setting of settingsToSeed) {
    const existing = await db.siteSetting.findUnique({ where: { key: setting.key } });
    if (existing) {
      await db.siteSetting.update({
        where: { key: setting.key },
        data: { value: setting.value }
      });
    } else {
      await db.siteSetting.create({
        data: { key: setting.key, value: setting.value }
      });
    }
  }

  console.log('About Page seeded.');
}

main().catch(console.error).finally(() => process.exit(0));
