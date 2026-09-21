"use client";

import React from "react";
import { motion, MotionValue } from "framer-motion";
import { Paperclip, Mic, ArrowUp, User, Heart, Search } from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import LocationSelector from "./LocationSelector";

interface DefaultSearchPromptProps {
  onActivate: () => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  onSelectActionPill: (action: "doctor" | "symptoms") => void;
  onOpenPulse?: () => void;
  promptOpacity?: MotionValue<number>;
  compactLabelOpacity?: MotionValue<number>;
  squareIconOpacity?: MotionValue<number>;
  fabLabelOpacity?: MotionValue<number>;
  controlsOpacity?: MotionValue<number>;
  controlsHeight?: MotionValue<string>;
  controlsMarginBottom?: MotionValue<string>;
  controlsOverflow?: MotionValue<"hidden" | "visible">;
}

export default function DefaultSearchPrompt({
  onActivate,
  selectedLocation,
  onSelectLocation,
  onSelectActionPill,
  onOpenPulse,
  promptOpacity,
  compactLabelOpacity,
  squareIconOpacity,
  fabLabelOpacity,
  controlsOpacity,
  controlsHeight,
  controlsMarginBottom,
  controlsOverflow,
}: DefaultSearchPromptProps) {
  return (
    <div 
      className={styles.landingContainer} 
      style={{ height: "100%", justifyContent: "center", cursor: "pointer", position: "relative", overflow: "hidden" }}
      onClick={onActivate}
    >
      {/* Top row: Primary Prompt (aligned to same outer boundary) */}
      <motion.div
        className={styles.landingInputRow}
        style={{
          ...(controlsMarginBottom ? { marginBottom: controlsMarginBottom } : {}),
          position: "relative",
          alignItems: "center",
          opacity: promptOpacity,
        }}
        onClick={onActivate}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onActivate();
        }}
      >
        {/* Main prompt: 20-22px, font-weight: 450 */}
        <span className={styles.landingPlaceholder}>
          How can we help you today?
        </span>
      </motion.div>

      {/* ── Square Box Content (Phase 1 & 2) -> Morphs to 3rd FAB button (Phase 3) ── */}
      {squareIconOpacity && (
        <motion.div
          className={styles.squareBoxContent}
          style={{
            opacity: squareIconOpacity,
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div className={styles.floatingPulseIconWrap}>
            <div className={styles.pulseBars} aria-hidden>
              <span className={styles.pulseBar1} />
              <span className={styles.pulseBar2} />
              <span className={styles.pulseBar3} />
            </div>
          </div>
          {fabLabelOpacity && (
            <motion.span
              className={styles.floatingPulseSearchText}
              style={{
                opacity: fabLabelOpacity,
                marginTop: 4,
              }}
            >
              Pulse AI<br />Search
            </motion.span>
          )}
        </motion.div>
      )}

      {/* Continuous horizontal interaction row */}
      <motion.div 
        className={styles.landingBottomRow}
        style={controlsOpacity ? {
          opacity: controlsOpacity,
          height: controlsHeight,
          overflow: controlsOverflow || "visible",
        } : undefined}
      >
        <div className={styles.bottomControlsLeft}>
          {/* Attachment Icon Button - standalone, no permanent box */}
          <button
            type="button"
            className={styles.standaloneIconBtn}
            aria-label="Attach medical records or file"
            onClick={(e) => {
              e.stopPropagation();
              onActivate();
            }}
          >
            <Paperclip size={17} />
          </button>

          {/* Location Context Selector - the ONLY outlined contextual control */}
          <LocationSelector
            selectedLocation={selectedLocation}
            onSelectLocation={onSelectLocation}
          />

          {/* Quick Action: Find a doctor - lightweight icon + text, no box */}
          <button
            type="button"
            className={styles.inlineActionBtn}
            onClick={(e) => {
              e.stopPropagation();
              onSelectActionPill("doctor");
            }}
          >
            <User size={14} className={styles.inlineActionIcon} />
            <span>Find a doctor</span>
          </button>

          {/* Quick Action: Describe my symptoms - lightweight icon + text, no box */}
          <button
            type="button"
            className={styles.inlineActionBtn}
            onClick={(e) => {
              e.stopPropagation();
              onSelectActionPill("symptoms");
            }}
          >
            <Heart size={14} className={styles.inlineActionIcon} />
            <span>Describe my symptoms</span>
          </button>
        </div>

        {/* Right side controls: Microphone (standalone icon) + Primary Submit Arrow (the ONLY filled button) */}
        <div className={styles.bottomControlsRight}>
          <button
            type="button"
            className={styles.standaloneIconBtn}
            aria-label="Voice search"
            onClick={(e) => {
              e.stopPropagation();
              onActivate();
            }}
          >
            <Mic size={17} />
          </button>

          <button
            type="button"
            className={styles.submitArrowBtn}
            aria-label="Submit search"
            onClick={(e) => {
              e.stopPropagation();
              onActivate();
            }}
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
