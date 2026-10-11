"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Briefcase, 
  MapPin, 
  Video, 
  RefreshCw, 
  SearchX,
  AlertCircle,
  Heart,
  Activity,
  Brain,
  User,
  Shield,
  Stethoscope,
  PhoneCall,
  Sparkles
} from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { DoctorCardData, ProximityTier } from "./searchData";

interface PrimaryResultsProps {
  doctors: DoctorCardData[];
  selectedLocation: string;
  proximityMessage?: string;
  proximityTier?: ProximityTier;
  query: string;
  pulseRecommendationText?: string;
  onAskPulse?: () => void;
  isPulseExpanded?: boolean;
  onTogglePulseExpand?: (expanded: boolean) => void;
  hidePulse?: boolean;
  status?: "success" | "empty" | "error";
  errorMessage?: string;
  onRetry?: () => void;
  onSelectSpecialty?: (specialty: string) => void;
}

function formatExperienceText(exp: string): string {
  if (!exp) return "10+ yrs of experience";
  const cleaned = exp.replace(/years?(\s+experience)?/gi, "yrs").trim();
  return `${cleaned} of experience`;
}

export default function PrimaryResults({
  doctors,
  selectedLocation,
  proximityMessage,
  proximityTier,
  query,
  pulseRecommendationText,
  status = "success",
  errorMessage,
  onRetry,
  onSelectSpecialty,
}: PrimaryResultsProps) {
  // Staggered loading sequence stage: "text" -> "skeleton" -> "cards"
  const [animStage, setAnimStage] = useState<"text" | "skeleton" | "cards">("text");

  // Construct word tokens for word-by-word typing effect
  const wordsToAnimate = React.useMemo(() => {
    if (pulseRecommendationText) {
      return pulseRecommendationText.split(" ").map((w) => ({ text: w, isBold: false }));
    }

    const isSingleDoc = doctors.length === 1;

    return [
      { text: "I", isBold: false },
      { text: "understand", isBold: false },
      { text: "your", isBold: false },
      { text: "clinical", isBold: false },
      { text: "inquiry", isBold: false },
      { text: "regarding", isBold: false },
      { text: `"${query || "your health query"}"`, isBold: true },
      { text: "—", isBold: false },
      { text: "here", isBold: false },
      { text: isSingleDoc ? "is" : "are", isBold: false },
      { text: "our", isBold: false },
      { text: "top", isBold: false },
      { text: "recommended", isBold: false },
      { text: isSingleDoc ? "specialist" : "specialists", isBold: false },
      { text: "at", isBold: false },
      { text: "Narayana", isBold: false },
      { text: "Health", isBold: false },
      { text: "near", isBold: false },
      { text: `${selectedLocation || "Bangalore"}:`, isBold: true },
    ];
  }, [pulseRecommendationText, query, selectedLocation, doctors.length]);

  useEffect(() => {
    // Stage 1: Word-by-word typing text animation
    setAnimStage("text");
    const textTypingDuration = Math.max(wordsToAnimate.length * 35 + 100, 600);

    // Stage 2: Skeleton shimmer placeholders appear after typing finishes
    const t1 = setTimeout(() => {
      setAnimStage("skeleton");
    }, textTypingDuration);

    // Stage 3: Real doctor cards reveal smoothly
    const t2 = setTimeout(() => {
      setAnimStage("cards");
    }, textTypingDuration + 420);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [query, doctors, wordsToAnimate]);

  // Dynamic skeleton placeholder count matching doctor results count (up to 8 cards max)
  const skeletonItems = React.useMemo(() => {
    const count = Math.min(Math.max(doctors.length, 1), 8);
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [doctors.length]);

  // Limit displayed doctors to maximum 8 cards
  const displayDoctors = React.useMemo(() => {
    return doctors.slice(0, 8);
  }, [doctors]);

  // Determine if results context is video consultations (e.g. no in-person NH care within 100 km)
  const isVideoContext = 
    proximityTier === "videoOnly" || 
    Boolean(proximityMessage?.toLowerCase().includes("video consultations"));

  // ── ERROR STATE (Simulation trigger: 'XZ' or service/network failure) ──
  if (status === "error") {
    return (
      <div className={styles.searchErrorContainer}>
        {/* Soft Ambient Lens */}
        <div className={styles.searchErrorHaloWrap}>
          <div className={styles.searchErrorHaloGlow} aria-hidden="true" />
          <div className={styles.searchErrorIconBadge}>
            <AlertCircle size={26} className={styles.searchErrorIcon} />
          </div>
        </div>

        <span className={styles.searchStateEyebrow}>SERVICE STATUS</span>

        <h3 className={styles.searchErrorTitle}>
          Directory temporarily unavailable
        </h3>

        <p className={styles.searchErrorSub}>
          {errorMessage || "We are having trouble connecting to our live clinical provider directory. This is usually momentary. Please try again or connect directly with our round-the-clock help desk."}
        </p>

        <div className={styles.searchErrorBtnRow}>
          <button
            type="button"
            className={styles.searchRetryBtn}
            onClick={onRetry}
          >
            <RefreshCw size={14} className={styles.searchRetryIcon} />
            <span>Retry Search</span>
          </button>

          <a
            href="tel:18602080208"
            className={styles.searchHelplineCallout}
            aria-label="Call 24/7 hospital helpline"
          >
            <PhoneCall size={13} className={styles.searchHelplineIcon} />
            <span>24/7 Helpline: 1860 208 0208</span>
          </a>
        </div>
      </div>
    );
  }

  // ── EMPTY STATE (Simulation trigger: 'XY' or zero doctors found) ──
  if (status === "empty" || doctors.length === 0) {
    const popularDepartments = [
      { name: "Cardiology", icon: Heart },
      { name: "Orthopaedics", icon: Activity },
      { name: "Neurology", icon: Brain },
      { name: "Pediatrics", icon: User },
      { name: "Oncology", icon: Shield },
      { name: "General Medicine", icon: Stethoscope },
    ];

    return (
      <div className={styles.searchEmptyContainer}>
        {/* Soft Ambient Lens */}
        <div className={styles.searchEmptyHaloWrap}>
          <div className={styles.searchEmptyHaloGlow} aria-hidden="true" />
          <div className={styles.searchEmptyIconBadge}>
            <SearchX size={26} className={styles.searchEmptyIcon} />
          </div>
        </div>

        <span className={styles.searchStateEyebrow}>CARE DIRECTORY</span>

        <h3 className={styles.searchEmptyTitle}>
          No exact matches for &ldquo;{query}&rdquo;
        </h3>

        <p className={styles.searchEmptySub}>
          We couldn&apos;t find an exact clinical match in {selectedLocation}. Check your spelling, describe your symptoms, or explore our primary departments:
        </p>

        {/* Popular Specialty Suggestions with Icons */}
        <div className={styles.searchEmptyChipsRow}>
          {popularDepartments.map((dept) => {
            const Icon = dept.icon;
            return (
              <button
                key={dept.name}
                type="button"
                className={styles.searchEmptyChipBtn}
                onClick={() => onSelectSpecialty?.(dept.name)}
              >
                <Icon size={13} className={styles.searchEmptyChipIcon} />
                <span>{dept.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const isSingleDoctor = doctors.length === 1;

  return (
    <div className={styles.primaryResultsSection}>
      {/* ── STAGE 1: Word-by-Word Word-Reveal Animated Clinical Summary ── */}
      <motion.div 
        key={query}
        className={styles.chatSummaryTextRow}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.035 } }
        }}
        initial="hidden"
        animate="visible"
      >
        <p className={styles.chatSummaryText}>
          {wordsToAnimate.map((word, idx) => (
            <motion.span
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 3, filter: "blur(2px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.15 } }
              }}
              style={{ display: "inline-block", marginRight: "0.28em" }}
            >
              {word.isBold ? <strong>{word.text}</strong> : word.text}
            </motion.span>
          ))}
        </p>
      </motion.div>

      {/* ── STAGE 2: Doctor Card Skeleton Shimmer Loader (Matches Doctor Count up to 8) ── */}
      {animStage === "skeleton" && (
        <div className={`${styles.refDoctorsGrid} ${isSingleDoctor ? styles.refDoctorsGridSingle : ""}`}>
          {skeletonItems.map((idx) => (
            <div key={idx} className={`${styles.refDocSkeletonCard} ${isSingleDoctor ? styles.refDocCardSingle : ""}`}>
              <div className={styles.refDocSkeletonShimmer} />
              <div className={styles.refDocSkeletonBottom}>
                <div className={styles.refDocSkeletonLine1} />
                <div className={styles.refDocSkeletonLine2} />
                <div className={styles.refDocSkeletonLine3} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── STAGE 3: Real Verified Doctor Cards Reveal (Maximum 8 cards) ── */}
      {(animStage === "cards" || animStage === "text") && (
        <motion.div 
          className={`${styles.refDoctorsGrid} ${isSingleDoctor ? styles.refDoctorsGridSingle : ""}`}
          initial={{ opacity: animStage === "cards" ? 0 : 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {displayDoctors.map((doc) => {
            const isLongName = doc.name.length > 18;
            const isVcDoctor = 
              doc.consultationType === "video" || 
              isVideoContext || 
              Boolean(doc.isVideoConsult);

            return (
              <div 
                key={doc.id} 
                className={`${styles.refDoctorCard} ${isSingleDoctor ? styles.refDocCardSingle : ""}`}
              >
                {/* Full background doctor photo spanning entire card */}
                <img
                  src={doc.image}
                  alt={doc.name}
                  className={styles.refDocFullImage}
                  draggable={false}
                />

                {/* Video Consult Tag at Top Right */}
                {isVcDoctor && (
                  <div className={styles.refDocVideoTag}>
                    <Video size={13} strokeWidth={2.4} className={styles.refDocVideoIcon} />
                    <span>Video Consult</span>
                  </div>
                )}

                {/* Gradient overlay darkening smoothly towards the bottom */}
                <div className={styles.refDocFullGradient} />

                {/* Doctor Information directly over the gradient overlay at the bottom */}
                <div className={styles.refDocOverlayContent}>
                  <div className={styles.refDocBottomFlex}>
                    {/* Left Column: Name, Specialty, Experience, Hospital */}
                    <div className={styles.refDocTextCol}>
                      <h3 
                        className={`${styles.refDocName} ${isLongName ? styles.refDocNameMultiLine : styles.refDocNameSingleLine}`} 
                        title={doc.name}
                      >
                        {doc.name}
                      </h3>

                      <div className={styles.refDocSpecialty} title={doc.speciality}>
                        {doc.speciality}
                      </div>

                      <div className={styles.refDocExpRow}>
                        <Briefcase size={12} className={styles.refDocExpIcon} />
                        <span>{formatExperienceText(doc.experience)}</span>
                      </div>

                      <div 
                        className={`${styles.refDocHospital} ${isLongName ? styles.refDocHospitalSingleLine : styles.refDocHospitalTwoLines}`} 
                        title={doc.hospital}
                      >
                        {doc.hospital}
                      </div>
                    </div>

                    {/* Right Side: White Book Button */}
                    <Link
                      href={`/doctors/${doc.id}/book?city=${encodeURIComponent(selectedLocation)}`}
                      className={styles.refBookBtnWhite}
                    >
                      Book
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Clean View all doctors Link */}
      <div className={styles.refViewAllRow}>
        <Link
          href={`/doctors?q=${encodeURIComponent(query)}&city=${encodeURIComponent(selectedLocation)}`}
          className={styles.refViewAllLink}
        >
          <span>View all doctors ({doctors.length > 8 ? `${doctors.length}+` : doctors.length})</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

