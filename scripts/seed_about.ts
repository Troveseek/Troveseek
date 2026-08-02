import 'dotenv/config';
import db from '../src/lib/db';

const settings = [
  // English Content - Top Tier Corporate Narrative
  { key: 'about_title', value: 'Architecting the Digital Future.' },
  { key: 'about_subtitle', value: 'A LEGACY OF EXCELLENCE' },
  { key: 'about_description', value: "In an era of unprecedented technological disruption, true market leadership requires more than adaptation—it demands evolution. At TroveSeek, we bridge the critical gap between visionary strategy and flawless execution. As trusted architects of digital transformation for forward-thinking enterprises, we converge deep industry expertise, data-driven insights, and state-of-the-art technological infrastructure. We do not merely respond to market trends; we define them. By building robust, scalable ecosystems, we empower organizations to navigate complexity, outpace the competition, and secure long-term, sustainable dominance." },
  { key: 'about_mission', value: 'To architect scalable, future-proof digital infrastructures that empower global enterprises to achieve operational excellence, drive exponential revenue growth, and sustain enduring market leadership.' },
  { key: 'about_vision', value: 'To be the premier global authority in digital transformation, continuously redefining the boundaries of technological innovation and corporate strategy.' },
  { key: 'about_cta_label', value: 'Partner With Excellence' },
  
  // English Stats (set to 0 as requested)
  { key: 'about_stat1_value', value: '0' },
  { key: 'about_stat1_label', value: 'Global Markets' },
  { key: 'about_stat2_value', value: '0' },
  { key: 'about_stat2_label', value: 'Strategic Partnerships' },
  { key: 'about_stat3_value', value: '0' },
  { key: 'about_stat3_label', value: 'Enterprise Solutions' },
  { key: 'about_stat4_value', value: '0' },
  { key: 'about_stat4_label', value: 'Innovation Awards' },

  // Arabic Content - Top Tier Corporate Narrative
  { key: 'about_title_ar', value: 'هندسة المستقبل الرقمي.' },
  { key: 'about_subtitle_ar', value: 'إرث من التميز' },
  { key: 'about_description_ar', value: 'في عصر يشهد تحولات تكنولوجية غير مسبوقة، لم تعد القيادة الحقيقية للسوق تعتمد على التكيف فحسب، بل تتطلب تطوراً مستمراً. في تروفسيك، نحن نسد الفجوة الحرجة بين الرؤية الاستراتيجية والتنفيذ الخالي من العيوب. بصفتنا مهندسين موثوقين للتحول الرقمي للمؤسسات الطموحة، نقوم بدمج الخبرة العميقة في الصناعة، والتحليلات المبنية على البيانات، والبنية التحتية التكنولوجية المتطورة. نحن لا نستجيب لمتغيرات السوق فحسب؛ بل نحن من يصنعها. من خلال بناء أنظمة بيئية قوية وقابلة للتوسع، نمكن المنظمات من تجاوز التعقيدات، والتفوق على المنافسين، وتأمين هيمنة مستدامة على المدى الطويل.' },
  { key: 'about_mission_ar', value: 'هندسة بنى تحتية رقمية قابلة للتوسع وجاهزة للمستقبل، لتمكين المؤسسات العالمية من تحقيق التميز التشغيلي، ودفع عجلة النمو المضاعف، والحفاظ على ريادة السوق بشكل مستدام.' },
  { key: 'about_vision_ar', value: 'أن نكون المرجعية العالمية الأولى في مجال التحول الرقمي، مع إعادة صياغة حدود الابتكار التكنولوجي واستراتيجيات الأعمال باستمرار.' },
  { key: 'about_cta_label_ar', value: 'شاركنا رحلة التميز' },

  // Arabic Stats
  { key: 'about_stat1_value_ar', value: '0' },
  { key: 'about_stat1_label_ar', value: 'أسواق عالمية' },
  { key: 'about_stat2_value_ar', value: '0' },
  { key: 'about_stat2_label_ar', value: 'شراكات استراتيجية' },
  { key: 'about_stat3_value_ar', value: '0' },
  { key: 'about_stat3_label_ar', value: 'حلول مؤسسية' },
  { key: 'about_stat4_value_ar', value: '0' },
  { key: 'about_stat4_label_ar', value: 'جوائز الابتكار' },
];

async function main() {
  console.log('Seeding About Page Settings (Premium Tier)...');

  for (const setting of settings) {
    await db.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value }
    });
    console.log(`Upserted setting: ${setting.key}`);
  }

  console.log('✅ About Page Settings seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
