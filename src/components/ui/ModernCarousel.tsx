"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import styles from "./ModernCarousel.module.css";

interface CarouselItem {
  id: string;
  title: string;
  desc: string;
  bg: string;
  link?: string;
  buttonText?: string;
  stat?: {
    value: string;
    label: string;
  };
}

/**
 * Shutter rolling digit component
 * Creates an odometer-style vertical roll effect for each individual digit
 */
function ShutterDigit({ char, delay = 0 }: { char: string; delay?: number }) {
  const isDigit = /\d/.test(char);
  if (!isDigit) {
    return <span className={styles.shutterNonDigit}>{char}</span>;
  }

  const digit = parseInt(char, 10);
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <span className={styles.shutterDigitSlot} aria-hidden="true">
      <motion.span
        className={styles.shutterDigitTrack}
        initial={{ y: "0%" }}
        animate={{ y: `-${digit * 10}%` }}
        transition={{
          duration: 0.9,
          delay: delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {digits.map((d) => (
          <span key={d} className={styles.shutterDigitItem}>
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function ShutterMetricReveal({ value }: { value: string }) {
  const chars = value.split("");
  let digitIndex = 0;

  return (
    <span className={styles.shutterValueWrapper} aria-label={value}>
      {chars.map((char, i) => {
        const isDigit = /\d/.test(char);
        const delay = isDigit ? 0.08 + digitIndex++ * 0.07 : 0;
        return <ShutterDigit key={i} char={char} delay={delay} />;
      })}
    </span>
  );
}

interface ModernCarouselProps {
  items: CarouselItem[];
  activeId?: string;
  onActiveChange?: (id: string) => void;
}

export default function ModernCarousel({ items, activeId: externalActiveId, onActiveChange }: ModernCarouselProps) {
  const [internalActiveId, setInternalActiveId] = useState(items[0]?.id);
  const [isBelow900, setIsBelow900] = useState(false);
  const touchStartX = React.useRef<number | null>(null);

  useEffect(() => {
    const checkWidth = () => {
      setIsBelow900(window.innerWidth < 900);
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const activeId = externalActiveId !== undefined ? externalActiveId : internalActiveId;
  const setActiveId = (id: string) => {
    setInternalActiveId(id);
    onActiveChange?.(id);
  };

  const activeIndex = items.findIndex(item => item.id === activeId);
  const totalItems = items.length;
  const activeItem = items[activeIndex];
  const nextItem = activeIndex < totalItems - 1 ? items[activeIndex + 1] : null;

  const isPrevDisabled = activeIndex <= 0;
  const isNextDisabled = activeIndex >= totalItems - 1;

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveId(items[activeIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (activeIndex < totalItems - 1) {
      setActiveId(items[activeIndex + 1].id);
    }
  };

  const transition: any = { type: "spring", bounce: 0.2, duration: 0.8 };

  return (
    <motion.div
      className={styles.carouselContainer}
      initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={styles.carouselTrack}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const deltaX = e.changedTouches[0].clientX - touchStartX.current;
          if (deltaX < -50) {
            handleNext();
          } else if (deltaX > 50) {
            handlePrev();
          }
          touchStartX.current = null;
        }}
      >
        {items.map((item, index) => {
          const isActive = item.id === activeId;
          const displayIndex = String(index + 1).padStart(2, "0");

          let isFullyVisible = true;
          let isPeek = false;
          let isHidden = false;

          if (isBelow900) {
            // Below 900px: Strictly show 1 expanded card and 2 collapsed cards (3 cards total)
            const maxVisible = 3;
            if (totalItems > maxVisible) {
              const windowStart = Math.max(0, Math.min(activeIndex - 1, totalItems - maxVisible));
              const windowEnd = windowStart + maxVisible - 1;

              if (index >= windowStart && index <= windowEnd) {
                isFullyVisible = true;
                isPeek = false;
              } else {
                isHidden = true;
              }
            }
          } else {
            // Desktop: 5-card window upfront + 1 peek card
            const maxVisible = 5;
            if (totalItems > maxVisible) {
              // Window starts so that active card is in view
              let windowStart = Math.max(0, Math.min(activeIndex - 2, totalItems - maxVisible));
              // Ensure first cards are upfront if activeIndex is near start
              if (activeIndex < 3) {
                windowStart = 0;
              } else if (activeIndex >= totalItems - 2) {
                windowStart = Math.max(0, totalItems - maxVisible);
              }

              const windowEnd = windowStart + maxVisible - 1; // 5 cards [windowStart .. windowEnd]

              if (index >= windowStart && index <= windowEnd) {
                isFullyVisible = true;
              } else if (index === windowEnd + 1 || (windowStart > 0 && index === windowStart - 1)) {
                isPeek = true;
              } else {
                isHidden = true;
              }
            }
          }

          if (isHidden) {
            return null;
          }

          return (
            <motion.div
              key={item.id}
              layout
              className={`${styles.carouselItem} ${isActive ? styles.active : ""} ${isPeek ? styles.peekItem : ""}`}
              onClick={() => setActiveId(item.id)}
              initial={false}
              animate={{
                flex: isActive ? 10 : (isPeek ? 0.22 : (isBelow900 ? 0.8 : 0.48)),
                filter: isPeek ? "blur(3.5px)" : "blur(0px)",
                opacity: isPeek ? 0.55 : 1,
              }}
              transition={transition}
            >
              {/* Background Image Wrapper for Zoom Effect */}
              <div className={styles.imageWrapper}>
                <motion.div
                  className={styles.backgroundImage}
                  style={{ backgroundImage: `url(${item.bg})` }}
                  animate={{
                    scale: isActive ? 1 : 1.15,
                    opacity: isActive ? 0.95 : (isPeek ? 0.35 : 0.5)
                  }}
                  transition={transition}
                />
              </div>

              {/* Gradient Overlay */}
              <div className={styles.overlay} />

              {/* Bottom Glass Blur (Only for expanded cards) */}
              <motion.div
                className={styles.bottomGlass}
                initial={false}
                animate={{
                  opacity: isActive && !isPeek ? 1 : 0,
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />

              {/* Content */}
              <motion.div
                className={styles.content}
                animate={{
                  opacity: isActive && !isPeek ? 1 : 0,
                  y: isActive ? 0 : 20,
                  pointerEvents: isActive ? "auto" : "none"
                }}
                transition={{ duration: 0.4, delay: isActive ? 0.2 : 0 }}
              >
                <div className={styles.headerRow}>
                  <span className={styles.cardAction}>
                    Explore
                    <span className={styles.actionUnderline} aria-hidden />
                  </span>
                  <span className={styles.index}>{displayIndex}</span>
                </div>

                <div className={styles.bottomRow}>
                  <div className={styles.bottomContent}>
                    <h3 className={styles.title}>{item.title}</h3>
                    <p className={styles.desc}>{item.desc}</p>

                    {item.link && (
                      <motion.div
                        whileHover={{ x: 5 }}
                        className={styles.actionWrapper}
                      >
                        <Link href={item.link} className={styles.heroButton}>
                          {item.buttonText || "View All Specialties"}
                        </Link>
                      </motion.div>
                    )}
                  </div>

                  {item.stat && (
                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.div
                          key={item.id}
                          className={styles.metricContainer}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
                        >
                          <div className={styles.metricValue}>
                            <ShutterMetricReveal value={item.stat.value} />
                          </div>
                          <div
                            className={styles.metricLabel}
                            dangerouslySetInnerHTML={{ __html: item.stat.label }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>

              {/* Vertical Title (when collapsed) */}
              <motion.div
                className={styles.collapsedContent}
                animate={{
                  opacity: !isActive ? (isPeek ? 0.6 : 1) : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <span className={styles.index}>{displayIndex}</span>
                <span className={styles.verticalTitle}>{item.title}</span>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className={styles.navigationWrapper}>
        <div className={styles.indicatorContainer}>
          <span className={styles.indicatorText}>
            {String(activeIndex + 1).padStart(2, "0")} / {String(totalItems).padStart(2, "0")}
          </span>
          <div className={styles.indicatorBars}>
            {items.map((_, idx) => (
              <div
                key={idx}
                className={`${styles.indicatorBar} ${idx === activeIndex ? styles.indicatorBarActive : ''}`}
                onClick={() => setActiveId(items[idx].id)}
                role="button"
                tabIndex={0}
                aria-label={`Go to ${items[idx].title}`}
              />
            ))}
          </div>
        </div>

        {/* Active & Next Card Readability Indication (Text Only, No Labels) */}
        <div className={styles.readingAidContainer}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem?.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={styles.readingAidContent}
            >
              {/* Active Card Title */}
              <span className={styles.activeTitle} title={activeItem?.title}>
                {activeItem?.title}
              </span>

              {/* Next Card Title (No "Next:" label text) */}
              {nextItem && (
                <button
                  type="button"
                  className={styles.readingAidNext}
                  onClick={handleNext}
                  title={`Go to ${nextItem.title}`}
                >
                  <span className={styles.readingAidDivider}>/</span>
                  <span className={styles.nextTitle} title={nextItem.title}>
                    {nextItem.title}
                  </span>
                  <ArrowRight size={12} className={styles.nextArrowIcon} />
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.navButtons}>
          <button
            className={`${styles.navBtn} ${isPrevDisabled ? styles.navBtnDisabled : ""}`}
            onClick={handlePrev}
            disabled={isPrevDisabled}
            aria-label="Previous item"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            className={`${styles.navBtn} ${isNextDisabled ? styles.navBtnDisabled : ""}`}
            onClick={handleNext}
            disabled={isNextDisabled}
            aria-label="Next item"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
