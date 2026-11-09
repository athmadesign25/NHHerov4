"use client";

import React from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Award, ArrowRight } from "lucide-react";
import { CsrHeroData } from "@/data/csrData";
import styles from "./CsrHero.module.css";

interface CsrHeroProps {
  data: CsrHeroData;
}

export default function CsrHero({ data }: CsrHeroProps) {
  return (
    <section className={styles.heroSection} data-nav-theme="dark">
      {/* Background Video */}
      <div className={styles.videoWrapper}>
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={data.posterUrl}
          className={styles.heroVideo}
        >
          <source src={data.videoUrl} type="video/mp4" />
        </video>
        <div className={styles.heroOverlay} />
      </div>

      {/* Main Container */}
      <div className={styles.container}>
        {/* Upper Editorial Text (Clean, comfortable placement, no shadows) */}
        <div className={styles.contentBlock}>
          <div className={styles.breadcrumbsWrapper}>
            <Breadcrumbs items={[{ label: "CSR Overview", href: "/csr" }]} />
          </div>

          <h1 className={styles.heroTitle}>{data.title}</h1>
          <p className={styles.heroSubtitle}>{data.subtitle}</p>

          <div className={styles.heroCtaRow}>
            <a href="#initiatives" className={styles.heroCtaBtn}>
              <span>Explore Initiatives</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* Bottom Metrics & Milestone Row (Matching Image 2 Speciality Hero) */}
        <div className={styles.metricsBottomWrap}>
          <div className={styles.statsGrid}>
            {data.stats.map((stat, idx) => (
              <div key={idx} className={styles.statItem}>
                <span className={styles.statValue}>{stat.value}</span>
                <p className={styles.statDesc}>{stat.description}</p>
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
        </div>
      </div>
    </section>
  );
}
