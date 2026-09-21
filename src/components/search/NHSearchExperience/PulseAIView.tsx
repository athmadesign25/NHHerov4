"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Paperclip, 
  Mic, 
  Sparkles, 
  Briefcase, 
  Send, 
  CheckCircle2,
  Activity,
  Heart,
  Calendar
} from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { DoctorCardData } from "./searchData";

interface PulseAIViewProps {
  query: string;
  selectedLocation: string;
  doctors: DoctorCardData[];
  onBack: () => void;
}

type ActionChipType = "none" | "symptoms" | "tests" | "slots" | "video";

export default function PulseAIView({
  query,
  selectedLocation,
  doctors,
  onBack,
}: PulseAIViewProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [activeChip, setActiveChip] = useState<ActionChipType>("none");
  const [inputValue, setInputValue] = useState("");
  const [customReply, setCustomReply] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleFavorite = (docId: string) => {
    setFavorites((prev) => 
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  // 1-second simulated analysis on mount (Requirement 6)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle action chips (Requirement 8)
  const handleChipClick = (chip: ActionChipType) => {
    setActiveChip(chip);
    setCustomReply(null);
    if (chip === "symptoms") {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  // Handle conversational submit (Requirement 9)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputValue.trim();
    if (!clean) return;

    setCustomReply(`Noted: "${clean}". Based on this, I recommend scheduling an in-person cardiology evaluation at Narayana Health City.`);
    setInputValue("");
    setActiveChip("none");
  };

  // Dynamic response text based on active chip or custom reply
  const getResponseMessage = () => {
    if (customReply) return customReply;
    if (activeChip === "video") {
      return `Showing top cardiologists available for immediate video consultation in ${selectedLocation}.`;
    }
    if (activeChip === "tests") {
      return `Recommended diagnostic heart tests based on your search in ${selectedLocation}:`;
    }
    if (activeChip === "slots") {
      return `Here are cardiologists with confirmed consultation slots available today in ${selectedLocation}.`;
    }
    if (activeChip === "symptoms") {
      return `Describe your symptoms below (e.g. chest heaviness, palpitations, breathlessness) for clinical triage.`;
    }
    return `Here are some Cardiologists near you in ${selectedLocation}.`;
  };

  const displayQueryText = query.trim()
    ? `${query.trim()} in ${selectedLocation}`
    : `cardiologist near me in ${selectedLocation}`;

  return (
    <div className={styles.pulseViewContainer}>
      {/* ── Top Bar: Back Button, Title, Live Status & Query Context ── */}
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

          <div className={styles.pulseHeaderIconBox} aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="2.8" fill="currentColor" />
              <circle cx="18.5" cy="8.5" r="1.8" fill="currentColor" />
              <circle cx="5.5" cy="8.5" r="1.8" fill="currentColor" />
              <circle cx="18.5" cy="15.5" r="1.8" fill="currentColor" />
              <circle cx="5.5" cy="15.5" r="1.8" fill="currentColor" />
              <line x1="9.6" y1="10.4" x2="7" y2="9.4" />
              <line x1="14.4" y1="10.4" x2="17" y2="9.4" />
              <line x1="9.6" y1="13.6" x2="7" y2="14.6" />
              <line x1="14.4" y1="13.6" x2="17" y2="14.6" />
            </svg>
          </div>

          <span className={styles.pulseHeaderTitle}>Pulse AI Clinical Assistant</span>

          <span className={styles.pulseLiveBadge}>
            <span className={styles.pulseLiveDot} />
            LIVE
          </span>
        </div>

        {/* User Query Context Bubble (Right side, matching Figma) */}
        <div className={styles.pulseUserQueryBubble}>
          <span className={styles.pulseQueryText}>{displayQueryText}</span>
          <span className={styles.pulseQueryTime}>Just now</span>
        </div>
      </div>

      {/* ── AI Response Line (Left) ── */}
      <div className={styles.pulseResponseHeader}>
        <div className={styles.pulseResponseGlyph} aria-hidden>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="2.8" fill="#F43F5E" />
            <circle cx="18.5" cy="8.5" r="1.8" fill="#F43F5E" />
            <circle cx="5.5" cy="8.5" r="1.8" fill="#F43F5E" />
            <circle cx="18.5" cy="15.5" r="1.8" fill="#F43F5E" />
            <circle cx="5.5" cy="15.5" r="1.8" fill="#F43F5E" />
            <line x1="9.6" y1="10.4" x2="7" y2="9.4" />
            <line x1="14.4" y1="10.4" x2="17" y2="9.4" />
            <line x1="9.6" y1="13.6" x2="7" y2="14.6" />
            <line x1="14.4" y1="13.6" x2="17" y2="14.6" />
          </svg>
        </div>

        {isAnalyzing ? (
          <div className={styles.pulseThinkingPill}>
            <span className={styles.pulseThinkingDots}>
              <span />
              <span />
              <span />
            </span>
            <span>Pulse AI is analyzing specialists...</span>
          </div>
        ) : (
          <span className={styles.pulseResponseText}>{getResponseMessage()}</span>
        )}
      </div>

      {/* ── Middle Area: 4 Doctor Cards or Diagnostic Test Cards ── */}
      <div className={styles.pulseCardsContainer}>
        {isAnalyzing ? (
          /* Clean reserved height area during the 1-second analysis matching Figma reference */
          <div className={styles.pulseEmptyAnalysisArea} />
        ) : activeChip === "tests" ? (
          /* Heart Test Suggestions when "Recommended heart tests" chip is clicked */
          <div className={styles.pulseTestsGrid}>
            <div className={styles.pulseTestCard}>
              <div className={styles.pulseTestIcon}><Activity size={18} /></div>
              <h4 className={styles.pulseTestTitle}>12-Lead ECG</h4>
              <p className={styles.pulseTestDesc}>Immediate resting rhythm & ischemia detection</p>
              <span className={styles.pulseTestBadge}>Report in 15 mins</span>
            </div>
            <div className={styles.pulseTestCard}>
              <div className={styles.pulseTestIcon}><Heart size={18} /></div>
              <h4 className={styles.pulseTestTitle}>2D Echocardiogram</h4>
              <p className={styles.pulseTestDesc}>Heart chamber wall motion & ejection fraction</p>
              <span className={styles.pulseTestBadge}>Same-day slot</span>
            </div>
            <div className={styles.pulseTestCard}>
              <div className={styles.pulseTestIcon}><Activity size={18} /></div>
              <h4 className={styles.pulseTestTitle}>Cardiac CT / Angio</h4>
              <p className={styles.pulseTestDesc}>High-definition non-invasive coronary imaging</p>
              <span className={styles.pulseTestBadge}>Consultant referral</span>
            </div>
            <div className={styles.pulseTestCard}>
              <div className={styles.pulseTestIcon}><Heart size={18} /></div>
              <h4 className={styles.pulseTestTitle}>Lipid & Troponin</h4>
              <p className={styles.pulseTestDesc}>Quantitative cardiac biomarker blood panel</p>
              <span className={styles.pulseTestBadge}>NABL Accredited</span>
            </div>
          </div>
        ) : (
          /* 4 Relevant Doctor Cards in a clean horizontal arrangement (Requirement 7) */
          <div className={styles.pulseDoctorGrid}>
            {doctors.slice(0, 4).map((doc) => (
              <div key={doc.id} className={styles.pulseDoctorCard}>
                {/* Full-bleed background photo */}
                <img
                  src={doc.image}
                  alt={doc.name}
                  className={styles.pulseDocImage}
                />

                {/* Heart / Favorite toggle button (Figma reference) */}
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

                {/* Doctor info overlay */}
                <div className={styles.pulseDocOverlay}>
                  <h3 className={styles.pulseDocName} title={doc.name}>
                    {doc.name}
                  </h3>
                  <div className={styles.pulseDocSpecialty} title={doc.speciality}>
                    {doc.speciality}
                  </div>
                  <div className={styles.pulseDocHospital} title={doc.hospital}>
                    {doc.hospital}
                  </div>

                  <div className={styles.pulseDocExpRow}>
                    <Briefcase size={11} className={styles.pulseDocExpIcon} />
                    <span>{doc.experience}</span>
                  </div>

                  <Link
                    href={`/doctors/${doc.id}/book?city=${encodeURIComponent(selectedLocation)}${activeChip === "video" ? "&mode=video" : ""}`}
                    className={styles.pulseBookBtn}
                  >
                    <span>{activeChip === "video" ? "Book Video →" : "Book →"}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Contextual Action Chips (Requirement 8) ── */}
      <div className={styles.pulseChipsRow} role="group" aria-label="Quick follow-up actions">
        <button
          type="button"
          className={`${styles.pulseChip} ${activeChip === "symptoms" ? styles.pulseChipActive : ""}`}
          onClick={() => handleChipClick("symptoms")}
        >
          Specify symptoms
        </button>

        <button
          type="button"
          className={`${styles.pulseChip} ${activeChip === "tests" ? styles.pulseChipActive : ""}`}
          onClick={() => handleChipClick("tests")}
        >
          Recommended heart tests
        </button>

        <button
          type="button"
          className={`${styles.pulseChip} ${activeChip === "slots" ? styles.pulseChipActive : ""}`}
          onClick={() => handleChipClick("slots")}
        >
          Doctor slots today
        </button>

        <button
          type="button"
          className={`${styles.pulseChip} ${activeChip === "video" ? styles.pulseChipActive : ""}`}
          onClick={() => handleChipClick("video")}
        >
          Book video consultation
        </button>
      </div>

      {/* ── Bottom Conversational Input (Requirement 9) ── */}
      <form className={styles.pulseInputBar} onSubmit={handleFormSubmit}>
        <button
          type="button"
          className={styles.pulseInputAttachBtn}
          title="Attach medical report or file"
          aria-label="Attach file"
          onClick={() => {
            setCustomReply("Medical report upload feature ready. You can also describe symptoms below.");
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
          placeholder={activeChip === "symptoms" ? "E.g. chest tightness on exertion, shortness of breath..." : "Ask Pulse AI or describe symptoms..."}
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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="2.8" fill="#FFFFFF" />
            <circle cx="18.5" cy="8.5" r="1.8" fill="#FFFFFF" />
            <circle cx="5.5" cy="8.5" r="1.8" fill="#FFFFFF" />
            <circle cx="18.5" cy="15.5" r="1.8" fill="#FFFFFF" />
            <circle cx="5.5" cy="15.5" r="1.8" fill="#FFFFFF" />
            <line x1="9.6" y1="10.4" x2="7" y2="9.4" />
            <line x1="14.4" y1="10.4" x2="17" y2="9.4" />
            <line x1="9.6" y1="13.6" x2="7" y2="14.6" />
            <line x1="14.4" y1="13.6" x2="17" y2="14.6" />
          </svg>
        </button>
      </form>
    </div>
  );
}
