"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import styles from "./TreatmentsVersionController.module.css";

export type TreatmentsVersionId = 1 | 2;

export interface TreatmentsVersionMeta {
  id: TreatmentsVersionId;
  label: string;
  shortLabel: string;
  badge: string;
  description: string;
}

export const TREATMENTS_VERSIONS: TreatmentsVersionMeta[] = [
  {
    id: 1,
    label: "V1 Speciality Anatomy",
    shortLabel: "V1 Directory",
    badge: "Speciality Style",
    description: "Speciality listing style with search, cards & sidebar filters",
  },
  {
    id: 2,
    label: "V2 Pulse Medical Library",
    shortLabel: "V2 Library",
    badge: "Current Master",
    description: "Preserved original library layout with organ filter bar",
  },
];

interface TreatmentsVersionControllerProps {
  activeVersion: TreatmentsVersionId;
  onVersionChange: (id: TreatmentsVersionId) => void;
}

export default function TreatmentsVersionController({
  activeVersion,
  onVersionChange,
}: TreatmentsVersionControllerProps) {
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
        setIsVisible(false);
      } else if (lastScrollY.current - currentScrollY > 8) {
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
        onVersionChange(1);
      } else if (e.key === "2") {
        onVersionChange(2);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onVersionChange]);

  return (
    <div
      className={styles.controllerContainer}
      style={{
        transform: isVisible ? "translateY(0)" : "translateY(80px)",
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
      }}
    >
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          <motion.button
            key="collapsed"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className={styles.miniPill}
            onClick={() => setIsCollapsed(false)}
            title="Expand version toggle"
            aria-label="Expand version toggle"
          >
            <Sparkles size={13} color="#00D47E" />
            <span>V{activeVersion}</span>
            <ChevronUp size={13} />
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={styles.controllerCard}
          >
            <div className={styles.brandLabel}>
              <span className={styles.brandDot} />
              <span>Procedures View</span>
            </div>

            <div className={styles.optionsGroup}>
              {TREATMENTS_VERSIONS.map((v) => {
                const isActive = activeVersion === v.id;
                return (
                  <button
                    key={v.id}
                    className={`${styles.optionBtn} ${isActive ? styles.optionBtnActive : ""}`}
                    onClick={() => onVersionChange(v.id)}
                    title={v.description}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTreatmentsVersionBg"
                        className={styles.activeBackground}
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      />
                    )}
                    <span>{v.shortLabel}</span>
                    <span className={styles.badge}>{v.badge}</span>
                  </button>
                );
              })}
            </div>

            <button
              className={styles.collapseBtn}
              onClick={() => setIsCollapsed(true)}
              title="Minimize controller"
              aria-label="Minimize controller"
            >
              <ChevronDown size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

