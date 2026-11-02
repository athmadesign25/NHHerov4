"use client";

import { useId, useRef, useState, useLayoutEffect } from "react";
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Search, Stethoscope, Award, SlidersHorizontal } from "lucide-react";
import { keepFilterHeadingVisible, prepareFilterListToggle } from "./filterScrolling";
import styles from "./SpecialityFilters.module.css";

const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export interface SpecialityFiltersProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedClassification: string;
  onSelectClassification: (classification: string) => void;
  selectedLetter: string;
  onSelectLetter: (letter: string) => void;
  categories: string[];
  categoryCounts: Record<string, number>;
  classificationCounts: Record<string, number>;
  availableLetters: Set<string>;
}

export default function SpecialityFilters({
  selectedCategory,
  onSelectCategory,
  selectedClassification,
  onSelectClassification,
  selectedLetter,
  onSelectLetter,
  categories,
  categoryCounts,
  classificationCounts,
  availableLetters,
}: SpecialityFiltersProps) {
  const id = useId();
  const reducedMotion = Boolean(useReducedMotion());
  const transition = { duration: reducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] as const };

  const [openGroups, setOpenGroups] = useState<{
    category: boolean;
    classification: boolean;
    alphabet: boolean;
  }>({
    category: true,
    classification: true,
    alphabet: true,
  });

  const [categorySearch, setCategorySearch] = useState("");
  const [categoryExpanded, setCategoryExpanded] = useState(false);

  const finishListToggle = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    const finish = finishListToggle.current;
    finishListToggle.current = null;
    finish?.();
  }, [categoryExpanded]);

  // Filter categories by search
  const filteredCategories = categories.filter((c) =>
    c.toLowerCase().includes(categorySearch.toLowerCase().trim())
  );

  const visibleCategories =
    categorySearch.trim() || categoryExpanded
      ? filteredCategories
      : filteredCategories.slice(0, 6);

  const hiddenCount = filteredCategories.length - visibleCategories.length;

  return (
    <div className={styles.filters}>
      <LayoutGroup id={id}>
        {/* ── Group 1: Speciality Category ── */}
        <motion.section
          className={styles.group}
          data-filter-group
          data-expanded={openGroups.category}
          aria-labelledby={`${id}-category-trigger`}
          layout={reducedMotion ? false : "position"}
          transition={transition}
        >
          <div className={styles.groupHeader} data-filter-category-header>
            <h3 className={styles.groupHeading}>
              <motion.button
                type="button"
                id={`${id}-category-trigger`}
                className={styles.groupToggle}
                aria-expanded={openGroups.category}
                aria-controls={`${id}-category-panel`}
                transition={transition}
                onClick={(event) => {
                  if (openGroups.category) keepFilterHeadingVisible(event.currentTarget);
                  setOpenGroups((prev) => ({ ...prev, category: !prev.category }));
                }}
              >
                <Stethoscope size={17} className={styles.groupIcon} aria-hidden />
                <span className={styles.groupLabel}>Speciality Category</span>
                {selectedCategory !== "All" && (
                  <motion.span
                    className={styles.count}
                    initial={reducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={transition}
                  >
                    1
                  </motion.span>
                )}
                <ChevronDown
                  size={16}
                  className={`${styles.chevron} ${openGroups.category ? styles.chevronOpen : ""}`}
                  aria-hidden
                />
              </motion.button>
            </h3>
            <button
              type="button"
              className={styles.clearGroup}
              disabled={selectedCategory === "All"}
              aria-hidden={selectedCategory === "All"}
              aria-label="Clear category"
              title="Clear category"
              onClick={() => {
                onSelectCategory("All");
                if (selectedClassification === "Centres of Excellence Only") {
                  onSelectClassification("All");
                }
                document.getElementById(`${id}-category-trigger`)?.focus({ preventScroll: true });
              }}
            >
              Clear
            </button>
          </div>

          <div
            id={`${id}-category-panel`}
            className={styles.panel}
            aria-labelledby={`${id}-category-trigger`}
            aria-hidden={!openGroups.category}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {openGroups.category && (
                <motion.div
                  key="category-content"
                  initial={reducedMotion ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: reducedMotion ? 0 : -4,
                    transition: { duration: reducedMotion ? 0 : 0.12 },
                  }}
                  transition={transition}
                >
                  {categories.length > 5 && (
                    <label className={styles.search}>
                      <Search size={16} aria-hidden />
                      <input
                        type="search"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Search category"
                        aria-label="Search speciality category filters"
                      />
                    </label>
                  )}

                  <fieldset id={`${id}-categories-fieldset`} className={styles.options}>
                    <legend className={styles.srOnly}>Speciality Category</legend>
                    {visibleCategories.map((cat) => {
                      const isSelected = selectedCategory === cat;
                      const count = categoryCounts[cat] || 0;
                      return (
                        <motion.label
                          key={cat}
                          className={`${styles.option} ${isSelected ? styles.optionActive : ""}`}
                          tabIndex={-1}
                          layout={reducedMotion ? false : "position"}
                          initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={transition}
                        >
                          <span className={styles.checkControl}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              id={`filter-cat-${cat.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                              onChange={() => {
                                if (isSelected && cat !== "All") {
                                  onSelectCategory("All");
                                  onSelectClassification("All");
                                } else {
                                  onSelectCategory(cat);
                                  if (cat === "Centres of Excellence") {
                                    onSelectClassification("Centres of Excellence Only");
                                  } else {
                                    onSelectClassification("All");
                                  }
                                }
                              }}
                            />
                            <Check
                              size={14}
                              strokeWidth={3}
                              className={styles.checkIcon}
                              aria-hidden
                            />
                          </span>
                          <span className={styles.optionLabel}>{cat}</span>
                          <span className={styles.resultCount}>{count}</span>
                        </motion.label>
                      );
                    })}
                    {filteredCategories.length === 0 && (
                      <p className={styles.hint} role="status">
                        No matches found.
                      </p>
                    )}
                  </fieldset>

                  {!categorySearch.trim() && (hiddenCount > 0 || categoryExpanded) && (
                    <button
                      type="button"
                      className={styles.showMore}
                      aria-expanded={categoryExpanded}
                      aria-controls={`${id}-categories-fieldset`}
                      onClick={(event) => {
                        finishListToggle.current = prepareFilterListToggle(
                          event.currentTarget,
                          !categoryExpanded
                        );
                        setCategoryExpanded((prev) => !prev);
                      }}
                    >
                      {categoryExpanded ? "Show less" : `Show ${hiddenCount} more`}
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* ── Group 2: Classification ── */}
        <motion.section
          className={styles.group}
          data-filter-group
          data-expanded={openGroups.classification}
          aria-labelledby={`${id}-classification-trigger`}
          layout={reducedMotion ? false : "position"}
          transition={transition}
        >
          <div className={styles.groupHeader} data-filter-category-header>
            <h3 className={styles.groupHeading}>
              <motion.button
                type="button"
                id={`${id}-classification-trigger`}
                className={styles.groupToggle}
                aria-expanded={openGroups.classification}
                aria-controls={`${id}-classification-panel`}
                transition={transition}
                onClick={(event) => {
                  if (openGroups.classification) keepFilterHeadingVisible(event.currentTarget);
                  setOpenGroups((prev) => ({ ...prev, classification: !prev.classification }));
                }}
              >
                <Award size={17} className={styles.groupIcon} aria-hidden />
                <span className={styles.groupLabel}>Classification</span>
                {selectedClassification !== "All" && (
                  <motion.span
                    className={styles.count}
                    initial={reducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={transition}
                  >
                    1
                  </motion.span>
                )}
                <ChevronDown
                  size={16}
                  className={`${styles.chevron} ${openGroups.classification ? styles.chevronOpen : ""}`}
                  aria-hidden
                />
              </motion.button>
            </h3>
            <button
              type="button"
              className={styles.clearGroup}
              disabled={selectedClassification === "All"}
              aria-hidden={selectedClassification === "All"}
              aria-label="Clear classification"
              title="Clear classification"
              onClick={() => {
                onSelectClassification("All");
                if (selectedCategory === "Centres of Excellence") {
                  onSelectCategory("All");
                }
                document.getElementById(`${id}-classification-trigger`)?.focus({ preventScroll: true });
              }}
            >
              Clear
            </button>
          </div>

          <div
            id={`${id}-classification-panel`}
            className={styles.panel}
            aria-labelledby={`${id}-classification-trigger`}
            aria-hidden={!openGroups.classification}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {openGroups.classification && (
                <motion.div
                  key="classification-content"
                  initial={reducedMotion ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: reducedMotion ? 0 : -4,
                    transition: { duration: reducedMotion ? 0 : 0.12 },
                  }}
                  transition={transition}
                >
                  <fieldset className={styles.options}>
                    <legend className={styles.srOnly}>Classification</legend>
                    {(
                      [
                        "All",
                        "Centres of Excellence Only",
                        "24/7 Emergency Support",
                      ] as const
                    ).map((cls) => {
                      const isSelected = selectedClassification === cls;
                      const count = classificationCounts[cls] || 0;
                      return (
                        <motion.label
                          key={cls}
                          className={`${styles.option} ${isSelected ? styles.optionActive : ""}`}
                          tabIndex={-1}
                          layout={reducedMotion ? false : "position"}
                          initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={transition}
                        >
                          <span className={styles.checkControl}>
                            <input
                              type="radio"
                              name="classification"
                              checked={isSelected}
                              onChange={() => {
                                onSelectClassification(cls);
                                if (cls === "Centres of Excellence Only") {
                                  onSelectCategory("Centres of Excellence");
                                } else if (selectedCategory === "Centres of Excellence") {
                                  onSelectCategory("All");
                                }
                              }}
                            />
                            <Check
                              size={14}
                              strokeWidth={3}
                              className={styles.checkIcon}
                              aria-hidden
                            />
                          </span>
                          <span className={styles.optionLabel}>{cls}</span>
                          <span className={styles.resultCount}>{count}</span>
                        </motion.label>
                      );
                    })}
                  </fieldset>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* ── Group 3: A–Z Directory ── */}
        <motion.section
          className={styles.group}
          data-filter-group
          data-expanded={openGroups.alphabet}
          aria-labelledby={`${id}-alphabet-trigger`}
          layout={reducedMotion ? false : "position"}
          transition={transition}
        >
          <div className={styles.groupHeader} data-filter-category-header>
            <h3 className={styles.groupHeading}>
              <motion.button
                type="button"
                id={`${id}-alphabet-trigger`}
                className={styles.groupToggle}
                aria-expanded={openGroups.alphabet}
                aria-controls={`${id}-alphabet-panel`}
                transition={transition}
                onClick={(event) => {
                  if (openGroups.alphabet) keepFilterHeadingVisible(event.currentTarget);
                  setOpenGroups((prev) => ({ ...prev, alphabet: !prev.alphabet }));
                }}
              >
                <SlidersHorizontal size={17} className={styles.groupIcon} aria-hidden />
                <span className={styles.groupLabel}>A–Z Directory</span>
                {selectedLetter !== "All" && (
                  <motion.span
                    className={styles.count}
                    initial={reducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={transition}
                  >
                    1
                  </motion.span>
                )}
                <ChevronDown
                  size={16}
                  className={`${styles.chevron} ${openGroups.alphabet ? styles.chevronOpen : ""}`}
                  aria-hidden
                />
              </motion.button>
            </h3>
            <button
              type="button"
              className={styles.clearGroup}
              disabled={selectedLetter === "All"}
              aria-hidden={selectedLetter === "All"}
              aria-label="Clear A-Z filter"
              title="Clear A-Z filter"
              onClick={() => {
                onSelectLetter("All");
                document.getElementById(`${id}-alphabet-trigger`)?.focus({ preventScroll: true });
              }}
            >
              Clear
            </button>
          </div>

          <div
            id={`${id}-alphabet-panel`}
            className={styles.panel}
            aria-labelledby={`${id}-alphabet-trigger`}
            aria-hidden={!openGroups.alphabet}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {openGroups.alphabet && (
                <motion.div
                  key="alphabet-content"
                  initial={reducedMotion ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: reducedMotion ? 0 : -4,
                    transition: { duration: reducedMotion ? 0 : 0.12 },
                  }}
                  transition={transition}
                >
                  <div className={styles.alphabet} role="group" aria-label="A to Z alphabetical filter">
                    <button
                      type="button"
                      onClick={() => onSelectLetter("All")}
                      aria-pressed={selectedLetter === "All"}
                      id="filter-letter-all"
                    >
                      All
                    </button>
                    {ALPHABET.map((letter) => {
                      const hasMatches = availableLetters.has(letter);
                      const isPressed = selectedLetter === letter;
                      return (
                        <button
                          key={letter}
                          type="button"
                          disabled={!hasMatches}
                          aria-pressed={isPressed}
                          onClick={() => onSelectLetter(letter)}
                          id={`filter-letter-${letter}`}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      </LayoutGroup>
    </div>
  );
}
