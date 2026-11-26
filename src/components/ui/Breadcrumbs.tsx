"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import styles from "./Breadcrumbs.module.css";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  theme?: "light" | "dark";
  className?: string;
  hideOnMobile?: boolean;
}

export default function Breadcrumbs({
  items,
  theme = "dark",
  className = "",
  hideOnMobile = false,
}: BreadcrumbsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDark = theme === "dark";
  const inactiveColor = isDark ? "var(--dyn-muted, var(--v2-muted, rgba(var(--white-rgb), 0.7)))" : "var(--color-text-muted)";
  const activeColor = isDark ? "var(--dyn-heading, var(--v2-heading, var(--white)))" : "var(--color-text)";
  const arrowColor = isDark ? "var(--dyn-muted, var(--v2-muted, rgba(var(--white-rgb), 0.4)))" : "var(--color-border)";

  // On mobile, if there are more than 3 items and not expanded, collapse middle items into '...'
  const shouldCollapse = items.length > 3 && !isExpanded;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`${styles.nav} ${hideOnMobile ? styles.hideOnMobile : ""} ${className}`}
    >
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isSecond = index === 1;
          const isLast = index === items.length - 1;
          const isMiddle = !isFirst && !isSecond && !isLast;

          // If collapsed, hide intermediate items on mobile
          if (shouldCollapse && isMiddle) {
            // Render the ellipsis button right after the 2nd item (index === 2)
            if (index === 2) {
              return (
                <li key="ellipsis" className={styles.item}>
                  <button
                    type="button"
                    className={styles.ellipsisBtn}
                    style={{ color: inactiveColor }}
                    onClick={() => setIsExpanded(true)}
                    aria-label="Expand breadcrumbs"
                    title="Show full path"
                  >
                    ...
                  </button>
                  <span className={styles.separatorWrapper}>
                    <ChevronRight size={14} className={styles.chevron} style={{ color: arrowColor }} />
                    <span className={styles.slash} style={{ color: arrowColor }}>/</span>
                  </span>
                </li>
              );
            }
            return null;
          }

          return (
            <li key={index} className={styles.item}>
              {item.href && !isLast ? (
                <Link 
                  href={item.href} 
                  style={{ color: inactiveColor, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = activeColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = inactiveColor}
                >
                  {item.label}
                </Link>
              ) : (
                <span style={{ color: activeColor }}>
                  {item.label}
                </span>
              )}
              
              {!isLast && (
                <span className={styles.separatorWrapper}>
                  <ChevronRight size={14} className={styles.chevron} style={{ color: arrowColor }} />
                  <span className={styles.slash} style={{ color: arrowColor }}>/</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
