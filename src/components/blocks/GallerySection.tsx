import React from 'react';
import db from '@/lib/db';
import { getLocale } from 'next-intl/server';

export async function GallerySection() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const images = await db.galleryImage.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  });

  if (images.length === 0) return null; // Hide if empty

  return (
    <section style={{ padding: '96px 32px', background: 'var(--clr-bg)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            {isAr ? 'الحياة في TroveSeek' : 'Life at TroveSeek'}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700 }}>{isAr ? 'خلف الكواليس' : 'Behind the Scenes'}</h2>
        </div>

        {/* Masonry Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '16px',
          gridAutoRows: '200px'
        }}>
          {images.map((img, i) => {
            const isLarge = i % 4 === 0 || i % 5 === 0;
            return (
              <div key={img.id} style={{
                background: `url(${img.imageUrl}) center/cover`,
                borderRadius: '16px',
                border: '1px solid var(--clr-border)',
                gridRowEnd: isLarge ? 'span 2' : 'span 1',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '16px',
                color: 'white',
                fontSize: '14px',
                transition: 'var(--transition)',
                cursor: 'pointer',
                boxShadow: 'inset 0 -50px 50px -20px rgba(0,0,0,0.5)'
              }}>
                <div style={{ fontWeight: 600, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  {isAr ? (img.titleAr || img.title || img.captionAr || img.caption) : (img.title || img.caption)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
