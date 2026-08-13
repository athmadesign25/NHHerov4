"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import React, { useRef } from "react";
import { Award, Microscope, Stethoscope, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import styles from "./WhyChooseNH.module.css";

import Image from "next/image";
import LiquidGrid from "./LiquidGrid";

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
  const featuresRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const { scrollYProgress: exitProgress } = useScroll({
    target: featuresRef,
    offset: ["end 80%", "end -20%"],
  });

  // Smooth the scroll progress so the line animation starts slowly and feels fluid
  const smoothScrollYProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 15,
    restDelta: 0.001,
  });

  const smoothExitProgress = useSpring(exitProgress, {
    stiffness: 100,
    damping: 20,
    restDelta: 0.001,
  });

  const sectionScale = useTransform(smoothExitProgress, [0, 1], [1, 0.90]);
  const sectionRadius = useTransform(smoothExitProgress, [0, 1], ["0px", "32px"]);



  // Background dot grid parallax (moves down slowly while scrolling down)
  const bgYTransform = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  // Parallax ambient glowing orbs (move up from bottom while scrolling down)
  const orbRedY = useTransform(scrollYProgress, [0, 1], ["20%", "-40%"]);
  const orbBlueY = useTransform(scrollYProgress, [0, 1], ["40%", "-60%"]);

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
      <motion.div 
        className={styles.animatedWrapper}
        style={{ scale: sectionScale, borderRadius: sectionRadius, transformOrigin: 'top center' }}
      >
        {/* Liquid Grid Interactive Background */}
        <LiquidGrid yTransform={bgYTransform as any} />

        {/* Ambient Parallax Glowing Orbs */}
        <motion.div className={styles.ambientOrbRed} style={{ y: orbRedY }} />
        <motion.div className={styles.ambientOrbBlue} style={{ y: orbBlueY }} />

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

        <div className={styles.featuresGrid} ref={featuresRef}>
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
              >
                <motion.div
                  style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "inherit", textAlign: "inherit" }}
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
                </motion.div>
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
      </motion.div>
    </section>
  );
}
