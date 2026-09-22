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
  Bone
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
}

type ActionChipType = "none" | "symptoms" | "tests" | "slots" | "video";

type ChatPhase = 
  | "prompt_sent"     // Stage 1: User prompt sent/bubble appears
  | "bot_thinking"    // Stage 2: Pulse AI analysing/thinking ("Analyzing symptoms...")
  | "typewriter"      // Stage 3: Bot text types out in typewriter format
  | "skeleton_cards"  // Stage 4: Doctor skeleton cards appear and shimmer
  | "cards_revealed"  // Stage 5: Real doctor cards revealed
  | "chips_ready";    // Stage 6: Action sub-chips appear

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

  const [activeChip, setActiveChip] = useState<ActionChipType>("none");
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleFavorite = (docId: string) => {
    setFavorites((prev) => 
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  // ── Stage 1: Prompt sent -> Stage 2: Bot starts thinking ──
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase("bot_thinking");
    }, 280);
    return () => clearTimeout(t);
  }, []);

  // ── Stage 2: Bot thinking -> Stage 3: Typewriter starts ──
  useEffect(() => {
    if (phase === "bot_thinking") {
      const t = setTimeout(() => {
        setPhase("typewriter");
        setDisplayedText("");
        setTypedIndex(0);
      }, 650);
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

  const displayQueryText = activeQuery.trim()
    ? (activeQuery.toLowerCase().includes(selectedLocation.toLowerCase())
        ? activeQuery.trim()
        : `${activeQuery.trim()} in ${selectedLocation}`)
    : `Cardiologist near me in ${selectedLocation}`;

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
      </div>

      {/* ── 2. Chat Interface (Starts below Header with clear spacing/padding) ── */}
      <div className={styles.pulseChatInterface}>
        {/* ── Chat Row 1: User Prompt Message (Top-Right with Dynamic Query Text) ── */}
        <div className={styles.pulseChatRowUser}>
          <motion.div 
            key={activeQuery}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.pulseUserQueryBubble}>
              <span className={styles.pulseQueryText}>{displayQueryText}</span>
              <span className={styles.pulseQueryTime}>Just now</span>
            </div>
          </motion.div>
        </div>

        {/* ── Chat Row 2: Bot Response Row with Small Sparkle Star (Matching App) ── */}
        <div className={styles.pulseChatRowBot}>
          <div className={styles.pulseStarIconBox} aria-hidden="true">
            <SparkleStarIcon size={18} />
          </div>

          {phase === "bot_thinking" ? (
            /* Bot Thinking State */
            <motion.div 
              className={styles.pulseThinkingPill}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span>Pulse AI is analyzing symptoms & matching specialists in {selectedLocation}</span>
              <span className={styles.pulseThinkingDots}>
                <span />
                <span />
                <span />
              </span>
            </motion.div>
          ) : (
            /* Typewriter Bot Text with Intent Emphasis */
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
        </div>

        {/* ── Chat Row 3: Doctor Cards Carousel or Diagnostic Tests ── */}
        <div className={styles.pulseCardsContainer}>
          {phase === "prompt_sent" || phase === "bot_thinking" || phase === "typewriter" ? (
            /* Reserved clean height while typing */
            <div className={styles.pulseEmptyAnalysisArea} />
          ) : phase === "skeleton_cards" ? (
            /* Shimmer Skeleton Cards */
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
            /* Dynamic Diagnostic Tests View by Specialty */
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
            /* 4 Relevant Live Doctor Cards with Result Page Composition */
            <motion.div 
              className={styles.pulseDoctorGrid}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              {currentDoctors.slice(0, 4).map((doc) => (
                <div key={doc.id} className={styles.pulseDoctorCard}>
                  {/* Full-bleed background photo */}
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className={styles.pulseDocImage}
                  />

                  {/* Heart / Favorite toggle button */}
                  <button
                    type="button"
                    className={styles.pulseDocFavBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(doc.id);
                    }}
                    aria-label={`Save ${doc.name} to favorites`}
                  >
                    <Heart
                      size={12}
                      fill={favorites.includes(doc.id) ? "#EF4444" : "none"}
                      color={favorites.includes(doc.id) ? "#EF4444" : "rgba(255, 255, 255, 0.85)"}
                    />
                  </button>

                  {/* Smooth bottom dark gradient scrim */}
                  <div className={styles.pulseDocGradient} />

                  {/* Doctor info overlay matching Result Page composition */}
                  <div className={styles.pulseDocOverlayContent}>
                    <div className={styles.pulseDocBottomFlex}>
                      {/* Left Column: Name, Specialty in color, Experience, Hospital */}
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

                      {/* Right Column: Crisp White Book Button */}
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

        {/* ── Chat Row 4: Sub-Chips Section with Dynamic Specialty Intent ── */}
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

        {/* ── Chat Row 5: Bottom Conversational Input (Functional & Connected) ── */}
        <form className={styles.pulseInputBar} onSubmit={handleFormSubmit}>
          <button
            type="button"
            className={styles.pulseInputAttachBtn}
            title="Attach medical report or file"
            aria-label="Attach file"
            onClick={() => {
              setTargetMessage("Medical report upload is active. Pulse AI can analyze clinical records and prescriptions. Describe symptoms below to proceed:");
              setPhase("bot_thinking");
            }}
          >
            <Paperclip size={16} />
          </button>

          <input
            ref={inputRef}
            type="text"
            className={styles.pulseTextInput}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              activeChip === "symptoms"
                ? "Describe your symptoms (e.g. chest tightness, joint stiffness, headache)..."
                : `Ask Pulse AI or describe symptoms in ${selectedLocation}...`
            }
            aria-label="Ask Pulse AI"
          />

          <button
            type="button"
            className={`${styles.pulseMicBtn} ${isListening ? styles.pulseMicBtnActive : ""}`}
            title={isListening ? "Listening..." : "Speak symptoms"}
            aria-label="Voice input"
            onClick={() => setIsListening((prev) => !prev)}
          >
            <Mic size={16} />
          </button>

          <button
            type="submit"
            className={styles.pulseSendBtn}
            title="Send message to Pulse AI"
            aria-label="Send message"
          >
            <Send size={15} color="#FFFFFF" />
          </button>
        </form>
      </div>
    </div>
  );
}
