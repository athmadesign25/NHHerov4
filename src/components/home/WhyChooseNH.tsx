"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import React, { useRef } from "react";
import { Award, Microscope, Stethoscope, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import styles from "./WhyChooseNH.module.css";

import Image from "next/image";

const featureCards = [
  {
    image: "/whychoose/excellence.png",
    title: "Clinical Excellence",
    descriptionLines: ["Protocols and tracked outcomes", "for safer recovery paths"],
  },
  {
    image: "/whychoose/experts.png",
    title: "Top Medical Experts",
    descriptionLines: ["Senior specialists for complex", "procedures and continuity of care"],
  },
  {
    image: "/whychoose/technology.png",
    title: "Advanced Technology",
    descriptionLines: ["Modern diagnostics and surgical", "platforms for precision treatment"],
  },
  {
    image: "/whychoose/support.png",
    title: "Patient-First Support",
    descriptionLines: ["Clear communication and care", "navigation for every family"],
  },
];

const accreditations = [
  {
    key: "jci",
    title: "JCI Accredited",
    short: "JCI",
    logo: "/accreditations/jci.png",
    alt: "Joint Commission International accreditation logo",
  },
  {
    key: "nabh",
    title: "NABH Certified Nursing Services",
    short: "NABH",
    logo: "/accreditations/nabh.png",
    alt: "NABH certified nursing services logo",
  },
  {
    key: "nabl",
    title: "NABL Accredited Laboratories",
    short: "NABL",
    logo: "/accreditations/nabl.png",
    alt: "NABL accreditation board logo",
  },
  {
    key: "cap",
    title: "CAP Accredited",
    short: "CAP",
    logo: "/accreditations/cap.png",
    alt: "College of American Pathologists accredited logo",
  },
];

export default function WhyChooseNH() {
  const [failedLogos, setFailedLogos] = React.useState<Record<string, boolean>>({});
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Smooth the scroll progress so the line animation starts slowly and feels fluid
  const smoothScrollYProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 15,
    restDelta: 0.001,
  });

  // Create a reveal progress from 0 to 115 (to ensure the mask completely clears the bottom)
  const revealProgress = useTransform(smoothScrollYProgress, [0.15, 1], [0, 115]);
  
  // Create a smooth fading mask for the tip of the line
  const maskImage = useTransform(
    revealProgress,
    (p) => `linear-gradient(to bottom, black ${Math.max(0, p - 15)}%, transparent ${p}%)`
  );

  // Background dot grid parallax (moves down slowly while scrolling down)
  const bgYTransform = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  // Parallax offsets for a dynamic staggered scroll feel (intensified)
  const yTransforms = [
    useTransform(scrollYProgress, [0, 1], [0, -100]),
    useTransform(scrollYProgress, [0, 1], [0, -260]),
    useTransform(scrollYProgress, [0, 1], [0, -140]),
    useTransform(scrollYProgress, [0, 1], [0, -320]),
  ];

  // Internal parallax for the images (opposing drag effect)
  // Normalized to [0, 60] so the gap between the image and text remains consistent across all cards
  const imageYTransforms = [
    useTransform(scrollYProgress, [0, 1], [0, 60]),
    useTransform(scrollYProgress, [0, 1], [0, 60]),
    useTransform(scrollYProgress, [0, 1], [0, 60]),
    useTransform(scrollYProgress, [0, 1], [0, 60]),
  ];

  return (
    <section ref={sectionRef} className={`section ${styles.section}`} id="why-choose-nh">
      <motion.div className={styles.dotGridBackground} style={{ y: bgYTransform }} />
      <div className="container">
        <div className={styles.specialitiesCtaWrap}>
          <Link href="/specialities" className={styles.specialitiesCta}>
            Explore All Specialities <ArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.header}>
          <div className="section-eyebrow" style={{ color: "#ffffff" }}>BEST IN HEALTHCARE</div>
          <h2 className="section-title">Why Choose Narayana Health?</h2>
          <p className={`section-subtitle ${styles.headerSubtitle}`}>
            Where your health &amp; well-being comes first, always.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.connectorTrack}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.connectorSvg}>
              <defs>
                <linearGradient id="glowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="100%" stopColor="var(--color-emergency)" />
                </linearGradient>
              </defs>
              {/* Random, organic curve connecting the staggered cards */}
              <path 
                d="M 30,5 C 70,20 85,35 60,45 C 30,55 15,70 40,85 C 60,95 70,100 50,100" 
                className={styles.svgTrack}
              />
              {/* Glowing animated fill with soft faded tip */}
              <motion.path 
                d="M 30,5 C 70,20 85,35 60,45 C 30,55 15,70 40,85 C 60,95 70,100 50,100" 
                className={styles.svgFill}
                style={{ WebkitMaskImage: maskImage, maskImage: maskImage }}
              />
            </svg>
          </div>
          {featureCards.map((card, index) => {
            return (
              <motion.article
                key={card.title}
                className={styles.featureCard}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.9, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ y: yTransforms[index] }}
                whileHover={{ scale: 1.03, transition: { duration: 0.3, ease: "easeOut" } }}
              >
                <motion.div className={styles.featureIllustration} style={{ y: imageYTransforms[index] }}>
                  <Image src={card.image} alt={card.title} width={800} height={600} className={styles.featureImage} />
                </motion.div>
                <h3 className={styles.featureTitle}>{card.title}</h3>
                <p className={styles.featureDescription}>
                  {card.descriptionLines.map((line, i) => (
                    <span key={i}>{line}</span>
                  ))}
                </p>
              </motion.article>
            );
          })}
        </div>

        <div className={styles.badgesWrap}>
          <div className={styles.badgesRow}>
            {accreditations.map((item, index) => (
              <div key={item.key} className={styles.badgeItem}>
                {failedLogos[item.key] ? (
                  <div className={styles.logoFallback}>{item.short}</div>
                ) : (
                  <img
                    src={item.logo}
                    alt={item.alt}
                    className={styles.badgeLogo}
                    loading="lazy"
                    onError={() => setFailedLogos((prev) => ({ ...prev, [item.key]: true }))}
                  />
                )}
                <span className={styles.badgeTitle}>{item.title}</span>
                {index < accreditations.length - 1 && <div className={styles.badgeDivider} aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
