import React, { forwardRef } from 'react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, iconLeft, iconRight, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    
    return (
      <div className={`${styles.inputWrapper} ${className}`}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        
        <div className={styles.inputContainer}>
          {iconLeft && <div className={styles.iconLeft}>{iconLeft}</div>}
          
          <input
            id={inputId}
            ref={ref}
            className={`
              ${styles.input} 
              ${error ? styles.error : ''} 
              ${iconLeft ? styles.withIconLeft : ''} 
              ${iconRight ? styles.withIconRight : ''}
            `}
            {...props}
          />
          
          {iconRight && <div className={styles.iconRight}>{iconRight}</div>}
        </div>
        
        {error && <span className={styles.errorText}>{error}</span>}
        {hint && !error && <span className={styles.hintText}>{hint}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
