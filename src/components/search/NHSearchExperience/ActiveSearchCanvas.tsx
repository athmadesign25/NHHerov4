"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Paperclip, Mic, ArrowRight, X, 
  User, Heart, Sparkles, CornerDownLeft, Command,
  Activity, Bone, Brain, AlertCircle, Stethoscope, SearchX,
  Clock
} from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import LocationSelector from "./LocationSelector";
import { 
  PredictiveState, 
  getPredictiveCompletion, 
  fetchLiveApiPredictions,
  countWords,
  enforceWordLimit,
  MAX_SEARCH_WORDS
} from "./searchData";

const MOBILE_POPULAR_SEARCHES = [
  { label: "Cardiologist", query: "Cardiologist near me", icon: Heart },
  { label: "Chest pain", query: "I have chest pain", icon: Activity },
  { label: "Orthopaedic", query: "Orthopaedic doctor", icon: Bone },
  { label: "Knee pain", query: "I have knee pain", icon: Activity },
  { label: "Neurologist", query: "Neurologist specialist", icon: Brain },
  { label: "Pediatrician", query: "Pediatrician near me", icon: User },
];

interface ActiveSearchCanvasProps {
  query: string;
  onQueryChange: (val: string) => void;
  onSubmit: (query: string) => void;
  onClose: () => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  activePill: string | null;
  onSelectActionPill: (pill: "doctor" | "symptoms") => void;
}

