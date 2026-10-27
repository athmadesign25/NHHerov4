"use client";

import React, { useState, useMemo, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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
  SPECIALITY_FILTER_OPTIONS, 
  TreatmentProcedureItem 
} from "@/data/treatmentsProceduresData";
import styles from "./TreatmentsLibrary.module.css";

// Parameters displayed on the right column of the Hero (matching mockup)
const HERO_ANALYTICS_PARAMETERS = [
  { value: 400, suffix: "+", label: "Surgical Procedures" },
  { value: 30, suffix: "+", label: "Medical Specialities" },
  { staticValue: "98.6%", label: "Clinical Safety Score" },
  { staticValue: "1L+", label: "Transplant & Surgical Care" },
];

export default function TreatmentsLibraryPage() {
  // Circular filters are NOT initially active; become active only when clicked
  const [selectedSpeciality, setSelectedSpeciality] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [, startTransition] = useTransition();

  // Filter items based on active criteria
  const filteredItems = useMemo(() => {
    return TREATMENTS_PROCEDURES_DATA.filter((item) => {
      // Filter by speciality if one is explicitly selected
      if (selectedSpeciality && item.specialitySlug !== selectedSpeciality) {
        return false;
      }
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesShortTitle = item.shortTitle.toLowerCase().includes(query);
        const matchesSummary = item.summary.toLowerCase().includes(query);
        const matchesSpeciality = item.speciality.toLowerCase().includes(query);
        if (!matchesTitle && !matchesShortTitle && !matchesSummary && !matchesSpeciality) {
          return false;
        }
      }
      return true;
    });
  }, [selectedSpeciality, searchQuery]);

  // Compute dynamic feedback text matching user's exact syntax
  const feedbackText = useMemo(() => {
    if (searchQuery.trim()) {
      return `Here based on your search for "${searchQuery}" this are the results`;
    }
    if (selectedSpeciality === "cardiology") {
      return "Here based on your selection for treatment under heart section this are the results";
    }
    if (selectedSpeciality) {
      const currentOpt = SPECIALITY_FILTER_OPTIONS.find((s) => s.value === selectedSpeciality);
      if (currentOpt) {
        return `Here based on your selection for treatment under ${currentOpt.label.toLowerCase()} section this are the results`;
      }
    }
    return "Here based on your selection for clinical treatments and procedures this are the results";
  }, [selectedSpeciality, searchQuery]);

  const handleToggleSpeciality = (val: string) => {
    // Clicking active filter toggles it off, clicking another selects it
    setSelectedSpeciality((prev) => (prev === val ? null : val));
  };

  const handleResetFilters = () => {
    setSelectedSpeciality(null);
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

      {/* ─── TWO-COLUMN HERO SECTION (MATCHING MOCKUP) ────────────────────── */}
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
          {/* Left Column: Breadcrumb, Title, Subtitle & Search */}
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

            {/* Compressed Pill Search with Gradient Outline, Glow Spotlight & Live Result Count */}
            <div className={styles.heroSearchContainer}>
              <div className={styles.searchBoxWrap}>
                <div className={styles.searchBox}>
                  <Search size={18} strokeWidth={1.8} className={styles.searchIcon} />
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
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic result count displayed immediately below search when typing */}
              {searchQuery.trim().length > 0 && (
                <div className={styles.searchCountFeedback}>
                  <span>
                    Showing <strong className={styles.searchCountHighlight}>{filteredItems.length}</strong> {filteredItems.length === 1 ? "result" : "results"} for &ldquo;{searchQuery}&rdquo;
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Vertically Stacked Numerical Validation with Left Divider */}
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

      {/* ─── CATEGORY CIRCLE BUBBLE FILTERS (NOT INITIALLY ACTIVE) ────────── */}
      <section className={styles.categorySection}>
        <div className={styles.bubblesRow}>
          {SPECIALITY_FILTER_OPTIONS.map((opt) => {
            const isActive = selectedSpeciality === opt.value;
            return (
              <button
                key={opt.value}
                className={`${styles.bubbleBtn} ${isActive ? styles.bubbleBtnActive : ""}`}
                onClick={() => handleToggleSpeciality(opt.value)}
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

      {/* ─── DYNAMIC FEEDBACK TEXT ROW (MATCHING USER SCREENSHOT) ─────────── */}
      <div className={styles.feedbackTextRow}>
        <p className={styles.feedbackText}>
          {feedbackText}
        </p>
      </div>

      {/* ─── 3-COLUMN CARDS GRID (PROMINENT ABOVE THE FOLD) ────────────────── */}
      <main className={styles.cardsGrid}>
        {filteredItems.length === 0 ? (
          <div className={styles.emptyState} style={{ gridColumn: "1 / -1" }}>
            <div className={styles.emptyIconWrapper}>
              <Search size={26} />
            </div>
            <h3 className={styles.emptyTitle}>No matching procedures found</h3>
            <p className={styles.emptyDesc}>
              We couldn't find any results matching your search or active category filter. Try clearing your query or choosing another section.
            </p>
            <button className={styles.resetFiltersBtn} onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const detailUrl = `/procedures/${item.slug}`;
            const doctorsUrl = `/doctors?speciality=${encodeURIComponent(item.specialitySlug)}`;

            return (
              <motion.article
                key={item.id}
                className={styles.procedureCard}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: Math.min(idx * 0.03, 0.2) }}
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
          })
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

      {/* ─── MEDICALLY REVIEWED FOOTER BAND ────────────────────────────────── */}
      <MedicallyReviewedBand
        reviewer={{
          name: "Dr. Devi Prasad Shetty",
          designation: "Chairman & Senior Consultant Cardiac Surgeon",
          specialty: "Cardiothoracic & Vascular Surgery",
          qualifications: "MS, FRCS (England), Padma Bhushan",
          experience: "35+ Yrs Exp",
          image: "/assets/doctor_1.png",
          reviewDate: "October 2026",
          profileLink: "/doctors"
        }}
      />
    </div>
  );
}
