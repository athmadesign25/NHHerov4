"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, ChevronRight, ChevronDown, Check } from "lucide-react";
import styles from "./StickyBreadcrumbBar.module.css";

export interface BreadcrumbSiblingPage {
  label: string;
  href: string;
  description?: string;
}

export const HEALTH_LIBRARY_SIBLING_PAGES: BreadcrumbSiblingPage[] = [
  {
    label: "Treatments & Procedures",
    href: "/treatments",
    description: "Surgical & clinical procedures",
  },
  {
    label: "Diseases & Conditions",
    href: "/diseases",
    description: "Medical conditions guide",
  },
  {
    label: "Symptoms Directory",
    href: "/symptoms",
    description: "Warning signs & evaluation",
  },
  {
    label: "Diagnostics & Lab Tests",
    href: "/diagnostics",
    description: "Scans, blood panels & NABL labs",
  },
  {
    label: "Health Articles & Guides",
    href: "/articles",
    description: "Doctor-reviewed medical insights",
  },
  {
    label: "Medical Specialities",
    href: "/specialities",
    description: "Explore clinical departments",
  },
  {
    label: "Find a Doctor",
    href: "/doctors",
    description: "Book appointments with specialists",
  },
];

interface StickyBreadcrumbBarProps {
  currentTitle: string;
  parentLabel?: string;
  activeFilterLabel?: string | null;
  siblingPages?: BreadcrumbSiblingPage[];
  onScrollToTop?: () => void;
}

/**
 * Sticky top breadcrumb navigation strip modeled after SpecialityDesign2's pinned breadcrumb bar.
 * Lets scrolled users orient themselves and jump cleanly between Health Library / related pages.
 */
export default function StickyBreadcrumbBar({
  currentTitle,
  parentLabel = "Health Library",
  activeFilterLabel = null,
  siblingPages = HEALTH_LIBRARY_SIBLING_PAGES,
  onScrollToTop,
}: StickyBreadcrumbBarProps) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMiddleExpanded, setIsMiddleExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDropdownOpen]);

  return (
    <div className={styles.breadcrumbBar}>
      <div className={styles.breadcrumbInner}>
        <nav className={styles.pinnedBreadcrumbRow} aria-label="Pinned breadcrumb navigation">
          {/* Home link */}
          <Link
            href="/"
            className={`${styles.breadcrumbLink} ${styles.breadcrumbHomeLink}`}
            title="Narayana Health Home"
            aria-label="Back to Narayana Health Home"
          >
            <Home size={14} className={styles.breadcrumbHomeIcon} aria-hidden="true" />
            <span className={styles.breadcrumbHomeText}>Home</span>
          </Link>

          <ChevronRight size={14} className={styles.breadcrumbChevron} aria-hidden="true" />
          <span className={styles.breadcrumbSlash} aria-hidden="true">/</span>

          {/* Collapsed mobile ellipsis trigger */}
          {!isMiddleExpanded && (
            <>
              <button
                type="button"
                className={styles.breadcrumbEllipsisBtn}
                onClick={() => setIsMiddleExpanded(true)}
                aria-expanded={false}
                aria-label="Expand breadcrumb trail"
                title="Show more"
              >
                ...
              </button>
              <ChevronRight
                size={14}
                className={`${styles.breadcrumbChevron} ${styles.breadcrumbEllipsisChevron}`}
                aria-hidden="true"
              />
              <span
                className={`${styles.breadcrumbSlash} ${styles.breadcrumbEllipsisSlash}`}
                aria-hidden="true"
              >
                /
              </span>
            </>
          )}

          {/* Middle parent category label (Desktop always visible; mobile when expanded) */}
          <span
            className={`${styles.breadcrumbMiddleGroup} ${
              isMiddleExpanded ? styles.breadcrumbMiddleGroupExpanded : ""
            }`}
          >
            <button
              type="button"
              className={styles.breadcrumbParentBtn}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={isDropdownOpen}
            >
              <span>{parentLabel}</span>
            </button>

            <ChevronRight size={14} className={styles.breadcrumbChevron} aria-hidden="true" />
            <span className={styles.breadcrumbSlash} aria-hidden="true">/</span>
          </span>

          {/* Interactive Current Page Switcher Dropdown (Matches SpecialityDesign2 dropdown pill) */}
          <div className={styles.dropdownWrapper} ref={dropdownRef}>
            <div className={styles.combinedTriggerRow}>
              <button
                type="button"
                className={styles.currentTitleBtn}
                onClick={() => {
                  if (onScrollToTop) onScrollToTop();
                  else window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                title={`Scroll to top of ${currentTitle}`}
              >
                <span>{currentTitle}</span>
              </button>

              <button
                type="button"
                className={`${styles.dropdownToggleBtn} ${isDropdownOpen ? styles.dropdownToggleBtnOpen : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen((prev) => !prev);
                }}
                aria-haspopup="menu"
                aria-expanded={isDropdownOpen}
                aria-label={`Switch page from ${currentTitle}`}
                title="Navigate between Health Library & Speciality pages"
              >
                <ChevronDown
                  size={14}
                  className={`${styles.chevronDown} ${isDropdownOpen ? styles.chevronDownOpen : ""}`}
                  aria-hidden="true"
                />
              </button>
            </div>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  className={styles.dropdownMenu}
                  role="menu"
                  aria-label="Navigate pages"
                  data-lenis-prevent="true"
                  onWheel={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownHeaderLabel}>Quick Page Switcher</span>
                  </div>
                  <div className={styles.dropdownList}>
                    {siblingPages.map((page) => {
                      const isActive =
                        pathname === page.href ||
                        (page.href !== "/" && pathname?.startsWith(page.href));
                      return (
                        <Link
                          key={page.href}
                          href={page.href}
                          role="menuitem"
                          className={`${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ""}`}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className={styles.dropdownItemContent}>
                            <span className={styles.dropdownItemTitle}>{page.label}</span>
                            {page.description && (
                              <span className={styles.dropdownItemDesc}>{page.description}</span>
                            )}
                          </div>
                          {isActive && <Check size={15} className={styles.dropdownCheck} aria-hidden="true" />}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {activeFilterLabel && (
            <span className={styles.activeFilterContext}>
              <ChevronRight size={13} className={styles.breadcrumbChevron} aria-hidden="true" />
              <span className={styles.breadcrumbSlash} aria-hidden="true">/</span>
              <span className={styles.activeFilterContextText}>{activeFilterLabel}</span>
            </span>
          )}
        </nav>
      </div>
    </div>
  );
}
