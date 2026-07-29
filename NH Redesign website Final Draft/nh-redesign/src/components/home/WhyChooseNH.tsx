"use client";

import { motion } from "framer-motion";
import React from "react";
import { Award, Microscope, Stethoscope, ShieldCheck } from "lucide-react";
import styles from "./WhyChooseNH.module.css";

const featureCards = [
  {
    tone: "blue",
    icon: ShieldCheck,
    title: "Clinical Excellence",
    descriptionLines: ["Protocols and tracked outcomes", "for safer recovery paths"],
  },
  {
    tone: "red",
    icon: Stethoscope,
    title: "Top Medical Experts",
    descriptionLines: ["Senior specialists for complex", "procedures and continuity of care"],
  },
  {
    tone: "darkBlue",
    icon: Microscope,
    title: "Advanced Technology",
    descriptionLines: ["Modern diagnostics and surgical", "platforms for precision treatment"],
  },
  {
    tone: "darkRed",
    icon: Award,
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

  return (
    <section className={`section ${styles.section}`} id="why-choose-nh">
      <div className="container">
        <div className={styles.header}>
          <div className="section-eyebrow">BEST IN HEALTHCARE</div>
          <h2 className="section-title">Why Choose Narayana Health?</h2>
          <p className={`section-subtitle ${styles.headerSubtitle}`}>
            Where your health &amp; well-being comes first, always.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {featureCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                className={`${styles.featureCard} ${styles[`tone${card.tone[0].toUpperCase()}${card.tone.slice(1)}`]}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.07 }}
                onMouseMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const x = event.clientX - rect.left;
                  const y = event.clientY - rect.top;
                  event.currentTarget.style.setProperty("--mx", `${x}px`);
                  event.currentTarget.style.setProperty("--my", `${y}px`);
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.setProperty("--mx", "50%");
                  event.currentTarget.style.setProperty("--my", "50%");
                }}
              >
                <div className={styles.featureIcon}>
                  <Icon size={30} />
                </div>
                <h3 className={styles.featureTitle}>{card.title}</h3>
                <p className={styles.featureDescription}>
                  <span>{card.descriptionLines[0]}</span>
                  <span>{card.descriptionLines[1]}</span>
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
