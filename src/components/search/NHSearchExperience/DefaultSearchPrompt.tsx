"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, MotionValue } from "framer-motion";
import { Paperclip, Mic, ArrowUp, MapPin, ChevronDown, User, Stethoscope, Search } from "lucide-react";
import styles from "./NHSearchExperience.module.css";
import { NH_LOCATIONS } from "./searchData";

interface DefaultSearchPromptProps {
  onActivate: () => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  onSelectActionPill: (action: "doctor" | "symptoms") => void;
  onOpenPulse?: () => void;
  promptOpacity?: MotionValue<number>;
  compactLabelOpacity?: MotionValue<number>;
  controlsOpacity?: MotionValue<number>;
  controlsHeight?: MotionValue<string>;
  controlsMarginBottom?: MotionValue<string>;
}

export default function DefaultSearchPrompt({
  onActivate,
  selectedLocation,
  onSelectLocation,
  onSelectActionPill,
  onOpenPulse,
  promptOpacity,
  compactLabelOpacity,
  controlsOpacity,
  controlsHeight,
  controlsMarginBottom,
}: DefaultSearchPromptProps) {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  // Close location menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setIsLocationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.landingContainer} style={{ height: "100%", justifyContent: "center" }}>
      {/* Top row: Primary Prompt + Pulse AI */}
      <motion.div
        className={styles.landingInputRow}
        style={{
          ...(controlsMarginBottom ? { marginBottom: controlsMarginBottom } : {}),
          position: "relative",
          alignItems: "center",
        }}
        onClick={onActivate}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onActivate();
        }}
      >
        {/* Large prompt "How can we help you today?" */}
        <motion.span 
          className={styles.landingPlaceholder}
          style={promptOpacity ? { opacity: promptOpacity } : undefined}
        >
          How can we help you today?
        </motion.span>

        {/* Compact label [ ✦ Pulse AI · Search ⌕ ] cross-fades in during scroll morph */}
        {compactLabelOpacity && (
          <motion.div
            className={styles.compactSearchLabel}
            style={{
              opacity: compactLabelOpacity,
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          >
            <span className={styles.compactPulseSpark}>✦</span>
            <span className={styles.compactPulseTitle}>Pulse AI</span>
            <span className={styles.compactDivider}>·</span>
            <span className={styles.compactSearchText}>Search</span>
            <Search size={14} className={styles.compactSearchIcon} />
          </motion.div>
        )}

        {/* Hero Pulse AI badge */}
        <motion.div 
          className={styles.pulseBadge}
          style={promptOpacity ? { opacity: promptOpacity } : undefined}
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenPulse) {
              onOpenPulse();
            } else {
              onActivate();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className={styles.pulseBars} aria-hidden>
            <span className={styles.pulseBar1} />
            <span className={styles.pulseBar2} />
            <span className={styles.pulseBar3} />
          </div>
          <span className={styles.pulseText}>Pulse AI</span>
        </motion.div>
      </motion.div>

      {/* Spacious Lower Interaction Row (collapses and fades during scroll) */}
      <motion.div 
        className={styles.landingBottomRow}
        style={controlsOpacity ? {
          opacity: controlsOpacity,
          height: controlsHeight,
          overflow: "hidden",
        } : undefined}
      >
        <div className={styles.bottomControlsLeft}>
          <button
            type="button"
            className={styles.iconControlBtn}
            aria-label="Attach medical records or file"
            onClick={(e) => {
              e.stopPropagation();
              onActivate();
            }}
          >
            <Paperclip size={18} />
          </button>

          {/* Location Selector */}
          <div className={styles.locationPillWrapper} ref={locationRef} style={{ position: "relative" }}>
            <button
              type="button"
              className={styles.locationPill}
              onClick={(e) => {
                e.stopPropagation();
                setIsLocationOpen(!isLocationOpen);
              }}
              aria-expanded={isLocationOpen}
              aria-label={`Select city, current city is ${selectedLocation}`}
            >
              <MapPin size={14} className={styles.locationPinIcon} />
              <span>{selectedLocation}</span>
              <ChevronDown
                size={13}
                style={{
                  transform: isLocationOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
            </button>

            {isLocationOpen && (
              <div className={styles.locationMenu}>
                {NH_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    className={`${styles.locationMenuItem} ${
                      loc === selectedLocation ? styles.locationMenuItemSelected : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLocation(loc);
                      setIsLocationOpen(false);
                    }}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Starting Points */}
          <button
            type="button"
            className={styles.actionBtnDoctor}
            onClick={(e) => {
              e.stopPropagation();
              onSelectActionPill("doctor");
            }}
          >
            <User size={14} />
            <span>Find a doctor</span>
          </button>

          <button
            type="button"
            className={styles.actionBtnSymptoms}
            onClick={(e) => {
              e.stopPropagation();
              onSelectActionPill("symptoms");
            }}
          >
            <Stethoscope size={14} />
            <span>Describe my symptoms</span>
          </button>
        </div>

        {/* Right side controls: Microphone + Primary Submit Arrow */}
        <div className={styles.bottomControlsRight}>
          <button
            type="button"
            className={styles.iconControlBtn}
            aria-label="Voice search"
            onClick={(e) => {
              e.stopPropagation();
              onActivate();
            }}
          >
            <Mic size={18} />
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
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
