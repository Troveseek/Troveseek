import React from 'react';
import { Card } from '@/components/ui/Card';
import { Mail, Globe } from 'lucide-react';
import db from '@/lib/db';
import { getLocale } from 'next-intl/server';

export async function TeamSection() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const team = await db.teamMember.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  });

  if (team.length === 0) return null; // Hide if empty

  return (
    <section style={{ padding: '96px 32px', background: 'var(--clr-surface-2)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            {isAr ? 'فريقنا' : 'Our Team'}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 2.6vw + 6px, 34px)', fontWeight: 700, color: 'var(--clr-text)', marginBottom: '12px' }}>
            {isAr ? 'تعرف على العقول وراء TroveSeek' : 'Meet the Minds Behind TroveSeek'}
          </h2>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: 'clamp(14px, 0.9vw + 4px, 16px)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            {isAr ? 'فريق عالمي من المهندسين والمصممين والاستراتيجيين يبنون مستقبل التجارة الرقمية.' : 'A global team of engineers, designers, and strategists building the future of digital commerce.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'clamp(16px, 2.5vw, 28px)' }}>
          {team.map((member) => (
            <Card key={member.id} style={{ textAlign: 'center', padding: 'clamp(20px, 2.5vw, 28px) clamp(16px, 2vw, 20px)', transition: 'var(--transition)' }}>
              {member.imageUrl ? (
                <div style={{ 
                  width: '96px', height: '96px', borderRadius: '50%', 
                  background: `url(${member.imageUrl}) center/cover`, 
                  margin: '0 auto 16px',
                  border: '3px solid var(--clr-surface-3)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                }} />
              ) : (
                <div style={{ 
                  width: '96px', height: '96px', borderRadius: '50%', 
                  background: 'var(--clr-surface-elevated)', 
                  margin: '0 auto 16px',
                  border: '3px solid var(--clr-surface-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', fontWeight: 600, color: 'var(--clr-text-muted)'
                }}>
                  {(isAr && member.nameAr ? member.nameAr : member.name).charAt(0)}
                </div>
              )}
              <h3 style={{ fontSize: 'clamp(16px, 1.1vw + 4px, 18px)', fontWeight: 600, marginBottom: '4px' }}>{isAr ? (member.nameAr || member.name) : member.name}</h3>
              <p style={{ color: 'var(--clr-primary)', fontSize: '13.5px', fontWeight: 500, marginBottom: '10px' }}>{isAr ? (member.roleAr || member.role) : member.role}</p>
              {(member.bio || member.bioAr) && <p style={{ color: 'var(--clr-text-muted)', fontSize: '13px', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{isAr ? (member.bioAr || member.bio) : member.bio}</p>}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                {member.email && <a href={`mailto:${member.email}`} style={{ color: 'var(--clr-text-muted)', transition: 'color 0.2s' }}><Mail size={16} /></a>}
                {member.website && <a href={member.website} target="_blank" rel="noreferrer" style={{ color: 'var(--clr-text-muted)', transition: 'color 0.2s' }}><Globe size={16} /></a>}
                {member.linkedIn && <a href={member.linkedIn} target="_blank" rel="noreferrer" style={{ color: 'var(--clr-text-muted)', transition: 'color 0.2s', fontSize: '13px' }}>LinkedIn</a>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
