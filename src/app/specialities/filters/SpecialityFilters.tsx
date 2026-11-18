"use client";

import React, { Fragment, useId, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "framer-motion";
import {
  Stethoscope,
  SlidersHorizontal,
  ChevronDown,
  Search,
  Check,
  Star,
} from "lucide-react";
import { keepFilterHeadingVisible, prepareFilterListToggle } from "./filterScrolling";
import styles from "./SpecialityFilters.module.css";

export interface SpecialityFiltersProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedClassification: string;
  onSelectClassification: (classification: string) => void;
  selectedLetter: string;
  onSelectLetter: (letter: string) => void;
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
  categories: string[];
  categoryCounts: Record<string, number>;
  classificationCounts: Record<string, number>;
  availableLetters: Set<string>;
}

type FilterGroupKey = "categories" | "alphabet";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface FilterGroupConfig {
  key: FilterGroupKey;
  label: string;
  plural: string;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  Icon: typeof Stethoscope;
}

const GROUPS: readonly FilterGroupConfig[] = [
  {
    key: "categories",
    label: "Speciality Category",
    plural: "categories",
    searchPlaceholder: "Search category",
    searchAriaLabel: "Search speciality category filters",
    Icon: Stethoscope,
  },
  {
    key: "alphabet",
    label: "A–Z Directory",
    plural: "letters",
    Icon: SlidersHorizontal,
  },
] as const;

const ALPHABET = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

