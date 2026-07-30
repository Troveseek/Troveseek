"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function AnnouncementBanner() {
  const [hero, setHero] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/page-heroes?page=HOME')
      .then(res => res.json())
      .then(data => {
        const activeHero = data?.data?.find((h: any) => h.isActive);
        if (activeHero) {
          try {
            activeHero.buttons = JSON.parse(activeHero.buttons || '[]');
          } catch {
            activeHero.buttons = [];
          }
          setHero(activeHero);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !hero) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, var(--clr-primary), var(--clr-accent))',
      color: '#fff',
      padding: '10px 24px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      fontWeight: 500,
      flexWrap: 'wrap'
    }}>
      {hero.label && (
        <span style={{ 
          background: 'rgba(255,255,255,0.2)', 
          padding: '2px 8px', 
          borderRadius: '999px', 
          fontSize: '11px', 
          fontWeight: 700, 
          textTransform: 'uppercase' 
        }}>{hero.label}</span>
      )}
      <span>{hero.title} {hero.subtitle}</span>
      {hero.buttons && hero.buttons.length > 0 && hero.buttons.map((btn: any, i: number) => (
        btn.isActive && (
          <Link key={i} href={btn.url} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fff', fontWeight: 600, textDecoration: 'underline' }}>
            {btn.label} <ArrowRight size={14} />
          </Link>
        )
      ))}
    </div>
  );
}
