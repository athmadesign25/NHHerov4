"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Globe, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./BlogLanguageChanger.module.css";

export interface LanguageOption {
  code: string;
  label: string;
  native: string;
}

export const BLOG_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "bn", label: "Bangla", native: "বাংলা" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
];

interface BlogLanguageChangerProps {
  theme?: "dark" | "light";
  onLanguageChange?: (lang: LanguageOption) => void;
}

export default function BlogLanguageChanger({
  theme = "dark",
  onLanguageChange,
}: BlogLanguageChangerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(BLOG_LANGUAGES[0]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (lang: LanguageOption) => {
    setSelectedLang(lang);
    setIsOpen(false);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.changerWrapper} ${theme === "light" ? styles.themeLight : styles.themeDark}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        className={`${styles.triggerBtn} ${isOpen ? styles.triggerBtnActive : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Select language, currently ${selectedLang.label}`}
      >
        <span className={styles.langLabel}>{selectedLang.label}</span>
        {isOpen ? (
          <ChevronUp size={15} className={styles.chevronIcon} />
        ) : (
          <ChevronDown size={15} className={styles.chevronIcon} />
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={styles.dropdownMenu}
            role="listbox"
            tabIndex={-1}
          >
            {BLOG_LANGUAGES.map((lang) => {
              const isSelected = selectedLang.code === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  className={`${styles.optionBtn} ${isSelected ? styles.optionActive : ""}`}
                  onClick={() => handleSelect(lang)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className={styles.optionTextCol}>
                    <span className={styles.primaryText}>{lang.label}</span>
                    {lang.native !== lang.label && (
                      <span className={styles.nativeSubtext}>{lang.native}</span>
                    )}
                  </div>
                  {isSelected && <Check size={14} className={styles.checkIcon} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

