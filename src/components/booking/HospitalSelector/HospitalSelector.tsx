"use client";

import React, { useState, useRef, useId } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./HospitalSelector.module.css";

interface Hospital {
  value: string;
  label: string;
  city: string;
}

interface HospitalSelectorProps {
  hospitals: Hospital[];
  value: string;
  onChange: (value: string) => void;
}

export default function HospitalSelector({ hospitals, value, onChange }: HospitalSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();
  const listId = `hospital-list-${id}`;

  const selected = hospitals.find((h) => h.value === value) ?? hospitals[0];

  const handleSelect = (hospital: Hospital) => {
    onChange(hospital.value);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  return (
    <div className={styles.wrapper} onKeyDown={handleKeyDown}>
      <label className={styles.fieldLabel} htmlFor={`hospital-trigger-${id}`}>
        <MapPin size={16} aria-hidden />
        Select Hospital
      </label>

      {/* Desktop: custom dropdown */}
      <div className={styles.dropdownWrapper}>
        <button
          ref={buttonRef}
          id={`hospital-trigger-${id}`}
          type="button"
          className={[styles.trigger, isOpen ? styles.triggerOpen : ""].join(" ")}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listId}
          onClick={() => setIsOpen((v) => !v)}
        >
          <span className={styles.triggerText}>
            <span className={styles.triggerLabel}>{selected?.label ?? "Select a hospital"}</span>
            {selected?.city && <span className={styles.triggerCity}>{selected.city}</span>}
          </span>
          <ChevronDown
            size={16}
            className={[styles.chevron, isOpen ? styles.chevronOpen : ""].join(" ")}
            aria-hidden
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label="Hospital options"
              className={styles.list}
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              {hospitals.map((hospital) => {
                const isSelected = hospital.value === value;
                return (
                  <li
                    key={hospital.value}
                    role="option"
                    aria-selected={isSelected}
                    className={[styles.option, isSelected ? styles.optionSelected : ""].join(" ")}
                    onClick={() => handleSelect(hospital)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleSelect(hospital);
                    }}
                    tabIndex={0}
                  >
                    <span className={styles.optionText}>
                      <span className={styles.optionLabel}>{hospital.label}</span>
                      <span className={styles.optionCity}>{hospital.city}</span>
                    </span>
                    {isSelected && (
                      <Check size={14} className={styles.checkIcon} aria-hidden />
                    )}
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* MWEB: native select for accessibility & touch UX */}
      <select
        className={styles.nativeSelect}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Select hospital"
      >
        {hospitals.map((h) => (
          <option key={h.value} value={h.value}>
            {h.label} — {h.city}
          </option>
        ))}
      </select>
    </div>
  );
}
