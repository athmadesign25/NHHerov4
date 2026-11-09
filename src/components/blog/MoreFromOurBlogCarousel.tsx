"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { ArticleItem, ARTICLES_DIRECTORY_DATA } from "@/data/articlesDirectoryData";
import styles from "./MoreFromOurBlogCarousel.module.css";

interface MoreFromOurBlogCarouselProps {
  articles: ArticleItem[];
  title?: string;
  subtitle?: string;
}

export default function MoreFromOurBlogCarousel({
  articles,
  title = "More from Our Blog",
  subtitle = "Doctor-curated guides, symptom breakthroughs, and preventive clinical insights",
}: MoreFromOurBlogCarouselProps) {
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
    <section className={styles.carouselSection} aria-label={title} data-nav-theme="light">
      <div className={styles.container}>
        {/* Section Header (Centered Clean Typography) */}
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        {/* Carousel Scroll Track (Pauses on Hover / Touch) */}
        <div
          className={styles.carouselWrapper}
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
                  <Link href={`/blog/${item.slug}`} className={styles.blogCard}>
                    {/* Full Background Image */}
                    <Image
                      src={item.image || "/images/articles/blog_heart_health.png"}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 82vw, (max-width: 1024px) 45vw, 360px"
                      className={styles.cardBgImage}
                    />

                    {/* Signature Multi-Stop Gradient Scrim */}
                    <div className={styles.cardOverlay} />

                    {/* Text On Scrim Content (Category, Title, Date, Author) */}
                    <div className={styles.cardContent}>
                      <div className={styles.cardMetaRow}>
                        <span className={styles.cardCategory}>{item.category}</span>
                        <span className={styles.cardMetaDot}>•</span>
                        <span className={styles.cardDate}>{item.publishedDate}</span>
                      </div>

                      <div className={styles.cardTitleRow}>
                        <h3 className={styles.cardTitle} title={item.title}>
                          {item.title}
                        </h3>
                        <ArrowRight size={16} className={styles.cardArrow} />
                      </div>

                      <div className={styles.cardAuthorRow}>
                        <div
                          className={`${styles.authorAvatar} ${
                            isNH ? styles.authorAvatarNH : styles.authorAvatarDoc
                          }`}
                        >
                          {initials}
                        </div>
                        <span className={styles.authorName}>{item.author}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Controls: Previous, Dots, Next (Matching Screenshot 1) */}
        <div className={styles.controlsRow}>
          <button
            type="button"
            className={`${styles.navBtn} ${!canScrollLeft ? styles.navBtnDisabled : ""}`}
            onClick={() => scrollByDirection("left")}
            disabled={!canScrollLeft}
            aria-label="Previous articles"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Pagination Dots */}
          <div className={styles.dotsWrap}>
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
          </div>

          <button
            type="button"
            className={`${styles.navBtn} ${!canScrollRight ? styles.navBtnDisabled : ""}`}
            onClick={() => scrollByDirection("right")}
            disabled={!canScrollRight}
            aria-label="Next articles"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
