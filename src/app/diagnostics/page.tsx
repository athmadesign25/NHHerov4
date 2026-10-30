"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  X, 
  ArrowUpRight, 
  PhoneCall,
  Calendar,
  Clock,
  Activity,
  RotateCcw,
  SlidersHorizontal
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { MetricValueReveal } from "@/components/sections/hero/Hero";
import { DIAGNOSTICS_DATA, DiagnosticItem } from "@/data/diagnosticsData";
import styles from "./DiagnosticsLibrary.module.css";

// 10 Key Organ Filters
const ORGAN_FILTER_OPTIONS = [
  { label: "Heart", value: "heart", image: "/Specialities icons/Cardiology.jpeg" },
  { label: "Brain & Spine", value: "brain", image: "/Specialities icons/Neurology.jpeg" },
  { label: "Kidneys", value: "kidney", image: "/Specialities icons/Nephrology.jpeg" },
  { label: "Liver", value: "liver", image: "/Specialities icons/Liver Transplant.svg" },
  { label: "Lungs", value: "lungs", image: "/Specialities icons/Pulmonology.jpeg" },
  { label: "Bones & Joints", value: "bones", image: "/Specialities icons/Orthopedics.jpeg" },
  { label: "Stomach", value: "stomach", image: "/Specialities icons/General Surgery.jpeg" },
  { label: "Cancer Care", value: "cancer", image: "/Specialities icons/Cancer Care.jpeg" },
  { label: "Urinary & Bladder", value: "urinary", image: "/Specialities icons/Urology.jpeg" },
  { label: "Children & Neonatal", value: "paediatric", image: "/Specialities icons/Paediatrics.jpeg" },
];

// Secondary credentials on right hero column
const HERO_ANALYTICS_PARAMETERS = [
  { value: 1500, suffix: "+", label: "Diagnostic Tests" },
  { staticValue: "NABL", label: "Accredited Labs" },
  { staticValue: "Same Day", label: "Digital Reports" },
  { staticValue: "AI-Ready", label: "Imaging Precision" },
];

