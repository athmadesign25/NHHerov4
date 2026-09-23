"use client";

import React from "react";
import { motion, MotionValue } from "framer-motion";
import { Paperclip, Mic, ArrowUp, User, Heart, Search } from "lucide-react";
import Lottie from "lottie-react";
import pulseAnimation from "../../../../public/assets/pulse animation.json";
import styles from "./NHSearchExperience.module.css";
import LocationSelector from "./LocationSelector";
import TypewriterPrompt from "./TypewriterPrompt";

interface DefaultSearchPromptProps {
  onActivate: () => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  onSelectActionPill: (action: "doctor" | "symptoms") => void;
  onOpenPulse?: () => void;
  searchTheme?: "dark" | "white";
  promptOpacity?: MotionValue<number>;
  minimizedSearchOpacity?: MotionValue<number>;
  textColor?: MotionValue<string>;
  compactLabelOpacity?: MotionValue<number>;
  squareIconOpacity?: MotionValue<number>;
  fabLabelOpacity?: MotionValue<number>;
  controlsOpacity?: MotionValue<number>;
  controlsHeight?: MotionValue<string>;
  controlsMarginBottom?: MotionValue<string>;
  controlsOverflow?: MotionValue<"hidden" | "visible">;
  isMobile?: boolean;
}

export default function DefaultSearchPrompt({
  onActivate,
  selectedLocation,
  onSelectLocation,
  onSelectActionPill,
  onOpenPulse,
  searchTheme = "dark",
  promptOpacity,
  minimizedSearchOpacity,
  textColor,
  compactLabelOpacity,
  squareIconOpacity,
  fabLabelOpacity,
  controlsOpacity,
  controlsHeight,
  controlsMarginBottom,
  controlsOverflow,
  isMobile = false,
}: DefaultSearchPromptProps) {
  const isWhite = searchTheme === "white";

  return (
    <div 
      className={styles.landingContainer} 
      style={{ height: "100%", justifyContent: "center", cursor: "pointer", position: "relative", overflow: "hidden", zIndex: 5 }}
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
        {/* Main prompt: Balanced airy regular weight, matching active search placeholder style */}
        <TypewriterPrompt
          className={styles.landingPlaceholder}
          style={isWhite ? { color: "rgba(15, 23, 42, 0.45)", fontWeight: 400, letterSpacing: "-0.01em", textShadow: "none" } : { color: "rgba(255, 255, 255, 0.62)", fontWeight: 400 }}
        />
      </motion.div>

      {/* ── Minimized Search Content: Pulse Lottie animation with text below ── */}
      {minimizedSearchOpacity && (
        <div className="hideOnMobile" style={{ position: "absolute", inset: 0 }}>
          <motion.div
          className={styles.squareBoxContent}
          style={{
            opacity: minimizedSearchOpacity,
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            padding: "13px 6px",
            pointerEvents: "none",
            userSelect: "none",
            boxSizing: "border-box",
          }}
        >
          <div className={styles.floatingPulseIconWrap}>
            <div className={styles.pulseLottieContainer} aria-hidden="true">
              <Lottie animationData={pulseAnimation} loop={true} />
            </div>
          </div>
          <motion.span
            className={styles.floatingPulseSearchText}
            style={{
              color: textColor || "#FFFFFF",
              marginTop: 1,
            }}
          >
            Pulse AI<br />Search
          </motion.span>
        </motion.div>
        </div>
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
            style={isWhite ? { color: "rgba(15, 23, 42, 0.55)" } : undefined}
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
            style={isWhite ? { color: "rgba(15, 23, 42, 0.65)", fontWeight: 400 } : undefined}
            onClick={(e) => {
              e.stopPropagation();
              onSelectActionPill("doctor");
            }}
          >
            <User size={14} className={styles.inlineActionIcon} style={isWhite ? { color: "rgba(15, 23, 42, 0.50)" } : undefined} />
            <span>Find a doctor</span>
          </button>

          {/* Quick Action: Describe my symptoms - lightweight icon + text, no box */}
          {!isMobile && (
            <button
              type="button"
              className={styles.inlineActionBtn}
              style={isWhite ? { color: "rgba(15, 23, 42, 0.65)", fontWeight: 400 } : undefined}
              onClick={(e) => {
                e.stopPropagation();
                onSelectActionPill("symptoms");
              }}
            >
              <Heart size={14} className={styles.inlineActionIcon} style={isWhite ? { color: "rgba(15, 23, 42, 0.50)" } : undefined} />
              <span>Describe my symptoms</span>
            </button>
          )}
        </div>

        {/* Right side controls: Microphone (standalone icon) + Primary Submit Arrow (the ONLY filled button) */}
        {!isMobile && (
          <div className={styles.bottomControlsRight}>
            <button
              type="button"
              className={styles.standaloneIconBtn}
              style={isWhite ? { color: "rgba(15, 23, 42, 0.55)" } : undefined}
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
        )}
      </motion.div>
    </div>
  );
}
