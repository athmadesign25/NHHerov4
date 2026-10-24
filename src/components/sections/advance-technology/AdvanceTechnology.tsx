"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import styles from "./AdvanceTechnology.module.css";

export interface TechnologyItem {
  id: string;
  name: string;
  desc: string;
  image: string;
  ctaLink?: string;
  ctaText?: string;
}

export const ADVANCE_TECHNOLOGY_ITEMS: TechnologyItem[] = [
  {
    id: "cyberknife",
    name: "CyberKnife® S7 Radiosurgery",
    desc: "Robotic stereotactic radiosurgery delivering high-dose targeted radiation to tumours with sub-millimetre accuracy while sparing healthy surrounding tissues.",
    image: "/images/procedures/cyberknife_hd.jpg",
    ctaLink: "#overview",
    ctaText: "Know more",
  },
  {
    id: "pet-ct",
    name: "Digital Biograph Vision PET-CT",
    desc: "Advanced digital PET-CT scanning for precise cellular-level cancer detection, staging, and real-time monitoring of therapy response.",
    image: "/images/procedures/petct_hd.jpg",
    ctaLink: "#overview",
    ctaText: "Know more",
  },
  {
    id: "genomics",
    name: "Comprehensive Genomic Profiling",
    desc: "Next-generation sequencing identifying specific tumour DNA mutations to guide personalised targeted and immunotherapy plans.",
    image: "/images/procedures/genomics_hd.jpg",
    ctaLink: "#overview",
    ctaText: "Know more",
  },
  {
    id: "linac-radiation",
    name: "TrueBeam™ Linear Accelerator",
    desc: "Fast, precise image-guided radiotherapy (IGRT) and rapid-arc delivery that treats tumours with pinpoint accuracy in minutes.",
    image: "/images/procedures/radiation_oncology_hd.jpg",
    ctaLink: "#overview",
    ctaText: "Know more",
  },
  {
    id: "robotic-surgery",
    name: "Da Vinci Xi® Robotic Surgery",
    desc: "Multi-quadrant robotic surgical system enabling minimally invasive tumour removal with 3D-HD magnification and tremor-free instruments.",
    image: "/images/procedures/procedure_surgery.png",
    ctaLink: "#overview",
    ctaText: "Know more",
  },
  {
    id: "3t-mri",
    name: "3T High-Field MRI Spectroscopy",
    desc: "High-gradient clinical magnetic resonance imaging offering sub-millimetre structural resolution for neuro, pelvic, and musculoskeletal oncology.",
    image: "/images/procedures/procedure_mri.png",
    ctaLink: "#overview",
    ctaText: "Know more",
  },
];

interface AdvanceTechnologyProps {
  technologies?: TechnologyItem[];
}

export default function AdvanceTechnology({
  technologies = ADVANCE_TECHNOLOGY_ITEMS,
}: AdvanceTechnologyProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const DURATION_SECONDS = 3.2;

  // Auto-advance timer: moves to next card every 5 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % technologies.length);
    }, DURATION_SECONDS * 1000);

    return () => clearInterval(interval);
  }, [isPaused, activeIndex, technologies.length]);

  // Scroll-linked expansion to fill full screen width with Why Choose Us margins
  const { scrollYProgress: enterProgress } = useScroll({
    target: containerRef,
    offset: ["start 92%", "start 25%"],
  });

  const gridScale = useTransform(enterProgress, [0, 1], [0.92, 1.0]);
  const gridWidth = useTransform(enterProgress, [0, 1], ["92%", "100%"]);
  const gridBlur = useTransform(enterProgress, [0, 0.4], ["blur(12px)", "blur(0px)"]);

  const activeTech = technologies[activeIndex] || technologies[0];

  return (
    <div
      className={styles.wrapper}
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div
        className={styles.bentoExpandWrapper}
        style={{
          scale: gridScale,
          width: gridWidth,
          filter: gridBlur,
        }}
      >
        {/* Outer Card Shell with soft rounded corners */}
        <div className={styles.cardShell}>
        {/* LEFT COLUMN: Interactive List */}
        <div className={styles.leftCol}>
          <div className={styles.itemsList} role="tablist">
            {technologies.map((item, index) => {
              const isActive = index === activeIndex;

              return (
                <div
                  key={item.id}
                  className={`${styles.itemRow} ${isActive ? styles.itemRowActive : ""}`}
                  onClick={() => setActiveIndex(index)}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveIndex(index);
                    }
                  }}
                >
                  {/* Top line of the item: title and button */}
                  <div className={styles.itemHeader}>
                    <div className={styles.itemTitleGroup}>
                      <h3 className={styles.itemTitle}>{item.name}</h3>
                    </div>

                    {/* Button icon: circular arrow, dark filled with right arrow when active */}
                    <Link
                      href={item.ctaLink || "#overview"}
                      className={`${styles.actionBtn} ${isActive ? styles.actionBtnActive : ""}`}
                      onClick={(e) => {
                        // Allow click to trigger selection or link navigation
                        e.stopPropagation();
                      }}
                      aria-label={`${item.name} - ${item.ctaText || "Know more"}`}
                    >
                      {isActive ? (
                        <ArrowRight size={16} />
                      ) : (
                        <ArrowUpRight size={15} />
                      )}
                    </Link>
                  </div>

                  {/* No per-row expanded block — description lives in descPanel below */}
                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT COLUMN: Full-Bleed Image Frame with Bottom Floating Title */}
        <div className={styles.rightCol}>
          <div className={styles.imageFrame}>
            <AnimatePresence initial={false}>
              <motion.div
                key={activeTech.id}
                className={styles.imageSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <img
                  src={activeTech.image}
                  alt={activeTech.name}
                  className={styles.slideImg}
                />

                {/* Subtle vignette for text readability */}
                <div className={styles.imgGradient} />

                {/* Bottom Glass Blur for text readability */}
                <div className={styles.bottomGlass} />

                {/* Bottom Overlay: Title + Description */}
                <div className={styles.imageBottomBar}>
                  <motion.h2
                    className={styles.imageBigTitle}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  >
                    {activeTech.name}
                  </motion.h2>
                  <motion.p
                    className={styles.imageDesc}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.22 }}
                  >
                    {activeTech.desc}
                  </motion.p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  );
}