export default function SpecialityFilters({
  selectedCategory,
  onSelectCategory,
  onSelectClassification,
  selectedLetter,
  onSelectLetter,
  categories,
  categoryCounts,
  availableLetters,
}: SpecialityFiltersProps) {
  const id = useId();
  const reducedMotion = Boolean(useReducedMotion());
  const transition = { duration: reducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] as const };

  // Both groups open initially, matching user mockup
  const [openGroups, setOpenGroups] = useState<Record<FilterGroupKey, boolean>>({
    categories: true,
    alphabet: true,
  });
  const [searches, setSearches] = useState<Partial<Record<FilterGroupKey, string>>>({});
  const [expanded, setExpanded] = useState<Partial<Record<FilterGroupKey, boolean>>>({});

  const finishListToggle = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    const finish = finishListToggle.current;
    finishListToggle.current = null;
    finish?.();
  }, [expanded]);

  const toggleGroup = (key: FilterGroupKey) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Options provider for the category group
  const getOptionsForGroup = (groupKey: FilterGroupKey): FilterOption[] => {
    if (groupKey === "categories") {
      return categories.map((cat) => ({
        value: cat,
        label: cat,
        count: categoryCounts[cat] ?? 0,
        icon:
          cat === "Centres of Excellence" ? (
            <Star
              size={13}
              fill="#f59e0b"
              color="#f59e0b"
              style={{ marginRight: 6, flexShrink: 0, display: "inline-block", verticalAlign: "middle" }}
              aria-hidden="true"
            />
          ) : undefined,
      }));
    }
    return [];
  };

  const getSelectedCount = (groupKey: FilterGroupKey): number => {
    if (groupKey === "categories") {
      return selectedCategory && selectedCategory !== "All" ? 1 : 0;
    }
    if (groupKey === "alphabet") {
      return selectedLetter && selectedLetter !== "All" ? 1 : 0;
    }
    return 0;
  };

  const toggleOption = (groupKey: FilterGroupKey, val: string) => {
    if (groupKey === "categories") {
      if (val === "All") {
        onSelectCategory("All");
        onSelectClassification("All");
        return;
      }

      if (selectedCategory === val) {
        onSelectCategory("All");
        onSelectClassification("All");
      } else {
        onSelectCategory(val);
        if (val === "Centres of Excellence") {
          onSelectClassification("Centres of Excellence Only");
        } else {
          onSelectClassification("All");
        }
      }
    }
  };

  const clearGroup = (groupKey: FilterGroupKey) => {
    if (groupKey === "categories") {
      onSelectCategory("All");
      onSelectClassification("All");
    }
    if (groupKey === "alphabet") {
      onSelectLetter("All");
    }
  };

  return (
    <div className={styles.filters}>
      <LayoutGroup id={id}>
        {GROUPS.map((group) => {
          const open = openGroups[group.key] ?? false;
          const selectedCount = getSelectedCount(group.key);
          const Icon = group.Icon;
          const triggerId = `${id}-${group.key}-trigger`;
          const panelId = `${id}-${group.key}-panel`;

          // Specific rendering for Alphabet group
          if (group.key === "alphabet") {
            return (
              <Fragment key={group.key}>
                <motion.section
                  className={styles.group}
                  data-filter-group="true"
                  data-expanded={open}
                  aria-labelledby={triggerId}
                  layout={reducedMotion ? false : "position"}
                  transition={transition}
                >
                  <div className={styles.groupHeader} data-filter-category-header="true">
                    <h3 className={styles.groupHeading}>
                      <motion.button
                        type="button"
                        id={triggerId}
                        className={styles.groupToggle}
                        aria-expanded={open}
                        aria-controls={panelId}
                        transition={transition}
                        onClick={(event) => {
                          if (open) keepFilterHeadingVisible(event.currentTarget);
                          toggleGroup(group.key);
                        }}
                      >
                        <Icon size={17} className={styles.groupIcon} aria-hidden />
                        <span className={styles.groupLabel}>{group.label}</span>
                        {selectedCount > 0 && (
                          <motion.span
                            className={styles.count}
                            initial={reducedMotion ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={transition}
                          >
                            {selectedCount}
                          </motion.span>
                        )}
                        <ChevronDown size={16} className={styles.chevron} aria-hidden />
                      </motion.button>
                    </h3>
                    <button
                      type="button"
                      className={styles.clearGroup}
                      disabled={selectedCount === 0}
                      aria-hidden={selectedCount === 0}
                      aria-label={`Clear ${group.label.toLowerCase()}`}
                      title={`Clear ${group.label.toLowerCase()}`}
                      onClick={() => {
                        clearGroup(group.key);
                        document.getElementById(triggerId)?.focus({ preventScroll: true });
                      }}
                    >
                      Clear
                    </button>
                  </div>

                  <div
                    id={panelId}
                    className={styles.panel}
                    aria-labelledby={triggerId}
                    aria-hidden={!open}
                    inert={!open}
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      {open && (
                        <motion.div
                          key="content"
                          initial={reducedMotion ? false : { opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{
                            opacity: 0,
                            y: reducedMotion ? 0 : -4,
                            transition: { duration: reducedMotion ? 0 : 0.12 },
                          }}
                          transition={transition}
                        >
                          <div
                            className={styles.alphabet}
                            role="group"
                            aria-label="A–Z Directory letter filter"
                          >
                            {ALPHABET.map((letter) => {
                              const isAll = letter === "All";
                              const isPressed = isAll
                                ? selectedLetter === "All" || !selectedLetter
                                : selectedLetter === letter;
                              const isAvailable = isAll || availableLetters.has(letter);

                              return (
                                <button
                                  key={letter}
                                  type="button"
                                  id={
                                    isAll
                                      ? "filter-letter-all"
                                      : `filter-letter-${letter}`
                                  }
                                  aria-pressed={isPressed}
                                  disabled={!isAvailable}
                                  onClick={() => {
                                    if (isAll) {
                                      onSelectLetter("All");
                                    } else {
                                      onSelectLetter(isPressed ? "All" : letter);
                                    }
                                  }}
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
              </Fragment>
            );
          }

          // Rendering for Categories group
          const options = getOptionsForGroup(group.key);
          const search = searches[group.key] ?? "";
          const matching = options.filter((option) =>
            option.label.toLowerCase().includes(search.trim().toLowerCase())
          );
          const isExpanded = expanded[group.key] ?? false;
          // Show initial 6 categories (matching prompt 3) or all matching search
          const visible =
            search.trim() || isExpanded
              ? matching
              : matching.filter((option, index) => index < 6 || selectedCategory === option.value);
          const hidden = matching.length - visible.length;

          return (
            <Fragment key={group.key}>
              <motion.section
                className={styles.group}
                data-filter-group="true"
                data-expanded={open}
                aria-labelledby={triggerId}
                layout={reducedMotion ? false : "position"}
                transition={transition}
              >
                <div className={styles.groupHeader} data-filter-category-header="true">
                  <h3 className={styles.groupHeading}>
                    <motion.button
                      type="button"
                      id={triggerId}
                      className={styles.groupToggle}
                      aria-expanded={open}
                      aria-controls={panelId}
                      transition={transition}
                      onClick={(event) => {
                        if (open) keepFilterHeadingVisible(event.currentTarget);
                        toggleGroup(group.key);
                      }}
                    >
                      <Icon size={17} className={styles.groupIcon} aria-hidden />
                      <span className={styles.groupLabel}>{group.label}</span>
                      {selectedCount > 0 && (
                        <motion.span
                          className={styles.count}
                          initial={reducedMotion ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={transition}
                        >
                          {selectedCount}
                        </motion.span>
                      )}
                      <ChevronDown size={16} className={styles.chevron} aria-hidden />
                    </motion.button>
                  </h3>
                  <button
                    type="button"
                    className={styles.clearGroup}
                    disabled={selectedCount === 0}
                    aria-hidden={selectedCount === 0}
                    aria-label={`Clear ${group.label.toLowerCase()}`}
                    title={`Clear ${group.label.toLowerCase()}`}
                    onClick={() => {
                      clearGroup(group.key);
                      document.getElementById(triggerId)?.focus({ preventScroll: true });
                    }}
                  >
                    Clear
                  </button>
                </div>

                <div
                  id={panelId}
                  className={styles.panel}
                  aria-labelledby={triggerId}
                  aria-hidden={!open}
                  inert={!open}
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    {open && (
                      <motion.div
                        key="content"
                        initial={reducedMotion ? false : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          y: reducedMotion ? 0 : -4,
                          transition: { duration: reducedMotion ? 0 : 0.12 },
                        }}
                        transition={transition}
                      >
                        {options.length > 5 && (
                          <label className={styles.search}>
                            <Search size={16} aria-hidden />
                            <input
                              type="search"
                              value={search}
                              onChange={(e) =>
                                setSearches({ ...searches, [group.key]: e.target.value })
                              }
                              placeholder={group.searchPlaceholder}
                              aria-label={group.searchAriaLabel}
                            />
                          </label>
                        )}

                        <fieldset id={`${id}-${group.key}`} className={styles.options}>
                          <legend className={styles.srOnly}>{group.label}</legend>
                          {options.length === 0 && (
                            <p className={styles.hint}>
                              {group.label} details haven’t been provided.
                            </p>
                          )}
                          {visible.map((option) => {
                            const isSelected =
                              option.value === "All"
                                ? selectedCategory === "All" || !selectedCategory
                                : selectedCategory === option.value;

                            return (
                              <motion.label
                                key={option.value}
                                className={styles.option}
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
                                    id={`filter-cat-${option.value.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                                    onChange={() => toggleOption(group.key, option.value)}
                                  />
                                  <Check
                                    size={14}
                                    strokeWidth={2}
                                    absoluteStrokeWidth
                                    className={styles.checkIcon}
                                    aria-hidden
                                  />
                                </span>
                                <span className={styles.optionLabel}>
                                  {option.icon}
                                  {option.label}
                                </span>
                                {option.count !== undefined && (
                                  <span
                                    className={styles.resultCount}
                                    aria-label={`${option.count} matching`}
                                  >
                                    {option.count}
                                  </span>
                                )}
                              </motion.label>
                            );
                          })}
                          {options.length > 0 && matching.length === 0 && (
                            <p className={styles.hint} role="status">
                              No matches. Try another search.
                            </p>
                          )}
                        </fieldset>

                        {!search.trim() && (hidden > 0 || isExpanded) && options.length > 6 && (
                          <button
                            type="button"
                            className={styles.showMore}
                            aria-expanded={Boolean(isExpanded)}
                            aria-controls={`${id}-${group.key}`}
                            aria-label={
                              isExpanded
                                ? `Show fewer ${group.plural}`
                                : `Show ${hidden} more ${group.plural}`
                            }
                            onClick={(event) => {
                              finishListToggle.current = prepareFilterListToggle(
                                event.currentTarget,
                                !isExpanded
                              );
                              setExpanded((prev) => ({
                                ...prev,
                                [group.key]: !prev[group.key],
                              }));
                            }}
                          >
                            {isExpanded ? "Show less" : `Show ${hidden} more`}
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.section>
            </Fragment>
          );
        })}
      </LayoutGroup>
    </div>
  );
}
