import React from 'react';
import { Layers, Shield, Zap, Globe, Cpu, Headphones } from 'lucide-react';
import styles from './FeaturesGrid.module.css';
import { getLocale } from 'next-intl/server';

const features = [
  {
    icon: Layers,
    title: 'Vast Digital Inventory',
    titleAr: 'مخزون رقمي ضخم',
    description: 'Access millions of premium digital assets, templates, and 3D models curated by top global creators.',
    descriptionAr: 'الوصول إلى الملايين من الأصول الرقمية المتميزة والقوالب والنماذج ثلاثية الأبعاد برعاية أفضل المبدعين العالميين.'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    titleAr: 'أمان المؤسسات',
    description: 'Bank-grade encryption, secure transactions, and robust intellectual property protection for all your assets.',
    descriptionAr: 'تشفير بمستوى البنوك ومعاملات آمنة وحماية قوية للملكية الفكرية لجميع أصولك.'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    titleAr: 'سرعة فائقة',
    description: 'Built on edge computing architecture ensuring ultra-low latency and instant delivery worldwide.',
    descriptionAr: 'مبني على بنية الحوسبة الطرفية لضمان زمن انتقال منخفض للغاية وتسليم فوري في جميع أنحاء العالم.'
  },
  {
    icon: Globe,
    title: 'Global Ecosystem',
    titleAr: 'نظام بيئي عالمي',
    description: 'Connect with a thriving community of buyers and sellers spanning across 120+ countries.',
    descriptionAr: 'تواصل مع مجتمع مزدهر من المشترين والبائعين يمتد عبر أكثر من 120 دولة.'
  },
  {
    icon: Cpu,
    title: 'AI-Powered Insights',
    titleAr: 'رؤى مدعومة بالذكاء الاصطناعي',
    description: 'Leverage our proprietary AI engines to analyze trends, optimize pricing, and predict market demands.',
    descriptionAr: 'استفد من محركات الذكاء الاصطناعي الخاصة بنا لتحليل الاتجاهات وتحسين الأسعار وتوقع طلبات السوق.'
  },
  {
    icon: Headphones,
    title: '24/7 Expert Support',
    titleAr: 'دعم فني على مدار الساعة',
    description: 'Our dedicated team of professionals is always available to help you scale your digital business.',
    descriptionAr: 'فريقنا المتخصص من المحترفين متاح دائماً لمساعدتك في توسيع نطاق عملك الرقمي.'
  }
];

export async function FeaturesGrid() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  return (
    <section className={styles.featuresSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>{isAr ? 'لماذا TroveSeek' : 'Why TroveSeek'}</span>
          <h2 className={styles.title}>{isAr ? 'مستقبل التجارة الرقمية' : 'The Future of Digital Commerce'}</h2>
          <p className={styles.subtitle}>
            {isAr 
              ? 'كل ما تحتاجه لبيع وشراء وإدارة المنتجات الرقمية على نطاق واسع. نحن نوفر البنية التحتية لتتمكن من التركيز على الإبداع.' 
              : 'Everything you need to buy, sell, and manage digital products at scale. We provide the infrastructure so you can focus on creation.'}
          </p>
        </div>
        
        <div className={styles.grid}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className={styles.featureCard}>
                <div className={styles.iconWrapper}>
                  <Icon size={24} />
                </div>
                <h3 className={styles.featureTitle}>{isAr ? feature.titleAr : feature.title}</h3>
                <p className={styles.featureDesc}>{isAr ? feature.descriptionAr : feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
