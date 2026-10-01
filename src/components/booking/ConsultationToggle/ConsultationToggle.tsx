"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ConsultationType } from "@/features/booking/types";
import styles from "./ConsultationToggle.module.css";

interface ConsultationToggleProps {
  value: ConsultationType;
  onChange: (type: ConsultationType) => void;
}

const OPTIONS: { value: ConsultationType; label: string; icon: string; alt: string }[] = [
  {
    value: "hospital",
    label: "Hospital Visit",
    icon: "/Appointment/Hospital_visit.svg",
    alt: "Hospital building icon",
  },
  {
    value: "video",
    label: "Video Consult",
    icon: "/Appointment/Video_consultation.svg",
    alt: "Video camera icon",
  },
];

export default function ConsultationToggle({ value, onChange }: ConsultationToggleProps) {
  return (
    <div className={styles.track} role="group" aria-label="Consultation type">
      {OPTIONS.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            id={`consultation-toggle-${opt.value}`}
            className={[styles.option, isActive ? styles.optionActive : ""].join(" ")}
            onClick={() => onChange(opt.value)}
            aria-pressed={isActive}
            type="button"
          >
            {/* Animated background pill */}
            {isActive && (
              <motion.span
                layoutId="consultationActivePill"
                className={styles.activePill}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <span className={styles.optionContent}>
              <Image
                src={opt.icon}
                alt={opt.alt}
                width={16}
                height={16}
                className={[styles.optionIcon, isActive ? styles.optionIconActive : ""].join(" ")}
              />
              <span className={styles.optionLabel}>{opt.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
