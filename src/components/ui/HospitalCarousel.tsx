"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { HospitalItem } from "@/data/hospitalsData";
import styles from "./HospitalCarousel.module.css";

interface HospitalCarouselProps {
  hospitals: HospitalItem[];
}

const CARD_STEP = 572; // 528px card width + 44px gap

export default function HospitalCarousel({ hospitals }: HospitalCarouselProps) {
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
    <div className={styles.carouselContainer}>
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
                    key={`card-${realIndex}`}
                    initial={{
                      opacity: 0,
                      filter: "blur(8px)",
                      x: slideOffsetEnter,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      x: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      filter: "blur(8px)",
                      x: slideOffsetExit,
                      scale: 0.97,
                    }}
                    transition={{
                      duration: 0.55,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <div className={styles.card}>
                      <div className={styles.imageWrap}>
                        <Image
                          src={hosp.image}
                          alt={hosp.name}
                          fill
                          sizes="(max-width: 768px) 85vw, 528px"
                          className={styles.image}
                          loading="lazy"
                        />
                      </div>

                      {/* Gradient & Glass Blur Overlay over the bottom half */}
                      <div className={styles.bottomOverlay} />

                      {/* Content layered directly over the image */}
                      <div className={styles.cardBody}>
                        <div className={styles.bottomContent}>
                          <div className={styles.cardContent}>
                            <Link href={hosp.href} className={styles.hospitalTitle} title={hosp.name}>
                              {hosp.name}
                            </Link>
                            <p className={styles.hospitalAddress} title={hosp.address}>
                              {hosp.address || "Bengaluru, Karnataka"}
                            </p>
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
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dark edge fades matching the hospital section background */}
      <div className={`${styles.edgeFade} ${styles.edgeFadeLeft} ${styles.desktopOnly}`} aria-hidden />
      <div className={`${styles.edgeFade} ${styles.edgeFadeRight} ${styles.desktopOnly}`} aria-hidden />

      {/* Navigation Arrows */}
      <button
        type="button"
        className={`${styles.arrowBtn} ${styles.arrowBtnLeft} ${styles.desktopOnly}`}
        onClick={goPrev}
        aria-label="Previous hospital"
      >
        <ChevronLeft size={22} strokeWidth={2} />
      </button>

      <button
        type="button"
        className={`${styles.arrowBtn} ${styles.arrowBtnRight} ${styles.desktopOnly}`}
        onClick={goNext}
        aria-label="Next hospital"
      >
        <ChevronRight size={22} strokeWidth={2} />
      </button>

      {/* MOBILE / TABLET NATIVE SWIPE LAYOUT */}
      <div className={`${styles.mobileCarouselContainer} ${styles.mobileOnly}`}>
        {hospitals.map((hosp, index) => (
          <div key={`mobile-hosp-${hosp.id}`} className={styles.mobileCarouselItem}>
            <div className={styles.card}>
              <div className={styles.imageWrap}>
                <Image
                  src={hosp.image}
                  alt={hosp.name}
                  fill
                  sizes="(max-width: 768px) 85vw, 528px"
                  className={styles.image}
                  loading="lazy"
                />
              </div>

              <div className={styles.bottomOverlay} />

              <div className={styles.cardBody}>
                <div className={styles.bottomContent}>
                  <div className={styles.cardContent}>
                    <Link href={hosp.href} className={styles.hospitalTitle} title={hosp.name}>
                      {hosp.name}
                    </Link>
                    <p className={styles.hospitalAddress} title={hosp.address}>
                      {hosp.address || "Bengaluru, Karnataka"}
                    </p>
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
          </div>
        ))}
      </div>

      <div className={`${styles.mobileNavigator} ${styles.mobileOnly}`}>
        {hospitals.map((_, i) => (
          <div
            key={i}
            className={`${styles.navDot} ${i === mobileActiveIndex ? styles.navDotActive : ""}`}
            onClick={() => setMobileActiveIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
