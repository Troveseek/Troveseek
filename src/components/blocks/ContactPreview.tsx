"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LiveChatButton } from '@/components/ui/LiveChatButton';
import { Mail, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { useLocale } from 'next-intl';
import styles from './ContactPreview.module.css';

export function ContactPreview() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [contactInfo, setContactInfo] = useState({ email: 'contact@troveseek.com', phone: '+1 (555) 234-5678' });

  useEffect(() => {
    fetch('/api/settings?keys=contact_email,contact_phone')
      .then(res => res.json())
      .then(data => {
        if (data.contact_email || data.contact_phone) {
          setContactInfo({
            email: data.contact_email || 'contact@troveseek.com',
            phone: data.contact_phone || '+1 (555) 234-5678'
          });
        }
      })
      .catch(console.error);
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.card}>
          
          <div className={styles.badge}>
            <span className={styles.pulseDot} />
            {isAr ? 'استشارات فورية على مدار الساعة' : '24/7 Enterprise Inquiries'}
          </div>

          <h2 className={styles.title}>
            {isAr ? 'دعنا نبني حلول برمجية استثنائية معاً' : "Let's Build Something Extraordinary Together"}
          </h2>

          <p className={styles.description}>
            {isAr
              ? 'هل لديك مشروع في ذهنك أو ترغب في توسيع بنيتك السحابية؟ خبراؤنا مستعدون لتقديم استشارات مخصصة وحلول فائقة الأداء.'
              : 'Have a transformative project in mind or need enterprise software architecture? Our team is dedicated to accelerating your digital growth.'}
          </p>

          <div className={styles.contactGrid}>
            <a href={`mailto:${contactInfo.email}`} className={styles.contactItem}>
              <div className={`${styles.iconWrapper} ${styles.primaryIcon}`}>
                <Mail size={22} />
              </div>
              <div>
                <div className={styles.contactLabel}>{isAr ? 'البريد الإلكتروني' : 'Email Us'}</div>
                <div className={styles.contactValue}>{contactInfo.email}</div>
              </div>
            </a>

            <a href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`} className={styles.contactItem}>
              <div className={`${styles.iconWrapper} ${styles.accentIcon}`}>
                <Phone size={22} />
              </div>
              <div>
                <div className={styles.contactLabel}>{isAr ? 'الهاتف المباشر' : 'Call Directly'}</div>
                <div className={styles.contactValue}>{contactInfo.phone}</div>
              </div>
            </a>
          </div>

          <div className={styles.ctaGroup}>
            <Link href="/contact" className={styles.primaryBtn}>
              <span>{isAr ? 'بدء مشروع جديد' : 'Start a Project'}</span>
              <ArrowRight size={18} style={{ transform: isAr ? 'rotate(180deg)' : 'none' }} />
            </Link>
            <LiveChatButton />
          </div>

        </div>
      </div>
    </section>
  );
}
