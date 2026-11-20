"use client";

import React from "react";
import styles from "./LibrarySubFilterTabs.module.css";

export interface SubFilterTabOption {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface LibrarySubFilterTabsProps {
  tabs: SubFilterTabOption[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
  ariaLabel?: string;
}

export default function LibrarySubFilterTabs({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  ariaLabel = "Filter category tabs",
}: LibrarySubFilterTabsProps) {
  return (
    <div
      className={`${styles.subFilterContainer} ${className}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span className={styles.tabCount}>{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
