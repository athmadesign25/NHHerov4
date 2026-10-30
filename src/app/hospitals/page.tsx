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
  Building,
  Activity,
  RotateCcw,
  SlidersHorizontal,
  MapPin
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { MetricValueReveal } from "@/components/sections/hero/Hero";
import { HOSPITALS_DIRECTORY_DATA, HospitalDirectoryItem } from "@/data/hospitalsDirectoryData";
import styles from "./HospitalsLibrary.module.css";

// Key City / Regional Hub Filters
const CITY_FILTER_OPTIONS = [
  { label: "Bangalore", value: "bangalore", image: "/speciality-media/KztpC4GYDq70ncLAFLSv.webp" },
  { label: "Kolkata", value: "kolkata", image: "/speciality-media/IZDfHNBQPDDr8xXnifex.webp" },
  { label: "Mumbai", value: "mumbai", image: "/images/procedures/pediatric_abdomen.jpg" },
  { label: "Delhi-NCR", value: "delhi-ncr", image: "/assets/hospital_exterior_2.jpg" },
  { label: "Jaipur", value: "jaipur", image: "/assets/hospital_exterior_1.jpg" },
  { label: "Mysore", value: "mysore", image: "/speciality-media/X9LPjGaxsejoIT5Aracu.webp" },
];

const HERO_ANALYTICS_PARAMETERS = [
  { value: 25, suffix: "+", label: "Hospitals & Clinics" },
  { staticValue: "6,000+", label: "Operational Beds" },
  { staticValue: "24×7", label: "Emergency & Trauma" },
  { staticValue: "JCI / NABH", label: "Accredited Centers" },
];

