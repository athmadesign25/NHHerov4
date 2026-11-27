"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useTransition,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLibraryHeroBlendShrink } from "@/lib/useHeroShrink";
import {
  Search,
  X,
  ArrowUpRight,
  Clock,
  Activity,
  Layers,
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import LibraryDiscoveryDock from "@/components/ui/LibraryDiscoveryDock";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { CardTitleText, buildCardHoverReading } from "@/components/ui/CardTitleText";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import {
  DEFAULT_ORGAN_FILTER_OPTIONS,
} from "@/components/ui/OrganSystemChipsCarousel";
import MobileRollingStats from "@/components/ui/MobileRollingStats";
import { MetricValueReveal } from "@/components/sections/hero/Hero";
import {
  TREATMENTS_PROCEDURES_DATA,
  TreatmentProcedureItem
} from "@/data/treatmentsProceduresData";
import styles from "@/app/treatments/TreatmentsLibrary.module.css";

// Pure Organ-Only Circular Filters (Red, Blue & White 3D/Clean SVG Icons)
const ORGAN_FILTER_OPTIONS = DEFAULT_ORGAN_FILTER_OPTIONS;

// Hero Credential Parameters (part of Title & Subtext narrative)
const HERO_ANALYTICS_PARAMETERS = [
  { value: 400, suffix: "+", label: "Surgical Procedures" },
  { value: 30, suffix: "+", label: "Medical Specialities" },
  { staticValue: "98.6%", label: "Clinical Safety Score" },
  { staticValue: "1L+", label: "Transplants & Complex Surgeries" },
];

const PATIENT_GROUP_CHIPS = [
  { id: "adult", label: "Adult" },
  { id: "pediatric", label: "Pediatric" },
] as const;

export default function TreatmentsV2Library() {
  const [items, setItems] = useState<TreatmentProcedureItem[]>(TREATMENTS_PROCEDURES_DATA);
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>("all");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [isPageOpening, setIsPageOpening] = useState<boolean>(true);
  const [, startTransition] = useTransition();

  // Blended dark landing above the fold -> hero shrinks over white & filters crossfade cleanly on scroll
  const { pageMotionStyle, heroMotionStyle } = useLibraryHeroBlendShrink();

  // Prevent background scroll when mobile filter sheet is open
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

  // Initial page entrance animation sequence orchestration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageOpening(false);
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  // Read URL search or organ parameter if navigated from Pulse search
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const initialSearch = urlParams.get("search") || urlParams.get("q") || urlParams.get("query");
      const initialOrgan = urlParams.get("organ");
      if (initialSearch) {
        setSearchQuery(initialSearch);
      }
      if (initialOrgan) {
        setSelectedOrgan(initialOrgan);
      }
    }
  }, []);

  // Dynamic API fetching whenever selectedOrgan or searchQuery changes
  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setIsApiLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("query", searchQuery.trim());
        if (selectedOrgan) params.set("organ", selectedOrgan);
        params.set("limit", "48");

        const res = await fetch(`/api/treatments?${params.toString()}`, {
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
          console.error("[Treatments API] error:", err);
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

  const isPediatricItem = useCallback((item: TreatmentProcedureItem) => {
    const text = `${item.title} ${item.shortTitle} ${item.summary} ${item.overview} ${item.speciality} ${item.specialitySlug} ${item.slug}`.toLowerCase();
    return (
      text.includes("pediatric") ||
      text.includes("paediatric") ||
      text.includes("child") ||
      text.includes("infant") ||
      text.includes("neonatal") ||
      text.includes("congenital") ||
      item.specialitySlug === "paediatric"
    );
  }, []);

  const matchesSubFilter = useCallback(
    (item: TreatmentProcedureItem, subFilter: string) => {
      if (subFilter === "pediatric") return isPediatricItem(item);
      if (subFilter === "adult") return !isPediatricItem(item);
      return true;
    },
    [isPediatricItem]
  );

  const displayedItems = useMemo(() => {
    return items.filter((item) => {
      if (!matchesSubFilter(item, selectedSubFilter)) {
        return false;
      }
      if (selectedLetter) {
        const firstChar = (item.letter || item.shortTitle[0] || item.title[0]).toUpperCase();
        if (firstChar !== selectedLetter) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedSubFilter, selectedLetter, matchesSubFilter]);

  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (!matchesSubFilter(item, selectedSubFilter)) return;
      const char = (item.letter || item.shortTitle[0] || item.title[0]).toUpperCase();
      if (char >= "A" && char <= "Z") {
        set.add(char);
      }
    });
    return set;
  }, [items, selectedSubFilter, matchesSubFilter]);

  // Dynamic Book-Appointment-Style Heading reflecting active filters
  const dynamicResultsHeading = useMemo(() => {
    const parts: string[] = [];
    if (selectedSubFilter === "pediatric") parts.push("Pediatric");
    else if (selectedSubFilter === "adult") parts.push("Adult");

    if (currentOrganLabel) {
      parts.push(currentOrganLabel);
    }

    const baseSubject = parts.length > 0 ? `${parts.join(" ")} Treatments & Procedures` : "All Surgical Treatments & Procedures";

    if (searchQuery.trim() && selectedLetter) {
      return `${baseSubject} Matching “${searchQuery.trim()}” (Starting with ‘${selectedLetter}’)`;
    }
    if (searchQuery.trim()) {
      return `${baseSubject} Matching “${searchQuery.trim()}”`;
    }
    if (selectedLetter) {
      return `${baseSubject} Starting with ‘${selectedLetter}’`;
    }
    return baseSubject;
  }, [selectedSubFilter, currentOrganLabel, searchQuery, selectedLetter]);

  const handleResetFilters = () => {
    setSelectedOrgan(null);
    setSearchQuery("");
    setSelectedSubFilter("all");
    setSelectedLetter(null);
    setItems(TREATMENTS_PROCEDURES_DATA);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("organ");
      url.searchParams.delete("search");
      url.searchParams.delete("q");
      url.searchParams.delete("query");
      window.history.replaceState(null, "", url.toString());
    }
  };

  return (
    <motion.div
      className={styles.pageContainer}
      style={pageMotionStyle}
    >
      {/* ─── HERO SECTION (BLENDED DARK AT REST -> INSETS OVER WHITE ON SCROLL) ─── */}
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
                src="/images/heroes/treatments_hero_v3.jpg"
                alt="Surgeon performing precision procedure at Narayana Health"
                fill
                priority
                sizes="100vw"
                className={styles.heroBgImage}
              />
              <div className={styles.heroBgOverlay} />
            </motion.div>
          </div>

          <div className={styles.heroInner}>
            {/* Top Narrative Block: Breadcrumb + Title + Subtext + (L1: Inline Numerical Credentials) */}
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
                    { label: "Treatments & Procedures" },
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
                  words={["Treatments & Procedures"]}
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
                Explore comprehensive clinical guides, recovery paths, and transparent pricing for over 400+ advanced surgical procedures and evidence-based treatments across Narayana Health.
              </motion.p>

              {/* Mobile Web Rolling Single-Row Credential Ticker */}
              <MobileRollingStats items={HERO_ANALYTICS_PARAMETERS} />

              {/* L1: Numerical Values are directly part of Title & Subtext block */}
              <motion.div
                key="hero-stats-l1"
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

      {/* ─── F5 IN-FLOW DISCOVERY + FIXED STICKY DOCK (MINI-CIRCLE ORGAN PILLS ON SCROLL) ─── */}
      <LibraryDiscoveryDock
        id="procedures-directory"
        currentTitle="Treatments & Procedures"
        parentLabel="Health Library"
        searchPlaceholder="Search treatments, surgery, organ or condition..."
        searchAriaLabel="Search treatments, surgery or condition"
        searchQuery={searchQuery}
        onSearchChange={(val) => startTransition(() => setSearchQuery(val))}
        gradId="nhSearchPillGradTreatments"
        organOptions={ORGAN_FILTER_OPTIONS}
        selectedOrgan={selectedOrgan}
        onToggleOrgan={handleToggleOrgan}
        onClearOrgan={() => setSelectedOrgan(null)}
        onOpenMobileFilters={() => setIsFilterSheetOpen(true)}
        subFilterChips={PATIENT_GROUP_CHIPS}
        selectedSubFilter={selectedSubFilter}
        onSelectSubFilter={(id) => {
          setSelectedSubFilter(id);
          setSelectedLetter(null);
        }}
        availableLetters={availableLetters}
        selectedLetter={selectedLetter}
        onSelectLetter={setSelectedLetter}
        headingText={dynamicResultsHeading}
        resultCount={displayedItems.length}
        isApiLoading={isApiLoading}
        onResetAll={handleResetFilters}
      >
        <AnimatePresence mode="wait">
          {isPageOpening ? (
            <motion.div
              key="entrance-skeletons"
              className={styles.cardsGrid}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.45, delay: 0.4 }}
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
                  <h3 className={styles.emptyTitle}>No matching procedures found</h3>
                  <p className={styles.emptyDesc}>
                    We couldn&apos;t find any results matching your search, care group, or active filter. Try clearing your filters or exploring another organ system.
                  </p>
                  <button className={styles.resetFiltersBtn} onClick={handleResetFilters}>
                    Reset Filters
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {displayedItems.map((item, idx) => {
                    const detailUrl = `/procedures/${item.slug}`;
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
                                    item.duration ? `Typical procedure duration: ${item.duration}` : null,
                                    item.hospitalStay ? `Hospital stay: ${item.hospitalStay}` : null,
                                    item.recoveryTime ? `Expected recovery: ${item.recoveryTime}` : null,
                                    item.successRate ? `Clinical success rate: ${item.successRate}` : null,
                                  ])}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className={styles.cardBottomSlot}>
                            <div className={styles.cardRestingMeta}>
                              <span className={styles.metaBadge}>
                                <span>{item.hospitalStay ? `Stay: ${item.hospitalStay}` : "Minimal Stay"}</span>
                              </span>
                              <span className={styles.metaDivider} aria-hidden="true" />
                              <span className={styles.metaBadge}>
                                <span>{item.recoveryTime ? `Recovery: ${item.recoveryTime}` : "Fast Recovery"}</span>
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
        eyebrow="MULTI-DISCIPLINARY SURGICAL BOARD"
        title="Looking for a Surgical Second Opinion or Cost Estimate?"
        subtitle="Our senior surgical boards review complex diagnoses, imaging reports, and recommend minimally invasive surgical alternatives with transparent, all-inclusive pricing."
        primaryBtn={{
          href: "/book-an-appointment",
          text: "Find a Specialist",
        }}
        secondaryBtn={{
          href: "/health-packages",
          text: "Explore Health Packages",
        }}
        phoneText="Surgical Helpline: 1800 309 0309"
        phoneHref="tel:18003090309"
      />
      <ClinicalFloatingSideActions />

      {/* ─── MOBILE FILTER BOTTOM SHEET DRAWER ─── */}
      <AnimatePresence>
        {isFilterSheetOpen && (
          <>
            <motion.div
              className={styles.sheetBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterSheetOpen(false)}
            />

            <motion.div
              className={styles.sheetContainer}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.sheetDragHandle} />

              <div className={styles.sheetHeader}>
                <div className={styles.sheetTitleWrap}>
                  <h3 className={styles.sheetTitle}>Filter by Organ System</h3>
                  <span className={styles.sheetSubtitle}>Choose an organ to filter procedures</span>
                </div>
                <button
                  type="button"
                  className={styles.sheetCloseBtn}
                  onClick={() => setIsFilterSheetOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={16} />
                </button>
              </div>

              <div className={styles.sheetBody}>
                <button
                  type="button"
                  className={`${styles.sheetOrganCard} ${!selectedOrgan ? styles.sheetOrganCardActive : ""}`}
                  onClick={() => {
                    setSelectedOrgan(null);
                    setIsFilterSheetOpen(false);
                  }}
                >
                  <div className={styles.sheetOrganIconWrapAll}>
                    <Layers size={18} />
                  </div>
                  <span className={styles.sheetOrganLabel}>All Organ Systems</span>
                  <span className={styles.sheetOrganCount}>{TREATMENTS_PROCEDURES_DATA.length}</span>
                </button>

                <div className={styles.sheetOrgansGrid}>
                  {ORGAN_FILTER_OPTIONS.map((opt) => {
                    const isSelected = selectedOrgan === opt.value;
                    const count = TREATMENTS_PROCEDURES_DATA.filter((p) => {
                      const fullContent = `${p.title} ${p.shortTitle} ${p.speciality} ${p.summary} ${p.specialitySlug}`.toLowerCase();
                      return fullContent.includes(opt.value);
                    }).length;

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`${styles.sheetOrganCard} ${isSelected ? styles.sheetOrganCardActive : ""}`}
                        onClick={() => {
                          handleToggleOrgan(opt.value);
                          setIsFilterSheetOpen(false);
                        }}
                      >
                        <div className={styles.sheetOrganImgWrap}>
                          <Image
                            src={opt.image}
                            alt={opt.label}
                            width={24}
                            height={24}
                            className={styles.sheetOrganImg}
                          />
                        </div>
                        <span className={styles.sheetOrganLabel}>{opt.label}</span>
                        {count > 0 && <span className={styles.sheetOrganCount}>{count}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.sheetFooter}>
                {selectedOrgan ? (
                  <button
                    type="button"
                    className={styles.sheetResetBtn}
                    onClick={() => {
                      setSelectedOrgan(null);
                    }}
                  >
                    Reset
                  </button>
                ) : (
                  <div />
                )}
                <button
                  type="button"
                  className={styles.sheetApplyBtn}
                  onClick={() => setIsFilterSheetOpen(false)}
                >
                  View {displayedItems.length} Procedures
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div >
  );
}
