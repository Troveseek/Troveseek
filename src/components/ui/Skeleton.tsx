import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'pill';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  variant = 'rect', 
  width = '100%', 
  height = '20px', 
  className = '', 
  style, 
  ...props 
}: SkeletonProps) {
  const classes = [
    styles.skeleton,
    variant === 'circle' ? styles.circle : '',
    variant === 'pill' ? styles.pill : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={classes} 
      style={{ width, height, ...style }} 
      {...props} 
    />
  );
}
