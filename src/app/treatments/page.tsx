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
  Calendar
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { MetricValueReveal } from "@/components/sections/hero/Hero";
import MedicallyReviewedBand from "@/components/ui/MedicallyReviewedBand";
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

// Secondary credentials on right hero column (calm, non-distracting metrics)
const HERO_ANALYTICS_PARAMETERS = [
  { value: 400, suffix: "+", label: "Surgical Procedures" },
  { value: 30, suffix: "+", label: "Medical Specialities" },
  { staticValue: "98.6%", label: "Clinical Safety Score" },
];

export default function TreatmentsLibraryPage() {
  const [items, setItems] = useState<TreatmentProcedureItem[]>(TREATMENTS_PROCEDURES_DATA);
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [, startTransition] = useTransition();

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

  // Compute dynamic feedback text matching clinical semantics
  const feedbackText = useMemo(() => {
    if (searchQuery.trim()) {
      return `Here based on your search for "${searchQuery}" this are the results`;
    }
    if (selectedOrgan) {
      const currentOpt = ORGAN_FILTER_OPTIONS.find((s) => s.value === selectedOrgan);
      if (currentOpt) {
        return `Here based on your selection for treatment under ${currentOpt.label.toLowerCase()} section this are the results`;
      }
    }
    return "Here based on your selection for clinical treatments and procedures this are the results";
  }, [selectedOrgan, searchQuery]);

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
      {/* ─── VERTICAL INDICATOR RAIL (SIGNATURE DETAIL FROM MOCKUP) ───────── */}
      <div className={styles.verticalRail} aria-hidden="true">
        {[...Array(12)].map((_, i) => (
          <span key={i} className={styles.railDash} />
        ))}
      </div>

      {/* ─── TWO-COLUMN HERO SECTION (FOCUSED ON SEARCH & CLINICAL CONTENT) ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <Image
            src="/doctor_patient.png"
            alt="Doctor examining patient with stethoscope"
            fill
            priority
            sizes="100vw"
            className={styles.heroBgImage}
          />
          <div className={styles.heroBgOverlay} />
        </div>

        <div className={styles.heroInner}>
          {/* Left Column: Breadcrumb, Title, Subtitle & Pulse AI Search */}
          <div className={styles.heroLeftCol}>
            <div className={styles.breadcrumbsContainer}>
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Treatments & Procedures" },
                ]}
                theme="dark"
              />
            </div>

            <h1 className={styles.heroTitle}>
              <TextSweepEffect 
                words={["Treatments & Procedures"]} 
                sweepMs={2400} 
                delayMs={80} 
                finalColor="#FFFFFF" 
              />
            </h1>

            <p className={styles.heroSubtitle}>
              Explore comprehensive clinical guides, recovery paths, and transparent pricing for over 400+ advanced surgical procedures and evidence-based treatments across Narayana Health.
            </p>

            {/* Compressed Pill Search with Pulse Moving Gradient Outline, Glow Spotlight & Live Result Count */}
            <div className={styles.heroSearchContainer}>
              {/* Pulse AI Search Gradient Definition for Search Icon */}
              <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }} aria-hidden="true">
                <defs>
                  <linearGradient id="nhPulseSearchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00C4FF" />
                    <stop offset="35%" stopColor="#8B5CF6" />
                    <stop offset="70%" stopColor="#FF2E93" />
                    <stop offset="100%" stopColor="#ED1C24" />
                  </linearGradient>
                </defs>
              </svg>

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
            </div>
          </div>

          {/* Right Column: Secondary Credential Numbers (Toned down, non-distracting) */}
          <div className={styles.heroRightCol}>
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
        </div>
      </section>

      {/* ─── 10 ORGAN CIRCLE BUBBLE FILTERS ───────────────────────────────── */}
      <section className={styles.categorySection}>
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
      </section>

      {/* ─── DYNAMIC FEEDBACK TEXT ROW & QUICK API PULSE BAR ─────────────── */}
      <div className={styles.feedbackTextRow}>
        <p className={styles.feedbackText}>
          {feedbackText}
        </p>

        {isApiLoading && (
          <div className={styles.apiPulseBar}>
            <div className={styles.apiPulseIndicator} />
          </div>
        )}
      </div>

      {/* ─── 3-COLUMN CARDS GRID (FETCHED FROM API & INTERACTIVE) ──────────── */}
      <main className={styles.cardsGrid} style={{ opacity: isApiLoading ? 0.78 : 1, transition: "opacity 0.18s ease" }}>
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

                    {/* Two Decision Buttons: Find doctors & Read more ↗ (Hover on desktop / Always visible on iPad & mobile) */}
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
                </motion.article>
              );
            })}
          </AnimatePresence>
        )}
      </main>

      {/* ─── BOTTOM TRUST HIGHLIGHT ────────────────────────────────────────── */}
      <section className={styles.trustBanner}>
        <div className={styles.trustTextGroup}>
          <div className={styles.trustEyebrow}>Narayana Health Clinical Standards</div>
          <h3 className={styles.trustTitle}>
            Looking for a surgical second opinion or cost estimate?
          </h3>
          <p className={styles.trustDesc}>
            Our multidisciplinary surgical boards review complex diagnoses and recommend minimally invasive alternatives with transparent, all-inclusive pricing.
          </p>
        </div>

        <div className={styles.trustActions}>
          <a href="tel:18003090309" className={styles.trustSecondaryBtn}>
            <PhoneCall size={15} />
            <span>1800 309 0309</span>
          </a>
          <Link href="/book-appointment" className={styles.trustPrimaryBtn}>
            <Calendar size={15} />
            <span>Book Consultation</span>
          </Link>
        </div>
      </section>

      {/* ─── MEDICALLY REVIEWED BADGE FOOTER ───────────────────────────────── */}
      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 clamp(20px, 4vw, 40px) 40px" }}>
        <MedicallyReviewedBand
          reviewer={{
            name: "Dr. Devi Prasad Shetty",
            designation: "Chairman & Founder, Narayana Health",
            specialty: "Cardiac Surgery",
            qualifications: "MS, FRCS",
            experience: "35+ Yrs Exp",
            image: "/doctors/doc_devi_shetty.jpg",
            profileLink: "/doctors/dr-devi-shetty",
            reviewDate: "October 2026",
          }}
        />
      </div>
    </div>
  );
}
