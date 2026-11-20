"use client";

import React from "react";
import { X } from "lucide-react";
import styles from "./AlphabeticalFilterRail.module.css";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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
  return (
    <div className={`${styles.alphabetRailSection} ${className}`} aria-label="Alphabetical Filter">
      <div className={styles.alphabetRailContainer} role="toolbar" aria-label="A to Z alphabetical filter">
        {/* ALL Button */}
        <button
          type="button"
          className={`${styles.allBtn} ${selectedLetter === null ? styles.allBtnActive : ""}`}
          onClick={() => onSelectLetter(null)}
          aria-pressed={selectedLetter === null}
          aria-label="Show all letters"
        >
          All
        </button>

        {/* Letters A to Z */}
        {ALPHABET.map((char) => {
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
        })}
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
