"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RollingNumber from "@/components/ui/RollingNumber";
import MobileRollingStats from "@/components/ui/MobileRollingStats";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { Award } from "lucide-react";
import { CsrHeroData } from "@/data/csrData";
import { useLibraryHeroBlendShrink } from "@/lib/useHeroShrink";
import styles from "./CsrHero.module.css";

interface CsrHeroProps {
  data: CsrHeroData;
}

export default function CsrHero({ data }: CsrHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { heroMotionStyle } = useLibraryHeroBlendShrink();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    mass: 0.8,
  });

  const videoScale = useTransform(smoothProgress, [0, 1], [1, 1.08]);
  const videoOpacity = useTransform(smoothProgress, [0, 0.85], [0.65, 0.20]);
  const videoY = useTransform(smoothProgress, [0, 1], ["0%", "8%"]);
  const contentY = useTransform(smoothProgress, [0, 1], [0, 36]);
  const contentOpacity = useTransform(smoothProgress, [0, 0.75], [1, 0.4]);

  return (
    <div style={{ position: "relative", overflowX: "clip" }}>
      <motion.section
        ref={sectionRef}
        className={styles.heroSection}
        data-nav-theme="dark"
        style={heroMotionStyle}
      >
        {/* Background Video & Scrim inside Shrinking Dark Card */}
        <div className={styles.videoWrapper}>
          <motion.video
            autoPlay
            loop
            muted
            playsInline
            poster={data.posterUrl}
            className={styles.heroVideo}
            style={{
              scale: videoScale,
              y: videoY,
              opacity: videoOpacity,
            }}
          >
            <source src={data.videoUrl} type="video/mp4" />
          </motion.video>
          <div className={styles.heroOverlay} />
        </div>

      {/* Main Container with subtle scroll elevation */}
      <motion.div 
        className={styles.container}
        style={{
          y: contentY,
          opacity: contentOpacity,
        }}
      >
        {/* Upper Editorial Text */}
        <motion.div 
          className={styles.contentBlock}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.breadcrumbsWrapper}>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "CSR Overview" },
              ]}
              theme="dark"
            />
          </div>

          <h1 className={styles.heroTitle}>
            <TextSweepEffect
              words={[data.title]}
              sweepMs={2400}
              delayMs={80}
              finalColor="#FFFFFF"
            />
          </h1>
          <p className={styles.heroSubtitle}>{data.subtitle}</p>

          <div className={styles.heroCtaRow}>
            <a href="#initiatives" className={styles.heroCtaBtn}>
              <span>Explore Initiatives</span>
            </a>
          </div>

          <MobileRollingStats
            items={data.stats.map((s) => ({ staticValue: s.value, label: s.label }))}
          />
        </motion.div>

        {/* Bottom Metrics & Milestone Row */}
        <motion.div 
          className={styles.metricsBottomWrap}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.statsGrid}>
            {data.stats.map((stat, idx) => (
              <div key={idx} className={styles.statBlock}>
                <span className={styles.statNumber}>
                  <RollingNumber value={stat.value} />
                </span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.statsDivider} />

          <div className={styles.milestoneSection}>
            <Award className={styles.milestoneIcon} strokeWidth={1.5} />
            <div>
              <h3 className={styles.milestoneTitle}>
                National CSR Leadership in Healthcare Equity
              </h3>
              <p className={styles.milestoneDesc}>
                Narayana Hrudayalaya Foundation drives measurable community interventions under Schedule VII of the Companies Act, ensuring certified transparency and social return on investment.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
    </div>
  );
}
