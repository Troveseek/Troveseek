import React from 'react';
import { Layers, Shield, Zap, Globe, Cpu, Headphones } from 'lucide-react';
import styles from './FeaturesGrid.module.css';
import { getLocale } from 'next-intl/server';

const features = [
  {
    icon: Headphones,
    title: 'Elite Professional Services',
    titleAr: 'خدمات احترافية نخبوية',
    description: 'Deploy our top-tier experts for bespoke development, strategic consulting, and flawless media production tailored to your enterprise.',
    descriptionAr: 'انشر خبراءنا من الطراز الأول للتطوير المخصص، الاستشارات الاستراتيجية، والإنتاج الإعلامي المصمم خصيصاً لمؤسستك.'
  },
  {
    icon: Zap,
    title: 'Enterprise-Grade SaaS',
    titleAr: 'برمجيات كخدمة للمؤسسات',
    description: 'Access highly scalable, secure, and robust software solutions designed to automate workflows and accelerate exponential growth.',
    descriptionAr: 'احصل على حلول برمجية آمنة وقابلة للتوسع، مصممة لأتمتة سير العمل وتسريع وتيرة النمو المضاعف.'
  },
  {
    icon: Layers,
    title: 'Premium Digital Assets',
    titleAr: 'أصول رقمية متميزة',
    description: 'Leverage an exclusive marketplace of high-fidelity digital products, templates, and models curated by global industry leaders.',
    descriptionAr: 'استفد من سوق حصري يضم منتجات رقمية، قوالب، ونماذج عالية الدقة برعاية قادة الصناعة العالميين.'
  },
  {
    icon: Shield,
    title: 'Uncompromising Security',
    titleAr: 'أمان لا مساومة فيه',
    description: 'Military-grade encryption, secure intellectual property frameworks, and compliant transaction infrastructures for absolute peace of mind.',
    descriptionAr: 'تشفير بمستوى عسكري، أطر آمنة للملكية الفكرية، وبنى تحتية لمعاملات متوافقة لضمان راحة بال مطلقة.'
  },
  {
    icon: Globe,
    title: 'Global Ecosystem',
    titleAr: 'نظام بيئي عالمي',
    description: 'Seamlessly integrate into a thriving worldwide network of visionary buyers, sellers, and strategic partners spanning over 120 countries.',
    descriptionAr: 'اندمج بسلاسة في شبكة عالمية مزدهرة من المشترين والبائعين والشركاء الاستراتيجيين ذوي الرؤى عبر أكثر من 120 دولة.'
  },
  {
    icon: Cpu,
    title: 'Strategic AI Insights',
    titleAr: 'رؤى استراتيجية مدعومة بالذكاء الاصطناعي',
    description: 'Harness proprietary machine learning engines to analyze market trends, optimize service pricing, and predict industry shifts.',
    descriptionAr: 'سخّر محركات التعلم الآلي الخاصة بنا لتحليل اتجاهات السوق، تحسين تسعير الخدمات، وتوقع تحولات الصناعة.'
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
          <h2 className={styles.title}>{isAr ? 'محور التحول الرقمي' : 'The Nexus of Digital Transformation'}</h2>
          <p className={styles.subtitle}>
            {isAr 
              ? 'نظام بيئي متكامل يجمع بين المنتجات الرقمية المتميزة، حلول البرمجيات كخدمة (SaaS) القابلة للتوسع، والخدمات الاحترافية النخبوية. نحن نبني البنية التحتية لتتمكن أنت من قيادة السوق.' 
              : 'An integrated ecosystem converging premium Digital Products, scalable SaaS solutions, and elite Professional Services. We architect the infrastructure so you can command the market.'}
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
