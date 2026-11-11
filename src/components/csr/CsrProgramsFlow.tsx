"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
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

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Card 1 (second card)
  const card1Y = useTransform(scrollYProgress, [0.15, 0.35], ["100%", "0%"]);
  const card1Opacity = useTransform(scrollYProgress, [0.14, 0.22, 0.35], [0, 1, 1]);
  const card1Scale = useTransform(scrollYProgress, [0.15, 0.35], [0.95, 1]);
  const card1PointerEvents = useTransform(scrollYProgress, (v) => (v >= 0.2 ? "auto" : "none"));

  // Card 2 (third card)
  const card2Y = useTransform(scrollYProgress, [0.44, 0.64], ["100%", "0%"]);
  const card2Opacity = useTransform(scrollYProgress, [0.43, 0.51, 0.64], [0, 1, 1]);
  const card2Scale = useTransform(scrollYProgress, [0.44, 0.64], [0.95, 1]);
  const card2PointerEvents = useTransform(scrollYProgress, (v) => (v >= 0.48 ? "auto" : "none"));

  // Card 3 (fourth card - completes 100% docking over Card 3)
  const card3Y = useTransform(scrollYProgress, [0.72, 0.90], ["100%", "0%"]);
  const card3Opacity = useTransform(scrollYProgress, [0.71, 0.79, 0.90], [0, 1, 1]);
  const card3Scale = useTransform(scrollYProgress, [0.72, 0.90], [0.95, 1]);
  const card3PointerEvents = useTransform(scrollYProgress, (v) => (v >= 0.76 ? "auto" : "none"));

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
          top: 22,
          y: card1Y,
          opacity: card1Opacity,
          scale: card1Scale,
          pointerEvents: card1PointerEvents,
        };
      case 2:
        return {
          zIndex: 3,
          top: 44,
          y: card2Y,
          opacity: card2Opacity,
          scale: card2Scale,
          pointerEvents: card2PointerEvents,
        };
      case 3:
      default:
        return {
          zIndex: 4,
          top: 66,
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

                      {/* Outlined "Know More" Action Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedProgram(prog)}
                        className={styles.knowMoreBtn}
                        aria-label={`Know more about ${prog.title}`}
                      >
                        <span>Know More</span>
                        <ArrowRight size={14} />
                      </button>
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
