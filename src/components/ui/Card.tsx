import React from 'react';
import styles from './Card.module.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass';
  isInteractive?: boolean;
}

export function Card({ 
  variant = 'default', 
  isInteractive = false, 
  className = '', 
  children, 
  ...props 
}: CardProps) {
  const classes = [
    styles.card,
    variant === 'glass' ? styles.glass : '',
    isInteractive ? styles.interactive : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ 
  className = '', 
  children, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${styles.header} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ 
  className = '', 
  children, 
  ...props 
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`${styles.title} ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardBody({ 
  className = '', 
  children, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${styles.body} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ 
  className = '', 
  children, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${styles.footer} ${className}`} {...props}>
      {children}
    </div>
  );
}
