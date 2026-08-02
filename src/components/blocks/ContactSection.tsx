"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './ContactSection.module.css';
import { useLocale } from 'next-intl';

// Dynamically import the Leaflet Map component with SSR disabled
const MapComponent = dynamic(() => import('@/components/ui/MapComponent'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '300px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--clr-surface-2)',
      borderRadius: 'var(--radius-lg, 18px)',
      color: 'var(--clr-text-muted)',
      fontSize: '13px'
    }}>
      Loading Map...
    </div>
  )
});

export function ContactSection() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [contactInfo, setContactInfo] = useState({
    email: 'contact@troveseek.com',
    phone: '+1 (555) 123-4567',
    address: '123 Innovation Drive, Tech City, TC 90210',
    mapUrl: ''
  });
  
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/settings?keys=contact_email,contact_phone,contact_address,contact_map_url')
      .then(res => res.json())
      .then(data => {
        if (data && (data.contact_email || data.contact_phone || data.contact_address)) {
          setContactInfo({
            email: data.contact_email || 'contact@troveseek.com',
            phone: data.contact_phone || '+1 (555) 123-4567',
            address: data.contact_address || '123 Innovation Drive, Tech City, TC 90210',
            mapUrl: data.contact_map_url || ''
          });
        }
      })
      .catch(console.error);
      
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setLocations(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <section className={styles.section} id="contact-section">
      <div className={styles.container}>
        {/* Section Heading */}
        <div className={styles.hero}>
          <div className={styles.heroEyebrow}>{isAr ? 'تواصل معنا' : 'Get in Touch'}</div>
          <h2 className={styles.heroTitle}>{isAr ? 'دعنا نبني شيئاً رائعاً معاً' : "Let's Build Something Amazing Together"}</h2>
          <p className={styles.heroSubtitle}>
            {isAr ? 'سواء كان لديك استفسار حول منتجاتنا، أو تحتاج إلى حل SaaS مخصص، أو ترغب في استكشاف خدماتنا — فريقنا مستعد للمساعدة.' : 'Whether you have questions about our digital products, custom SaaS solutions, or enterprise services — our team is ready to help.'}
          </p>
        </div>

        <div className={styles.mainLayout}>
          {/* Form Column */}
          <div className={styles.formColumn}>
            <h3 className={styles.formHeading}>{isAr ? 'أرسل لنا رسالة' : 'Send us a Message'}</h3>
            <p className={styles.formSubheading}>{isAr ? 'املأ النموذج أدناه وسنرد عليك في أقرب وقت ممكن.' : "Fill out the form below and we'll get back to you shortly."}</p>

            {submitted ? (
              <div style={{
                background: 'rgba(0, 229, 176, 0.1)',
                border: '1px solid rgba(0, 229, 176, 0.3)',
                borderRadius: 'var(--radius-md, 12px)',
                padding: '24px',
                textAlign: 'center',
                color: 'var(--clr-text)'
              }}>
                <h4 style={{ color: 'var(--clr-accent)', marginBottom: '8px', fontSize: '17px', fontWeight: 700 }}>
                  {isAr ? 'تم استلام رسالتك بنجاح!' : 'Message Received Successfully!'}
                </h4>
                <p style={{ color: 'var(--clr-text-muted)', fontSize: '13.5px', margin: 0 }}>
                  {isAr ? 'شكراً لتواصلك معنا. سنرد عليك في أقرب وقت.' : 'Thank you for reaching out. We will get back to you shortly.'}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  style={{ marginTop: '16px' }}
                  onClick={() => setSubmitted(false)}
                >
                  {isAr ? 'إرسال رسالة أخرى' : 'Send Another Message'}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{isAr ? 'الاسم الكامل' : 'Full Name'}</label>
                    <input type="text" required className={styles.formInput} placeholder={isAr ? 'جون دو' : 'John Doe'} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
                    <input type="email" required className={styles.formInput} placeholder="john@example.com" />
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
                  <textarea required className={styles.formTextarea} placeholder={isAr ? 'أخبرنا كيف يمكننا مساعدتك...' : 'Tell us how we can help you...'} />
                </div>

                <Button type="submit" size="lg" variant="primary" style={{ width: '100%' }} icon={<Send size={16} />} disabled={isSubmitting}>
                  {isSubmitting ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال الرسالة' : 'Send Message')}
                </Button>
              </form>
            )}
          </div>

          {/* Info Column */}
          <div className={styles.infoColumn}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitle}>{isAr ? 'تواصل مباشر' : 'Direct Contact'}</h3>

              <div className={styles.contactMethod}>
                <div className={styles.contactIcon}><Mail size={20} /></div>
                <div>
                  <div className={styles.contactLabel}>{isAr ? 'البريد الإلكتروني' : 'Email'}</div>
                  <div className={styles.contactValue}>
                    <a href={`mailto:${contactInfo.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className={styles.contactMethod}>
                <div className={styles.contactIcon}><Phone size={20} /></div>
                <div>
                  <div className={styles.contactLabel}>{isAr ? 'الهاتف' : 'Phone'}</div>
                  <div className={styles.contactValue}>
                    <a href={`tel:${contactInfo.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className={styles.contactMethod}>
                <div className={styles.contactIcon}><MapPin size={20} /></div>
                <div>
                  <div className={styles.contactLabel}>{isAr ? 'المقر الرئيسي' : 'Global Headquarters'}</div>
                  <div className={styles.contactValue}>
                    {contactInfo.mapUrl ? (
                      <a href={contactInfo.mapUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                        {contactInfo.address}
                      </a>
                    ) : (
                      contactInfo.address
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Map */}
            <div className={styles.mapContainer}>
              <MapComponent />
            </div>

            {locations.length > 0 && (
              <div className={styles.infoCard}>
                <h3 className={styles.infoCardTitle}>{isAr ? 'مكاتب أخرى' : 'Other Offices'}</h3>
                {locations.map(loc => (
                  <div key={loc.id} className={styles.contactMethod}>
                    <div className={styles.contactIcon}><MapPin size={20} /></div>
                    <div>
                      <div className={styles.contactLabel}>{loc.name}</div>
                      <div className={styles.contactValue}>
                        {loc.mapUrl ? (
                          <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                            {loc.address}
                          </a>
                        ) : (
                          loc.address
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
