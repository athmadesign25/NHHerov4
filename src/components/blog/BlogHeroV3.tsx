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
      // Exact Procedure Detail V2 transition:
      // At scrollY = 0..36px, keep background 100% dark (#060c18) so Hero and Featured Blogs start in unified dark mode.
      // From 36px to 360px, smoothly morph #060c18 -> #020408 -> #f4f7fb -> #ffffff while crossfading the hero photo out.
      const sy = window.scrollY || 0;
      const startScroll = 36;
      const endScroll = 360;
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
    [0, 0.40, 0.68, 1],
    ["#060c18", "#020408", "#f4f7fb", "#ffffff"]
  );

  // Smoothly crossfade hero photo into the unified dynamic canvas so there is ZERO gradient mist band or horizontal seam
  const heroCanvasOpacity = useTransform(
    heroTransitionProgress,
    [0, 0.38, 0.68],
    [1, 0.75, 0]
  );

  // Hero bottom metrics dynamic color inversion as the unified canvas transitions from dark/black to white
  const heroStatNumColor = useTransform(
    heroTransitionProgress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.80)", "rgba(255, 255, 255, 0.90)", "#0f172a", "#0f172a"]
  );
  const heroStatLabelColor = useTransform(
    heroTransitionProgress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.50)", "rgba(255, 255, 255, 0.60)", "#64748b", "#64748b"]
  );
  const heroStatDividerColor = useTransform(
    heroTransitionProgress,
    [0, 0.44, 0.64, 1],
    ["rgba(255, 255, 255, 0.14)", "rgba(255, 255, 255, 0.18)", "rgba(15, 23, 42, 0.12)", "rgba(15, 23, 42, 0.12)"]
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
        backgroundColor: "transparent",
        ["--stat-num-color" as string]: heroStatNumColor,
        ["--stat-label-color" as string]: heroStatLabelColor,
        ["--stat-divider-color" as string]: heroStatDividerColor,
      }}
    >
      {/* ── SECTION 1: CLEAN GENERIC BLOGS PAGE HEADER HERO BANNER ── */}
      <section className={styles.heroSection} data-nav-theme="dark">
        <motion.div className={styles.heroBg} style={{ opacity: heroCanvasOpacity }}>
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
        </motion.div>

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
