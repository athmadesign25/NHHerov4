"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronRight,
  Star,
  Sparkles,
  PhoneCall,
  UserCheck,
  RotateCcw,
  ArrowRight,
  Stethoscope,
  Award,
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import {
  ALL_SPECIALITIES,
  SPECIALITY_CATEGORIES,
  type SpecialityMeta,
} from "@/data/specialities";
import styles from "./page.module.css";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Helper to determine destination URL (Cancer Care -> ?design=2)
function getSpecialityHref(slug: string): string {
  if (slug === "oncology") {
    return "/specialities/oncology?design=2";
  }
  return `/specialities/${slug}`;
}

export default function SpecialitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLetter, setActiveLetter] = useState("All");

  // Read URL query params if present (e.g. /specialities?search=heart or ?category=Cancer+Care)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("search");
      const cat = params.get("category");
      if (q) setSearchQuery(q);
      if (cat) setActiveCategory(cat);
    }
  }, []);

  // Filter categories enriched with "Centres of Excellence" tab
  const categoriesList = useMemo(() => {
    return ["All", "Centres of Excellence", ...SPECIALITY_CATEGORIES.filter((c) => c !== "All")];
  }, []);

  // Flagship Centres of Excellence for top showcase banner
  const coeFlagships = useMemo(() => {
    return ALL_SPECIALITIES.filter((s) => s.isCoE).slice(0, 4);
  }, []);

  // Set of letters that actually have at least one speciality
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    ALL_SPECIALITIES.forEach((s) => {
      const letter = (s.shortName || s.name).trim().charAt(0).toUpperCase();
      letters.add(letter);
    });
    return letters;
  }, []);

  // Filtered specialities based on category, search, and alphabet
  const filteredSpecialities = useMemo(() => {
    return ALL_SPECIALITIES.filter((spec) => {
      // 1. Category check
      if (activeCategory === "Centres of Excellence") {
        if (!spec.isCoE) return false;
      } else if (activeCategory !== "All") {
        if (spec.category !== activeCategory) return false;
      }

      // 2. Alphabet letter check
      if (activeLetter !== "All") {
        const firstLetter = (spec.shortName || spec.name).trim().charAt(0).toUpperCase();
        if (firstLetter !== activeLetter) return false;
      }

      // 3. Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = spec.name.toLowerCase().includes(query);
        const matchShort = spec.shortName.toLowerCase().includes(query);
        const matchCategory = spec.category.toLowerCase().includes(query);
        const matchTagline = spec.tagline.toLowerCase().includes(query);
        const matchConditions = spec.keyConditions?.some((c) =>
          c.toLowerCase().includes(query)
        );

        if (!matchName && !matchShort && !matchCategory && !matchTagline && !matchConditions) {
          return false;
        }
      }

      return true;
    });
  }, [activeCategory, activeLetter, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
    setActiveLetter("All");
  };

  const hasActiveFilters = searchQuery.trim() !== "" || activeCategory !== "All" || activeLetter !== "All";

  return (
    <div style={{ paddingTop: "var(--nav-height)", minHeight: "100vh" }}>
      {/* ── 1. HERO SECTION ── */}
      <section className={styles.hero} aria-label="Medical Specialities & Clinical Departments">
        <div className={styles.heroDotGrid} aria-hidden="true" />
        <div className={styles.heroGlow} aria-hidden="true" />

        <div className={styles.heroInner}>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Medical Specialities" },
            ]}
            theme="dark"
          />

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.heroEyebrowWrap}>
              <span className={styles.heroEyebrowBadge}>
                <span className={styles.heroEyebrowPulse} />
                Narayana Health Clinical Directory
              </span>
            </div>

            <h1 className={styles.heroTitle}>
              Our{" "}
              <span className={styles.heroSweepWord}>
                <TextSweepEffect
                  words={["Medical Specialities", "Centres of Excellence", "Clinical Disciplines"]}
                  finalColor="#ffffff"
                  sweepMs={1400}
                />
              </span>
            </h1>

            <p className={styles.heroSubtitle}>
              From world-renowned cardiac surgeries and precision oncology to pediatric care — explore 40+ medical
              disciplines led by 3,000+ renowned clinicians across 25+ hospitals.
            </p>

            <div className={styles.heroMetricsRow}>
              <div className={styles.heroMetricItem}>
                <Award size={16} color="#38bdf8" />
                <span className={styles.heroMetricValue}>40+</span>
                <span className={styles.heroMetricLabel}>Clinical Disciplines</span>
              </div>
              <div className={styles.heroMetricItem}>
                <Sparkles size={16} color="#fbbf24" />
                <span className={styles.heroMetricValue}>10+</span>
                <span className={styles.heroMetricLabel}>Centres of Excellence</span>
              </div>
              <div className={styles.heroMetricItem}>
                <UserCheck size={16} color="#4ade80" />
                <span className={styles.heroMetricValue}>3,000+</span>
                <span className={styles.heroMetricLabel}>Specialist Doctors</span>
              </div>
              <div className={styles.heroMetricItem}>
                <Stethoscope size={16} color="#f87171" />
                <span className={styles.heroMetricValue}>24/7</span>
                <span className={styles.heroMetricLabel}>Emergency Response</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. FEATURED CENTRES OF EXCELLENCE BANNER ── */}
      <section className={styles.coeSection} aria-label="Flagship Centres of Excellence">
        <div className="container">
          <div className={styles.coeHeader}>
            <div>
              <span className={styles.coeEyebrow}>
                <Star size={14} fill="#38bdf8" stroke="none" />
                Flagship Quaternary Institutes
              </span>
              <h2 className={styles.coeTitle}>Centres of Excellence</h2>
              <p className={styles.coeSubtitle}>
                Nationally and globally benchmarked institutes delivering tertiary and quaternary care with advanced clinical outcomes.
              </p>
            </div>
            <Link
              href="/specialities/oncology?design=2"
              className={styles.coeActionLink}
              id="spec-explore-cancer-care-top"
            >
              Spotlight: Cancer Care Experience <ChevronRight size={14} />
            </Link>
          </div>

          <div className={styles.coeScrollTrack}>
            {coeFlagships.map((coe) => (
              <Link
                key={coe.slug}
                href={getSpecialityHref(coe.slug)}
                className={styles.coeCard}
                id={`coe-card-${coe.slug}`}
                aria-label={`${coe.name} Centre of Excellence`}
              >
                <div className={styles.coeMediaWrap}>
                  <Image
                    src={coe.image}
                    alt={coe.name}
                    fill
                    className={styles.coeImage}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    priority
                  />
                  <div className={styles.coeMediaOverlay} />
                  <span className={styles.coeBadgeTop}>
                    <Star size={12} fill="#fff" stroke="none" />
                    Centre of Excellence
                  </span>
                  <div className={styles.coeIconBadge} aria-hidden="true">
                    <img src={coe.icon} alt="" width={22} height={22} />
                  </div>
                </div>

                <div className={styles.coeBody}>
                  <h3 className={styles.coeName}>{coe.shortName}</h3>
                  <p className={styles.coeTagline}>{coe.tagline}</p>

                  <div className={styles.coeStatRow}>
                    <div>
                      <span className={styles.coeStatValue}>{coe.stat.value}</span>
                      <span className={styles.coeStatLabel}>{coe.stat.label}</span>
                    </div>
                    <span className={styles.coeActionLink}>
                      Explore <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. STICKY SEARCH & FILTER CONTROL BAR ── */}
      <div className={styles.controlBarWrapper} role="region" aria-label="Filter and Search Specialities">
        <div className={styles.controlBarInner}>
          {/* Top Row: Search Input + Count & Reset */}
          <div className={styles.searchRow}>
            <div className={styles.searchInputWrap}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by speciality, condition, or symptom (e.g. Heart, Knee, Chemo, Asthma)..."
                className={styles.searchInput}
                id="speciality-search-input"
                aria-label="Search medical specialities"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className={styles.clearSearchBtn}
                  aria-label="Clear search input"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className={styles.searchMetaRight}>
              <span className={styles.resultsCountBadge} id="results-count-badge">
                Showing {filteredSpecialities.length} of {ALL_SPECIALITIES.length} Specialities
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className={styles.resetAllBtn}
                  id="reset-filters-btn"
                  title="Reset all filters"
                >
                  <RotateCcw size={13} /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className={styles.categoryPillsTrack} role="tablist" aria-label="Speciality Categories">
            {categoriesList.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={isActive}
                  id={`cat-pill-${cat.toLowerCase().replace(/\s+&\s+|\s+/g, "-")}`}
                  onClick={() => setActiveCategory(cat)}
                  className={`${styles.categoryPill} ${isActive ? styles.categoryPillActive : ""}`}
                >
                  {cat === "Centres of Excellence" && <Star size={13} fill={isActive ? "#fff" : "#f59e0b"} stroke="none" />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 4. A–Z ALPHABET INDEX BAR ── */}
      <div className={styles.alphabetBarWrapper} aria-label="Alphabetical Specialities Index">
        <div className={styles.alphabetInner}>
          <span className={styles.alphabetLabel}>A–Z Index:</span>
          <button
            type="button"
            onClick={() => setActiveLetter("All")}
            className={`${styles.letterBtn} ${styles.letterBtnAll} ${
              activeLetter === "All" ? styles.letterBtnActive : ""
            }`}
            id="letter-filter-all"
            aria-pressed={activeLetter === "All"}
          >
            All
          </button>
          {ALPHABET.map((letter) => {
            const hasMatches = availableLetters.has(letter);
            const isActive = activeLetter === letter;

            return (
              <button
                key={letter}
                type="button"
                disabled={!hasMatches}
                onClick={() => setActiveLetter(letter)}
                className={`${styles.letterBtn} ${isActive ? styles.letterBtnActive : ""}`}
                id={`letter-filter-${letter}`}
                aria-pressed={isActive}
                title={hasMatches ? `Filter specialities starting with ${letter}` : `No specialities starting with ${letter}`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 5. MAIN SPECIALITIES DIRECTORY GRID ── */}
      <section className={styles.mainGridSection} aria-label="All Specialities Directory">
        <div className="container">
          <AnimatePresence mode="wait">
            {filteredSpecialities.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={styles.emptyStateContainer}
              >
                <div className={styles.emptyStateIcon}>
                  <Search size={32} />
                </div>
                <h3 className={styles.emptyStateTitle}>No matching specialities found</h3>
                <p className={styles.emptyStateDesc}>
                  We couldn&apos;t find any department matching &quot;<strong>{searchQuery}</strong>&quot;. Try checking for spelling errors, searching for common conditions (e.g. &apos;heart&apos;, &apos;kidney&apos;, &apos;asthma&apos;), or reset your filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className={styles.emptyResetBtn}
                  id="empty-state-reset-btn"
                >
                  <RotateCcw size={16} /> Reset All Filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`${activeCategory}-${activeLetter}-${searchQuery}`}
                className={styles.mainGrid}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {filteredSpecialities.map((spec, idx) => (
                  <motion.div
                    key={spec.slug}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(idx * 0.03, 0.3),
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      href={getSpecialityHref(spec.slug)}
                      className={styles.specCard}
                      id={`speciality-item-${spec.slug}`}
                      aria-label={`${spec.name} — ${spec.tagline}`}
                    >
                      {/* Media Header */}
                      <div className={styles.specCardMedia}>
                        <Image
                          src={spec.image}
                          alt={spec.name}
                          fill
                          className={styles.specCardImage}
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          loading={idx < 6 ? "eager" : "lazy"}
                        />
                        <div className={styles.specCardGradient} />

                        {spec.isCoE && (
                          <span className={styles.specCoEBadge}>
                            <Star size={11} fill="#fff" stroke="none" />
                            Centre of Excellence
                          </span>
                        )}

                        <span className={styles.specCategoryTag}>{spec.category}</span>

                        <div className={styles.specIconBadge} aria-hidden="true">
                          <img src={spec.icon} alt="" width={22} height={22} />
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className={styles.specCardBody}>
                        <h2 className={styles.specCardTitle}>{spec.name}</h2>
                        <p className={styles.specCardTagline}>{spec.tagline}</p>

                        {/* Conditions Tags */}
                        {spec.keyConditions && spec.keyConditions.length > 0 && (
                          <div className={styles.conditionsWrap}>
                            {spec.keyConditions.slice(0, 4).map((cond) => (
                              <span key={cond} className={styles.conditionChip}>
                                {cond}
                              </span>
                            ))}
                            {spec.keyConditions.length > 4 && (
                              <span className={styles.conditionChip} style={{ fontWeight: 600 }}>
                                +{spec.keyConditions.length - 4} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Stats Row */}
                        <div className={styles.specStatRow}>
                          <div>
                            <span className={styles.specStatHighlight}>{spec.stat.value}</span>{" "}
                            <span className={styles.specStatMuted}>{spec.stat.label}</span>
                          </div>
                          {spec.doctorCount && (
                            <span className={styles.specDoctorsCount}>
                              <UserCheck size={14} color="#034EA2" />
                              {spec.doctorCount}+ Specialists
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className={styles.specCardFooter}>
                        <span className={styles.specExploreAction}>
                          Explore Department <ChevronRight size={15} />
                        </span>
                        <span className={styles.specConsultAction}>
                          Consult <ArrowRight size={13} />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── 6. BOTTOM MEDICAL ADVISORY & SUPPORT BANNER ── */}
      <section className={styles.helpBanner} aria-label="Need Assistance">
        <div className={styles.helpBannerInner}>
          <div className={styles.helpLeft}>
            <span className={styles.helpEyebrow}>24/7 PATIENT SUPPORT & CARE COORDINATION</span>
            <h2 className={styles.helpTitle}>Not sure which speciality is right for you?</h2>
            <p className={styles.helpSubtitle}>
              Connect with our medical coordinators. We will evaluate your symptoms, match you with the right specialist, and help you schedule an immediate consultation.
            </p>
          </div>

          <div className={styles.helpActions}>
            <a
              href="tel:18003090309"
              className={styles.helpBtnCall}
              id="speciality-page-call-desk"
            >
              <PhoneCall size={16} /> 1800 309 0309 (Toll-Free)
            </a>
            <Link
              href="/search"
              className={styles.helpBtnDoctor}
              id="speciality-page-find-doctor"
            >
              <Search size={16} /> Find a Doctor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
