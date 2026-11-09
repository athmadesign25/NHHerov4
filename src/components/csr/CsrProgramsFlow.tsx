"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  Stethoscope,
  GraduationCap,
  School,
  Radio,
  Smartphone,
  Heart,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { CsrProgramItem } from "@/data/csrData";
import CsrProgramModal from "./CsrProgramModal";
import styles from "./CsrProgramsFlow.module.css";

interface CsrProgramsFlowProps {
  programs: CsrProgramItem[];
}

export default function CsrProgramsFlow({ programs }: CsrProgramsFlowProps) {
  const [selectedProgram, setSelectedProgram] = useState<CsrProgramItem | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const scrollProgress = useMotionValue(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);

    // Highly reliable scroll progress calculation:
    // Tracks exactly when .stackingTrack reaches the sticky dock top (92px)
    // and maps to 0.0 -> 1.0 until the track finishes scrolling.
    const updateScrollProgress = () => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const stickyTop = 92; // calc(var(--nav-height, 72px) + 20px)
      const stickyViewport = track.firstElementChild as HTMLElement | null;
      const viewportHeight = stickyViewport ? stickyViewport.offsetHeight : 620;
      const totalScrollableDistance = Math.max(1, track.offsetHeight - viewportHeight);
      const scrolled = stickyTop - rect.top;
      const currentProgress = Math.min(1, Math.max(0, scrolled / totalScrollableDistance));
      scrollProgress.set(currentProgress);
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });

    // Connect to Lenis smooth scroll instance
    const connectLenis = () => {
      const lenis = (window as any).lenis || (window as any).__lenis;
      if (lenis && typeof lenis.on === "function") {
        lenis.on("scroll", updateScrollProgress);
      }
    };
    connectLenis();
    const lenisTimer = setTimeout(connectLenis, 300);

    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("scroll", updateScrollProgress);
      clearTimeout(lenisTimer);
      const lenis = (window as any).lenis || (window as any).__lenis;
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", updateScrollProgress);
      }
    };
  }, [scrollProgress]);

  // Sequential Stacking Motion (Dramatic Bottom-to-Top Full Card Reveal):
  // Card 1 (index 0) sits at base top: 0px.
  // Card 2 (index 1): comes from bottom (100% -> 0%), fades in, and docks at top: 22px.
  // Card 3 (index 2): comes from bottom (100% -> 0%), fades in, and docks at top: 44px.
  // Card 4 (index 3): comes from bottom (100% -> 0%), fades in, and docks at top: 66px.

  // Card 2 (second initiative - index 1)
  const card1Y = useTransform(scrollProgress, [0.06, 0.32], ["100%", "0%"]);
  const card1Opacity = useTransform(scrollProgress, [0.06, 0.16, 0.32], [0, 1, 1]);
  const card1Scale = useTransform(scrollProgress, [0.06, 0.32], [0.94, 1]);
  const card1PointerEvents = useTransform(scrollProgress, (v) => (v >= 0.15 ? "auto" : "none"));

  // Card 3 (third initiative - index 2)
  const card2Y = useTransform(scrollProgress, [0.36, 0.62], ["100%", "0%"]);
  const card2Opacity = useTransform(scrollProgress, [0.36, 0.46, 0.62], [0, 1, 1]);
  const card2Scale = useTransform(scrollProgress, [0.36, 0.62], [0.94, 1]);
  const card2PointerEvents = useTransform(scrollProgress, (v) => (v >= 0.45 ? "auto" : "none"));

  // Card 4 (fourth initiative - index 3)
  const card3Y = useTransform(scrollProgress, [0.66, 0.92], ["100%", "0%"]);
  const card3Opacity = useTransform(scrollProgress, [0.66, 0.76, 0.92], [0, 1, 1]);
  const card3Scale = useTransform(scrollProgress, [0.66, 0.92], [0.94, 1]);
  const card3PointerEvents = useTransform(scrollProgress, (v) => (v >= 0.75 ? "auto" : "none"));

  const renderIcon = (name: string) => {
    switch (name) {
      case "camps":
        return <Stethoscope size={17} />;
      case "education":
        return <GraduationCap size={17} />;
      case "school":
        return <School size={17} />;
      case "radio":
        return <Radio size={17} />;
      case "mobile":
        return <Smartphone size={17} />;
      case "heart":
        return <Heart size={17} />;
      case "partnership":
        return <Building2 size={17} />;
      case "scholarship":
        return <GraduationCap size={17} />;
      default:
        return <CheckCircle2 size={17} />;
    }
  };

  const getCardMotionStyle = (index: number) => {
    if (isMobile) {
      return {
        position: "relative" as const,
        top: "auto",
        opacity: 1,
        y: 0,
        scale: 1,
        pointerEvents: "auto" as const,
      };
    }

    switch (index) {
      case 0:
        return {
          zIndex: 1,
          top: 0,
          opacity: 1,
          y: 0,
          scale: 1,
          pointerEvents: "auto" as const,
        };
      case 1:
        return {
          zIndex: 2,
          top: "22px",
          y: card1Y,
          opacity: card1Opacity,
          scale: card1Scale,
          pointerEvents: card1PointerEvents,
        };
      case 2:
        return {
          zIndex: 3,
          top: "44px",
          y: card2Y,
          opacity: card2Opacity,
          scale: card2Scale,
          pointerEvents: card2PointerEvents,
        };
      case 3:
      default:
        return {
          zIndex: 4,
          top: "66px",
          y: card3Y,
          opacity: card3Opacity,
          scale: card3Scale,
          pointerEvents: card3PointerEvents,
        };
    }
  };

  return (
    <section id="initiatives" className={styles.sectionWrapper} data-nav-theme="light">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.headerBlock}>
          <span className={styles.eyebrow}>FLAGSHIP CSR PROGRAMS</span>
          <h2 className={styles.sectionTitle}>Pioneering Grassroots Change</h2>
          <p className={styles.sectionSubtitle}>
            Four foundational initiatives driving measurable preventive health, educational upliftment, and community dialogue across rural India.
          </p>
        </div>

        {/* Pinned Folder Stacking Track: 100% complete docking, 0px empty void at end */}
        <div ref={trackRef} className={styles.stackingTrack}>
          <div className={styles.stickyViewport}>
            {programs.map((prog, index) => {
              const isImageRight = prog.imagePosition === "right";
              const motionStyle = getCardMotionStyle(index);

              return (
                <motion.div
                  key={prog.id}
                  className={styles.cardLayer}
                  style={motionStyle}
                >
                  <article
                    className={`${styles.stackedCard} ${isImageRight ? styles.imageRight : ""}`}
                  >
                    {/* Image Side: Full-Scale Photo with Gradient Scrim merging into the white text side */}
                    <div className={styles.imageSide}>
                      <Image
                        src={prog.image}
                        alt={prog.imageAlt}
                        fill
                        sizes="(max-width: 900px) 100vw, 600px"
                        className={styles.fullScaleImg}
                      />

                      {/* Directional Gradient Scrim that merges the image into the white panel */}
                      <div className={isImageRight ? styles.imageScrimRight : styles.imageScrimLeft} />

                      {prog.statBadge && (
                        <div className={styles.floatingStatBadge}>
                          <span className={styles.statNumber}>{prog.statBadge.number}</span>
                          <span className={styles.statLabel}>{prog.statBadge.label}</span>
                        </div>
                      )}
                    </div>

                    {/* Text Side: Pure White Background with Crisp High-Contrast Typography */}
                    <div className={styles.textSide}>
                      <div className={styles.itemEyebrow}>
                        <ShieldCheck size={14} />
                        <span>{prog.eyebrow}</span>
                      </div>

                      <h3 className={styles.itemTitle}>{prog.title}</h3>

                      <p className={styles.itemDesc}>{prog.description}</p>

                      {/* Bullet Points with Badges */}
                      <div className={styles.pointsList}>
                        {prog.points.map((pt, pIdx) => (
                          <div key={pIdx} className={styles.pointItem}>
                            <div className={styles.pointIconBadge}>
                              {renderIcon(pt.iconName)}
                            </div>
                            <div className={styles.pointContent}>
                              <h4 className={styles.pointHeading}>{pt.title}</h4>
                              <p className={styles.pointBody}>{pt.body}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Solid Rounded Rectangle "Know More" Link CTA to Detail Page */}
                      <Link
                        href={`/csr/${prog.id}`}
                        className={styles.knowMoreBtn}
                        aria-label={`Read full initiative details on ${prog.title}`}
                      >
                        <span>Know More</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Program Detail Modal */}
      <CsrProgramModal
        program={selectedProgram}
        onClose={() => setSelectedProgram(null)}
      />
    </section>
  );
}
