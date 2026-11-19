"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useTransform, useMotionValue, MotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, ArrowUpRight, Calendar } from "lucide-react";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { ArticleItem, ARTICLES_DIRECTORY_DATA } from "@/data/articlesDirectoryData";
import styles from "./MoreFromOurBlogCarousel.module.css";

interface MoreFromOurBlogCarouselProps {
  articles: ArticleItem[];
  title?: string;
  subtitle?: string;
  scrollYProgress?: MotionValue<number>;
  seamless?: boolean;
}

export default function MoreFromOurBlogCarousel({
  articles,
  title = "More from Our Blog",
  subtitle = "Doctor-curated guides, symptom breakthroughs, and preventive clinical insights",
  scrollYProgress,
  seamless = false,
}: MoreFromOurBlogCarouselProps) {
  const fallbackProgress = useMotionValue(1);
  const activeProgress = scrollYProgress || fallbackProgress;

  // Dynamic text & control colors driven by scroll progress (0 = dark #060c18, 1 = light #ffffff)
  const eyebrowColor = useTransform(
    activeProgress,
    [0, 0.55, 1],
    ["rgba(255, 255, 255, 0.72)", "#0284c7", "#034EA2"]
  );
  const titleColor = useTransform(
    activeProgress,
    [0, 0.55, 1],
    ["#ffffff", "#1e293b", "#0f172a"]
  );
  const subtitleColor = useTransform(
    activeProgress,
    [0, 0.55, 1],
    ["rgba(255, 255, 255, 0.78)", "#475569", "#64748b"]
  );
  const trackScale = useTransform(
    activeProgress,
    [0, 1],
    [0.97, 1.0]
  );
  const navBtnBg = useTransform(
    activeProgress,
    [0, 0.55, 1],
    ["rgba(255, 255, 255, 0.14)", "rgba(255, 255, 255, 0.85)", "#ffffff"]
  );
  const navBtnBorder = useTransform(
    activeProgress,
    [0, 0.55, 1],
    ["rgba(255, 255, 255, 0.26)", "#cbd5e1", "#cbd5e1"]
  );
  const navBtnColor = useTransform(
    activeProgress,
    [0, 0.55, 1],
    ["#ffffff", "#0f172a", "#0f172a"]
  );
  const dotsWrapBg = useTransform(
    activeProgress,
    [0, 0.55, 1],
    ["rgba(255, 255, 255, 0.12)", "#e2e8f0", "#f1f5f9"]
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Ensure we have at least 6-8 articles so the corridor can continuously rotate
  const displayArticles = React.useMemo(() => {
    if (!articles || articles.length === 0) return ARTICLES_DIRECTORY_DATA.slice(0, 8);
    if (articles.length >= 6) return articles;
    const additional = ARTICLES_DIRECTORY_DATA.filter((a) => !articles.some((item) => item.slug === a.slug));
    return [...articles, ...additional].slice(0, 8);
  }, [articles]);

  const totalCards = displayArticles.length;

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const card = el.querySelector(`.${styles.cardItem}`) as HTMLElement;
    const cardWidth = card ? card.offsetWidth + 20 : 360;
    const newIdx = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(newIdx, 0), totalCards - 1));
  }, [totalCards]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  // Corridor Auto-Scroll animation: smoothly advances every 3.8s, pauses on hover/touch
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;

      const card = el.querySelector(`.${styles.cardItem}`) as HTMLElement;
      const cardWidth = card ? card.offsetWidth + 20 : 360;

      // If at end, smoothly cycle back to start
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 15) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 3800);

    return () => clearInterval(timer);
  }, [isPaused]);

  const scrollByDirection = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const card = el.querySelector(`.${styles.cardItem}`) as HTMLElement;
    const cardWidth = card ? card.offsetWidth + 20 : 360;
    const scrollAmount = dir === "left" ? -cardWidth : cardWidth;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollToDot = (dotIdx: number) => {
    const el = scrollRef.current;
    if (!el) return;

    const card = el.querySelector(`.${styles.cardItem}`) as HTMLElement;
    const cardWidth = card ? card.offsetWidth + 20 : 360;
    el.scrollTo({ left: dotIdx * cardWidth, behavior: "smooth" });
  };

  const getAuthorInitials = (author: string) => {
    if (author.toLowerCase().includes("narayana health")) return "NH";
    const parts = author.replace(/^Dr\.\s*/i, "").trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return author.slice(0, 2).toUpperCase();
  };

  if (!displayArticles || displayArticles.length === 0) return null;

  return (
    <section
      className={`${styles.carouselSection} ${seamless ? styles.carouselSectionSeamless : ""}`}
      aria-label={title}
      data-nav-theme="light"
    >
      <div className={styles.container}>
        {/* Section Header (Dynamic TextSweepEffect + Scroll-Driven Color) */}
        <div className={styles.header}>
          <motion.div
            className={styles.cleanEyebrow}
            style={{ color: eyebrowColor }}
          >
            CURATED CLINICAL HIGHLIGHTS
          </motion.div>
          <motion.h2
            className={styles.title}
            style={{
              color: titleColor,
              ["--featured-title-color" as string]: titleColor,
            }}
          >
            <TextSweepEffect
              words={[title]}
              sweepMs={1400}
              finalColor="var(--featured-title-color, #0f172a)"
            />
          </motion.h2>
          {subtitle && (
            <motion.p className={styles.subtitle} style={{ color: subtitleColor }}>
              {subtitle}
            </motion.p>
          )}
        </div>

        {/* Carousel Scroll Track (Pauses on Hover / Touch) */}
        <motion.div 
          className={styles.carouselWrapper}
          style={{ scale: seamless ? trackScale : 1 }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div ref={scrollRef} className={styles.track}>
            {displayArticles.map((item) => {
              const initials = getAuthorInitials(item.author);
              const isNH = initials === "NH";

              return (
                <div key={item.id} className={styles.cardItem}>
                  <div className={styles.blogCard}>
                    {/* Top Right Date Badge from Figma 468:624 */}
                    <div className={styles.dateBadge}>
                      <Calendar size={12} className={styles.dateIcon} />
                      <span>{item.publishedDate}</span>
                    </div>

                    {/* Full Background Image */}
                    <Image
                      src={item.image || "/images/articles/blog_heart_health.png"}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 82vw, (max-width: 1024px) 45vw, 360px"
                      className={styles.cardBgImage}
                    />

                    {/* Signature Multi-Stop Gradient Scrim (Exact Figma "Image fade") */}
                    <div className={styles.cardOverlay} />

                    {/* Bottom Card Content Layered On Gradient */}
                    <div className={styles.cardContent}>
                      <div className={styles.cardTextGroup}>
                        <div className={styles.cardCategory}>{item.category}</div>

                        <Link href={`/blog/${item.slug}`} className={styles.cardTitleLink}>
                          <h3 className={styles.cardTitle} title={item.title}>
                            {item.title}
                          </h3>
                        </Link>

                        <p className={styles.cardSub}>
                          {item.summary}
                        </p>
                      </div>

                      {/* Card Bottom Slot: Resting (Author + Arrow) vs Hover Full CTA ("Read more") */}
                      <div className={styles.cardBottomSlot}>
                        <div className={styles.cardRestingBottom}>
                          <div className={styles.authorGroup}>
                            <div className={styles.authorBadge}>
                              {item.authorAvatar ? (
                                <Image
                                  src={item.authorAvatar}
                                  alt={item.author}
                                  width={24}
                                  height={24}
                                  className={styles.authorImg}
                                />
                              ) : (
                                <span className={styles.authorInitials}>{initials}</span>
                              )}
                            </div>
                            <span className={styles.authorName}>{item.author}</span>
                          </div>
                          <ArrowUpRight size={18} className={styles.restingArrow} />
                        </div>

                        <div className={styles.cardActions}>
                          <Link href={`/blog/${item.slug}`} className={styles.cardDetailBtn}>
                            <span>Read more</span>
                            <ArrowUpRight size={13} className={styles.pillBtnArrow} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Carousel Controls: Previous, Dots, Next (Dynamic Scroll-Driven Theme) */}
        <div className={styles.controlsRow}>
          <motion.button
            type="button"
            className={`${styles.navBtn} ${!canScrollLeft ? styles.navBtnDisabled : ""}`}
            style={{
              backgroundColor: navBtnBg,
              borderColor: navBtnBorder,
              color: navBtnColor,
            }}
            onClick={() => scrollByDirection("left")}
            disabled={!canScrollLeft}
            aria-label="Previous articles"
          >
            <ChevronLeft size={20} />
          </motion.button>

          {/* Pagination Dots */}
          <motion.div className={styles.dotsWrap} style={{ backgroundColor: dotsWrapBg }}>
            {Array.from({ length: Math.min(totalCards, 6) }).map((_, dotIdx) => {
              const isActive = Math.min(activeIndex, 5) === dotIdx;
              return (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => scrollToDot(dotIdx)}
                  className={`${styles.dot} ${isActive ? styles.dotActive : ""}`}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                />
              );
            })}
          </motion.div>

          <motion.button
            type="button"
            className={`${styles.navBtn} ${!canScrollRight ? styles.navBtnDisabled : ""}`}
            style={{
              backgroundColor: navBtnBg,
              borderColor: navBtnBorder,
              color: navBtnColor,
            }}
            onClick={() => scrollByDirection("right")}
            disabled={!canScrollRight}
            aria-label="Next articles"
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>
      </div>
    </section>
  );
}

