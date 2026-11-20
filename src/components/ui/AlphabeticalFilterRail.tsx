"use client";

import React from "react";
import { X } from "lucide-react";
import styles from "./AlphabeticalFilterRail.module.css";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const ROW_1_LETTERS = "ABCDEFGHIJKLM".split("");
const ROW_2_LETTERS = "NOPQRSTUVWXYZ".split("");

interface AlphabeticalFilterRailProps {
  availableLetters?: Set<string>;
  selectedLetter: string | null;
  onSelectLetter: (letter: string | null) => void;
  className?: string;
  resultCount?: number;
}

export default function AlphabeticalFilterRail({
  availableLetters,
  selectedLetter,
  onSelectLetter,
  className = "",
  resultCount,
}: AlphabeticalFilterRailProps) {
  const renderLetterBtn = (char: string) => {
    const isAvailable = availableLetters ? availableLetters.has(char) : true;
    const isSelected = selectedLetter === char;

    return (
      <button
        key={char}
        type="button"
        className={`${styles.letterBtn} ${
          isSelected ? styles.letterBtnActive : ""
        } ${!isAvailable ? styles.letterBtnDisabled : ""}`}
        disabled={!isAvailable}
        onClick={() => onSelectLetter(isSelected ? null : char)}
        aria-pressed={isSelected}
        aria-label={`Filter by letter ${char}`}
      >
        {char}
      </button>
    );
  };

  const renderAllBtn = () => (
    <button
      type="button"
      className={`${styles.allBtn} ${selectedLetter === null ? styles.allBtnActive : ""}`}
      onClick={() => onSelectLetter(null)}
      aria-pressed={selectedLetter === null}
      aria-label="Show all letters"
    >
      All
    </button>
  );

  return (
    <div className={`${styles.alphabetRailSection} ${className}`} aria-label="Alphabetical Filter">
      {/* Desktop View: Single Flat Horizontal Rail (Unchanged) */}
      <div className={`${styles.alphabetRailContainer} ${styles.desktopRail}`} role="toolbar" aria-label="A to Z alphabetical filter">
        {renderAllBtn()}
        {ALPHABET.map(renderLetterBtn)}
      </div>

      {/* Mobile Web View: Two-Row Stacked Rail */}
      <div className={`${styles.alphabetRailContainer} ${styles.mobileStackedRail}`} role="toolbar" aria-label="A to Z alphabetical filter (mobile 2-row)">
        <div className={styles.mobileRailRow}>
          {renderAllBtn()}
          {ROW_1_LETTERS.map(renderLetterBtn)}
        </div>
        <div className={styles.mobileRailRow}>
          {ROW_2_LETTERS.map(renderLetterBtn)}
        </div>
      </div>

      {selectedLetter && (
        <div className={styles.letterStatusRow}>
          <span className={styles.letterStatusText}>
            Showing items starting with letter <strong className={styles.letterHighlight}>&ldquo;{selectedLetter}&rdquo;</strong>
            {typeof resultCount === "number" && ` (${resultCount} found)`}
          </span>
          <button
            type="button"
            className={styles.clearLetterBtn}
            onClick={() => onSelectLetter(null)}
            aria-label="Clear letter filter"
          >
            <X size={12} />
            <span>Clear A&ndash;Z</span>
          </button>
        </div>
      )}
    </div>
  );
}
