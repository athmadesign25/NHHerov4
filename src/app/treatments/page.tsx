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
  RotateCcw
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { MetricValueReveal } from "@/components/sections/hero/Hero";
import { 
  TREATMENTS_PROCEDURES_DATA, 
  TreatmentProcedureItem 
} from "@/data/treatmentsProceduresData";
import styles from "./TreatmentsLibrary.module.css";

// 10 Key Organ Filters requested by user
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

// Secondary credentials on right hero column (calm, non-distracting 4 parameters)
const HERO_ANALYTICS_PARAMETERS = [
  { value: 400, suffix: "+", label: "Surgical Procedures" },
  { value: 30, suffix: "+", label: "Medical Specialities" },
  { staticValue: "98.6%", label: "Clinical Safety Score" },
  { staticValue: "1L+", label: "Transplants & Complex Surgeries" },
];

export default function TreatmentsLibraryPage() {
  const [items, setItems] = useState<TreatmentProcedureItem[]>(TREATMENTS_PROCEDURES_DATA);
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [isPageOpening, setIsPageOpening] = useState<boolean>(true);
  const [, startTransition] = useTransition();

  // Initial page entrance animation sequence orchestration (image -> overlay -> title/subtext -> search -> skeleton -> real cards)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageOpening(false);
    }, 950);
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
    
    // Quick debounce so typing feels natural without overloading network
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
    return match ? match.label : selectedOrgan;
  }, [selectedOrgan]);

  const handleToggleOrgan = (val: string) => {
    // Clicking active organ toggles it off, clicking another selects it
    setSelectedOrgan((prev) => (prev === val ? null : val));
  };

  const handleResetFilters = () => {
    setSelectedOrgan(null);
    setSearchQuery("");
  };

  return (
    <div className={styles.pageContainer}>
      {/* ─── TWO-COLUMN HERO SECTION (FOCUSED ON SEARCH & CLINICAL CONTENT) ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <motion.div
            className={styles.heroBgMotion}
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
              className={styles.heroBgImage}
            />
            <div className={styles.heroBgOverlay} />
          </motion.div>
        </div>

        <div className={styles.heroInner}>
          {/* Left Column: Breadcrumb, Title, Subtitle & Pulse AI Search */}
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
                finalColor="#FFFFFF" 
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

            {/* Compressed Pill Search with Visible Gradient Outline, Glow Spotlight & Live Result Count */}
            <motion.div
              className={styles.heroSearchContainer}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.searchBoxWrap}>
                <div className={styles.searchBox}>
                  <Search size={16} strokeWidth={2.0} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search treatments, surgery or condition..."
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      startTransition(() => setSearchQuery(val));
                    }}
                    aria-label="Search treatments, surgery or condition"
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

              {/* Dynamic result count displayed immediately below search when typing */}
              {searchQuery.trim().length > 0 && (
                <div className={styles.searchCountFeedback}>
                  <span>
                    Showing <strong className={styles.searchCountHighlight}>{items.length}</strong> {items.length === 1 ? "result" : "results"} for &ldquo;{searchQuery}&rdquo;
                  </span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column: Secondary Credential Numbers (4 parameters, balanced hierarchy) */}
          <motion.div
            className={styles.heroRightCol}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.58, ease: [0.16, 1, 0.3, 1] }}
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

      {/* ─── 10 ORGAN CIRCLE BUBBLE FILTERS ───────────────────────────────── */}
      <motion.section
        className={styles.categorySection}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.68, ease: [0.16, 1, 0.3, 1] }}
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

      {/* ─── DYNAMIC FEEDBACK TEXT ROW (MINIMAL TYPOGRAPHY, NO CHIPS/BADGES) ─ */}
      <motion.div
        className={styles.feedbackTextRow}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.76 }}
      >
        <div className={styles.feedbackTextWrapper}>
          <p className={styles.feedbackText}>
            {searchQuery.trim() ? (
              <>
                Here based on your search for <strong className={styles.feedbackHighlight}>&ldquo;{searchQuery}&rdquo;</strong> &mdash; <span className={styles.feedbackCount}>{items.length} {items.length === 1 ? "procedure" : "procedures"} found</span>
              </>
            ) : selectedOrgan ? (
              <>
                Here based on your selection for treatment under <strong className={styles.feedbackHighlight}>{currentOrganLabel}</strong> &mdash; <span className={styles.feedbackCount}>{items.length} {items.length === 1 ? "procedure" : "procedures"} found</span>
              </>
            ) : (
              <>
                Here based on your selection for clinical treatments &amp; procedures &mdash; <span className={styles.feedbackCount}>{items.length} {items.length === 1 ? "procedure" : "procedures"} available</span>
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

      {/* ─── 3-COLUMN CARDS GRID (ORCHESTRATED WITH ENTRANCE SKELETON) ─────── */}
      <AnimatePresence mode="wait">
        {isPageOpening ? (
          <motion.div
            key="entrance-skeletons"
            className={styles.cardsGrid}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, delay: 0.78 }}
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
                <h3 className={styles.emptyTitle}>No matching procedures found</h3>
                <p className={styles.emptyDesc}>
                  We couldn't find any results matching your search or active organ filter. Try clearing your query or exploring another organ.
                </p>
                <button className={styles.resetFiltersBtn} onClick={handleResetFilters}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {items.map((item, idx) => {
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
                      {/* Top 3D Organ / Procedure Image with Dark Gradient Vignette */}
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

                      {/* Content Block */}
                      <div className={styles.cardContent}>
                        <div>
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

                        {/* Card Bottom Slot: Resting Metadata (Recovery, Stay) vs Hover Decision Action Buttons */}
                        <div className={styles.cardBottomSlot}>
                          {/* Non-hover Resting State: Clinical Procedure Facts (Fades away smoothly on hover) */}
                          <div className={styles.cardRestingMeta}>
                            <span className={styles.metaBadge}>
                              <Clock size={11} className={styles.metaIcon} />
                              <span>{item.hospitalStay ? `Stay: ${item.hospitalStay}` : "Minimal Stay"}</span>
                            </span>
                            <span className={styles.metaBadge}>
                              <Activity size={11} className={styles.metaIcon} />
                              <span>{item.recoveryTime ? `Recovery: ${item.recoveryTime}` : "Fast Recovery"}</span>
                            </span>
                          </div>

                          {/* Hover Action Buttons: Find doctors & Read more ↗ (Revealed on hover on desktop / Always available on iPad & mobile) */}
                          <div className={styles.cardActions}>
                            <Link href={doctorsUrl} className={styles.cardDoctorBtn}>
                              Find doctors
                            </Link>

                            <Link href={detailUrl} className={styles.cardDetailBtn}>
                              <span>Read more</span>
                              <ArrowUpRight size={13} className={styles.pillBtnArrow} />
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

      {/* ─── BOTTOM TRUST HIGHLIGHT (SECOND OPINION BOARD WITH INTEGRATED GRADIENT IMAGE) ─── */}
      <section className={styles.trustBanner}>
        <div className={styles.trustImageBg}>
          <Image
            src="/top-medical-experts.png"
            alt="Narayana Health multidisciplinary surgical board"
            fill
            sizes="(max-width: 900px) 100vw, 640px"
            className={styles.trustImage}
          />
          <div className={styles.trustGradientOverlay} />
        </div>

        <div className={styles.trustContent}>
          <div className={styles.trustEyebrow}>MULTI-DISCIPLINARY SURGICAL BOARD</div>
          <h3 className={styles.trustTitle}>
            Looking for a surgical second opinion or cost estimate?
          </h3>
          <p className={styles.trustDesc}>
            Our senior surgical boards review complex diagnoses, imaging reports, and recommend minimally invasive surgical alternatives with transparent, all-inclusive pricing.
          </p>

          <div className={styles.trustActions}>
            <a href="tel:18003090309" className={styles.trustSecondaryBtn}>
              <PhoneCall size={15} />
              <span>1800 309 0309</span>
            </a>
            <Link href="/book-appointment" className={styles.trustPrimaryBtn}>
              <Calendar size={15} />
              <span>Request Second Opinion</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
