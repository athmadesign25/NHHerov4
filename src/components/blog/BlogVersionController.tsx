"use client";

import React, { useEffect } from "react";
import styles from "./BlogVersionController.module.css";

export type BlogVersionId = 1 | 2;

interface BlogVersionControllerProps {
  activeVersion: BlogVersionId;
  onVersionChange: (version: BlogVersionId) => void;
}

export default function BlogVersionController({
  activeVersion,
  onVersionChange,
}: BlogVersionControllerProps) {
  // Global hotkeys 1 and 2
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "1") {
        onVersionChange(1);
      } else if (e.key === "2") {
        onVersionChange(2);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onVersionChange]);

  return (
    <div className={styles.pillContainer} aria-label="Version Switcher">
      <button
        type="button"
        onClick={() => onVersionChange(1)}
        className={`${styles.toggleBtn} ${activeVersion === 1 ? styles.btnActive : ""}`}
        title="V1: Grid Showcase (Press 1)"
        aria-pressed={activeVersion === 1}
      >
        V1
      </button>
      <span className={styles.divider}>/</span>
      <button
        type="button"
        onClick={() => onVersionChange(2)}
        className={`${styles.toggleBtn} ${activeVersion === 2 ? styles.btnActive : ""}`}
        title="V2: Immersive Carousel (Press 2)"
        aria-pressed={activeVersion === 2}
      >
        V2
      </button>
    </div>
  );
}
