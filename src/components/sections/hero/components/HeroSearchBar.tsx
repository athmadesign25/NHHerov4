"use client";

import React, { SetStateAction, Dispatch } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import Lottie from "lottie-react";
import styles from "@/components/sections/hero/Hero.module.css";
import pulseAnimation from "../../../../../public/assets/pulse animation.json";
import searchAnimation from "../../../../../public/assets/AI Searching 2.json";
import { useHeroSearch } from "@/components/sections/hero/hooks/useHeroSearch";
import HeroSearchDropdown from "./HeroSearchDropdown";

const AI_SUGGESTIONS = [
  "Book Doctors",
  "Find Specialties",
  "Find Treatment"
];

interface HeroSearchBarProps {
  searchProps: ReturnType<typeof useHeroSearch>;
  searchRef: React.RefObject<HTMLFormElement>;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  hasOpened: boolean;
  setHasOpened: Dispatch<SetStateAction<boolean>>;
  isScrolledPastHero: boolean;
  isPulseActive: boolean;
  setIsPulseActive: Dispatch<SetStateAction<boolean>>;
  aiSuggestionIdx: number;
  isUserLoggedIn: boolean;
}

export default function HeroSearchBar({
  searchProps,
  searchRef,
  isOpen,
  setIsOpen,
  hasOpened,
  setHasOpened,
  isScrolledPastHero,
  isPulseActive,
  setIsPulseActive,
  aiSuggestionIdx,
  isUserLoggedIn
}: HeroSearchBarProps) {
  const { searchQuery, setSearchQuery, handleSearch } = searchProps;

  return (
    <motion.form
      ref={searchRef}
      onSubmit={handleSearch}
      className={`${styles.searchBarForm} ${isOpen ? styles.searchBarFormActive : ""}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ 
        opacity: 1, 
        y: isOpen ? -490 : 0 
      }}
      transition={isOpen 
        ? { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
        : { delay: 0.4, duration: 0.6 }
      }
    >
      {!isPulseActive && (
        <motion.div
          key="hero-search-container"
          className={`${styles.aiSearchContainer} ${isOpen ? styles.aiSearchContainerActive : ""}`}
          onClick={() => {
            if (!isOpen) {
              setIsOpen(true);
              setHasOpened(true);
              setTimeout(() => {
                document.getElementById("hero-search-input")?.focus();
              }, 50);
            }
          }}
          initial={false}
          animate={
            isScrolledPastHero
              ? { opacity: 0, scale: 0.85, filter: "blur(14px)", pointerEvents: "none" }
              : { opacity: 1, scale: 1, filter: "blur(0px)", pointerEvents: "auto" }
          }
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top Input & Dynamic Suggestive Text Row */}
          <div className={styles.chatTopInputRow}>
            <div className={styles.chatTextUnit}>
              <span className={styles.blinkingCursor}>|</span>
              {searchQuery ? (
                <span className={styles.typedText}>{searchQuery}</span>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={AI_SUGGESTIONS[aiSuggestionIdx]}
                    className={styles.aiSuggestionText}
                    initial={{ opacity: 0, filter: "blur(8px)", y: 4 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    exit={{ opacity: 0, filter: "blur(8px)", y: -4 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    {AI_SUGGESTIONS[aiSuggestionIdx]}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
            <input
              id="hero-search-input"
              type="text"
              value={searchQuery}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
                setHasOpened(true);
              }}
              onFocus={() => {
                setIsOpen(true);
                setHasOpened(true);
              }}
              className={styles.hiddenSearchInput}
            />
          </div>

          {/* Bottom 3 Quick Buttons (Only in resting state, aligned to bottom of card) */}
          {!isOpen && (
            <div className={styles.chatBottomButtonsRow}>
              <button
                type="button"
                className={styles.chatIconBtn}
                aria-label="More options"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(true);
                  setHasOpened(true);
                }}
              >
                <div className={styles.searchIconOuter}>
                  <Lottie animationData={searchAnimation} className={styles.lottieIcon} loop={true} />
                </div>
              </button>

              <button
                type="button"
                className={styles.chatActionBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  const event = new CustomEvent('openPulseAI');
                  window.dispatchEvent(event);
                }}
              >
                <div className={styles.pulseIconCircle}>
                  <Lottie animationData={pulseAnimation} loop={true} />
                </div>
                <span>Ask Pulse AI</span>
              </button>

              <button
                type="button"
                className={styles.chatIconBtn}
                aria-label="Voice search"
              >
                <div className={styles.micIconCircle}>
                  <img src="/icons/mic.svg" alt="Voice Search" className={styles.micIcon} />
                </div>
              </button>
            </div>
          )}
        </motion.div>
      )}

      <HeroSearchDropdown 
        searchProps={searchProps}
        isPulseActive={isPulseActive}
        setIsPulseActive={setIsPulseActive}
        hasOpened={hasOpened}
        isUserLoggedIn={isUserLoggedIn}
      />
    </motion.form>
  );
}