export default function HospitalsLibraryPage() {
  const [items, setItems] = useState<HospitalDirectoryItem[]>(HOSPITALS_DIRECTORY_DATA);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
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
      const initialCity = urlParams.get("city") || urlParams.get("location");
      if (initialSearch) setSearchQuery(initialSearch);
      if (initialCity) setSelectedCity(initialCity.toLowerCase());
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsApiLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("query", searchQuery.trim());
        if (selectedCity) params.set("city", selectedCity);
        params.set("limit", "48");

        const res = await fetch(`/api/hospitals?${params.toString()}`, {
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
          console.error("[Hospitals API] error:", err);
        }
      } finally {
        setIsApiLoading(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [selectedCity, searchQuery]);

  const currentCityLabel = useMemo(() => {
    if (!selectedCity) return null;
    const match = CITY_FILTER_OPTIONS.find((s) => s.value === selectedCity);
    return match ? match.label : selectedCity;
  }, [selectedCity]);

  const handleToggleCity = (val: string) => {
    setSelectedCity((prev) => (prev === val ? null : val));
  };

  const handleResetFilters = () => {
    setSelectedCity(null);
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
              src="/assets/hospital_exterior_1.jpg"
              alt="Narayana Health hospital campus"
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
                  { label: "Hospitals & Clinics" },
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
                words={["Hospitals & Clinics Network"]} 
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
              Locate quaternary multispeciality hospitals, superspeciality cardiac centers, pediatric institutes, and day care clinics across India with 24×7 emergency triage.
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
                      placeholder="Search hospital name, city, location or address..."
                      className={styles.searchInput}
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        startTransition(() => setSearchQuery(val));
                      }}
                      aria-label="Search hospital name or city"
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
                  className={`${styles.mobileFilterBtn} ${selectedCity ? styles.mobileFilterBtnActive : ""}`}
                  onClick={() => setIsFilterSheetOpen(true)}
                  aria-label="Open city filters"
                >
                  <SlidersHorizontal size={15} />
                  <span className={styles.mobileFilterBtnText}>
                    {selectedCity ? CITY_FILTER_OPTIONS.find(o => o.value === selectedCity)?.label : "Cities"}
                  </span>
                  {selectedCity && <span className={styles.mobileFilterDot} />}
                </button>
              </div>

              {selectedCity && (
                <div className={styles.activeFilterRow}>
                  <span className={styles.activeFilterPill}>
                    <span>City: {CITY_FILTER_OPTIONS.find(o => o.value === selectedCity)?.label}</span>
                    <button
                      type="button"
                      className={styles.removeActiveFilterBtn}
                      onClick={() => handleToggleCity(selectedCity)}
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
                    Showing <strong className={styles.searchCountHighlight}>{items.length}</strong> {items.length === 1 ? "hospital" : "hospitals"} for &ldquo;{searchQuery}&rdquo;
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

      {/* ─── CITY BUBBLE FILTERS ─────────────────────────────────────────── */}
      <motion.section
        className={styles.categorySection}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.bubblesRow}>
          {CITY_FILTER_OPTIONS.map((opt) => {
            const isActive = selectedCity === opt.value;
            return (
              <button
                key={opt.value}
                className={`${styles.bubbleBtn} ${isActive ? styles.bubbleBtnActive : ""}`}
                onClick={() => handleToggleCity(opt.value)}
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
                Here based on your search for <strong className={styles.feedbackHighlight}>&ldquo;{searchQuery}&rdquo;</strong> &mdash; <span className={styles.feedbackCount}>{items.length} {items.length === 1 ? "hospital" : "hospitals"} found</span>
              </>
            ) : selectedCity ? (
              <>
                Here based on your selection for hospitals in <strong className={styles.feedbackHighlight}>{currentCityLabel}</strong> &mdash; <span className={styles.feedbackCount}>{items.length} {items.length === 1 ? "hospital" : "hospitals"} found</span>
              </>
            ) : (
              <>
                Here based on our hospital &amp; clinic directory &mdash; <span className={styles.feedbackCount}>{items.length} {items.length === 1 ? "hospital" : "hospitals"} available</span>
              </>
            )}
          </p>

          {(selectedCity || searchQuery.trim()) && (
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
                <h3 className={styles.emptyTitle}>No matching hospitals found</h3>
                <p className={styles.emptyDesc}>
                  We couldn&apos;t find any hospitals matching your search query. Try filtering by city or clearing your query.
                </p>
                <button className={styles.resetFiltersBtn} onClick={handleResetFilters}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {items.map((item, idx) => {
                  const detailUrl = `/hospitals/${item.slug}`;
                  const doctorsUrl = `/doctors?location=${encodeURIComponent(item.city)}`;

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
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 84px, (max-width: 1024px) 50vw, 33vw"
                          className={styles.cardBgImage}
                        />
                        <div className={styles.cardGradient} />
                      </div>

                      <div className={styles.cardContent}>
                        <div className={styles.cardTextGroup}>
                          <div className={styles.cardEyebrow}>
                            {item.city}, {item.state} &bull; {item.type.split(" ")[0]}
                          </div>

                          <Link href={detailUrl} className={styles.cardTitleLink}>
                            <h2 className={styles.cardTitle}>
                              {item.name}
                            </h2>
                          </Link>

                          <p className={styles.cardSub}>
                            {item.summary}
                          </p>
                        </div>

                        <div className={styles.cardBottomSlot}>
                          <div className={styles.cardRestingMeta}>
                            <span className={styles.metaBadge}>
                              <Building size={11} className={styles.metaIcon} />
                              <span>{item.beds}</span>
                            </span>
                            <span className={styles.metaBadge}>
                              <Activity size={11} className={styles.metaIcon} />
                              <span>{item.emergency}</span>
                            </span>
                          </div>

                          <div className={styles.cardActions}>
                            <Link href={doctorsUrl} className={styles.cardDoctorBtn}>
                              Find doctors
                            </Link>

                            <Link href={detailUrl} className={styles.cardDetailBtn}>
                              <span>Hospital info</span>
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
            src="/assets/hospital_interior_3.jpg"
            alt="Narayana Health hospital infrastructure"
            fill
            sizes="(max-width: 900px) 100vw, 640px"
            className={styles.trustImage}
          />
          <div className={styles.trustGradientOverlay} />
        </div>

        <div className={styles.trustContent}>
          <div className={styles.trustEyebrow}>24×7 APEX EMERGENCY RESPONSE</div>
          <h3 className={styles.trustTitle}>
            Emergency admission or ambulance dispatch?
          </h3>
          <p className={styles.trustDesc}>
            Our central emergency control dispatch coordinates directly with the nearest Narayana Health hospital trauma team, stroke units, and cath labs.
          </p>

          <div className={styles.trustActions}>
            <a href="tel:18003090309" className={styles.trustPrimaryBtn}>
              <PhoneCall size={16} />
              <span>Emergency Helpline: 1800 309 0309</span>
            </a>
            <Link href="/doctors" className={styles.trustSecondaryBtn}>
              <span>Book Doctor Appointment</span>
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
                  <h3 className={styles.filterSheetTitle}>Filter by City</h3>
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
                  {CITY_FILTER_OPTIONS.map((opt) => {
                    const isActive = selectedCity === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`${styles.filterSheetItem} ${isActive ? styles.filterSheetItemActive : ""}`}
                        onClick={() => {
                          handleToggleCity(opt.value);
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
                    setSelectedCity(null);
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
