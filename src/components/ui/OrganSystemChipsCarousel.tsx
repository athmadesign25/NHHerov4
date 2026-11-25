"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./OrganSystemChipsCarousel.module.css";

export interface OrganFilterOption {
  label: string;
  shortLabel?: string;
  value: string;
  image: string;
}

// Pure Organ-Only Circular Filters using unified Red (#ED1C24), Blue (#034EA1) & White medical icon artwork
export const DEFAULT_ORGAN_FILTER_OPTIONS: OrganFilterOption[] = [
  { label: "Heart", shortLabel: "Heart", value: "heart", image: "/Specialities icons/Cardiology.svg" },
  { label: "Brain", shortLabel: "Brain", value: "brain", image: "/Specialities icons/Neurology.svg" },
  { label: "Lungs", shortLabel: "Lungs", value: "lungs", image: "/Specialities icons/Pulmonology.svg" },
  { label: "Liver", shortLabel: "Liver", value: "liver", image: "/Specialities icons/Liver Transplant.svg" },
  { label: "Kidneys", shortLabel: "Kidneys", value: "kidney", image: "/Specialities icons/Nephrology.svg" },
  { label: "Stomach & GI", shortLabel: "Stomach", value: "stomach", image: "/Specialities icons/Gastro.svg" },
  { label: "Bones & Joints", shortLabel: "Bones", value: "bones", image: "/Specialities icons/Orthopaedics.svg" },
  { label: "Spine & Nerves", shortLabel: "Spine", value: "spine", image: "/Specialities icons/Spine.svg" },
  { label: "Urinary & Bladder", shortLabel: "Urinary", value: "urinary", image: "/Specialities icons/Urology.svg" },
  { label: "Uterus & Ovaries", shortLabel: "Uterus", value: "gynaecology", image: "/Specialities icons/Gynaecology.svg" },
  { label: "Thyroid & Glands", shortLabel: "Thyroid", value: "endocrine", image: "/Specialities icons/Thyroid.svg" },
  { label: "Vascular & Aorta", shortLabel: "Vascular", value: "vascular", image: "/Specialities icons/Vascular.svg" },
  { label: "Oral & Dental", shortLabel: "Dental", value: "dental", image: "/Specialities icons/Dental.svg" },
];

interface OrganSystemChipsCarouselProps {
  options?: OrganFilterOption[];
  selectedOrgan: string | null;
  onSelectOrgan: (organValue: string | null) => void;
  eyebrow?: string;
  className?: string;
  variant?: "circle" | "clean-tabs";
}

export default function OrganSystemChipsCarousel({
  options = DEFAULT_ORGAN_FILTER_OPTIONS,
  selectedOrgan,
  onSelectOrgan,
  eyebrow = "Filter by Organ System",
  className = "",
  variant = "circle",
}: OrganSystemChipsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons, { passive: true });
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [updateScrollButtons]);

  const handleScrollBy = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const delta = direction === "left" ? -340 : 340;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  const isCleanTabs = variant === "clean-tabs";

  return (
    <motion.section
      className={`${styles.carouselOuterSection} ${isCleanTabs ? styles.cleanTabsOuter : ""} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Filter by Organ System"
    >
      {!isCleanTabs && (
        <div className={styles.topBarRow}>
          <span className={styles.eyebrowLabel}>{eyebrow}</span>

          <div className={styles.controlsRightGroup}>
            <div className={styles.arrowGroup}>
              <button
                type="button"
                className={styles.carouselArrowBtn}
                onClick={() => handleScrollBy("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll organ systems left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className={styles.carouselArrowBtn}
                onClick={() => handleScrollBy("right")}
                disabled={!canScrollRight}
                aria-label="Scroll organ systems right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`${styles.trackContainer} ${isCleanTabs ? styles.cleanTabsTrackContainer : ""}`}>
        <div
          ref={trackRef}
          className={`${styles.bubblesRow} ${isCleanTabs ? styles.cleanTabsRow : ""}`}
        >
          {isCleanTabs && (
            <button
              type="button"
              className={`${styles.cleanTabBtn} ${selectedOrgan === null ? styles.cleanTabBtnActive : ""}`}
              onClick={() => onSelectOrgan(null)}
              aria-pressed={selectedOrgan === null}
            >
              <span className={styles.cleanAllBadge} aria-hidden="true">
                <span className={styles.cleanAllDotGrid}>
                  <span /><span /><span /><span />
                </span>
              </span>
              <span className={styles.cleanTabLabel}>All Organs</span>
            </button>
          )}
          {options.map((opt) => {
            const isActive = selectedOrgan === opt.value;
            if (isCleanTabs) {
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.cleanTabBtn} ${isActive ? styles.cleanTabBtnActive : ""}`}
                  onClick={() => onSelectOrgan(isActive ? null : opt.value)}
                  aria-pressed={isActive}
                  title={opt.label}
                >
                  <Image
                    src={opt.image}
                    alt={opt.label}
                    width={28}
                    height={28}
                    className={styles.cleanTabIcon}
                  />
                  <span className={styles.cleanTabLabel}>{opt.shortLabel || opt.label}</span>
                </button>
              );
            }
            return (
              <button
                key={opt.value}
                type="button"
                className={`${styles.bubbleBtn} ${isActive ? styles.bubbleBtnActive : ""}`}
                onClick={() => onSelectOrgan(isActive ? null : opt.value)}
                aria-pressed={isActive}
              >
                <div className={styles.bubbleImgWrap}>
                  <Image
                    src={opt.image}
                    alt={opt.label}
                    width={34}
                    height={34}
                    className={styles.bubbleImg}
                  />
                </div>
                <span className={styles.bubbleLabel}>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {isCleanTabs && (canScrollLeft || canScrollRight) && (
          <div className={styles.cleanTabsArrows}>
            {canScrollLeft && (
              <button
                type="button"
                className={styles.cleanTabScrollBtn}
                onClick={() => handleScrollBy("left")}
                aria-label="Scroll organ systems left"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            {canScrollRight && (
              <button
                type="button"
                className={styles.cleanTabScrollBtn}
                onClick={() => handleScrollBy("right")}
                aria-label="Scroll organ systems right"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
}
