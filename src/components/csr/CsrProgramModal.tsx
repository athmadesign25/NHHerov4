"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { CsrProgramItem } from "@/data/csrData";
import styles from "./CsrProgramModal.module.css";

interface CsrProgramModalProps {
  program: CsrProgramItem | null;
  onClose: () => void;
}

export default function CsrProgramModal({ program, onClose }: CsrProgramModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (program) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [program, onClose]);

  if (!program) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Banner with Image */}
        <div className={styles.modalImageBanner}>
          <Image
            src={program.image}
            alt={program.imageAlt}
            fill
            className={styles.modalBannerImg}
          />
          <div className={styles.modalImageScrim} />

          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>

          <div className={styles.modalHeaderContent}>
            <span className={styles.modalEyebrow}>{program.eyebrow}</span>
            <h3 className={styles.modalTitle}>{program.title}</h3>
          </div>
        </div>

        {/* Modal Narrative Body */}
        <div className={styles.modalBody}>
          <p className={styles.modalLead}>{program.modalContent.lead}</p>

          {program.modalContent.paragraphs.map((p, idx) => (
            <p key={idx} className={styles.modalParagraph}>{p}</p>
          ))}

          {/* Key Verified Metrics */}
          <div className={styles.metricsGrid}>
            {program.modalContent.metrics.map((m, idx) => (
              <div key={idx} className={styles.metricBox}>
                <span className={styles.metricVal}>{m.value}</span>
                <span className={styles.metricLbl}>{m.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.modalDoneBtn} onClick={onClose}>
              Close Overview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

