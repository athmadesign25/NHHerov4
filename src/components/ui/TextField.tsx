import React from 'react';
import styles from './TextField.module.css';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  prefixElement?: React.ReactNode;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ className = '', icon, prefixElement, ...props }, ref) => {
    
    if (prefixElement) {
      return (
        <div className={`${styles.prefixContainer} ${className}`}>
          <div className={styles.prefix}>
            {prefixElement}
          </div>
          <input 
            ref={ref} 
            className={styles.prefixInput} 
            {...props} 
          />
          {icon && <div className={styles.icon}>{icon}</div>}
        </div>
      );
    }

    return (
      <div className={`${styles.inputWrapper} ${className}`}>
        <input 
          ref={ref} 
          className={`${styles.input} ${icon ? styles.hasIcon : ''}`} 
          {...props} 
        />
        {icon && <div className={styles.icon}>{icon}</div>}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
