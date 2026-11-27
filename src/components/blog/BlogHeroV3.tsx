"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RollingNumber from "@/components/ui/RollingNumber";
import MobileRollingStats from "@/components/ui/MobileRollingStats";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import MoreFromOurBlogCarousel from "@/components/blog/MoreFromOurBlogCarousel";
import { ARTICLES_DIRECTORY_DATA } from "@/data/articlesDirectoryData";
import { useLibraryHeroBlendShrink } from "@/lib/useHeroShrink";
import styles from "./BlogHeroV3.module.css";

const BLOG_HERO_STATS = [
  { staticValue: "400+", label: "Clinical Guides" },
  { staticValue: "40+", label: "Medical Specialities" },
  { staticValue: "100%", label: "Doctor Reviewed" },
  { staticValue: "24×7", label: "Health Advisory" },
];

export default function BlogHeroV3() {
  const featuredRef = useRef<HTMLDivElement>(null);
  const { progress, heroMotionStyle } = useLibraryHeroBlendShrink();

  const featuredArticles = React.useMemo(() => {
    const popular = ARTICLES_DIRECTORY_DATA.filter((a) => a.isPopular);
    const others = ARTICLES_DIRECTORY_DATA.filter((a) => !a.isPopular);
    return [...popular, ...others].slice(0, 8);
  }, []);

  const handleExploreMore = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("featured-blogs") || document.getElementById("explore-categories");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      {/* ── SECTION 1: HERO BANNER (BLENDED DARK AT REST -> INSETS OVER WHITE ON SCROLL) ── */}
      <div style={{ position: "relative", overflowX: "clip" }}>
        <motion.section
          className={styles.heroSection}
          data-nav-theme="dark"
          style={heroMotionStyle}
        >
          <div className={styles.heroBg}>
            <Image
              src="/images/specialities/Advance Heart Care.jpg"
              alt="Narayana Health Blogs & Medical Insights"
              fill
              priority
              loading="eager"
              sizes="100vw"
              className={styles.heroBgImage}
            />
            <div className={styles.scrimOverlay} />
          </div>

        <div className={styles.heroInner}>
          <motion.div
            className={styles.heroLeftCol}
            initial={{ opacity: 0, scale: 0.97, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.breadcrumbsWrapper}>
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Blog" },
                ]}
                theme="dark"
              />
            </div>

            <h1 className={styles.heroTitle}>
              <TextSweepEffect
                words={["Health Blogs, Medical Guides & Clinical Insights"]}
                sweepMs={2400}
                delayMs={80}
                finalColor="#FFFFFF"
              />
            </h1>

            <p className={styles.heroSubtitle}>
              Explore peer-reviewed medical articles, preventive health checklists, symptom explainers, and recovery stories authored by senior Narayana Health specialists.
            </p>

            <div className={styles.actionRow}>
              <a
                href="#featured-blogs"
                onClick={handleExploreMore}
                className={styles.exploreBtn}
              >
                <span>Explore More</span>
              </a>
            </div>

            <MobileRollingStats items={BLOG_HERO_STATS} />
          </motion.div>

          {/* Bottom Column: Horizontal Metrics Row (Matching CSR Hero) */}
          <motion.div
            className={styles.metricsBottomWrap}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.statsGrid}>
              <div className={styles.statBlock}>
                <span className={styles.statNumber}>
                  <RollingNumber value="400+" />
                </span>
                <span className={styles.statLabel}>Clinical Guides</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statNumber}>
                  <RollingNumber value="40+" />
                </span>
                <span className={styles.statLabel}>Medical Specialities</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statNumber}>
                  <RollingNumber value="100%" />
                </span>
                <span className={styles.statLabel}>Doctor Reviewed</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statNumber}>
                  <RollingNumber value="24×7" />
                </span>
                <span className={styles.statLabel}>Health Advisory</span>
              </div>
            </div>
          </motion.div>
        </div>
        </motion.section>
      </div>

      {/* ── SECTION 2: SEPARATE FEATURED & SUGGESTED BLOGS CAROUSEL (SMOOTH DARK -> WHITE TRANSITION) ── */}
      <div id="featured-blogs" ref={featuredRef} className={styles.featuredCarouselWrapper} data-nav-theme="light">
        <MoreFromOurBlogCarousel
          articles={featuredArticles}
          title="Featured & Suggested Blogs"
          subtitle="Doctor-curated guides, symptom breakthroughs, and preventive clinical insights"
          scrollYProgress={progress}
          seamless
        />
      </div>
    </div>
  );
}