export default function DiagnosticsLibraryPage() {
  const [items, setItems] = useState<DiagnosticItem[]>(DIAGNOSTICS_DATA);
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
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

        const res = await fetch(`/api/diagnostics?${params.toString()}`, {
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
          console.error("[Diagnostics API] error:", err);
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
    return match ? match.label : selectedOrgan;
  }, [selectedOrgan]);

  const handleToggleOrgan = (val: string) => {
    setSelectedOrgan((prev) => (prev === val ? null : val));
  };

  const handleResetFilters = () => {
    setSelectedOrgan(null);
    setSearchQuery("");
  };

  return (
    <div className={styles.pageContainer}>
      {/* ─── TWO-COLUMN HERO SECTION ───────────────────────────────────────── */}
      <section className={styles.hero} data-nav-theme="dark">
        <div className={styles.heroBg}>
          <motion.div
            className={styles.heroBgMotion}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src="/doctor_patient.png"
              alt="Medical laboratory scientist analyzing test specimen"
              fill
              priority
              sizes="100vw"
              className={styles.heroBgImage}
            />
            <div className={styles.heroBgOverlay} />
          </motion.div>
        </div>

        <div className={styles.heroInner}>
          {/* Left Column */}
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
                  { label: "Diagnostics & Lab Tests" },
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
                words={["Diagnostics & Lab Tests"]} 
                sweepMs={2400} 
                delayMs={80} 
                finalColor="#FFFFFF" 
              />
            </motion.h1>

            <motion.p
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Access over 1,500+ NABL &amp; NABH accredited laboratory investigations, advanced MRI, CT scans, digital PET-CT, and endoscopy with rapid turnaround times and verified digital reports.
            </motion.p>

            {/* Pill Search */}
            <motion.div
              className={styles.heroSearchContainer}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.heroSearchRow}>
                <div className={styles.searchBoxWrap}>
                  <div className={styles.searchBox}>
                    <Search size={16} strokeWidth={2.0} className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Search test, scan, X-ray, MRI or blood panel..."
                      className={styles.searchInput}
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        startTransition(() => setSearchQuery(val));
                      }}
                      aria-label="Search diagnostic test or scan"
                    />
                    {searchQuery && (
                      <button
                        className={styles.clearSearchBtn}
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear search input"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className={`${styles.mobileFilterBtn} ${selectedOrgan ? styles.mobileFilterBtnActive : ""}`}
                  onClick={() => setIsFilterSheetOpen(true)}
                  aria-label="Open organ filters"
                >
                  <SlidersHorizontal size={15} />
                  <span className={styles.mobileFilterBtnText}>
                    {selectedOrgan ? ORGAN_FILTER_OPTIONS.find(o => o.value === selectedOrgan)?.label : "Filters"}
                  </span>
                  {selectedOrgan && <span className={styles.mobileFilterDot} />}
                </button>
              </div>

              {selectedOrgan && (
                <div className={styles.activeFilterRow}>
                  <span className={styles.activeFilterPill}>
                    <span>Filter: {ORGAN_FILTER_OPTIONS.find(o => o.value === selectedOrgan)?.label}</span>
                    <button
                      type="button"
                      className={styles.removeActiveFilterBtn}
                      onClick={() => handleToggleOrgan(selectedOrgan)}
                      aria-label="Remove filter"
                    >
                      <X size={12} />
                    </button>
                  </span>
                </div>
              )}

              {searchQuery.trim().length > 0 && (
                <div className={styles.searchCountFeedback}>
                  <span>
                    Showing <strong className={styles.searchCountHighlight}>{items.length}</strong> {items.length === 1 ? "diagnostic test" : "diagnostic tests"} for &ldquo;{searchQuery}&rdquo;
                  </span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column: Secondary Credential Numbers */}
          <motion.div
            className={styles.heroRightCol}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
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
          </motion.div>
        </div>
      </section>

      {/* ─── 10 ORGAN BUBBLE FILTERS ──────────────────────────────────────── */}
      <motion.section
        className={styles.categorySection}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.bubblesRow}>
          {ORGAN_FILTER_OPTIONS.map((opt) => {
            const isActive = selectedOrgan === opt.value;
            return (
              <button
                key={opt.value}
                className={`${styles.bubbleBtn} ${isActive ? styles.bubbleBtnActive : ""}`}
                onClick={() => handleToggleOrgan(opt.value)}
                type="button"
                aria-pressed={isActive}
              >
                <div className={styles.bubbleImgWrap}>
                  <Image
                    src={opt.image}
                    alt={opt.label}
                    fill
                    sizes="52px"
                    className={styles.bubbleImg}
                  />
                </div>
                <span className={styles.bubbleLabel}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* ─── DYNAMIC FEEDBACK TEXT ROW ─────────────────────────────────────── */}
      <motion.div
        className={styles.feedbackTextRow}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.55 }}
      >
        <div className={styles.feedbackTextWrapper}>
          <p className={styles.feedbackText}>
            {searchQuery.trim() ? (
              <>
                Here based on your search for <strong className={styles.feedbackHighlight}>&ldquo;{searchQuery}&rdquo;</strong> &mdash; <span className={styles.feedbackCount}>{items.length} {items.length === 1 ? "test" : "tests"} found</span>
              </>
            ) : selectedOrgan ? (
              <>
                Here based on your selection for tests under <strong className={styles.feedbackHighlight}>{currentOrganLabel}</strong> &mdash; <span className={styles.feedbackCount}>{items.length} {items.length === 1 ? "test" : "tests"} found</span>
              </>
            ) : (
              <>
                Here based on our diagnostic investigations directory &mdash; <span className={styles.feedbackCount}>{items.length} {items.length === 1 ? "test" : "tests"} available</span>
              </>
            )}
          </p>

          {(selectedOrgan || searchQuery.trim()) && (
            <button 
              type="button" 
              className={styles.clearFilterChip} 
              onClick={handleResetFilters}
              aria-label="Clear active filter"
            >
              <RotateCcw size={12} />
              <span>Reset filter</span>
            </button>
          )}
        </div>

        {isApiLoading && (
          <div className={styles.apiPulseBar}>
            <div className={styles.apiPulseIndicator} />
          </div>
        )}
      </motion.div>

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
            {items.length === 0 ? (
              <div className={styles.emptyState} style={{ gridColumn: "1 / -1" }}>
                <div className={styles.emptyIconWrapper}>
                  <Search size={26} />
                </div>
                <h3 className={styles.emptyTitle}>No matching diagnostic tests found</h3>
                <p className={styles.emptyDesc}>
                  We couldn&apos;t find any tests matching your query. Try searching for &ldquo;MRI&rdquo;, &ldquo;X-ray&rdquo;, &ldquo;Blood test&rdquo;, or &ldquo;CT Scan&rdquo;.
                </p>
                <button className={styles.resetFiltersBtn} onClick={handleResetFilters}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {items.map((item, idx) => {
                  const detailUrl = `/diagnostics/${item.slug}`;
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
                          sizes="(max-width: 640px) 84px, (max-width: 1024px) 50vw, 33vw"
                          className={styles.cardBgImage}
                        />
                        <div className={styles.cardGradient} />
                      </div>

                      <div className={styles.cardContent}>
                        <div className={styles.cardTextGroup}>
                          <div className={styles.cardEyebrow}>
                            {item.modality}
                          </div>

                          <Link href={detailUrl} className={styles.cardTitleLink}>
                            <h2 className={styles.cardTitle}>
                              {item.title}
                            </h2>
                          </Link>

                          <p className={styles.cardSub}>
                            {item.summary}
                          </p>
                        </div>

                        <div className={styles.cardBottomSlot}>
                          <div className={styles.cardRestingMeta}>
                            <span className={styles.metaBadge}>
                              <Clock size={11} className={styles.metaIcon} />
                              <span>{item.turnaroundTime}</span>
                            </span>
                            <span className={styles.metaBadge}>
                              <Activity size={11} className={styles.metaIcon} />
                              <span>{item.preparation}</span>
                            </span>
                          </div>

                          <div className={styles.cardActions}>
                            <Link href={doctorsUrl} className={styles.cardDoctorBtn}>
                              Book test
                            </Link>

                            <Link href={detailUrl} className={styles.cardDetailBtn}>
                              <span>Test details</span>
                              <ArrowUpRight size={11.5} className={styles.pillBtnArrow} />
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

      {/* ─── BOTTOM TRUST HIGHLIGHT ───────────────────────────────────────── */}
      <section className={styles.trustBanner}>
        <div className={styles.trustImageBg}>
          <Image
            src="/top-medical-experts.png"
            alt="Narayana Health automated laboratory center"
            fill
            sizes="(max-width: 900px) 100vw, 640px"
            className={styles.trustImage}
          />
          <div className={styles.trustGradientOverlay} />
        </div>

        <div className={styles.trustContent}>
          <div className={styles.trustEyebrow}>NABL ACCREDITED LABORATORY NETWORK</div>
          <h3 className={styles.trustTitle}>
            Need doorstep home sample collection?
          </h3>
          <p className={styles.trustDesc}>
            Our trained, vaccinated phlebotomists collect blood and pathology samples directly from your home with barcode verification and automated temperature-controlled transit.
          </p>

          <div className={styles.trustActions}>
            <Link href="/doctors" className={styles.trustPrimaryBtn}>
              <Calendar size={16} />
              <span>Schedule Home Collection</span>
            </Link>
            <a href="tel:18003090309" className={styles.trustSecondaryBtn}>
              <PhoneCall size={15} />
              <span>Diagnostics Helpline: 1800 309 0309</span>
            </a>
          </div>
        </div>
      </section>

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
    </div>
  );
}
