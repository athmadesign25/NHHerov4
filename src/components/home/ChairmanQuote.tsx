"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./ChairmanQuote.module.css";

export default function ChairmanQuote() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ normX: 0, normY: 0, rawX: -1000, rawY: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const secRect = sectionRef.current.getBoundingClientRect();
    const secMouseX = e.clientX - secRect.left;
    const secMouseY = e.clientY - secRect.top;

    const normX = (secMouseX - secRect.width / 2) / (secRect.width / 2);
    const normY = (secMouseY - secRect.height / 2) / (secRect.height / 2);

    let rawX = -1000;
    let rawY = -1000;
    if (cardRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      rawX = e.clientX - cardRect.left;
      rawY = e.clientY - cardRect.top;
    }

    setMousePos({ normX, normY, rawX, rawY });
  };

  // Parallax shifts when mouse is inside the Leadership section
  // Sideways (x) movement allowed; vertical (y) movement clamped to >= 0 (only moves downwards, never upwards)
  const parallaxX = isHovered ? mousePos.normX * -14 : 0;
  const parallaxY = isHovered ? Math.max(0, mousePos.normY * 12) : 0;

  return (
    <section 
      ref={sectionRef} 
      className={styles.section} 
      id="chairman-quote"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="container">
        <motion.div
          ref={cardRef}
          className={styles.cardWrapper}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Base 20px Outer Glass Border */}
          <div className={styles.outerGlassFrame} />

          {/* Mouse-tracking glass glow on 20px outer border layer */}
          <div
            className={styles.borderGlowFrame}
            style={{
              opacity: isHovered ? 0.85 : 0,
              background: `radial-gradient(280px circle at ${mousePos.rawX + 20}px ${mousePos.rawY + 20}px, rgba(255, 255, 255, 0.45) 0%, rgba(200, 225, 255, 0.20) 45%, transparent 80%)`,
            }}
          />

          {/* Inner Content Card */}
          <div className={styles.card}>
            {/* Left Column: Dark Typography */}
            <motion.div
              className={styles.content}
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.eyebrow}>
                LEADERSHIP
                <span className={styles.eyebrowLine} />
              </div>

              <motion.h2
                className={styles.quote}
                initial={{ opacity: 0, y: 22, filter: "blur(16px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              >
                Healthcare must move beyond buildings and beds.
              </motion.h2>

              <motion.p
                className={styles.body}
                initial={{ opacity: 0, y: 22, filter: "blur(16px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                The future lies in integrated systems that unite clinical excellence, digital
                intelligence, and human insight. When technology and care move as one, health shifts
                from episodic treatment to lifelong partnership, anticipating risk, enabling
                prevention, and creating a system that is connected, predictive, and truly
                transformative.
              </motion.p>
            </motion.div>

            {/* Right Column: Layered Chairman Portrait Composition */}
            <div className={styles.imageWrap}>
              <motion.div
                className={styles.imageFrame}
                initial={{ opacity: 0, x: 28, scale: 0.97 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              >
                {/* 1. Background Image */}
                <Image
                  src="/chairman-portrait-bg.png"
                  alt="Chairman background"
                  fill
                  sizes="(max-width: 768px) 100vw, 440px"
                  className={styles.portraitBg}
                />

                {/* 2. Layered Cutout Portrait with Section Mouse Parallax */}
                <motion.div
                  className={styles.portraitCutoutWrap}
                  style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}
                  animate={{
                    x: parallaxX,
                    y: parallaxY,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 22,
                    mass: 0.5,
                  }}
                >
                  <Image
                    src="/chairman-portrait-cutout.png"
                    alt="Dr. Devi Prasad Shetty"
                    fill
                    sizes="(max-width: 768px) 100vw, 440px"
                    className={styles.portraitCutout}
                    priority
                  />
                </motion.div>

                {/* 3. Name & Title Pill Overlay */}
                <div className={styles.identityPill}>
                  <span className={styles.name}>Dr. Devi Prasad Shetty</span>
                  <span className={styles.title}>Founder and Chairman, Narayana Health</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
