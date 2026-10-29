"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import styles from "./SpecialityDesignController.module.css";

export type SpecialityDesignId = 1 | 2;

export interface SpecialityDesignMeta {
  id: SpecialityDesignId;
  label: string;
  shortLabel: string;
  description: string;
  badge: string;
}

export const SPECIALITY_DESIGNS: SpecialityDesignMeta[] = [
  {
    id: 1,
    label: "Design 1",
    shortLabel: "Design 1",
    description: "Design 1 (Current Master)",
    badge: "Design 1",
  },
  {
    id: 2,
    label: "Design 2",
    shortLabel: "Design 2",
    description: "Design 2 (Customized)",
    badge: "Design 2",
  },
];

interface SpecialityDesignControllerProps {
  activeDesign: SpecialityDesignId;
  onDesignChange: (id: SpecialityDesignId) => void;
}

export default function SpecialityDesignController({
  activeDesign,
  onDesignChange,
}: SpecialityDesignControllerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hide on scroll down, show on scroll up, show when idle
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 60) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY.current + 8) {
        // Scrolling down -> hide
        setIsVisible(false);
      } else if (lastScrollY.current - currentScrollY > 8) {
        // Scrolling up -> show
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;

      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, 1400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Global hotkeys 1 and 2
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "1") {
        onDesignChange(1);
      } else if (e.key === "2") {
        onDesignChange(2);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDesignChange]);

  const activeMeta = SPECIALITY_DESIGNS.find((d) => d.id === activeDesign) || SPECIALITY_DESIGNS[0];

  return (
    <motion.div
      className={styles.controllerContainer}
      aria-label="Specialty Detail Design Switcher"
      initial={{ opacity: 1, y: 0 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 64,
        pointerEvents: isVisible ? "auto" : "none",
      }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsVisible(true)}
    >
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.85, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 6 }}
            transition={{ duration: 0.18 }}
            className={styles.collapsedPill}
            onClick={() => setIsCollapsed(false)}
            title="Expand Design Switcher (Press 1 or 2)"
          >
            <Sparkles size={12} color="#00D47E" />
            <span>Design</span>
            <span className={styles.collapsedCurrentBadge}>{activeDesign}</span>
            <ChevronUp size={12} />
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.2 }}
            className={styles.controllerCard}
          >
            <div className={styles.brandLabel}>
              <span className={styles.brandDot} />
              <span>View</span>
            </div>

            <div className={styles.optionsGroup} role="tablist">
              {SPECIALITY_DESIGNS.map((design) => {
                const isActive = activeDesign === design.id;
                return (
                  <button
                    key={design.id}
                    role="tab"
                    aria-selected={isActive}
                    className={`${styles.optionBtn} ${isActive ? styles.optionBtnActive : ""}`}
                    onClick={() => onDesignChange(design.id)}
                    title={design.description}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeDesignPill"
                        className={styles.activeBackground}
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className={styles.hotkeyBadge}>{design.id}</span>
                    <span>{design.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            <button
              className={styles.collapseBtn}
              onClick={() => setIsCollapsed(true)}
              aria-label="Minimize design controller"
              title="Minimize controller"
            >
              <ChevronDown size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
