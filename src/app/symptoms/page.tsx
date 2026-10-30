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
  AlertTriangle,
  Activity,
  RotateCcw,
  SlidersHorizontal
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { MetricValueReveal } from "@/components/sections/hero/Hero";
import { SYMPTOMS_DATA, SymptomItem } from "@/data/symptomsData";
import styles from "./SymptomsLibrary.module.css";

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
  { value: 200, suffix: "+", label: "Documented Symptoms" },
  { value: 30, suffix: "+", label: "Clinical Specialities" },
  { staticValue: "24×7", label: "Emergency Triage" },
  { staticValue: "100%", label: "Doctor Reviewed" },
];

export default function SymptomsLibraryPage() {
  const [items, setItems] = useState<SymptomItem[]>(SYMPTOMS_DATA);
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
                finalColor="#FFFFFF" 
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
                      placeholder="Search symptom, sensation or warning sign..."
                      className={styles.searchInput}
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        startTransition(() => setSearchQuery(val));
                      }}
                      aria-label="Search symptom or warning sign"
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
                    Showing <strong className={styles.searchCountHighlight}>{items.length}</strong> {items.length === 1 ? "symptom" : "symptoms"} for &ldquo;{searchQuery}&rdquo;
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
                Here based on your search for <strong className={styles.feedbackHighlight}>&ldquo;{searchQuery}&rdquo;</strong> &mdash; <span className={styles.feedbackCount}>{items.length} {items.length === 1 ? "symptom" : "symptoms"} found</span>
              </>
            ) : selectedOrgan ? (
              <>
                Here based on your selection for symptoms under <strong className={styles.feedbackHighlight}>{currentOrganLabel}</strong> &mdash; <span className={styles.feedbackCount}>{items.length} {items.length === 1 ? "symptom" : "symptoms"} found</span>
              </>
            ) : (
              <>
                Here based on our clinical symptoms directory &mdash; <span className={styles.feedbackCount}>{items.length} {items.length === 1 ? "symptom" : "symptoms"} available</span>
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
                <h3 className={styles.emptyTitle}>No matching symptoms found</h3>
                <p className={styles.emptyDesc}>
                  We couldn't find any symptoms matching your query or organ filter. Try searching for broader terms like &ldquo;pain&rdquo;, &ldquo;fever&rdquo;, or &ldquo;breath&rdquo;.
                </p>
                <button className={styles.resetFiltersBtn} onClick={handleResetFilters}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {items.map((item, idx) => {
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
                          sizes="(max-width: 640px) 84px, (max-width: 1024px) 50vw, 33vw"
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
                              <AlertTriangle size={11} className={styles.metaIcon} />
                              <span>{item.severity}</span>
                            </span>
                            <span className={styles.metaBadge}>
                              <Activity size={11} className={styles.metaIcon} />
                              <span>{item.urgencyLevel}</span>
                            </span>
                          </div>

                          <div className={styles.cardActions}>
                            <Link href={doctorsUrl} className={styles.cardDoctorBtn}>
                              Find doctors
                            </Link>

                            <Link href={detailUrl} className={styles.cardDetailBtn}>
                              <span>Read more</span>
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
            alt="Narayana Health multidisciplinary emergency team"
            fill
            sizes="(max-width: 900px) 100vw, 640px"
            className={styles.trustImage}
          />
          <div className={styles.trustGradientOverlay} />
        </div>

        <div className={styles.trustContent}>
          <div className={styles.trustEyebrow}>24×7 EMERGENCY & TRIAGE NETWORK</div>
          <h3 className={styles.trustTitle}>
            Experiencing severe or sudden symptoms?
          </h3>
          <p className={styles.trustDesc}>
            Don't ignore critical warning signs. Our emergency care units and rapid triage helpline are available 24×7 with state-of-the-art ambulances, cath labs, and trauma specialists.
          </p>

          <div className={styles.trustActions}>
            <a href="tel:18003090309" className={styles.trustPrimaryBtn}>
              <PhoneCall size={16} />
              <span>Call Helpline: 1800 309 0309</span>
            </a>
            <Link href="/doctors" className={styles.trustSecondaryBtn}>
              <span>Consult a Doctor Online</span>
              <ArrowUpRight size={15} />
            </Link>
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
