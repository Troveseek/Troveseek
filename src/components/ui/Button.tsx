import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'iconOnly';
  children?: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  icon,
  href,
  target,
  rel,
  ...props
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    className
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {icon && <span className={styles.icon}>{icon}</span>}
      {size !== 'iconOnly' && children}
      {size === 'iconOnly' && !icon && children}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} target={target} rel={rel} style={{ textDecoration: 'none' }}>
        {content}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}
