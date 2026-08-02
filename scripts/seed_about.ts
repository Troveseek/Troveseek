import 'dotenv/config';
import db from '../src/lib/db';

const settings = [
  // English Content
  { key: 'about_title', value: 'Transforming Ideas into Digital Masterpieces.' },
  { key: 'about_subtitle', value: 'THE TROVESEEK STORY' },
  { key: 'about_description', value: "Every great brand has a story, and ours began with a simple belief: businesses shouldn't have to navigate the digital world alone. We are more than just an agency; we are your strategic partner in growth. By blending cutting-edge technology with human-centric design and behavioral psychology, we turn complex challenges into elegant digital solutions that captivate audiences and drive real revenue. Welcome to TroveSeek, where your digital legacy begins." },
  { key: 'about_mission', value: 'To empower visionary brands by engineering digital experiences that forge unbreakable connections, drive exponential growth, and redefine industry standards.' },
  { key: 'about_vision', value: 'To be the global catalyst for digital innovation, where creativity meets technology to shape the future of business.' },
  { key: 'about_cta_label', value: 'Discover Our Journey' },
  
  // English Stats (set to 0 as requested)
  { key: 'about_stat1_value', value: '0' },
  { key: 'about_stat1_label', value: 'Projects Launched' },
  { key: 'about_stat2_value', value: '0' },
  { key: 'about_stat2_label', value: 'Happy Clients' },
  { key: 'about_stat3_value', value: '0' },
  { key: 'about_stat3_label', value: 'Awards Won' },
  { key: 'about_stat4_value', value: '0' },
  { key: 'about_stat4_label', value: 'Global Partners' },

  // Arabic Content
  { key: 'about_title_ar', value: 'نحوّل أفكارك إلى تحف رقمية خالدة.' },
  { key: 'about_subtitle_ar', value: 'قصة تروفسيك' },
  { key: 'about_description_ar', value: 'لكل علامة تجارية عظيمة قصة، وقصتنا بدأت بإيمان بسيط: أن الشركات لا ينبغي أن تواجه العالم الرقمي بمفردها. نحن لسنا مجرد وكالة؛ نحن شريكك الاستراتيجي في رحلة النمو. من خلال دمج أحدث التقنيات مع التصميم الذي يركز على الإنسان وعلم النفس السلوكي، نحوّل التحديات المعقدة إلى حلول رقمية أنيقة تأسر الجماهير وتحقق إيرادات حقيقية. مرحبًا بك في تروفسيك، حيث يبدأ إرثك الرقمي.' },
  { key: 'about_mission_ar', value: 'تمكين العلامات التجارية الطموحة من خلال هندسة تجارب رقمية تبني روابط قوية، تدفع عجلة النمو المضاعف، وتعيد صياغة معايير الصناعة.' },
  { key: 'about_vision_ar', value: 'أن نكون المحفز العالمي للابتكار الرقمي، حيث يلتقي الإبداع بالتكنولوجيا لتشكيل مستقبل الأعمال.' },
  { key: 'about_cta_label_ar', value: 'اكتشف رحلتنا' },

  // Arabic Stats
  { key: 'about_stat1_value_ar', value: '0' },
  { key: 'about_stat1_label_ar', value: 'مشاريع تم إطلاقها' },
  { key: 'about_stat2_value_ar', value: '0' },
  { key: 'about_stat2_label_ar', value: 'عملاء سعداء' },
  { key: 'about_stat3_value_ar', value: '0' },
  { key: 'about_stat3_label_ar', value: 'جوائز حصدناها' },
  { key: 'about_stat4_value_ar', value: '0' },
  { key: 'about_stat4_label_ar', value: 'شركاء عالميون' },
];

async function main() {
  console.log('Seeding About Page Settings...');

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
