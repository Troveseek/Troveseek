import React from 'react';
import styles from './StatsBar.module.css';

interface Stat {
  label: string;
  value: string;
}

const stats: Stat[] = [
  { label: 'Active Users', value: '10K+' },
  { label: 'Premium Assets', value: '5,000+' },
  { label: 'Total Revenue', value: '$2M+' },
  { label: 'Countries Served', value: '120+' },
];

export function StatsBar() {
  return (
    <section className={styles.statsBar}>
      <div className={styles.container}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statItem}>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
