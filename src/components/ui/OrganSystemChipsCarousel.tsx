"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import styles from "./OrganSystemChipsCarousel.module.css";

export interface OrganFilterOption {
  label: string;
  value: string;
  image: string;
}

export const DEFAULT_ORGAN_FILTER_OPTIONS: OrganFilterOption[] = [
  { label: "Heart", value: "heart", image: "/Specialities icons/Cardiology.jpeg" },
  { label: "Brain & Spine", value: "brain", image: "/Specialities icons/Neurology.jpeg" },
  { label: "Kidneys", value: "kidney", image: "/Specialities icons/Nephrology.jpeg" },
  { label: "Liver", value: "liver", image: "/Specialities icons/Liver Transplant.svg" },
  { label: "Lungs", value: "lungs", image: "/Specialities icons/Pulmonology.jpeg" },
  { label: "Bones & Joints", value: "bones", image: "/Specialities icons/Orthopedics.jpeg" },
  { label: "Stomach & GI", value: "stomach", image: "/Specialities icons/Gastroenterology.jpeg" },
  { label: "Cancer Care", value: "cancer", image: "/Specialities icons/Cancer Care.jpeg" },
  { label: "Urinary & Bladder", value: "urinary", image: "/Specialities icons/Urology.jpeg" },
  { label: "Children & Neonatal", value: "paediatric", image: "/Specialities icons/Paediatrics.jpeg" },
  { label: "Women's Health", value: "gynaecology", image: "/Specialities icons/Gynaecology.svg" },
  { label: "Thyroid & Endocrine", value: "endocrine", image: "/Specialities icons/Endocrinology.jpeg" },
  { label: "Joints & Autoimmune", value: "rheumatology", image: "/Specialities icons/Rheumatology.jpeg" },
  { label: "General Surgery", value: "surgery", image: "/Specialities icons/General Surgery.jpeg" },
];

interface OrganSystemChipsCarouselProps {
  options?: OrganFilterOption[];
  selectedOrgan: string | null;
  onSelectOrgan: (organValue: string | null) => void;
  eyebrow?: string;
}

export default function OrganSystemChipsCarousel({
  options = DEFAULT_ORGAN_FILTER_OPTIONS,
  selectedOrgan,
  onSelectOrgan,
  eyebrow = "Explore by Organ System & Speciality",
}: OrganSystemChipsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = trackRef.current;
    if (!el || isExpanded) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
  }, [isExpanded]);

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

  const handleViewAllClick = () => {
    onSelectOrgan(null);
    setIsExpanded((prev) => !prev);
    if (trackRef.current) {
      trackRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  return (
    <motion.section
      className={styles.carouselOuterSection}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Filter by Organ System"
    >
      <div className={styles.topBarRow}>
        <span className={styles.eyebrowLabel}>{eyebrow}</span>

        <div className={styles.controlsRightGroup}>
          <button
            type="button"
            className={`${styles.expandAllBtn} ${isExpanded ? styles.expandAllBtnActive : ""}`}
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
          >
            <LayoutGrid size={13} />
            <span>{isExpanded ? "Carousel View" : `View All (${options.length})`}</span>
          </button>

          {!isExpanded && (
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
          )}
        </div>
      </div>

      <div className={styles.trackContainer}>
        <div
          ref={trackRef}
          className={`${styles.bubblesRow} ${isExpanded ? styles.bubblesRowExpanded : ""}`}
        >
          {/* 1. "View All" Chip */}
          <button
            type="button"
            className={`${styles.bubbleBtn} ${selectedOrgan === null ? styles.bubbleBtnActive : ""}`}
            onClick={handleViewAllClick}
            aria-pressed={selectedOrgan === null}
          >
            <div className={`${styles.bubbleImgWrap} ${styles.viewAllIconWrap}`}>
              <LayoutGrid size={22} />
            </div>
            <span className={styles.bubbleLabel}>{isExpanded ? "Collapse" : "View All"}</span>
          </button>

          {/* 2. Organ-System Chips */}
          {options.map((opt) => {
            const isActive = selectedOrgan === opt.value;
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
                    fill
                    sizes="56px"
                    className={styles.bubbleImg}
                  />
                </div>
                <span className={styles.bubbleLabel}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
