"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLibraryHeroBlendShrink } from "@/lib/useHeroShrink";
import { 
  Search, 
  X, 
  ArrowUpRight, 
  AlertTriangle,
  Activity
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { CardTitleText, buildCardHoverReading } from "@/components/ui/CardTitleText";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import LibraryDiscoveryDock from "@/components/ui/LibraryDiscoveryDock";
import MobileRollingStats from "@/components/ui/MobileRollingStats";
import {
  DEFAULT_ORGAN_FILTER_OPTIONS,
} from "@/components/ui/OrganSystemChipsCarousel";
import { MetricValueReveal } from "@/components/sections/hero/Hero";
import { SYMPTOMS_DATA, SymptomItem } from "@/data/symptomsData";
import styles from "./SymptomsLibrary.module.css";

// 14 Key Organ & Clinical Filters
const ORGAN_FILTER_OPTIONS = DEFAULT_ORGAN_FILTER_OPTIONS;

// Secondary credentials on right hero column
const HERO_ANALYTICS_PARAMETERS = [
  { value: 200, suffix: "+", label: "Documented Symptoms" },
  { value: 30, suffix: "+", label: "Clinical Specialities" },
  { staticValue: "24×7", label: "Emergency Triage" },
  { staticValue: "100%", label: "Doctor Reviewed" },
];

export default function SymptomsLibraryPage() {
  const [items, setItems] = useState<SymptomItem[]>(SYMPTOMS_DATA);
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [isPageOpening, setIsPageOpening] = useState<boolean>(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (isFilterSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterSheetOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageOpening(false);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const initialSearch = urlParams.get("search") || urlParams.get("q") || urlParams.get("query");
      const initialOrgan = urlParams.get("organ");
      if (initialSearch) setSearchQuery(initialSearch);
      if (initialOrgan) setSelectedOrgan(initialOrgan);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsApiLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("query", searchQuery.trim());
        if (selectedOrgan) params.set("organ", selectedOrgan);
        params.set("limit", "48");

        const res = await fetch(`/api/symptoms?${params.toString()}`, {
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.items)) {
            setItems(data.items);
          }
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          console.error("[Symptoms API] error:", err);
        }
      } finally {
        setIsApiLoading(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [selectedOrgan, searchQuery]);

  const currentOrganLabel = useMemo(() => {
    if (!selectedOrgan) return null;
    const match = ORGAN_FILTER_OPTIONS.find((s) => s.value === selectedOrgan);
    return match ? (match.shortLabel || match.label) : selectedOrgan;
  }, [selectedOrgan]);

  const handleToggleOrgan = (val: string) => {
    setSelectedOrgan((prev) => (prev === val ? null : val));
  };

  const displayedItems = useMemo(() => {
    if (!selectedLetter) return items;
    return items.filter((item) => {
      const char = (item.letter || item.shortTitle[0] || item.title[0]).toUpperCase();
      return char === selectedLetter;
    });
  }, [items, selectedLetter]);

  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      const char = (item.letter || item.shortTitle[0] || item.title[0]).toUpperCase();
      if (char >= "A" && char <= "Z") set.add(char);
    });
    return set;
  }, [items]);

  const dynamicHeadingText = useMemo(() => {
    const base = currentOrganLabel ? `${currentOrganLabel} Symptoms & Triage Guides` : "All Clinical Symptoms";
    if (searchQuery.trim() && selectedLetter) {
      return `${base} Matching “${searchQuery.trim()}” (Starting with ‘${selectedLetter}’)`;
    }
    if (searchQuery.trim()) return `${base} Matching “${searchQuery.trim()}”`;
    if (selectedLetter) return `${base} Starting with ‘${selectedLetter}’`;
    return base;
  }, [currentOrganLabel, searchQuery, selectedLetter]);

  const handleResetFilters = () => {
    setSelectedOrgan(null);
    setSearchQuery("");
    setSelectedLetter(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("organ");
      url.searchParams.delete("search");
      url.searchParams.delete("q");
      url.searchParams.delete("query");
      window.history.replaceState(null, "", url.toString());
    }
  };

  // Blended dark landing above the fold -> hero shrinks over white & filters crossfade cleanly on scroll
  const { pageMotionStyle, heroMotionStyle } = useLibraryHeroBlendShrink();

  return (
    <motion.div
      className={styles.pageContainer}
      style={pageMotionStyle}
    >
      {/* ─── TWO-COLUMN HERO SECTION (BLENDED DARK AT REST -> INSETS OVER WHITE) ─── */}
      <div style={{ position: "relative", overflowX: "clip" }}>
        <motion.section
          className={styles.hero}
          data-nav-theme="dark"
          style={heroMotionStyle}
        >
          <div className={styles.heroBg}>
            <motion.div
              className={styles.heroBgMotion}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src="/images/heroes/symptoms_hero_v3.jpg"
                alt="Doctor assessing patient symptoms"
                fill
                priority
                sizes="100vw"
                className={styles.heroBgImage}
              />
              <div className={styles.heroBgOverlay} />
            </motion.div>
          </div>

        <div className={styles.heroInner}>
          {/* Left Column: Breadcrumb, Title, Subtitle & Pulse Search */}
          <div className={styles.heroLeftCol}>
            <motion.div
              className={styles.breadcrumbsContainer}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
            >
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Symptoms Guide" },
                ]}
                theme="dark"
              />
            </motion.div>

            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            >
              <TextSweepEffect 
                words={["Symptoms & Clinical Triage"]} 
                sweepMs={2400} 
                delayMs={80} 
                finalColor="var(--dyn-heading, #FFFFFF)" 
              />
            </motion.h1>

            <motion.p
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Identify warning signs, understand potential medical causes, and find the right specialist for early diagnosis and treatment across 24×7 Narayana Health care networks.
            </motion.p>

            <MobileRollingStats items={HERO_ANALYTICS_PARAMETERS} />

            {/* L1 Compact Inline Numerical Credentials */}
            <motion.div
              className={styles.l1InlineStatsWrap}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.l1InlineStatsGrid}>
                {HERO_ANALYTICS_PARAMETERS.map((item, index) => (
                  <div key={index} className={styles.statBlock}>
                    <span className={styles.statNumber}>
                      {item.staticValue ? (
                        item.staticValue
                      ) : (
                        <MetricValueReveal value={item.value!} suffix={item.suffix} />
                      )}
                    </span>
                    <span className={styles.statLabel}>{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
        </motion.section>
      </div>

      {/* ─── F5 DISCOVERY, SMOOTH REVEAL & BLURRED STICKY BREADCRUMB DOCK ─── */}
      <LibraryDiscoveryDock
        id="symptoms-directory"
        currentTitle="Symptoms Directory"
        parentLabel="Health Library"
        searchPlaceholder="Search symptom, sensation or warning sign..."
        searchAriaLabel="Search symptom or warning sign"
        searchQuery={searchQuery}
        onSearchChange={(val) => startTransition(() => setSearchQuery(val))}
        gradId="nhSearchPillGradSymptoms"
        organOptions={ORGAN_FILTER_OPTIONS}
        selectedOrgan={selectedOrgan}
        onToggleOrgan={handleToggleOrgan}
        onClearOrgan={() => setSelectedOrgan(null)}
        onOpenMobileFilters={() => setIsFilterSheetOpen(true)}
        availableLetters={availableLetters}
        selectedLetter={selectedLetter}
        onSelectLetter={setSelectedLetter}
        headingText={dynamicHeadingText}
        resultCount={displayedItems.length}
        isApiLoading={isApiLoading}
        onResetAll={handleResetFilters}
      >
        {/* ─── 3-COLUMN CARDS GRID ──────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {isPageOpening ? (
            <motion.div
              key="entrance-skeletons"
              className={styles.cardsGrid}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.45, delay: 0.6 }}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonImageWrap}>
                    <div className={styles.skeletonShimmer} />
                  </div>
                  <div className={styles.skeletonContent}>
                    <div>
                      <div className={styles.skeletonEyebrow} />
                      <div className={styles.skeletonTitle} />
                      <div className={styles.skeletonLine} />
                      <div className={styles.skeletonLineShort} />
                      <div className={styles.skeletonBadges}>
                        <div className={styles.skeletonBadge} />
                        <div className={styles.skeletonBadge} />
                      </div>
                    </div>
                    <div className={styles.skeletonFooter}>
                      <div className={styles.skeletonPrice} />
                      <div className={styles.skeletonCta} />
                    </div>
                  </div>
                  <div className={styles.skeletonShimmer} />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.main
              key="loaded-cards"
              className={styles.cardsGrid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isApiLoading ? 0.78 : 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {displayedItems.length === 0 ? (
                <div className={styles.emptyState} style={{ gridColumn: "1 / -1" }}>
                  <div className={styles.emptyIconWrapper}>
                    <Search size={26} />
                  </div>
                  <h3 className={styles.emptyTitle}>No matching symptoms found</h3>
                  <p className={styles.emptyDesc}>
                    We couldn&apos;t find any symptoms matching your query or organ filter. Try searching for broader terms like &ldquo;pain&rdquo;, &ldquo;fever&rdquo;, or &ldquo;breath&rdquo;.
                  </p>
                  <button className={styles.resetFiltersBtn} onClick={handleResetFilters}>
                    Reset Filters
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {displayedItems.map((item, idx) => {
                  const detailUrl = `/symptoms/${item.slug}`;
                  const doctorsUrl = `/doctors?speciality=${encodeURIComponent(item.specialitySlug)}`;

                  return (
                    <motion.article
                      key={item.id}
                      className={styles.procedureCard}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.24, delay: Math.min(idx * 0.02, 0.15) }}
                    >
                      <div className={styles.cardImageWrap}>
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className={styles.cardBgImage}
                        />
                        <div className={styles.cardGradient} />
                      </div>

                      <div className={styles.cardContent}>
                        <div className={styles.cardTextGroup}>
                          <div className={styles.cardEyebrow}>
                            {item.speciality}
                          </div>

                          <Link href={detailUrl} className={styles.cardTitleLink}>
                            <h2 className={styles.cardTitle}>
                              <CardTitleText title={item.title} />
                            </h2>
                          </Link>

                          <div className={styles.cardSubReveal}>
                            <div className={styles.cardSubInner}>
                              <p className={styles.cardSub}>
                                {buildCardHoverReading([
                                  item.overview,
                                  item.summary,
                                  item.commonCauses?.length ? `Common causes: ${item.commonCauses.slice(0, 3).join(", ")}` : null,
                                  item.diagnosticTests?.length ? `Diagnostic evaluation: ${item.diagnosticTests.slice(0, 3).join(", ")}` : null,
                                ])}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className={styles.cardBottomSlot}>
                          <div className={styles.cardRestingMeta}>
                            <span className={styles.metaBadge}>
                              <span>{item.severity}</span>
                            </span>
                            <span className={styles.metaDivider} aria-hidden="true" />
                            <span className={styles.metaBadge}>
                              <span>{item.urgencyLevel}</span>
                            </span>
                          </div>

                          <div className={styles.cardActions}>
                            <Link href={doctorsUrl} className={styles.cardDoctorBtn}>
                              Find doctors
                            </Link>

                            <Link href={detailUrl} className={styles.cardDetailBtn}>
                              <span>Read more</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            )}
          </motion.main>
        )}
      </AnimatePresence>
      </LibraryDiscoveryDock>

      {/* ─── PRE-FOOTER CTA CARD BANNER (UNIVERSAL DESIGN TOKEN) ─────── */}
      <BlogCtaBanner
        bg="transparent"
        eyebrow="24×7 EMERGENCY & TRIAGE NETWORK"
        title="Experiencing Severe or Sudden Symptoms?"
        subtitle="Don't ignore critical warning signs. Our emergency care units and rapid triage helpline are available 24×7 with state-of-the-art ambulances, cath labs, and trauma specialists."
        primaryBtn={{
          href: "/book-an-appointment",
          text: "Find a Specialist",
        }}
        secondaryBtn={{
          href: "/treatments",
          text: "Explore Treatments",
        }}
        phoneText="Emergency Helpline: 1800 309 0309"
        phoneHref="tel:18003090309"
      />
      <ClinicalFloatingSideActions />

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {isFilterSheetOpen && (
          <div className={styles.filterSheetOverlay} onClick={() => setIsFilterSheetOpen(false)}>
            <motion.div
              className={styles.filterSheetContent}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.filterSheetHeader}>
                <div className={styles.filterSheetHandle} />
                <div className={styles.filterSheetTitleRow}>
                  <h3 className={styles.filterSheetTitle}>Filter by Organ System</h3>
                  <button
                    className={styles.filterSheetCloseBtn}
                    onClick={() => setIsFilterSheetOpen(false)}
                    aria-label="Close filters"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className={styles.filterSheetBody}>
                <div className={styles.filterSheetGrid}>
                  {ORGAN_FILTER_OPTIONS.map((opt) => {
                    const isActive = selectedOrgan === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`${styles.filterSheetItem} ${isActive ? styles.filterSheetItemActive : ""}`}
                        onClick={() => {
                          handleToggleOrgan(opt.value);
                          setIsFilterSheetOpen(false);
                        }}
                      >
                        <div className={styles.filterSheetImgWrap}>
                          <Image
                            src={opt.image}
                            alt={opt.label}
                            fill
                            sizes="40px"
                            className={styles.filterSheetImg}
                          />
                        </div>
                        <span className={styles.filterSheetLabel}>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.filterSheetFooter}>
                <button
                  type="button"
                  className={styles.filterSheetResetBtn}
                  onClick={() => {
                    setSelectedOrgan(null);
                    setIsFilterSheetOpen(false);
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className={styles.filterSheetApplyBtn}
                  onClick={() => setIsFilterSheetOpen(false)}
                >
                  Apply Filter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
