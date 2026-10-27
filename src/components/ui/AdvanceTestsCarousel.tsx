"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdvanceTestItem, ADVANCE_TESTS_DATA } from "@/data/advanceTestsData";
import styles from "./AdvanceTestsCarousel.module.css";

interface AdvanceTestsCarouselProps {
  tests?: AdvanceTestItem[];
}

export default function AdvanceTestsCarousel({ tests = ADVANCE_TESTS_DATA }: AdvanceTestsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Update scroll button states based on scroll position
  const updateScrollState = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateScrollState();
    track.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [tests.length]);

  const getStepWidth = () => {
    if (!trackRef.current || !trackRef.current.firstElementChild) return 572;
    const firstCard = trackRef.current.firstElementChild as HTMLElement;
    const trackStyle = window.getComputedStyle(trackRef.current);
    const gap = parseFloat(trackStyle.gap) || 44;
    return firstCard.offsetWidth + gap;
  };

  const scrollByCard = (direction: "left" | "right") => {
    if (!trackRef.current) return;
    const stepWidth = getStepWidth();
    trackRef.current.scrollBy({
      left: direction === "right" ? stepWidth : -stepWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className={styles.carouselWrapper}>
      {/* Navigation Arrows */}
      <button
        type="button"
        className={`${styles.arrowBtn} ${styles.arrowBtnLeft}`}
        onClick={() => scrollByCard("left")}
        disabled={!canScrollLeft}
        aria-label="Previous test"
      >
        <ChevronLeft size={22} strokeWidth={2.2} />
      </button>

      <button
        type="button"
        className={`${styles.arrowBtn} ${styles.arrowBtnRight}`}
        onClick={() => scrollByCard("right")}
        disabled={!canScrollRight}
        aria-label="Next test"
      >
        <ChevronRight size={22} strokeWidth={2.2} />
      </button>

      {/* Strictly 1-Row Horizontal Carousel Track */}
      <div ref={trackRef} className={styles.scrollTrack}>
        {tests.map((test, index) => (
          <div key={test.id} className={styles.cardItem}>
            <motion.div
              className={styles.card}
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.05 * index, ease: [0.16, 1, 0.3, 1] }}
            >
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

              {/* Glassmorphic Gradient Overlay over bottom half */}
              <div className={styles.bottomOverlay} />

              {/* Card Body Layered over Image */}
              <div className={styles.cardBody}>
                <div className={styles.bottomContent}>
                  <div className={styles.cardContent}>
                    <h3 className={styles.testTitle} title={test.name}>
                      {test.name}
                    </h3>
                    <p className={styles.testDesc} title={test.desc}>
                      {test.desc}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
