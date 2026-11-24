"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RollingNumber from "@/components/ui/RollingNumber";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import MoreFromOurBlogCarousel from "@/components/blog/MoreFromOurBlogCarousel";
import { ARTICLES_DIRECTORY_DATA } from "@/data/articlesDirectoryData";
import styles from "./BlogHeroV3.module.css";

export default function BlogHeroV3() {
  const featuredRef = useRef<HTMLDivElement>(null);
  const heroTransitionProgress = useMotionValue(0);

  useEffect(() => {
    const updateTransition = () => {
      // At scrollY = 0..24px, keep background 100% dark (#060c18) so the hero photo
      // has zero white/grey band at the bottom and Featured Blogs starts in crisp dark mode.
      // As the user scrolls down from 24px to 320px, smoothly morph #060c18 -> #ffffff.
      const sy = window.scrollY || 0;
      const startScroll = 24;
      const endScroll = 320;
      const raw = (sy - startScroll) / (endScroll - startScroll);
      const clamped = Math.max(0, Math.min(1, raw));
      heroTransitionProgress.set(clamped);
    };

    updateTransition();
    window.addEventListener("scroll", updateTransition, { passive: true });
    window.addEventListener("resize", updateTransition, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateTransition);
      window.removeEventListener("resize", updateTransition);
    };
  }, [heroTransitionProgress]);

  const sectionBgColor = useTransform(
    heroTransitionProgress,
    [0, 0.42, 0.78, 1],
    ["#060c18", "#0d2142", "#eef4fb", "#ffffff"]
  );

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
    <motion.div
      style={{
        backgroundColor: sectionBgColor,
        ["--hero-bottom-bg" as string]: sectionBgColor,
      }}
    >
      {/* ── SECTION 1: CLEAN GENERIC BLOGS PAGE HEADER HERO BANNER ── */}
      <section className={styles.heroSection} data-nav-theme="dark">
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
                <ArrowRight size={16} />
              </a>
            </div>
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
      </section>

      {/* ── SECTION 2: SEPARATE FEATURED & SUGGESTED BLOGS CAROUSEL BELOW HERO (SCROLL-DRIVEN TRANSITION) ── */}
      <div id="featured-blogs" ref={featuredRef} className={styles.featuredCarouselWrapper}>
        <MoreFromOurBlogCarousel
          articles={featuredArticles}
          title="Featured & Suggested Blogs"
          subtitle="Doctor-curated guides, symptom breakthroughs, and preventive clinical insights"
          scrollYProgress={heroTransitionProgress}
          seamless
        />
      </div>
    </motion.div>
  );
}
