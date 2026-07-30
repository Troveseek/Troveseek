"use client";

import React from 'react';
import Button from '@/components/ui/Button';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import { useLocale } from 'next-intl';

// Dynamically import the map component with SSR disabled
const MapComponent = dynamic(() => import('@/components/ui/MapComponent'), { ssr: false });

export default function ContactPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <div className={styles.contactPage}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroEyebrow}>{isAr ? 'ابق على تواصل' : 'Get in Touch'}</div>
        <h1 className={styles.heroTitle}>{isAr ? 'دعنا نبني شيئاً رائعاً معاً' : "Let's Build Something Amazing Together"}</h1>
        <p className={styles.heroSubtitle}>
          {isAr ? 'سواء كان لديك سؤال حول منتجاتنا، أو تحتاج إلى حل SaaS مخصص، أو ترغب في استكشاف خدماتنا — فريقنا مستعد للمساعدة خلال 24 ساعة.' : 'Whether you have a question about our products, need a custom SaaS solution, or want to explore our services — our team is ready to help within 24 hours.'}
        </p>
      </div>

      <div className={styles.mainLayout}>
        {/* Form */}
        <div className={styles.formColumn}>
          <div className={styles.formHeading}>{isAr ? 'أرسل لنا رسالة' : 'Send us a Message'}</div>
          <p className={styles.formSubheading}>{isAr ? 'املأ النموذج أدناه وسنرد عليك خلال 24 ساعة.' : "Fill out the form below and we'll get back to you within 24 hours."}</p>

          <form>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{isAr ? 'الاسم الكامل' : 'Full Name'}</label>
                <input type="text" className={styles.formInput} placeholder={isAr ? 'جون دو' : 'John Doe'} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
                <input type="email" className={styles.formInput} placeholder="john@example.com" />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{isAr ? 'الشركة (اختياري)' : 'Company (Optional)'}</label>
              <input type="text" className={styles.formInput} placeholder={isAr ? 'شركتك' : 'Your Company Inc.'} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{isAr ? 'الموضوع' : 'Subject'}</label>
              <select className={styles.formSelect}>
                <option>{isAr ? 'استفسار عام' : 'General Inquiry'}</option>
                <option>{isAr ? 'المبيعات والأسعار' : 'Sales & Pricing'}</option>
                <option>{isAr ? 'الدعم الفني' : 'Technical Support'}</option>
                <option>{isAr ? 'شراكة' : 'Partnership'}</option>
                <option>{isAr ? 'أخرى' : 'Other'}</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{isAr ? 'الرسالة' : 'Message'}</label>
              <textarea className={styles.formTextarea} placeholder={isAr ? 'أخبرنا كيف يمكننا مساعدتك...' : 'Tell us how we can help you...'} />
            </div>

            <Button size="lg" variant="primary" style={{ width: '100%' }} icon={<Send size={17} />}>
              {isAr ? 'إرسال الرسالة' : 'Send Message'}
            </Button>
          </form>
        </div>

        {/* Info Column */}
        <div className={styles.infoColumn}>
          <div className={styles.infoCard}>
            <div className={styles.infoCardTitle}>{isAr ? 'تواصل مباشر' : 'Direct Contact'}</div>

            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}><Mail size={22} /></div>
              <div>
                <div className={styles.contactLabel}>{isAr ? 'البريد الإلكتروني' : 'Email'}</div>
                <div className={styles.contactValue}>hello@troveseek.com</div>
              </div>
            </div>

            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}><Phone size={22} /></div>
              <div>
                <div className={styles.contactLabel}>{isAr ? 'الهاتف' : 'Phone'}</div>
                <div className={styles.contactValue}>+1 (555) 123-4567</div>
              </div>
            </div>

            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}><MapPin size={22} /></div>
              <div>
                <div className={styles.contactLabel}>{isAr ? 'المقر العالمي' : 'Global Headquarters'}</div>
                <div className={styles.contactValue}>123 Innovation Drive, Tech City, TC 90210</div>
              </div>
            </div>
          </div>

          <div className={styles.mapContainer}>
            <MapComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
