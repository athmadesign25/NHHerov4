"use client";

import React from "react";
import styles from "./AlphabeticalFilterRail.module.css";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface AlphabeticalFilterRailProps {
  availableLetters?: Set<string>;
  selectedLetter: string | null;
  onSelectLetter: (letter: string | null) => void;
  className?: string;
  resultCount?: number;
  eyebrow?: string;
}

export default function AlphabeticalFilterRail({
  availableLetters,
  selectedLetter,
  onSelectLetter,
  className = "",
  eyebrow,
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
      className={`${styles.letterBtn} ${styles.allBtn} ${
        selectedLetter === null ? styles.letterBtnActive : ""
      }`}
      onClick={() => onSelectLetter(null)}
      aria-pressed={selectedLetter === null}
      aria-label="Show all letters"
    >
      All
    </button>
  );

  return (
    <div className={`${styles.alphabetRailSection} ${className}`} aria-label="Alphabetical Filter">
      {eyebrow && (
        <div className={styles.eyebrowRow}>
          <span className={styles.eyebrowLabel}>{eyebrow}</span>
        </div>
      )}
      <div
        className={styles.alphabetRailContainer}
        role="toolbar"
        aria-label="A to Z alphabetical filter"
      >
        {renderAllBtn()}
        {ALPHABET.map(renderLetterBtn)}
      </div>
    </div>
  );
}