export default function ActiveSearchCanvas({
  query,
  onQueryChange,
  onSubmit,
  onClose,
  selectedLocation,
  onSelectLocation,
  activePill,
  onSelectActionPill,
}: ActiveSearchCanvasProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedSugIndex, setSelectedSugIndex] = useState<number>(-1);
  const [livePrediction, setLivePrediction] = useState<PredictiveState | null>(null);

  // Recent Searches (History for logged in user, cache for guest user)
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isLogged = localStorage.getItem("isLoggedIn") === "true" || sessionStorage.getItem("isLoggedIn") === "true";
    const storageKey = isLogged ? "nh_user_search_history" : "nh_guest_search_history";
    
    const fallbackSeed = isLogged
      ? ["Dr. Devi Prasad Shetty", "Cardiologist near me", "Lipid profile test", "Knee replacement surgery"]
      : ["Cardiologist in Bangalore", "Chest pain symptoms", "Orthopaedic doctor", "Pediatrician near me"];

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentSearches(parsed.slice(0, 4));
          return;
        }
      }
    } catch {
      // fallback to seed
    }

    setRecentSearches(fallbackSeed.slice(0, 4));
  }, []);

  const saveSearchToHistory = (itemQuery: string) => {
    const clean = itemQuery.trim();
    if (!clean || typeof window === "undefined") return;
    const isLogged = localStorage.getItem("isLoggedIn") === "true" || sessionStorage.getItem("isLoggedIn") === "true";
    const storageKey = isLogged ? "nh_user_search_history" : "nh_guest_search_history";

    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((q) => q.toLowerCase() !== clean.toLowerCase())].slice(0, 4);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore storage error
      }
      return next;
    });
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined") return;
    const isLogged = localStorage.getItem("isLoggedIn") === "true" || sessionStorage.getItem("isLoggedIn") === "true";
    const storageKey = isLogged ? "nh_user_search_history" : "nh_guest_search_history";
    try {
      localStorage.setItem(storageKey, JSON.stringify([]));
    } catch {
      // ignore
    }
    setRecentSearches([]);
  };

  // Compute immediate local prediction (0ms for demo speed)
  const localPrediction: PredictiveState | null = query.trim()
    ? getPredictiveCompletion(query)
    : null;

  // Debounced API prediction to fetch real entities from upstream search database
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setLivePrediction(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const live = await fetchLiveApiPredictions(trimmed, selectedLocation, controller.signal);
        if (!controller.signal.aborted) {
          setLivePrediction(live);
        }
      } catch {
        // Fallback gracefully
      }
    }, 140);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, selectedLocation]);

  // Merge predictions:
  // If query is an explicit demo key ("c", "ch", "chest", "k", "kn", "knee"), use local scenario
  // Otherwise use livePrediction if available, else fallback to localPrediction
  const isHardcodedScenario = 
    query.trim().toLowerCase() === "c" || 
    query.trim().toLowerCase() === "ch" || 
    query.trim().toLowerCase() === "chest" || 
    query.trim().toLowerCase().startsWith("chest p") || 
    query.trim().toLowerCase() === "k" || 
    query.trim().toLowerCase() === "kn" || 
    query.trim().toLowerCase() === "knee" || 
    query.trim().toLowerCase().startsWith("knee p") ||
    query.trim().toLowerCase().startsWith("xy") ||
    query.trim().toLowerCase().startsWith("xz");

  const prediction = isHardcodedScenario 
    ? (localPrediction || livePrediction)
    : (livePrediction || localPrediction);

  // Auto-focus input when opening
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keyboard handler for Tab completion, arrow navigation, enter submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      // Tab accepts the inline predictive completion
      if (prediction && prediction.fullText) {
        e.preventDefault();
        onQueryChange(prediction.fullText);
      }
    } else if (e.key === "ArrowRight" && inputRef.current) {
      // Right arrow at end of text also accepts prediction
      const atEnd = inputRef.current.selectionStart === query.length;
      if (atEnd && prediction && prediction.fullText) {
        e.preventDefault();
        onQueryChange(prediction.fullText);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (prediction && selectedSugIndex >= 0 && prediction.suggestions[selectedSugIndex]) {
        const target = prediction.suggestions[selectedSugIndex];
        saveSearchToHistory(target);
        onSubmit(target);
      } else if (query.trim()) {
        saveSearchToHistory(query.trim());
        onSubmit(query.trim());
      } else if (prediction && prediction.fullText) {
        saveSearchToHistory(prediction.fullText);
        onSubmit(prediction.fullText);
      } else {
        saveSearchToHistory("Cardiologist near me");
        onSubmit("Cardiologist near me");
      }
    } else if (e.key === "ArrowDown" && prediction) {
      e.preventDefault();
      setSelectedSugIndex((prev) =>
        prev < prediction.suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp" && prediction) {
      e.preventDefault();
      setSelectedSugIndex((prev) =>
        prev > 0 ? prev - 1 : prediction.suggestions.length - 1
      );
    } else if (e.key === "Escape") {
      if (query.length > 0 || activePill) {
        e.preventDefault();
        e.stopPropagation();
        onQueryChange("");
        inputRef.current?.focus();
      } else {
        e.preventDefault();
        onClose();
      }
    }
  };

  /**
   * Accepts prediction and updates query
   */
  const handleAcceptPrediction = (fullText: string) => {
    onQueryChange(fullText);
    inputRef.current?.focus();
  };

  return (
    <div className={styles.activeContainer}>
      {/* Top Header Row: Location Pill + Pulse AI Badge + Close button */}
      <div className={styles.topHeaderRow}>
        <div className={styles.headerLeftGroup}>
          {/* Location Selector */}
          <LocationSelector
            selectedLocation={selectedLocation}
            onSelectLocation={onSelectLocation}
          />
        </div>

        {/* Close Button */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close search"
        >
          <X size={18} />
        </button>
      </div>

      {/* Input Row with Live Predictive Sentence Ghost Overlay */}
      <div className={styles.activeInputRow}>
        <button 
          type="button" 
          className={styles.standaloneIconBtn} 
          aria-label="Attach medical records or file"
        >
          <Paperclip size={18} />
        </button>

        <div className={styles.inputGhostWrapper}>
          {/* Real interactive input */}
          <input
            ref={inputRef}
            type="text"
            className={styles.activeTextInput}
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              const words = countWords(val);
              if (words > MAX_SEARCH_WORDS) {
                onQueryChange(enforceWordLimit(val, MAX_SEARCH_WORDS));
              } else {
                onQueryChange(val);
              }
              setSelectedSugIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Start typing symptom, specialty or doctor..."
            aria-label="Search symptoms, conditions or doctors"
            autoComplete="off"
            spellCheck="false"
          />

          {/* Out-of-Word-Limit Error Indicator & Clear / Undo Button */}
          {(countWords(query) >= MAX_SEARCH_WORDS || query.length > 0) && (
            <div className={styles.inputEndAdornment}>
              {countWords(query) >= MAX_SEARCH_WORDS && (
                <span className={styles.inputWordLimitError} role="alert">
                  500 words limit reached
                </span>
              )}
              {query.length > 0 && (
                <button
                  type="button"
                  className={styles.inputClearBtn}
                  aria-label="Clear search input"
                  title="Clear search"
                  onClick={() => {
                    onQueryChange("");
                    inputRef.current?.focus();
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Inline ghost predictive sentence overlay */}
          {prediction && query.length > 0 && (
            <div
              className={styles.ghostTextOverlay}
              onClick={() => handleAcceptPrediction(prediction.fullText)}
              title="Click or press Tab to complete"
            >
              <span className={styles.ghostInvisibleTyped}>{query}</span>
              <span className={styles.ghostSuffix}>{prediction.suffix}</span>
              <span className={styles.tabBadge}>Tab ⇥</span>
            </div>
          )}
        </div>

        <button 
          type="button" 
          className={styles.standaloneIconBtn} 
          aria-label="Voice search"
        >
          <Mic size={18} />
        </button>

        <button
          type="button"
          className={styles.submitArrowBtn}
          aria-label="Submit search"
          onClick={() => {
            if (prediction && selectedSugIndex >= 0 && prediction.suggestions[selectedSugIndex]) {
              const target = prediction.suggestions[selectedSugIndex];
              saveSearchToHistory(target);
              onSubmit(target);
            } else if (query.trim()) {
              saveSearchToHistory(query.trim());
              onSubmit(query.trim());
            } else if (prediction && prediction.fullText) {
              saveSearchToHistory(prediction.fullText);
              onSubmit(prediction.fullText);
            } else {
              saveSearchToHistory("Cardiologist near me");
              onSubmit("Cardiologist near me");
            }
          }}
        >
          <ArrowRight size={16} strokeWidth={2.0} />
        </button>
      </div>

      {/* Red Horizon Divider Line */}
      <motion.div 
        className={styles.redDivider}
        initial={{ opacity: 0, scaleX: 0.8 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.32, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Quick Actions (Unboxed lightweight text + icon directly on the glass) */}
      <motion.div 
        className={styles.activePillsRow}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          type="button"
          className={`${styles.inlineActionBtn} ${activePill === "doctor" ? styles.inlineActionBtnActive : ""}`}
          onClick={() => onSelectActionPill("doctor")}
          aria-pressed={activePill === "doctor"}
          title={activePill === "doctor" ? "Click to undo selection" : "Find a doctor"}
        >
          <User size={14} className={styles.inlineActionIcon} />
          <span>Find a doctor</span>
          {activePill === "doctor" && (
            <span className={styles.inlineActionUndoWrap} title="Undo" aria-hidden="true">
              <X size={11} className={styles.inlineActionUndoIcon} />
            </span>
          )}
        </button>

        <button
          type="button"
          className={`${styles.inlineActionBtn} ${activePill === "symptoms" ? styles.inlineActionBtnActive : ""}`}
          onClick={() => onSelectActionPill("symptoms")}
          aria-pressed={activePill === "symptoms"}
          title={activePill === "symptoms" ? "Click to undo selection" : "Describe my symptoms"}
        >
          <Heart size={14} className={styles.inlineActionIcon} />
          <span>Describe my symptoms</span>
          {activePill === "symptoms" && (
            <span className={styles.inlineActionUndoWrap} title="Undo" aria-hidden="true">
              <X size={11} className={styles.inlineActionUndoIcon} />
            </span>
          )}
        </button>
      </motion.div>

      {/* ── STATE 2: EMPTY CANVAS (When user has not typed yet) ── */}
      {!prediction && query.trim().length === 0 && (
        <motion.div 
          className={styles.emptyCanvasPrompt}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Either Recent Searches or Popular Searches (not both stacked) */}
          {recentSearches.length > 0 ? (
            <div className={styles.recentHistorySection}>
              <div className={styles.recentHistoryHeader}>
                <span className={styles.recentHistoryLabel}>Recent searches</span>
                <button
                  type="button"
                  className={styles.recentHistoryClearBtn}
                  onClick={handleClearHistory}
                  title="Clear recent searches"
                >
                  Clear
                </button>
              </div>

              <div className={styles.historyFastTagsRow}>
                {recentSearches.slice(0, 4).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={styles.historyFastTag}
                    onClick={() => {
                      saveSearchToHistory(item);
                      onQueryChange(item);
                      onSubmit(item);
                    }}
                  >
                    <Clock size={12} className={styles.fastTagIcon} />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.mobileQuickTray}>
              <span className={styles.mobileQuickLabel}>Popular searches</span>
              <div className={styles.mobileQuickChips}>
                {MOBILE_POPULAR_SEARCHES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className={styles.mobileQuickChip}
                      onClick={() => {
                        saveSearchToHistory(item.query);
                        onQueryChange(item.query);
                        onSubmit(item.query);
                      }}
                    >
                      <Icon size={13} className={styles.mobileQuickChipIcon} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── LIVE PREDICTIVE SECTION (When user types any character) ── */}
      {prediction && (
        <div className={styles.suggestionsSection}>
          {prediction.status === "error" ? (
            <div className={styles.predictiveErrorTray}>
              <div className={styles.predictiveErrorHeader}>
                <span>Directory connection issue</span>
                <span className={styles.predictiveEmptyAction}>— Press Enter to retry</span>
              </div>
              <div className={styles.predictiveTrayChipsRow}>
                {["Cardiology", "Orthopaedics", "Neurology", "General Medicine"].map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    className={styles.predictiveTrayChip}
                    onClick={() => {
                      onQueryChange(spec);
                      onSubmit(spec);
                    }}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          ) : prediction.status === "empty" || prediction.suggestions.length === 0 ? (
            <div className={styles.predictiveEmptyTray}>
              <div className={styles.predictiveEmptyHeader}>
                <span>No suggestions for &ldquo;{query}&rdquo;</span>
                <span className={styles.predictiveEmptyAction}>— Press Enter to search</span>
              </div>
              <div className={styles.predictiveTrayChipsRow}>
                {["Cardiology", "Orthopaedics", "Neurology", "Pediatrics", "Oncology"].map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    className={styles.predictiveTrayChip}
                    onClick={() => {
                      onQueryChange(spec);
                      onSubmit(spec);
                    }}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className={styles.suggestionsHeaderRow}>
                <span className={styles.suggestionsHeader}>Suggested predictions</span>
              </div>

              <div className={styles.suggestionsList} role="listbox">
                {prediction.suggestions.slice(0, 4).map((sug, idx) => (
                  <button
                    key={sug}
                    type="button"
                    className={`${styles.suggestionItem} ${
                      selectedSugIndex === idx ? styles.suggestionItemActive : ""
                    }`}
                    onClick={() => {
                      saveSearchToHistory(sug);
                      onSubmit(sug);
                    }}
                    onMouseEnter={() => setSelectedSugIndex(idx)}
                    role="option"
                    aria-selected={selectedSugIndex === idx}
                  >
                    <ArrowRight size={14} className={styles.suggestionArrow} />
                    <span className={styles.suggestionText}>
                      {sug}
                    </span>
                    <span className={styles.pressEnterHint}>
                      <CornerDownLeft size={12} />
                    </span>
                  </button>
                ))}
              </div>

              {/* Pulse AI Status */}
              <div className={styles.pulseStatusRow}>
                <span className={styles.sparkleIcon}>✦</span>
                <span>Pulse understands what you&apos;re trying to say</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
