import React from 'react';
import { Layers, Shield, Zap, Globe, Cpu, Headphones, CheckCircle, Package, Users, Lock, LifeBuoy } from 'lucide-react';
import styles from './FeaturesGrid.module.css';
import { getLocale } from 'next-intl/server';

const features = [
  {
    icon: Globe,
    title: 'All-in-One Digital Hub',
    titleAr: 'مركز رقمي شامل',
    description: 'Instead of juggling multiple agencies and platforms, get your software, digital assets, and professional services under one roof.',
    descriptionAr: 'بدلاً من التعامل مع وكالات ومنصات متعددة، احصل على برمجياتك، أصولك الرقمية، وخدماتك الاحترافية تحت سقف واحد.'
  },
  {
    icon: Zap,
    title: 'Ready-to-Use Solutions',
    titleAr: 'حلول جاهزة للاستخدام',
    description: 'Save months of development time. Instantly access our SaaS tools and premium digital products to launch faster.',
    descriptionAr: 'وفر أشهراً من وقت التطوير. احصل فوراً على أدواتنا البرمجية ومنتجاتنا الرقمية المتميزة لتنطلق بشكل أسرع.'
  },
  {
    icon: Users,
    title: 'Verified Industry Experts',
    titleAr: 'خبراء معتمدون',
    description: 'Our professional services are delivered by vetted, experienced specialists who understand how to drive real business growth.',
    descriptionAr: 'نقدم خدماتنا الاحترافية عبر متخصصين ذوي خبرة وكفاءة عالية يفهمون كيفية تحقيق نمو حقيقي للأعمال.'
  },
  {
    icon: CheckCircle,
    title: 'Transparent Pricing',
    titleAr: 'تسعير شفاف',
    description: 'No hidden fees, no surprises. We offer clear, straightforward pricing for all our services, software, and digital products.',
    descriptionAr: 'لا رسوم خفية، ولا مفاجآت. نقدم أسعاراً واضحة ومباشرة لجميع خدماتنا وبرمجياتنا ومنتجاتنا الرقمية.'
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    titleAr: 'آمن وموثوق',
    description: 'Your payments, data, and intellectual property are protected by industry-leading security and encryption standards.',
    descriptionAr: 'تتم حماية مدفوعاتك، بياناتك، وملكيتك الفكرية بأعلى معايير الأمان والتشفير في الصناعة.'
  },
  {
    icon: LifeBuoy,
    title: 'Dedicated Support',
    titleAr: 'دعم فني مخصص',
    description: "We don't just deliver and disappear. Our team provides ongoing, reliable support to ensure your long-term success.",
    descriptionAr: 'نحن لا نسلم العمل ونختفي. فريقنا يقدم دعماً مستمراً وموثوقاً لضمان نجاحك على المدى الطويل.'
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
          <h2 className={styles.title}>{isAr ? 'لماذا تختار تروفسيك' : 'Why Choose TroveSeek'}</h2>
          <p className={styles.subtitle}>
            {isAr 
              ? 'كل ما يحتاجه عملك للنمو، في مكان واحد وبأعلى معايير الجودة والاحترافية.' 
              : 'Everything your business needs to grow, in one place, delivered with uncompromising quality.'}
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
