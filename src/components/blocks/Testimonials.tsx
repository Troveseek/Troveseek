import React from 'react';
import styles from './Testimonials.module.css';
import db from '@/lib/db';
import { getLocale } from 'next-intl/server';

export async function Testimonials() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const testimonials = await db.testimonial.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  if (testimonials.length === 0) return null; // Hide if empty

  return (
    <section className={styles.testimonialsSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isAr ? 'موثوقون من قبل أصحاب الرؤى' : 'Trusted by Visionaries'}</h2>
        </div>
        
        <div className={styles.grid}>
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className={styles.testimonialCard}>
              <p className={styles.quote}>"{isAr ? (testimonial.quoteAr || testimonial.quote) : testimonial.quote}"</p>
              <div className={styles.author}>
                {testimonial.avatarUrl ? (
                  <div className={styles.avatar} style={{ background: `url(${testimonial.avatarUrl}) center/cover` }}></div>
                ) : (
                  <div className={styles.avatar}></div>
                )}
                <div className={styles.authorInfo}>
                  <span className={styles.authorName}>{isAr ? (testimonial.nameAr || testimonial.name) : testimonial.name}</span>
                  {(testimonial.role || testimonial.roleAr) && <span className={styles.authorRole}>{isAr ? (testimonial.roleAr || testimonial.role) : testimonial.role}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
