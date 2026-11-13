"use client";

import React, { useState, useMemo, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Star,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { ALL_SPECIALITIES, type SpecialityMeta } from "@/data/specialities";
import themeStyles from "../specialities/toolbar/DoctorSearchTheme.module.css";
import styles from "../specialities/page.module.css";
import heroStyles from "./CentreOfExcellenceHero.module.css";

// Helper to determine destination URL (Cancer Care -> ?design=2)
function getCoEHref(slug: string): string {
  if (slug === "oncology") {
    return "/centre-of-excellence/oncology?design=2";
  }
  return `/centre-of-excellence/${slug}`;
}

// Flagship Centres of Excellence
const COE_LIST = ALL_SPECIALITIES.filter((s) => s.isCoE);

function CentreOfExcellenceContent() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(() => searchParams?.get("search") || searchParams?.get("q") || "");
  const [sortBy, setSortBy] = useState("relevance");

  // Sync query params whenever searchParams changes
  useEffect(() => {
    const query = searchParams?.get("search") || searchParams?.get("q") || "";
    if (query) setSearch(query);
  }, [searchParams]);

  // Filtered & Sorted Centres of Excellence
  const filtered = useMemo(() => {
    let list = COE_LIST;

    // Search Query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((s) => {
        const matchName = s.name.toLowerCase().includes(q);
        const matchShort = s.shortName.toLowerCase().includes(q);
        const matchCat = s.category.toLowerCase().includes(q);
        const matchTag = s.tagline.toLowerCase().includes(q);
        const matchCond = s.keyConditions?.some((c) => c.toLowerCase().includes(q));
        return matchName || matchShort || matchCat || matchTag || matchCond;
      });
    }

    // Sorting
    if (sortBy === "doctors") {
      return [...list].sort((a, b) => (b.doctorCount || 0) - (a.doctorCount || 0));
    }
    if (sortBy === "name") {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === "procedures") {
      return [...list].sort((a, b) => {
        const valA = parseFloat(a.stat.value.replace(/[^0-9.]/g, "")) || 0;
        const valB = parseFloat(b.stat.value.replace(/[^0-9.]/g, "")) || 0;
        return valB - valA;
      });
    }

    return list;
  }, [search, sortBy]);

  const handleResetSearch = () => {
    setSearch("");
    setSortBy("relevance");
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  };

  return (
    <div
      className={`${styles.page} ${styles.doctorPage} ${themeStyles.theme}`}
      data-design="d20"
      data-nav-theme="light"
    >
      {/* ── 1. HERO SECTION (TREATMENTS LIBRARY STYLE WITH DOCTOR_PATIENT BG) ── */}
      <section className={heroStyles.hero} data-nav-theme="dark">
        <div className={heroStyles.heroBg}>
          <motion.div
            className={heroStyles.heroBgMotion}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src="/doctor_patient.png"
              alt="Doctor examining patient with stethoscope"
              fill
              priority
              sizes="100vw"
              className={heroStyles.heroBgImage}
            />
            {/* Left Glass Blur & Targeted Text Highlight Scrim */}
            <div className={heroStyles.heroGlassOverlay} />
            <div className={heroStyles.heroLeftScrim} />
            <div className={heroStyles.heroBgOverlay} />
          </motion.div>
        </div>

        <div className={heroStyles.heroInner}>
          {/* Left Column: Breadcrumb, Title, Subtitle & Pulse Search */}
          <div className={heroStyles.heroLeftCol}>
            <motion.div
              className={heroStyles.breadcrumbsContainer}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
            >
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Centres of Excellence" },
                ]}
                theme="dark"
              />
            </motion.div>

            <motion.h1
              className={heroStyles.heroTitle}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            >
              <TextSweepEffect
                words={["Centres of Excellence"]}
                sweepMs={2400}
                delayMs={80}
                finalColor="#FFFFFF"
              />
            </motion.h1>

            <motion.p
              className={heroStyles.heroSubtitle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Narayana Health&apos;s flagship institutes of specialized medicine &mdash; where India&apos;s leading clinical experts, breakthrough robotic &amp; surgical technology, and compassionate care converge across cardiac sciences, oncology, neurosciences, organ transplants, and joint replacement.
            </motion.p>

            {/* Pulse Search Input */}
            <motion.div
              className={heroStyles.heroSearchContainer}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={heroStyles.heroSearchRow}>
                <div className={heroStyles.searchBoxWrap}>
                  <div className={heroStyles.searchBox}>
                    <Search size={16} strokeWidth={2.0} className={heroStyles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Search Centres of Excellence or clinical condition..."
                      className={heroStyles.searchInput}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-label="Search Centres of Excellence"
                    />
                    {search && (
                      <button
                        className={heroStyles.clearSearchBtn}
                        onClick={() => setSearch("")}
                        aria-label="Clear search input"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. FULL-WIDTH CENTRES OF EXCELLENCE GRID ── */}
      <main className={heroStyles.coeContainer} aria-label="Centres of Excellence directory">
        <AnimatePresence mode="popLayout">
          <motion.div className={heroStyles.coeGrid} layout>
            {filtered.map((spec, i) => (
              <motion.div
                key={spec.slug}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: Math.min(i * 0.04, 0.25), duration: 0.35 }}
              >
                <CoECardItem spec={spec} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className={styles.emptyState}>
            <Search size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
            <div className={styles.emptyTitle}>No Centres of Excellence found</div>
            <div className={styles.emptyDesc}>
              Try adjusting your search query or reset your search
            </div>
            <button
              type="button"
              onClick={handleResetSearch}
              className={styles.emptyResetBtn}
              id="empty-reset-filters-btn"
            >
              <RotateCcw size={14} /> Reset Search
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CentreOfExcellencePage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "80vh", paddingTop: "140px", textAlign: "center", color: "#64748B" }}>
          Loading Centres of Excellence...
        </div>
      }
    >
      <CentreOfExcellenceContent />
    </Suspense>
  );
}

function CoECardItem({ spec }: { spec: SpecialityMeta }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <Link
      id={`coe-card-${spec.slug}`}
      aria-label={spec.name}
      className={styles.specialityCard}
      href={getCoEHref(spec.slug)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        alt={spec.name}
        loading="lazy"
        src={spec.image}
        className={styles.cardImage}
      />
      {spec.video && (
        <video
          ref={videoRef}
          src={spec.video}
          className={`${styles.cardVideo} ${isHovered ? styles.cardVideoActive : ""}`}
          muted
          loop
          playsInline
        />
      )}
      <div className={styles.cardOverlay} />

      <div className={styles.cardTopBadges}>
        <span className={styles.cardCoEBadge}>
          <Star size={13} strokeWidth={2} aria-hidden="true" />
          <span>Centre of Excellence</span>
        </span>
      </div>

      <div className={styles.cardTextWrap}>
        {spec.stat && (
          <div className={styles.cardStats}>
            <div className={styles.metricValue}>{spec.stat.value}</div>
            <div className={styles.metricLabel}>{spec.stat.label}</div>
          </div>
        )}
        <div className={styles.specialityNameRow}>
          <span className={styles.specialityName}>{spec.name}</span>
          <ArrowRight className={styles.nameArrow} size={16} strokeWidth={2.5} />
        </div>
        <span className={styles.cardAction}>
          Explore Institute
          <span className={styles.actionUnderline} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
