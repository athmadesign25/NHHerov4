"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./WhyChooseNH.module.css";

const stackImages = [
  "/clinical-excellence.png",
  "/patient-first-support.png",
  "/advanced-technology.png",
];

const doctorsList = [
  { id: "doc1", image: "/doc1.png" },
  { id: "doc2", image: "/doc2.png" },
  { id: "doc3", image: "/doc3.png" },
  { id: "doc4", image: "/doc4.png" },
];

export default function WhyChooseNH() {
  // Video Refs
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video5Ref = useRef<HTMLVideoElement>(null);

  // Stack gallery state for Card 2
  const [stackIndex, setStackIndex] = useState(0);
  const [isCard2Hovered, setIsCard2Hovered] = useState(false);

  // Doctor stack state for Card 3
  const [docIndex, setDocIndex] = useState(0);
  const [isCard3Hovered, setIsCard3Hovered] = useState(false);

  // Card 1 hover video playback
  const handleCard1MouseEnter = () => {
    video1Ref.current?.play().catch(() => {});
  };
  const handleCard1MouseLeave = () => {
    video1Ref.current?.pause();
  };

  // Card 5 hover video playback
  const handleCard5MouseEnter = () => {
    video5Ref.current?.play().catch(() => {});
  };
  const handleCard5MouseLeave = () => {
    video5Ref.current?.pause();
  };

  // Card 2 stack loop on hover
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCard2Hovered) {
      interval = setInterval(() => {
        setStackIndex((prev) => (prev + 1) % stackImages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isCard2Hovered]);

  // Card 3 doctor flip loop on hover
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCard3Hovered) {
      interval = setInterval(() => {
        setDocIndex((prev) => (prev + 1) % doctorsList.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isCard3Hovered]);

  return (
    <section className={styles.section} id="WhyChooseNH_section">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className="section-eyebrow">WHY CHOOSE US</div>
          <h2 className={styles.sectionTitle}>Why Choose Narayana Health</h2>
        </div>

        {/* Bento Grid */}
        <div className={styles.bentoGrid}>
          {/* CARD 1: Patient-First Support (Top Left) */}
          <div
            className={styles.card1}
            onMouseEnter={handleCard1MouseEnter}
            onMouseLeave={handleCard1MouseLeave}
          >
            <div className={styles.cardHeaderUnit}>
              <h3 className={styles.cardTitle}>Patient-First Support</h3>
              <p className={styles.cardSubtitle}>
                Clear communication and care navigation for every family
              </p>
            </div>

            <div className={styles.videoWrapper1}>
              <video
                ref={video1Ref}
                src="/0_Head_Setting_1280x720.mp4"
                className={styles.cardVideo1}
                muted
                loop
                playsInline
                preload="metadata"
              />
              <div className={styles.videoOverlayBlend1} />
            </div>
          </div>

          {/* CARD 2: Clinical Excellence (Top Middle) */}
          <div
            className={styles.card2}
            onMouseEnter={() => setIsCard2Hovered(true)}
            onMouseLeave={() => setIsCard2Hovered(false)}
          >
            <div className={styles.cardHeaderUnit}>
              <h3 className={styles.cardTitle}>Clinical Excellence</h3>
              <p className={styles.cardSubtitle}>
                Protocols and tracked outcomes for safer recovery paths
              </p>
            </div>

            {/* Stack of 3 Cards Gallery */}
            <div className={styles.stackGalleryArea}>
              {stackImages.map((imgSrc, idx) => {
                const positionIndex = (idx - stackIndex + 3) % 3;
                return (
                  <motion.div
                    key={imgSrc}
                    className={styles.stackCard}
                    animate={{
                      scale: positionIndex === 0 ? 1.0 : positionIndex === 1 ? 0.88 : 0.76,
                      y: positionIndex === 0 ? 0 : positionIndex === 1 ? -28 : -54,
                      zIndex: positionIndex === 0 ? 3 : positionIndex === 1 ? 2 : 1,
                      opacity: positionIndex === 0 ? 1.0 : positionIndex === 1 ? 0.85 : 0.70,
                    }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      backgroundImage: `url('${imgSrc}')`,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* CARD 3: Top Medical Experts (Top Right) */}
          <div
            className={styles.card3}
            onMouseEnter={() => setIsCard3Hovered(true)}
            onMouseLeave={() => setIsCard3Hovered(false)}
          >
            <div className={styles.cardHeaderUnit}>
              <h3 className={styles.cardTitle}>Top Medical Experts</h3>
              <p className={styles.cardSubtitle}>
                Senior specialists for complex procedures and continuity of care
              </p>
            </div>

            {/* Horizontal Doctor Profile Cards Stack */}
            <div className={styles.doctorStackArea}>
              {doctorsList.map((doc, idx) => {
                const pos = (idx - docIndex + 4) % 4;
                return (
                  <motion.div
                    key={doc.id}
                    className={styles.doctorTile}
                    animate={{
                      x: pos * 28,
                      zIndex: 4 - pos,
                      scale: 1 - pos * 0.04,
                    }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <img src={doc.image} alt="Doctor profile" className={styles.doctorImage} />
                  </motion.div>
                );
              })}
            </div>

            {/* Stat Box Overlay Right Side */}
            <div className={styles.card3StatBox}>
              <span className={styles.statMetric3}>4500+</span>
              <span className={styles.statSubtitle3}>
                Doctors and team trained on standard protocols
              </span>
            </div>
          </div>

          {/* CARD 4: Our Accreditations (Bottom Left, Spans 2 Cols) */}
          <div className={styles.card4}>
            <div className={styles.cardHeaderUnitNoSub}>
              <h3 className={styles.cardTitle}>Our Accreditations</h3>
            </div>

            <div className={styles.accreditationsRow}>
              {/* NABH */}
              <div className={styles.accreditationItem}>
                <div className={`${styles.logoCircleContainer} ${styles.nabhContainer}`}>
                  <img
                    src="/NABH certified nursing services logo.png"
                    alt="NABH Certified"
                    className={styles.nabhLogo}
                  />
                </div>
                <span className={styles.accreditationLabel}>
                  NABH Certified Nursing Services
                </span>
              </div>

              {/* CAP */}
              <div className={styles.accreditationItem}>
                <div className={styles.capRectContainer}>
                  <img
                    src="/College of American Pathologists accredited logo.png"
                    alt="CAP Accredited"
                    className={styles.capLogo}
                  />
                </div>
                <span className={styles.accreditationLabel}>
                  CAP Accredited
                </span>
              </div>

              {/* NABL */}
              <div className={styles.accreditationItem}>
                <div className={styles.logoCircleContainer}>
                  <img
                    src="/NABL accreditation board logo.png"
                    alt="NABL Accredited"
                    className={styles.nablLogo}
                  />
                </div>
                <span className={styles.accreditationLabel}>
                  NABL Accredited Laboratories
                </span>
              </div>

              {/* JCI */}
              <div className={styles.accreditationItem}>
                <div className={styles.logoCircleContainer}>
                  <img
                    src="/Joint Commission International accreditation logo.png"
                    alt="JCI Accredited"
                    className={styles.jciLogo}
                  />
                </div>
                <span className={styles.accreditationLabel}>
                  JCI Accredited
                </span>
              </div>
            </div>
          </div>

          {/* CARD 5: Woman Nurse Video & Cancer Surgeries (Bottom Right) */}
          <div
            className={styles.card5}
            onMouseEnter={handleCard5MouseEnter}
            onMouseLeave={handleCard5MouseLeave}
          >
            <video
              ref={video5Ref}
              src="/4863544_Woman_Nurse_1280x720.mp4"
              className={styles.cardVideo5}
              muted
              loop
              playsInline
              preload="metadata"
            />

            {/* Top & Bottom Radial Gradient Overlays */}
            <div className={styles.topRadialOverlay5} />
            <div className={styles.bottomRadialOverlay5} />

            {/* Stat Box Bottom Right */}
            <div className={styles.card5StatBox}>
              <img
                src="/surgeryicon.png"
                alt="Surgery Icon"
                className={styles.surgeryIcon}
              />
              <div className={styles.statTextStack5}>
                <span className={styles.statMetric5}>8000+</span>
                <span className={styles.statSubtitle5}>
                  Cancer Surgeries Performed Annually
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
