"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Paperclip, 
  Mic, 
  Briefcase, 
  Send, 
  Activity,
  Heart,
  Brain,
  Bone,
  X,
  FileText,
  Calendar,
  ChevronDown,
  Plus,
  CheckCircle2,
  AlertCircle,
  Stethoscope
} from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { DoctorCardData, getSearchResults } from "./searchData";
import { 
  analyzePulseIntent, 
  ClinicalAnalysisResult, 
  ActionChipItem 
} from "./pulseClinicalEngine";
import Lottie from "lottie-react";
import pulseAnimation from "../../../../public/assets/pulse animation.json";

interface PulseAIViewProps {
  query: string;
  selectedLocation: string;
  doctors: DoctorCardData[];
  onBack: () => void;
  onClose?: () => void;
  attachedFile?: { name: string; size?: number } | null;
}

type ActionChipType = "none" | "symptoms" | "tests" | "slots" | "video";

type ChatPhase = 
  | "prompt_sent"     // Stage 1: User prompt sent/bubble appears
  | "bot_thinking"    // Stage 2: Pulse AI analysing/thinking ("Analyzing symptoms...")
  | "typewriter"      // Stage 3: Bot text types out in typewriter format
  | "skeleton_cards"  // Stage 4: Doctor skeleton cards appear and shimmer
  | "cards_revealed"  // Stage 5: Real doctor cards revealed
  | "chips_ready"     // Stage 6: Action sub-chips appear
  | "report_skeleton" // Stage 7: Health Report Skeleton shimmer appears first
  | "report_ready";   // Stage 8: Health Report Analysis revealed with fade disclosure effect

function formatExperienceText(exp: string): string {
  if (!exp) return "10+ yrs of experience";
  const cleaned = exp.replace(/years?(\s+experience)?/gi, "yrs").trim();
  return `${cleaned} of experience`;
}

/**
 * 4-Point AI Sparkle Star matching the Narayana Health Mobile App Bot prompt
 */
function SparkleStarIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
        fill="url(#sparkleStarGrad)"
      />
      <circle cx="19.5" cy="4.5" r="1.5" fill="#00C4FF" />
      <defs>
        <linearGradient id="sparkleStarGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00C4FF" />
          <stop offset="0.5" stopColor="#38BDF8" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function PulseAIView({
  query,
  selectedLocation,
  doctors,
  onBack,
  onClose,
  attachedFile,
}: PulseAIViewProps) {
  // 1. Multi-turn chat state & conversation memory
  const [activeQuery, setActiveQuery] = useState(query || "Cardiologist near me");
  const [history, setHistory] = useState<string[]>([query || "Cardiologist near me"]);

  // 2. Clinical analysis result for current turn
  const [analysis, setAnalysis] = useState<ClinicalAnalysisResult>(() =>
    analyzePulseIntent(query || "Cardiologist near me", [], selectedLocation)
  );

  // 3. Live doctor cards currently displayed in carousel (updates on query)
  const [currentDoctors, setCurrentDoctors] = useState<DoctorCardData[]>(doctors);

  // 4. Target message for typewriter
  const [targetMessage, setTargetMessage] = useState<string>(() =>
    analyzePulseIntent(query || "Cardiologist near me", [], selectedLocation).clinicalMessage
  );

  const [phase, setPhase] = useState<ChatPhase>("prompt_sent");
  const [displayedText, setDisplayedText] = useState("");
  const [typedIndex, setTypedIndex] = useState(0);

  // Sync doctors when query / location changes or if passed doctors updates
  useEffect(() => {
    let isMounted = true;
    const triage = analyzePulseIntent(query || "Cardiologist near me", [], selectedLocation);
    getSearchResults(triage.searchQueryForApi || query, selectedLocation).then((res) => {
      if (isMounted && res && res.doctors.length > 0) {
        setCurrentDoctors(res.doctors);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [query, selectedLocation]);

  const [activeChip, setActiveChip] = useState<ActionChipType>("none");
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedSpecialistIndex, setSelectedSpecialistIndex] = useState(0);

  const reportSpecialistRecommendations = [
    {
      specialty: "Gastroenterologist",
      label: "Recommended specialist",
      desc: "You need to have Evaluation of mild it to fatty liver changes for better health",
      icon: Activity,
    },
    {
      specialty: "Neurologist",
      label: "Recommended specialist",
      desc: "Imaging showed mild compression in your neck area with reduced reflexes. Specialized neurology consult advised.",
      icon: Brain,
    },
    {
      specialty: "Cardiologist",
      label: "Recommended specialist",
      desc: "Normal cardiac biomarkers (Troponin I) & ECG rhythm. Preventive wellness consult recommended.",
      icon: Heart,
    },
  ];

  // ── Stage 1: Prompt sent -> Stage 2: Bot starts thinking ──
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase("bot_thinking");
    }, 280);
    return () => clearTimeout(t);
  }, []);

  // ── Stage 2: Bot thinking -> Stage 3: Typewriter (for text/voice) OR Report Skeleton (for attached file) ──
  useEffect(() => {
    if (phase === "bot_thinking") {
      if (attachedFile) {
        // Step 1: 1.2s extracting lab biomarkers, then show skeleton shimmer first!
        const t = setTimeout(() => {
          setPhase("report_skeleton");
        }, 1200);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => {
          setPhase("typewriter");
          setDisplayedText("");
          setTypedIndex(0);
        }, 650);
        return () => clearTimeout(t);
      }
    }
  }, [phase, attachedFile]);

  // ── Stage: Report Skeleton -> Stage: Report Ready with Fade Disclosure Effect ──
  useEffect(() => {
    if (phase === "report_skeleton") {
      // Step 2: 750ms of skeleton shimmer before progressive fade disclosure
      const t = setTimeout(() => {
        setPhase("report_ready");
      }, 750);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // ── Stage 3: Typewriter character-by-character effect ──
  useEffect(() => {
    if (phase !== "typewriter") return;

    if (typedIndex < targetMessage.length) {
      const timer = setTimeout(() => {
        setDisplayedText(targetMessage.slice(0, typedIndex + 1));
        setTypedIndex((prev) => prev + 1);
      }, 14);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setPhase("skeleton_cards");
      }, 160);
      return () => clearTimeout(timer);
    }
  }, [phase, typedIndex, targetMessage]);

  // ── Stage 4: Skeleton cards shimmer -> Stage 5: Cards revealed ──
  useEffect(() => {
    if (phase === "skeleton_cards") {
      const t = setTimeout(() => {
        setPhase("cards_revealed");
      }, 550);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // ── Stage 5: Cards revealed -> Stage 6: Sub-chips appear ──
  useEffect(() => {
    if (phase === "cards_revealed") {
      const t = setTimeout(() => {
        setPhase("chips_ready");
      }, 180);
      return () => clearTimeout(t);
    }
  }, [phase]);

  /**
   * Functional core: Executes live API search and clinical triage analysis
   * honoring conversation history and symptom intent.
   */
  const performTriageAndSearch = async (
    newQueryText: string,
    chipAction: ActionChipType = "none",
    updatedHistory?: string[]
  ) => {
    const hist = updatedHistory || history;
    const clean = newQueryText.trim();

    // 1. Analyze clinical intent and correlation with history
    const triageResult = analyzePulseIntent(clean, hist, selectedLocation);
    setAnalysis(triageResult);

    // If specific chip was clicked, tailor message
    let responseText = triageResult.clinicalMessage;
    if (chipAction === "video") {
      responseText = `Showing accredited ${triageResult.specialty} specialists offering direct online video consultations in ${selectedLocation}. Connect from home:`;
    } else if (chipAction === "slots") {
      responseText = `Here are confirmed ${triageResult.specialty} consultation slots available today in ${selectedLocation}:`;
    } else if (chipAction === "tests") {
      responseText = `Recommended diagnostic clinical tests based on your ${triageResult.specialty.toLowerCase()} symptoms in ${selectedLocation}:`;
    }

    setTargetMessage(responseText);
    setPhase("bot_thinking");

    // 2. Fetch live matching doctors from API (unless viewing diagnostic tests)
    if (chipAction !== "tests") {
      try {
        const searchRes = await getSearchResults(triageResult.searchQueryForApi, selectedLocation);
        if (searchRes && searchRes.doctors.length > 0) {
          if (chipAction === "video") {
            setCurrentDoctors(
              searchRes.doctors.map((d) => ({ 
                ...d, 
                consultationType: "video" as const,
                hospital: `${d.hospital} · Video Consult Available` 
              }))
            );
          } else if (chipAction === "slots") {
            setCurrentDoctors(
              searchRes.doctors.map((d) => ({ 
                ...d, 
                availableToday: true 
              }))
            );
          } else {
            setCurrentDoctors(searchRes.doctors);
          }
        }
      } catch (err) {
        console.warn("Pulse AI search query failed, using existing cards:", err);
      }
    }

    // 3. Trigger typewriter animation
    setTimeout(() => {
      setPhase("typewriter");
      setDisplayedText("");
      setTypedIndex(0);
    }, 600);
  };

  // Handle action chips with live conversational progression
  const handleChipClick = async (chip: ActionChipType) => {
    setActiveChip(chip);

    if (chip === "symptoms") {
      inputRef.current?.focus();
      return;
    }

    await performTriageAndSearch(activeQuery, chip);
  };

  // Handle conversational submit with live API query & intent triage
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputValue.trim();
    if (!clean) return;

    const newHistory = [...history, clean];
    setHistory(newHistory);
    setActiveQuery(clean);
    setInputValue("");
    setActiveChip("none");

    await performTriageAndSearch(clean, "none", newHistory);
  };

  const displayQueryText = attachedFile
    ? (activeQuery.trim() || "Understand my health report")
    : (activeQuery.trim()
        ? (activeQuery.toLowerCase().includes(selectedLocation.toLowerCase())
            ? activeQuery.trim()
            : `${activeQuery.trim()} in ${selectedLocation}`)
        : `Cardiologist near me in ${selectedLocation}`);

  return (
    <div className={styles.pulseViewContainer}>
      {/* ── 1. Top Navigation Bar: Back Button + Pulse AI Lottie + Title (Clean, un-wrapped) ── */}
      <div className={styles.pulseTopBar}>
        <div className={styles.pulseHeaderLeft}>
          <button
            type="button"
            className={styles.pulseBackBtn}
            onClick={onBack}
            aria-label="Back to search results"
            title="Back to search results"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Official Pulse AI Lottie File */}
          <div className={styles.pulseHeaderIconBox} aria-hidden="true">
            <div style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lottie animationData={pulseAnimation} loop={true} />
            </div>
          </div>

          <span className={styles.pulseHeaderTitle}>Pulse AI Clinical Assistant</span>

          <span className={styles.pulseLiveBadge}>
            <span className={styles.pulseLiveDot} />
            LIVE
          </span>
        </div>

        <div className={styles.pulseHeaderRight}>
          {attachedFile && (
            <div className={styles.pulseUserPill} title="Patient Profile">
              <div className={styles.pulseUserAvatar}>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Omkar J"
                />
              </div>
              <span className={styles.pulseUserName}>Omkar J</span>
              <ChevronDown size={14} className={styles.pulseUserChevron} />
            </div>
          )}

          {onClose && (
            <button
              type="button"
              className={styles.pulseCloseBtn}
              onClick={onClose}
              aria-label="Close search"
              title="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Chat Interface (Scrollable middle container) ── */}
      <div className={styles.pulseChatInterface}>
        {/* ── Chat Row 1: User Prompt Message (RIGHT-ALIGNED) ── */}
        <div className={styles.pulseChatRowUser}>
          <motion.div
            key={activeQuery}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.pulseUserQueryBubble}>
              {/* Attached PDF Preview Card */}
              {attachedFile && (
                <div className={styles.pulseUserPdfCard}>
                  <div className={styles.pulseUserPdfIconWrap}>
                    <FileText size={16} />
                  </div>
                  <div className={styles.pulseUserPdfDetails}>
                    <span className={styles.pulseUserPdfName}>{attachedFile.name}</span>
                    <span className={styles.pulseUserPdfSub}>Medical Health Report · PDF</span>
                  </div>
                </div>
              )}
              <span className={styles.pulseQueryText}>{displayQueryText}</span>
              <span className={styles.pulseQueryTime}>Just now</span>
            </div>
          </motion.div>
        </div>

        {/* ── Chat Row 2: Pulse AI Clinical Response (LEFT-ALIGNED) ── */}
        <div className={styles.pulseChatRowBot}>
          <div className={styles.pulseStarIconBox} aria-hidden="true">
            <SparkleStarIcon size={20} />
          </div>

          <div className={styles.pulseBotReplyContent}>
            {attachedFile && (phase === "prompt_sent" || phase === "bot_thinking") ? (
              /* Pulse AI Analyzing State (1-2s Triage Phase) */
              <motion.div
                className={styles.pulseReportAnalyzingCard}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className={styles.pulseReportAnalyzingLottie}>
                  <Lottie animationData={pulseAnimation} loop={true} />
                </div>
                <div className={styles.pulseReportAnalyzingText}>
                  <h4>Analyzing Health Report</h4>
                  <p>
                    Pulse AI is extracting lab biomarkers &amp; clinical parameters from{" "}
                    <strong>{attachedFile.name}</strong>...
                  </p>
                </div>
                <div className={styles.pulseScanningBarWrap}>
                  <div className={styles.pulseScanningBar} />
                </div>
              </motion.div>
            ) : attachedFile && phase === "report_skeleton" ? (
              /* Pulse AI Report Skeleton Card with Shimmer (Appears First) */
              <motion.div
                className={styles.pulseReportSkeletonWrap}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Greeting row skeleton */}
                <div className={styles.pulseReportTopRow}>
                  <div className={styles.pulseSkeletonGreetingCol}>
                    <div className={`${styles.pulseSkeletonLine} ${styles.pulseSkelTitle}`} />
                    <div className={`${styles.pulseSkeletonLine} ${styles.pulseSkelSubtitle}`} />
                  </div>
                  <div className={styles.pulseSkeletonThumbBox}>
                    <div className={styles.pulseSkeletonThumbShimmer} />
                  </div>
                </div>

                {/* Main Report Card skeleton */}
                <div className={styles.pulseReportSkeletonCard}>
                  {/* Header skeleton */}
                  <div className={styles.pulseSkelCardHeader}>
                    <div className={styles.pulseSkelHeaderLeft}>
                      <div className={styles.pulseSkelIconCircle} />
                      <div className={styles.pulseSkelHeaderLines}>
                        <div className={`${styles.pulseSkeletonLine} ${styles.pulseSkelHeaderTitle}`} />
                        <div className={`${styles.pulseSkeletonLine} ${styles.pulseSkelHeaderSub}`} />
                      </div>
                    </div>
                    <div className={styles.pulseSkelDateBadge} />
                  </div>

                  {/* Findings items skeleton */}
                  <div className={styles.pulseSkelFindingsList}>
                    {[0, 1, 2, 3].map((idx) => (
                      <div key={idx} className={styles.pulseSkelFindingItem}>
                        <div className={styles.pulseSkelFindingIcon} />
                        <div className={styles.pulseSkelFindingLines}>
                          <div className={`${styles.pulseSkeletonLine} ${styles.pulseSkelFindingTitle}`} />
                          <div className={`${styles.pulseSkeletonLine} ${styles.pulseSkelFindingDesc}`} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Specialist section skeleton */}
                  <div className={styles.pulseSkelSpecialistSection}>
                    <div className={styles.pulseSkelSpecialistHeader}>
                      <div className={`${styles.pulseSkeletonLine} ${styles.pulseSkelSpecTitle}`} />
                      <div className={`${styles.pulseSkeletonLine} ${styles.pulseSkelSpecCounter}`} />
                    </div>
                    <div className={styles.pulseSkelSpecCard}>
                      <div className={styles.pulseSkelSpecTop}>
                        <div className={styles.pulseSkelSpecIcon} />
                        <div className={styles.pulseSkelSpecMeta}>
                          <div className={`${styles.pulseSkeletonLine} ${styles.pulseSkelSpecLabel}`} />
                          <div className={`${styles.pulseSkeletonLine} ${styles.pulseSkelSpecName}`} />
                        </div>
                      </div>
                      <div className={`${styles.pulseSkeletonLine} ${styles.pulseSkelSpecDesc1}`} />
                      <div className={`${styles.pulseSkeletonLine} ${styles.pulseSkelSpecDesc2}`} />
                      <div className={styles.pulseSkelConsultBtn} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : attachedFile && phase === "report_ready" ? (
              /* Health Report Analysis Result View with Fade Disclosure Effect */
              <motion.div
                className={styles.pulseReportContentWrap}
                initial={{ opacity: 0, y: 14, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* 1. Patient Greeting + Document Thumbnail in Top Row */}
                <div className={styles.pulseReportTopRow}>
                  <div className={styles.pulseReportPatientGreeting}>
                    <h3>Hello Omkar J (age 48),</h3>
                    <p>Mild fatty liver and normal heart function detected.</p>
                  </div>

                  {/* Mini Lab Report Thumbnail Card */}
                  <div
                    className={styles.pulseReportThumbnailCard}
                    title={`${attachedFile.name} (Verified)`}
                  >
                    <div className={styles.pulseThumbnailDocSheet}>
                      <div className={styles.pulseThumbnailLines}>
                        <div className={styles.pulseThumbLine} style={{ width: "80%" }} />
                        <div className={styles.pulseThumbLine} style={{ width: "60%" }} />
                        <div className={styles.pulseThumbLine} style={{ width: "95%" }} />
                      </div>
                      <div className={styles.pulseThumbGrid}>
                        <div className={styles.pulseThumbGridItem} />
                        <div className={styles.pulseThumbGridItem} />
                        <div className={styles.pulseThumbGridItem} />
                        <div className={styles.pulseThumbGridItem} />
                      </div>
                      <div className={styles.pulseThumbBodyFigures}>
                        <svg width="18" height="24" viewBox="0 0 20 28" fill="none" stroke="#034EA2" strokeWidth="1.2">
                          <circle cx="10" cy="5" r="3" />
                          <path d="M10 8V18M6 11L14 11M6 26L10 18L14 26" />
                        </svg>
                        <svg width="18" height="24" viewBox="0 0 20 28" fill="none" stroke="#ED1C24" strokeWidth="1.2">
                          <circle cx="10" cy="5" r="3" />
                          <path d="M10 8V18M6 11L14 11M6 26L10 18L14 26" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Main Crisp White Report Analysis Card */}
                <div className={styles.pulseReportCard}>
                  {/* Card Header with Peach Gradient */}
                  <div className={styles.pulseReportCardHeader}>
                    <div className={styles.pulseReportCardHeaderLeft}>
                      <div className={styles.pulseReportCardIconBox}>
                        <FileText size={20} />
                      </div>
                      <div className={styles.pulseReportCardHeaderText}>
                        <h4 className={styles.pulseReportCardTitle}>Report Analysis</h4>
                        <span className={styles.pulseReportCardSubtitle}>Based on Visit Summary, Lab Report</span>
                      </div>
                    </div>
                    <div className={styles.pulseReportDateBadge}>
                      <Calendar size={13} />
                      <span>Nov&apos;2024</span>
                    </div>
                  </div>

                  {/* Findings List */}
                  <div className={styles.pulseReportFindingsList}>
                    <div className={styles.pulseReportFindingItem}>
                      <div className={styles.pulseFindingIconRed}>!</div>
                      <div className={styles.pulseFindingText}>
                        <h5 className={styles.pulseFindingTitle}>Reflexes reduced</h5>
                        <p className={styles.pulseFindingDesc}>Imaging showed mild compression in your neck area.</p>
                      </div>
                    </div>

                    <div className={styles.pulseReportFindingItem}>
                      <div className={styles.pulseFindingIconRed}>!</div>
                      <div className={styles.pulseFindingText}>
                        <h5 className={styles.pulseFindingTitle}>Reflexes reduced</h5>
                        <p className={styles.pulseFindingDesc}>Imaging showed mild compression in your neck area.</p>
                      </div>
                    </div>

                    <div className={styles.pulseReportFindingItem}>
                      <div className={styles.pulseFindingIconGreen}>✓</div>
                      <div className={styles.pulseFindingText}>
                        <h5 className={styles.pulseFindingTitle}>Left hand tremors</h5>
                        <p className={styles.pulseFindingDesc}>You reported shaking in your left hand.</p>
                      </div>
                    </div>

                    <div className={styles.pulseReportFindingItem}>
                      <div className={styles.pulseFindingIconGreen}>✓</div>
                      <div className={styles.pulseFindingText}>
                        <h5 className={styles.pulseFindingTitle}>Left hand tremors</h5>
                        <p className={styles.pulseFindingDesc}>You reported shaking in your left hand.</p>
                      </div>
                    </div>
                  </div>

                  {/* "To improve your health" Recommendation Box */}
                  <div className={styles.pulseSpecialistSection}>
                    <div className={styles.pulseSpecialistHeader}>
                      <span className={styles.pulseSpecialistHeaderTitle}>To improve your health</span>
                      <span className={styles.pulseSpecialistCounter}>{selectedSpecialistIndex + 1}/3</span>
                    </div>

                    <div className={styles.pulseSpecialistCard}>
                      <div className={styles.pulseSpecialistTop}>
                        <div className={styles.pulseSpecialistIconWrap}>
                          {React.createElement(reportSpecialistRecommendations[selectedSpecialistIndex].icon, { size: 20 })}
                        </div>
                        <div className={styles.pulseSpecialistMeta}>
                          <span className={styles.pulseSpecialistLabel}>{reportSpecialistRecommendations[selectedSpecialistIndex].label}</span>
                          <span className={styles.pulseSpecialistName}>{reportSpecialistRecommendations[selectedSpecialistIndex].specialty}</span>
                        </div>
                      </div>

                      <p className={styles.pulseSpecialistDesc}>
                        {reportSpecialistRecommendations[selectedSpecialistIndex].desc}
                      </p>

                      <Link
                        href={`/doctors?speciality=${encodeURIComponent(reportSpecialistRecommendations[selectedSpecialistIndex].specialty)}&city=${encodeURIComponent(selectedLocation)}`}
                        className={styles.pulseConsultBtn}
                      >
                        Consult
                      </Link>
                    </div>

                    {/* 3 Dots Carousel Pagination */}
                    <div className={styles.pulseCarouselDots}>
                      {[0, 1, 2].map((idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`${styles.pulseDot} ${selectedSpecialistIndex === idx ? styles.pulseDotActive : ""}`}
                          onClick={() => setSelectedSpecialistIndex(idx)}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. If you're looking for something else */}
                <div className={styles.pulseAlternativesSection}>
                  <h5 className={styles.pulseAlternativesTitle}>If your looking for something elese</h5>
                  <div className={styles.pulseAlternativesRow}>
                    <button
                      type="button"
                      className={styles.pulseAltChip}
                      onClick={() => {
                        setActiveQuery("Book for ENT in " + selectedLocation);
                        setTargetMessage("Here are leading ENT (Ear, Nose & Throat) specialists available at Narayana Health:");
                        setPhase("bot_thinking");
                      }}
                    >
                      Book for ENT
                    </button>

                    <button
                      type="button"
                      className={styles.pulseAltChip}
                      onClick={() => {
                        setActiveQuery("Book for Cardiologist in " + selectedLocation);
                        setTargetMessage("Here are leading Cardiologists and cardiac wellness consultation slots at Narayana Health:");
                        setPhase("bot_thinking");
                      }}
                    >
                      Book for Cardiologist
                    </button>

                    <button
                      type="button"
                      className={styles.pulseAltChip}
                      onClick={() => {
                        inputRef.current?.focus();
                      }}
                    >
                      Specify more symptoms
                    </button>

                    <button
                      type="button"
                      className={styles.pulseAltChip}
                      onClick={() => {
                        setActiveQuery("Book video consultation in " + selectedLocation);
                        setTargetMessage("Video consultations allow you to consult specialists remotely from home with digital prescription delivery:");
                        setPhase("bot_thinking");
                      }}
                    >
                      Book video consultation
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Regular Text/Voice Multi-turn Bot Response */
              <>
                {phase === "bot_thinking" ? (
                  <motion.div
                    className={styles.pulseThinkingPill}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span>
                      Pulse AI is analyzing symptoms &amp; matching specialists in {selectedLocation}
                    </span>
                    <span className={styles.pulseThinkingDots}>
                      <span />
                      <span />
                      <span />
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    className={styles.pulseResponseTextWrap}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className={styles.pulseResponseText}>
                      {phase === "typewriter" ? displayedText : targetMessage}
                    </span>
                    {phase === "typewriter" && (
                      <span className={styles.typewriterCaret} />
                    )}
                  </motion.div>
                )}

                {/* Doctor Cards Carousel or Diagnostic Tests */}
                <div className={styles.pulseCardsContainer}>
                  {phase === "prompt_sent" || phase === "bot_thinking" || phase === "typewriter" ? (
                    <div className={styles.pulseEmptyAnalysisArea} />
                  ) : phase === "skeleton_cards" ? (
                    <motion.div
                      className={styles.pulseDoctorSkeletonGrid}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.24 }}
                    >
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className={styles.pulseDoctorSkeletonCard}>
                          <div className={styles.pulseSkeletonShimmer} />
                          <div className={`${styles.pulseSkeletonBar} ${styles.pulseSkeletonBarTitle}`} />
                          <div className={`${styles.pulseSkeletonBar} ${styles.pulseSkeletonBarSub}`} />
                          <div className={`${styles.pulseSkeletonBar} ${styles.pulseSkeletonBarLocation}`} />
                          <div className={`${styles.pulseSkeletonBar} ${styles.pulseSkeletonBarBtn}`} />
                        </div>
                      ))}
                    </motion.div>
                  ) : activeChip === "tests" ? (
                    <motion.div
                      className={styles.pulseTestsGrid}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.28 }}
                    >
                      {analysis.tests.map((test) => {
                        let IconComp = Activity;
                        if (test.iconType === "heart") IconComp = Heart;
                        else if (test.iconType === "brain") IconComp = Brain;
                        else if (test.iconType === "bone") IconComp = Bone;

                        return (
                          <div key={test.id} className={styles.pulseTestCard}>
                            <div className={styles.pulseTestIcon}><IconComp size={18} /></div>
                            <h4 className={styles.pulseTestTitle}>{test.title}</h4>
                            <p className={styles.pulseTestDesc}>{test.desc}</p>
                            <span className={styles.pulseTestBadge}>{test.badge}</span>
                          </div>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <motion.div
                      className={styles.pulseDoctorGrid}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {currentDoctors.slice(0, 4).map((doc) => (
                        <div key={doc.id} className={styles.pulseDoctorCard}>
                          <img
                            src={doc.image}
                            alt={doc.name}
                            className={styles.pulseDocImage}
                          />
                          <div className={styles.pulseDocGradient} />
                          <div className={styles.pulseDocOverlayContent}>
                            <div className={styles.pulseDocBottomFlex}>
                              <div className={styles.pulseDocTextCol}>
                                <h3 className={styles.pulseDocName} title={doc.name}>
                                  {doc.name}
                                </h3>
                                <div className={styles.pulseDocSpecialty} title={doc.speciality}>
                                  {doc.speciality}
                                </div>
                                <div className={styles.pulseDocExpRow}>
                                  <Briefcase size={11} className={styles.pulseDocExpIcon} />
                                  <span>{formatExperienceText(doc.experience)}</span>
                                </div>
                                <div className={styles.pulseDocHospital} title={doc.hospital}>
                                  {doc.hospital}
                                </div>
                              </div>
                              <Link
                                href={`/doctors/${doc.id}/book?city=${encodeURIComponent(selectedLocation)}${activeChip === "video" ? "&mode=video" : ""}`}
                                className={styles.pulseDocBookBtnWhite}
                              >
                                Book
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Sub-Chips */}
                <AnimatePresence>
                  {(phase === "chips_ready" || phase === "cards_revealed") && (
                    <motion.div
                      className={styles.pulseChipsSection}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <span className={styles.pulseChipsSectionLabel}>
                        If you&apos;re looking for something else:
                      </span>
                      <div className={styles.pulseChipsRow} role="group" aria-label="Quick follow-up actions">
                        {analysis.chips.map((chip, index) => (
                          <motion.button
                            key={chip.id}
                            type="button"
                            className={`${styles.pulseChip} ${activeChip === chip.id ? styles.pulseChipActive : ""}`}
                            onClick={() => handleChipClick(chip.id as ActionChipType)}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04, duration: 0.2 }}
                          >
                            {chip.label}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Sticky Bottom Conversational Input Bar (Pinned at bottom, outside the scroll area!) ── */}
      <div className={styles.pulseBottomStickyBar}>
        <form
          className={styles.pulseBottomInputBar}
          onSubmit={(e) => {
            e.preventDefault();
            const text = inputValue.trim();
            if (text) {
              handleFormSubmit(e);
            }
          }}
        >
          <button
            type="button"
            className={styles.pulseBottomPlusBtn}
            title="Attach file"
            aria-label="Attach file"
            onClick={() => inputRef.current?.focus()}
          >
            <Plus size={16} />
          </button>

          <input
            ref={inputRef}
            type="text"
            className={styles.pulseBottomInputField}
            placeholder="Ask Pulse..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            aria-label="Ask Pulse"
          />

          <button
            type="button"
            className={`${styles.pulseBottomMicBtn} ${isListening ? styles.pulseMicBtnActive : ""}`}
            title={isListening ? "Listening..." : "Speak symptoms"}
            aria-label="Voice search"
            onClick={() => setIsListening((prev) => !prev)}
          >
            <Mic size={17} />
          </button>

          {inputValue.trim().length > 0 && (
            <button
              type="submit"
              className={styles.pulseBottomSendBtn}
              title="Send"
              aria-label="Send query"
            >
              <Send size={14} color="#FFFFFF" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
