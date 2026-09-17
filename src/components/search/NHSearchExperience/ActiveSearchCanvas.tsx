"use client";

import React, { useRef, useEffect, useState } from "react";
import { 
  Paperclip, Mic, ArrowRight, X, 
  User, Heart, Sparkles, CornerDownLeft, Command
} from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { PredictiveState, getPredictiveCompletion } from "./searchData";
import LocationSelector from "./LocationSelector";

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

  // Compute live predictive completion whenever user types
  const prediction: PredictiveState | null = query.trim()
    ? getPredictiveCompletion(query)
    : null;

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
        onSubmit(prediction.suggestions[selectedSugIndex]);
      } else if (query.trim()) {
        onSubmit(query.trim());
      } else if (prediction && prediction.fullText) {
        onSubmit(prediction.fullText);
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
      e.preventDefault();
      onClose();
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

          {/* Pulse AI Badge */}
          <div className={styles.pulseBadge}>
            <div className={styles.pulseBars} aria-hidden>
              <span className={styles.pulseBar1} />
              <span className={styles.pulseBar2} />
              <span className={styles.pulseBar3} />
            </div>
            <span className={styles.pulseText}>Pulse AI</span>
          </div>
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
              onQueryChange(e.target.value);
              setSelectedSugIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Start typing a symptom, condition, specialty or doctor..."
            aria-label="Search symptoms, conditions or doctors"
            autoComplete="off"
            spellCheck="false"
          />

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
            if (prediction && selectedSugIndex >= 0) {
              onSubmit(prediction.suggestions[selectedSugIndex]);
            } else if (query.trim()) {
              onSubmit(query.trim());
            } else if (prediction) {
              onSubmit(prediction.fullText);
            }
          }}
        >
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Red Horizon Divider Line */}
      <div className={styles.redDivider} />

      {/* Quick Actions (Unboxed lightweight text + icon directly on the glass) */}
      <div className={styles.activePillsRow}>
        <button
          type="button"
          className={`${styles.inlineActionBtn} ${activePill === "doctor" ? styles.inlineActionBtnActive : ""}`}
          onClick={() => onSelectActionPill("doctor")}
        >
          <User size={14} className={styles.inlineActionIcon} />
          <span>Find a doctor</span>
        </button>

        <button
          type="button"
          className={`${styles.inlineActionBtn} ${activePill === "symptoms" ? styles.inlineActionBtnActive : ""}`}
          onClick={() => onSelectActionPill("symptoms")}
        >
          <Heart size={14} className={styles.inlineActionIcon} />
          <span>Describe my symptoms</span>
        </button>
      </div>

      {/* ── STATE 2: EMPTY CANVAS (When user has not typed yet) ── */}
      {!prediction && query.trim().length === 0 && (
        <div className={styles.emptyCanvasPrompt}>
          <p className={styles.emptyPromptSub}>
            Start typing a symptom, condition, specialty, procedure or doctor name.
          </p>
        </div>
      )}

      {/* ── LIVE PREDICTIVE SECTION (When user types any character) ── */}
      {prediction && (
        <div className={styles.suggestionsSection}>
          <div className={styles.suggestionsHeaderRow}>
            <span className={styles.suggestionsHeader}>Suggested predictions</span>
          </div>

          {prediction.suggestions.length > 0 && (
            <div className={styles.suggestionsList} role="listbox">
              {prediction.suggestions.slice(0, 4).map((sug, idx) => (
                <button
                  key={sug}
                  type="button"
                  className={`${styles.suggestionItem} ${
                    selectedSugIndex === idx ? styles.suggestionItemActive : ""
                  }`}
                  onClick={() => onSubmit(sug)}
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
          )}

          {/* Pulse AI Status */}
          <div className={styles.pulseStatusRow}>
            <span className={styles.sparkleIcon}>✦</span>
            <span>Pulse understands what you&apos;re trying to say</span>
          </div>
        </div>
      )}
    </div>
  );
}
