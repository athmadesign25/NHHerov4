"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { HospitalItem } from "@/data/hospitalsData";
import styles from "./HospitalCarousel.module.css";

interface HospitalCarouselProps {
  hospitals: HospitalItem[];
  theme?: "dark" | "light";
}

const CARD_STEP = 572; // 528px card width + 44px gap

export interface HospitalCardProps {
  hosp: HospitalItem;
  cardIndex?: number;
  priority?: boolean;
  isLight?: boolean;
  className?: string;
}

export function HospitalCard({ hosp, cardIndex = 0, priority = false, isLight = false, className }: HospitalCardProps) {
  const images = hosp.images && hosp.images.length > 0 ? hosp.images : [hosp.image];
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Reset image index when hospital changes
  useEffect(() => {
    setCurrentImgIndex(0);
  }, [hosp.id]);

  // Automatic image rotation (changes every 3.5s, pauses on user hover)
  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [images.length, isHovered]);

  return (
    <div
      className={`${styles.card} ${isLight ? styles.cardLight : ""} ${className || ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageWrap}>
        <AnimatePresence initial={false}>
          <motion.div
            key={`${hosp.id}-${currentImgIndex}`}
            className={styles.imageSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={images[currentImgIndex]}
              alt={`${hosp.name} - View ${currentImgIndex + 1}`}
              fill
              sizes="(max-width: 768px) 85vw, 528px"
              className={styles.image}
              priority={priority}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating indicators for hospital photos */}
      {images.length > 1 && (
        <div className={styles.imageIndicators} aria-label="Hospital photos">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles.indicatorPill} ${
                idx === currentImgIndex ? styles.indicatorPillActive : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentImgIndex(idx);
              }}
              aria-label={`View photo ${idx + 1} of ${hosp.name}`}
            />
          ))}
        </div>
      )}

      {/* Gradient & Glass Blur Overlay over the bottom half */}
      <div className={styles.bottomOverlay} />

      {/* Content layered directly over the image */}
      <div className={styles.cardBody}>
        <div className={styles.bottomContent}>
          <div className={styles.cardContent}>
            <Link href={hosp.href} className={styles.hospitalTitle} title={hosp.name}>
              {hosp.name}
            </Link>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${hosp.name}, ${hosp.address || "Bengaluru"}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.addressRow}
              title={`Open ${hosp.name} on Google Maps`}
              aria-label={`Open Google Maps for ${hosp.name}`}
            >
              <MapPin className={styles.mapPinIcon} aria-hidden />
              <span className={styles.hospitalAddress} title={hosp.address}>
                {hosp.address || "Bengaluru, Karnataka"}
              </span>
            </a>
          </div>

          <div className={styles.cardActions}>
            <Link href={hosp.appointmentHref} className={styles.bookBtn}>
              Book Appointment
            </Link>
            <a
              href={`tel:${hosp.phone}`}
              className={styles.callBtn}
              aria-label={`Call ${hosp.name}`}
            >
              <Phone size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HospitalCarousel({ hospitals, theme = "dark" }: HospitalCarouselProps) {
  const isLight = theme === "light";
  const cardsCount = hospitals.length;
  // By default, card 1 (2nd card) sits at center slot (slot 2)
  const [centerIndex, setCenterIndex] = useState(1);
  const [direction, setDirection] = useState(1);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(1);

  const goNext = () => {
    setDirection(1);
    setCenterIndex((prev) => (prev + 1) % cardsCount);
  };

  const goPrev = () => {
    setDirection(-1);
    setCenterIndex((prev) => (prev - 1 + cardsCount) % cardsCount);
  };

  // 5 slots centered on slot 2
  const NUM_SLOTS = 5;
  const slots = Array.from({ length: NUM_SLOTS }, (_, slotPos) => {
    const offset = slotPos - 2;
    const realIndex = ((centerIndex + offset) % cardsCount + cardsCount) % cardsCount;
    return { slotPos, realIndex };
  });

  return (
    <div className={`${styles.carouselContainer} ${isLight ? styles.carouselContainerLight : ""}`}>
      {/* DESKTOP LAYOUT WITH 5-SLOT INFINITE CAROUSEL */}
      <div className={`${styles.trackViewport} ${styles.desktopOnly}`}>
        <div className={styles.track}>
          {slots.map(({ slotPos, realIndex }) => {
            const hosp = hospitals[realIndex];
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
                    key={`card-${hosp.id}`}
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
                    <HospitalCard hosp={hosp} cardIndex={realIndex} priority={slotPos === 2} isLight={isLight} />
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edge fades matching the hospital section background in dark mode only */}
      {!isLight && (
        <>
          <div className={`${styles.edgeFade} ${styles.edgeFadeLeft} ${styles.desktopOnly}`} aria-hidden />
          <div className={`${styles.edgeFade} ${styles.edgeFadeRight} ${styles.desktopOnly}`} aria-hidden />
        </>
      )}

      {/* Navigation Arrows */}
      <button
        type="button"
        className={`${styles.arrowBtn} ${styles.arrowBtnLeft} ${isLight ? styles.arrowBtnLight : ""} ${styles.desktopOnly}`}
        onClick={goPrev}
        aria-label="Previous hospital"
      >
        <ChevronLeft size={22} strokeWidth={2} />
      </button>

      <button
        type="button"
        className={`${styles.arrowBtn} ${styles.arrowBtnRight} ${isLight ? styles.arrowBtnLight : ""} ${styles.desktopOnly}`}
        onClick={goNext}
        aria-label="Next hospital"
      >
        <ChevronRight size={22} strokeWidth={2} />
      </button>

      {/* MOBILE / TABLET NATIVE SWIPE LAYOUT */}
      <div className={`${styles.mobileCarouselContainer} ${styles.mobileOnly}`}>
        {hospitals.map((hosp, index) => (
          <div key={`mobile-hosp-${hosp.id}`} className={styles.mobileCarouselItem}>
            <HospitalCard hosp={hosp} cardIndex={index} isLight={isLight} />
          </div>
        ))}
      </div>

      <div className={`${styles.mobileNavigator} ${styles.mobileOnly}`}>
        {hospitals.map((_, i) => (
          <div
            key={i}
            className={`${styles.navDot} ${isLight ? styles.navDotLight : ""} ${
              i === mobileActiveIndex ? (isLight ? styles.navDotActiveLight : styles.navDotActive) : ""
            }`}
            onClick={() => setMobileActiveIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
