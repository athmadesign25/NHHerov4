"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Sparkles, 
  Video, 
  Activity, 
  HeartHandshake, 
  FileText, 
  CheckCircle2, 
  ArrowUpRight 
} from "lucide-react";
import styles from "./BlogBentoGrid.module.css";

const ROTATING_STATS = [
  { value: "4,500+", label: "Board-Certified Doctors & Clinical Contributors" },
  { value: "100+", label: "Doctor-Authored Disease & Wellness Guides" },
  { value: "8,000+", label: "Complex Surgeries & Clinical Protocols Documented" },
];

export default function BlogBentoGrid() {
  const [statIndex, setStatIndex] = useState(0);

  // Auto-rotating stat counter
  useEffect(() => {
    const timer = setInterval(() => {
      setStatIndex((prev) => (prev + 1) % ROTATING_STATS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.bentoSection} data-nav-theme="dark">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrowBadge}>
            <ShieldCheck size={14} />
            <span>CLINICAL EXCELLENCE IN HEALTH KNOWLEDGE</span>
          </div>
          <h2 className={styles.sectionTitle}>
            Why Millions Trust Narayana Health Information
          </h2>
          <p className={styles.sectionSubtitle}>
            Bridging cutting-edge clinical research, quaternary hospital protocols, and everyday patient wellness into clear, accessible health guidance.
          </p>
        </div>

        {/* Bento Grid */}
        <div className={styles.bentoGrid}>
          {/* Card 1: Hero Large Card (Spans 2 columns on desktop) */}
          <div className={`${styles.bentoCard} ${styles.cardHero}`}>
            <div className={styles.heroCardBg}>
              <Image
                src="/images/backgrounds/why-choose-nh-bg.png"
                alt="Clinical Excellence at Narayana Health"
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className={styles.heroCardImage}
              />
              <div className={styles.heroCardGradient} />
            </div>

            <div className={styles.heroCardContent}>
              <div className={styles.heroBadgeRow}>
                <span className={styles.verifiedTag}>
                  <CheckCircle2 size={13} />
                  100% Peer-Reviewed
                </span>
                <span className={styles.hospitalNetTag}>Across 40+ Super-Specialties</span>
              </div>

              <div className={styles.statCounterBlock}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={statIndex}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={styles.statNumberWrap}
                  >
                    <span className={styles.statValue}>
                      {ROTATING_STATS[statIndex].value}
                    </span>
                    <span className={styles.statLabel}>
                      {ROTATING_STATS[statIndex].label}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className={styles.heroCardBottom}>
                <h3 className={styles.heroCardTitle}>
                  Clinical Rigour Behind Every Word
                </h3>
                <p className={styles.heroCardDesc}>
                  Every symptom guide, procedural milestone, and preventative tip undergoes multi-disciplinary clinical evaluation by operating surgeons and senior consultants.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: 24/7 Digital Second Opinions & Teleconsult */}
          <div className={`${styles.bentoCard} ${styles.cardTeleconsult}`}>
            <div className={styles.cardIconWrap}>
              <Video size={20} className={styles.cardIcon} />
            </div>
            <div className={styles.cardBody}>
              <span className={styles.cardMicroTag}>VIRTUAL CARE</span>
              <h3 className={styles.cardTitle}>24×7 Virtual Second Opinions</h3>
              <p className={styles.cardText}>
                Upload diagnostic scans and consult senior specialists from the comfort of your home across Narayana Telehealth.
              </p>
              <Link href="/doctors" className={styles.cardLink}>
                <span>Book Video Consult</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card 3: NABH & JCI Accredited Protocols */}
          <div className={`${styles.bentoCard} ${styles.cardProtocols}`}>
            <div className={styles.cardIconWrap}>
              <Activity size={20} className={styles.cardIcon} />
            </div>
            <div className={styles.cardBody}>
              <span className={styles.cardMicroTag}>ACCREDITED SCIENCE</span>
              <h3 className={styles.cardTitle}>NABH &amp; JCI Guidelines</h3>
              <p className={styles.cardText}>
                Our clinical pathways follow internationally benchmarked quality, antibiotic stewardship, and infection control standards.
              </p>
              <div className={styles.protocolChips}>
                <span className={styles.protoChip}>JCI Accredited</span>
                <span className={styles.protoChip}>NABH Certified</span>
                <span className={styles.protoChip}>NABL Labs</span>
              </div>
            </div>
          </div>

          {/* Card 4: Ask Pulse AI Clinical Navigator */}
          <div className={`${styles.bentoCard} ${styles.cardPulseAi}`}>
            <div className={styles.cardIconWrap}>
              <Sparkles size={20} className={styles.cardIconPulse} />
            </div>
            <div className={styles.cardBody}>
              <span className={styles.cardMicroTag}>AI CLINICAL TRIAGE</span>
              <h3 className={styles.cardTitle}>Ask Pulse AI Assistant</h3>
              <p className={styles.cardText}>
                Instant clinical clarification for your medical reports, symptom triage, and finding the right department in seconds.
              </p>
              <Link href="/treatments" className={styles.pulseBtn}>
                <span>Explore Pulse Library</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card 5: Comprehensive Health Packages */}
          <div className={`${styles.bentoCard} ${styles.cardPackages}`}>
            <div className={styles.cardIconWrap}>
              <HeartHandshake size={20} className={styles.cardIcon} />
            </div>
            <div className={styles.cardBody}>
              <span className={styles.cardMicroTag}>PREVENTION FIRST</span>
              <h3 className={styles.cardTitle}>Preventive Health Packages</h3>
              <p className={styles.cardText}>
                Advanced cardiac, diabetic, and executive whole-body screening to detect health risks before symptoms manifest.
              </p>
              <Link href="/health-packages" className={styles.cardLink}>
                <span>View Health Packages</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

