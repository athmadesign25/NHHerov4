"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdvanceTestItem, ADVANCE_TESTS_DATA } from "@/data/advanceTestsData";
import { useCarouselPeekHint } from "@/lib/useCarouselPeekHint";
import styles from "./AdvanceTestsCarousel.module.css";

interface AdvanceTestsCarouselProps {
  tests?: AdvanceTestItem[];
  theme?: "dark" | "light";
}

const CARD_STEP = 572; // 528px card width + 44px gap

function AdvanceTestCard({ test }: { test: AdvanceTestItem }) {
  return (
    <div className={styles.card}>
      {/* Full Photographic Image with Zoom */}
      <div className={styles.imageWrap}>
        <Image
          src={test.image}
          alt={test.name}
          fill
          sizes="(max-width: 768px) 85vw, 528px"
          className={styles.image}
          loading="lazy"
        />
      </div>

      {/* Top and Bottom Gradient Overlays */}
      <div className={styles.topOverlay} />
      <div className={styles.bottomOverlay} />

      {/* Card Body Layered over Image */}
      <div className={styles.cardBody}>
        <div className={styles.bottomContent}>
          <div className={styles.cardContent}>
            <span className={styles.cardAction}>
              Explore
              <span className={styles.actionUnderline} aria-hidden />
            </span>
            <h3 className={styles.testTitle} title={test.name}>
              {test.name}
            </h3>
            <p className={styles.testDesc} title={test.desc}>
              {test.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile-specific card wrapper with IntersectionObserver for responsive indicators
 */
function MobileAdvanceTestCard({
  test,
  index,
  onVisible,
}: {
  test: AdvanceTestItem;
  index: number;
  onVisible: (idx: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.6 });

  useEffect(() => {
    if (isInView) {
      onVisible(index);
    }
  }, [isInView, index, onVisible]);

  return (
    <div ref={ref} className={styles.mobileCarouselItem}>
      <AdvanceTestCard test={test} />
    </div>
  );
}

export default function AdvanceTestsCarousel({ 
  tests = ADVANCE_TESTS_DATA,
  theme = "light"
}: AdvanceTestsCarouselProps) {
  const isLight = theme === "light";
  const cardsCount = tests.length;
  // Card 0 (1st card) sits at center slot (slot 2) initially, matching active dot 0
  const [centerIndex, setCenterIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  useCarouselPeekHint(scrollContainerRef, cardsCount);

  const goNext = () => {
    setDirection(1);
    setCenterIndex((prev) => (prev + 1) % cardsCount);
  };

  const goPrev = () => {
    setDirection(-1);
    setCenterIndex((prev) => (prev - 1 + cardsCount) % cardsCount);
  };

  const goToIndex = (targetIndex: number) => {
    if (targetIndex === centerIndex) return;
    const diff = (targetIndex - centerIndex + cardsCount) % cardsCount;
    setDirection(diff <= cardsCount / 2 ? 1 : -1);
    setCenterIndex(targetIndex);
  };

  const handleMobileScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const firstItem = container.firstElementChild as HTMLElement | null;
    const itemWidth = firstItem ? firstItem.offsetWidth + 16 : 320;
    const index = Math.round(scrollLeft / itemWidth);
    if (index >= 0 && index < cardsCount && index !== mobileActiveIndex) {
      setMobileActiveIndex(index);
    }
  };

  const scrollToMobileCard = (index: number) => {
    setMobileActiveIndex(index);
    if (scrollContainerRef.current) {
      const items = scrollContainerRef.current.children;
      if (items[index]) {
        (items[index] as HTMLElement).scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
      }
    }
  };

  // 5 slots centered on slot 2
  const NUM_SLOTS = 5;
  const slots = Array.from({ length: NUM_SLOTS }, (_, slotPos) => {
    const offset = slotPos - 2;
    const realIndex = ((centerIndex + offset) % cardsCount + cardsCount) % cardsCount;
    return { slotPos, realIndex };
  });

  return (
    <div className={styles.carouselWrapper}>
      {/* DESKTOP LAYOUT WITH 5-SLOT INFINITE CAROUSEL (Identical to PatientStories) */}
      <div className={`${styles.trackViewport} ${styles.desktopOnly}`}>
        <div className={styles.track}>
          {slots.map(({ slotPos, realIndex }) => {
            const test = tests[realIndex];
            const slideOffsetEnter = direction * 48;
            const slideOffsetExit = direction * -48;

            return (
              <div
                key={`slot-${slotPos}`}
                style={{
                  position: "absolute",
                  left: `${slotPos * CARD_STEP}px`,
                  top: 0,
                }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={`card-${test.id}`}
                    initial={{
                      opacity: 0,
                      filter: "blur(12px)",
                      x: slideOffsetEnter,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      filter: "blur(12px)",
                      x: slideOffsetExit,
                    }}
                    transition={{
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <AdvanceTestCard test={test} />
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>


      {/* Navigation Arrows */}
      <button
        type="button"
        className={`${styles.arrowBtn} ${styles.arrowBtnLeft} ${isLight ? styles.arrowBtnLight : ""} ${styles.desktopOnly}`}
        onClick={goPrev}
        aria-label="Previous test"
      >
        <ChevronLeft size={22} strokeWidth={2} />
      </button>

      <button
        type="button"
        className={`${styles.arrowBtn} ${styles.arrowBtnRight} ${isLight ? styles.arrowBtnLight : ""} ${styles.desktopOnly}`}
        onClick={goNext}
        aria-label="Next test"
      >
        <ChevronRight size={22} strokeWidth={2} />
      </button>

      {/* DESKTOP CAROUSEL INDICATOR */}
      <div className={`${styles.desktopNavigator} ${styles.desktopOnly}`}>
        {tests.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.navDot} ${isLight ? styles.navDotLight : ""} ${
              i === centerIndex ? `${styles.navDotActive} ${isLight ? styles.navDotActiveLight : ""}` : ""
            }`}
            onClick={() => goToIndex(i)}
            aria-label={`Go to test ${i + 1}`}
            aria-current={i === centerIndex ? "true" : undefined}
          />
        ))}
      </div>

      {/* MOBILE / TABLET NATIVE SWIPE LAYOUT */}
      <div
        ref={scrollContainerRef}
        onScroll={handleMobileScroll}
        className={`${styles.mobileCarouselContainer} ${styles.mobileOnly}`}
      >
        {tests.map((test, index) => (
          <MobileAdvanceTestCard
            key={`mobile-test-${test.id}`}
            test={test}
            index={index}
            onVisible={setMobileActiveIndex}
          />
        ))}
      </div>

      <div className={`${styles.mobileNavigator} ${styles.mobileOnly}`}>
        {tests.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.navDot} ${isLight ? styles.navDotLight : ""} ${
              i === mobileActiveIndex ? `${styles.navDotActive} ${isLight ? styles.navDotActiveLight : ""}` : ""
            }`}
            onClick={() => scrollToMobileCard(i)}
            aria-label={`Go to test ${i + 1}`}
            aria-current={i === mobileActiveIndex ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}
