"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BlogArticleCard from "@/components/blog/BlogArticleCard";
import { duration, ease } from "@/lib/motion";
import styles from "./EmergencyGuideCarousel.module.css";

export interface GuideItem {
  title: string;
  link: string;
  image: string;
  author: string;
  category: string;
  date: string;
  href: string;
}

export default function EmergencyGuideCarousel({ items, labelledBy, staticMotion = false }: {
  items: GuideItem[]; labelledBy: string; staticMotion?: boolean;
}) {
  const prefersReduced = useReducedMotion();
  const reduced = Boolean(prefersReduced) || staticMotion;
  const track = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // The track is a scroll-snap row, so the chevrons only need to know whether
  // there is anything left to reach in either direction.
  const sync = useCallback(() => {
    const node = track.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    setAtStart(node.scrollLeft <= 1);
    setAtEnd(node.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    const node = track.current;
    if (!node) return;
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    node.addEventListener("scroll", sync, { passive: true });
    return () => { observer.disconnect(); node.removeEventListener("scroll", sync); };
  }, [sync]);

  // One card plus its gap, measured rather than hard-coded so the step stays
  // correct across the responsive column counts.
  const step = (towards: 1 | -1) => {
    const node = track.current;
    if (!node) return;
    const card = node.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(node).columnGap) || 0;
    const distance = (card?.offsetWidth ?? node.clientWidth) + gap;
    node.scrollBy({ left: distance * towards, behavior: reduced ? "instant" : "smooth" });
  };

  return <div className={styles.carousel}>
    <ul ref={track} className={styles.track} aria-labelledby={labelledBy}>
      {items.map((item, index) => (
        <motion.li key={item.link} className={styles.slide}
          initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 16, filter: reduced ? "blur(0px)" : "blur(12px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: reduced ? 0 : duration.slower, delay: reduced ? 0 : Math.min(index * 0.08, 0.4), ease: ease.out }}>
          <BlogArticleCard title={item.title} href={item.href} image={item.image}
            category={item.category} date={item.date} author={item.author} external
            sizes="(max-width: 768px) 85vw, 400px" />
        </motion.li>
      ))}
    </ul>
    <button type="button" className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => step(-1)} disabled={atStart} aria-label="Previous guides">
      <ChevronLeft size={22} strokeWidth={2} aria-hidden="true" />
    </button>
    <button type="button" className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => step(1)} disabled={atEnd} aria-label="Next guides">
      <ChevronRight size={22} strokeWidth={2} aria-hidden="true" />
    </button>
  </div>;
}
