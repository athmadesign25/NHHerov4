"use client";

import React from "react";
import { X } from "lucide-react";
import styles from "./LibrarySubFilterTabs.module.css";

export interface SubFilterTabOption {
  id: string;
  label: string;
  shortLabel?: string;
  count?: number;
  icon?: React.ReactNode;
}

interface LibrarySubFilterTabsProps {
  tabs: SubFilterTabOption[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
  ariaLabel?: string;
  defaultTab?: string;
  allowDeselect?: boolean;
  eyebrow?: string;
}

export default function LibrarySubFilterTabs({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  ariaLabel = "Filter category tabs",
  defaultTab,
  allowDeselect = true,
  eyebrow,
}: LibrarySubFilterTabsProps) {
  const resolvedDefaultTab =
    defaultTab !== undefined
      ? defaultTab
      : tabs.find((t) => t.id === "all")?.id || tabs[0]?.id || "";

  const handleTabClick = (tabId: string) => {
    if (activeTab === tabId) {
      if (allowDeselect && tabId !== resolvedDefaultTab) {
        onTabChange(resolvedDefaultTab);
      }
    } else {
      onTabChange(tabId);
    }
  };

  return (
    <div className={`${styles.subFilterOuter} ${className}`}>
      {eyebrow && <span className={styles.eyebrowLabel}>{eyebrow}</span>}
      <div
        className={styles.subFilterContainer}
        role="group"
        aria-label={ariaLabel}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isDefault = tab.id === resolvedDefaultTab;
          const showClear = isActive && !isDefault && allowDeselect;

          return (
            <button
              key={tab.id}
              type="button"
              className={`${styles.chip} ${isActive ? styles.chipActive : ""}`}
              aria-pressed={isActive}
              title={
                showClear
                  ? `Remove ${tab.label} filter`
                  : `Filter by ${tab.label}`
              }
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
              <span className={styles.tabLabel}>
                {tab.shortLabel ? (
                  <>
                    <span className={styles.tabLabelFull}>{tab.label}</span>
                    <span className={styles.tabLabelShort}>{tab.shortLabel}</span>
                  </>
                ) : (
                  tab.label
                )}
              </span>
              {typeof tab.count === "number" && (
                <span className={styles.tabCount}>{tab.count}</span>
              )}
              {showClear && (
                <span className={styles.selectionClear} aria-hidden>
                  <X size={13} strokeWidth={2.2} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
