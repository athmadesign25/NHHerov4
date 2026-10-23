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
import PulseAIAvatar from "./PulseAIAvatar";

interface PrimaryResultsProps {
  doctors: DoctorCardData[];
  totalDoctors?: number;
  selectedLocation: string;
  proximityMessage?: string;
  proximityTier?: ProximityTier;
  query: string;
  pulseRecommendationText?: string;
  onAskPulse?: (customText?: string) => void;
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
  totalDoctors,
  selectedLocation,
  proximityMessage,
  proximityTier,
  query,
  pulseRecommendationText,
  onAskPulse,
  status = "success",
  errorMessage,
  onRetry,
  onSelectSpecialty,
}: PrimaryResultsProps) {
  const [pulsePrompt, setPulsePrompt] = useState("");
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
      { text: `"${query || "your health query"}".`, isBold: true },
      { text: "Here", isBold: false },
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

  const displayedCount = displayDoctors.length;
  const totalCount = totalDoctors ?? (displayedCount === 1 ? 1 : displayedCount <= 3 ? displayedCount : 24);

  // Determine if results context is video consultations (e.g. no in-person NH care within 100 km)
  const isVideoContext = 
    proximityTier === "videoOnly" || 
    Boolean(proximityMessage?.toLowerCase().includes("video consultations"));

  // ── ERROR STATE (Simulation trigger: 'XZ' or network failure) ──
  if (status === "error") {
    return (
      <div className={styles.openEmptyWrapper}>
        <h2 className={styles.openEmptyTitle}>
          Directory temporarily unavailable
        </h2>
        <p className={styles.openEmptySub}>
          {errorMessage || "We're experiencing a temporary connection issue while searching our directory. Please try again or reach our 24/7 care desk."}
        </p>

        {/* Dual Actions: Retry Search + Ask Pulse AI */}
        <div className={styles.openErrorBtnRow}>
          <button
            type="button"
            className={styles.openRetryBtn}
            onClick={onRetry}
          >
            <RefreshCw size={15} />
            <span>Retry Search</span>
          </button>

          <button
            type="button"
            className={styles.openErrorPulseBtn}
            onClick={() => onAskPulse?.(`Help me find specialists in ${selectedLocation}`)}
          >
            <PulseAIAvatar size={20} />
            <span>Ask Pulse AI</span>
          </button>
        </div>

        {/* Minimal helpline */}
        <div className={styles.openHelplineRow}>
          <span>24/7 Helpline: 1860 208 0208 • Emergency: 1062</span>
        </div>
      </div>
    );
  }

  // ── EMPTY STATE (Zero doctors found or status === 'empty') ──
  if (status === "empty" || doctors.length === 0) {
    const popularDepartments = [
      "Cardiology",
      "Orthopaedics",
      "Neurology",
      "Pediatrics",
      "Oncology",
    ];

    const handlePulseSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const text = pulsePrompt.trim();
      if (text) {
        onAskPulse?.(text);
      } else {
        onAskPulse?.(query ? `Help me understand care options for ${query}` : undefined);
      }
    };

    return (
      <div className={styles.openEmptyWrapper}>
        {/* Simple, clear message directly in viewport without card */}
        <h2 className={styles.openEmptyTitle}>
          No matches found for &ldquo;{query}&rdquo;
        </h2>
        <p className={styles.openEmptySub}>
          We couldn&apos;t find an exact listing in {selectedLocation}. Let Pulse AI assist you:
        </p>

        {/* ── PULSE AI SEARCH BAR (Below Pulse / Text) ── */}
        <form
          className={styles.openPulseSearchBar}
          onSubmit={handlePulseSubmit}
        >
          <div className={styles.openPulseAvatarWrap}>
            <PulseAIAvatar size={28} isPulsing={true} />
          </div>
          <input
            type="text"
            className={styles.openPulseInput}
            value={pulsePrompt}
            onChange={(e) => setPulsePrompt(e.target.value)}
            placeholder={
              query
                ? `Ask Pulse AI about "${query}" or describe your symptoms...`
                : "Ask Pulse AI about symptoms, treatments or doctors..."
            }
            aria-label="Ask Pulse AI"
          />
          <button
            type="submit"
            className={styles.openPulseSubmitBtn}
            aria-label="Ask Pulse AI"
            title="Ask Pulse AI"
          >
            <ArrowRight size={17} />
          </button>
        </form>

        {/* Quick specialty chips - single harmonious row */}
        <div className={styles.openSpecialtiesRow}>
          {popularDepartments.map((dept) => (
            <button
              key={dept}
              type="button"
              className={styles.openSpecialtyChip}
              onClick={() => onSelectSpecialty?.(dept)}
            >
              <span>{dept}</span>
            </button>
          ))}
        </div>

        {/* Minimal clean helpline */}
        <div className={styles.openHelplineRow}>
          <span>24/7 Helpline: 1860 208 0208 • Emergency: 1062</span>
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

        {displayedCount > 0 && (
          <motion.div
            className={styles.doctorCountSimpleRow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.25 }}
          >
            <span className={styles.doctorCountSimpleText}>
              Showing {displayedCount} of {totalCount} {totalCount === 1 ? "doctor" : "doctors"}
            </span>
          </motion.div>
        )}
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

                {/* Video Consult Tag at Top Right (Minimal Icon Only) */}
                {isVcDoctor && (
                  <div 
                    className={styles.refDocVideoTag}
                    title="Video consultation available"
                    aria-label="Video consultation available"
                  >
                    <Video size={13} strokeWidth={2.0} className={styles.refDocVideoIcon} />
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

