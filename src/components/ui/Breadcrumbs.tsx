import React from "react";
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
  const isDark = theme === "dark";
  const inactiveColor = isDark ? "rgba(var(--white-rgb), 0.7)" : "var(--color-text-muted)";
  const activeColor = isDark ? "#ffffff" : "var(--color-text)";
  const arrowColor = isDark ? "rgba(var(--white-rgb), 0.4)" : "var(--color-border)";

  return (
    <nav
      aria-label="Breadcrumb"
      className={`${styles.nav} ${hideOnMobile ? styles.hideOnMobile : ""} ${className}`}
    >
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

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
                <ChevronRight size={14} style={{ marginLeft: 8, color: arrowColor }} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
