import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import styles from './Toast.module.css';

export interface ToastProps {
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'info' | 'warning';
  onClose?: () => void;
  className?: string;
}

export function Toast({ 
  title, 
  description, 
  variant = 'info', 
  onClose,
  className = ''
}: ToastProps) {
  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }[variant];

  return (
    <div className={`${styles.toast} ${styles[variant]} ${className}`} role="alert">
      <div className={styles.icon}>
        <Icon size={20} />
      </div>
      <div className={styles.content}>
        <h4 className={styles.title}>{title}</h4>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {onClose && (
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
