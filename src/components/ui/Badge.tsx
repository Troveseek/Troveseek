import React from 'react';
import styles from './Badge.module.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'green' | 'success' | 'amber' | 'warning' | 'red' | 'danger' | 'blue' | 'default';
  children: React.ReactNode;
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  // Normalize aliases
  const resolvedVariant =
    variant === 'success' ? 'green' :
    variant === 'warning' ? 'amber' :
    variant === 'danger' ? 'red' :
    variant;

  const classes = [
    styles.badge,
    styles[resolvedVariant],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
