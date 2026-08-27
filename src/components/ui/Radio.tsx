import React from 'react';
import styles from './Radio.module.css';

export interface RadioOption {
  label: string;
  value: string;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  className?: string;
  required?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  defaultValue,
  onChange,
  label,
  className = '',
  required = false
}) => {
  return (
    <div className={`${styles.radioGroup} ${className}`}>
      {label && <span className={styles.radioLabel}>{label}</span>}
      {options.map((option) => (
        <label key={option.value} className={styles.radioOption}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value !== undefined ? value === option.value : undefined}
            defaultChecked={defaultValue !== undefined ? defaultValue === option.value : undefined}
            onChange={onChange}
            className={styles.radioInput}
            required={required}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
};
