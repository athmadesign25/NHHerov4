"use client";

import React from "react";
import { CloudSun, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { TimeSlot, SlotPeriod } from "@/features/booking/types";
import styles from "./TimeSlotGrid.module.css";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedTime: string;
  onSelect: (time: string) => void;
}

interface PeriodConfig {
  period: SlotPeriod;
  label: string;
  icon: React.ReactNode;
}

const PERIOD_CONFIG: PeriodConfig[] = [
  { period: "morning", label: "Morning", icon: <CloudSun size={15} aria-hidden /> },
  { period: "afternoon", label: "Afternoon", icon: <Sun size={15} aria-hidden /> },
  { period: "evening", label: "Evening", icon: <Moon size={15} aria-hidden /> },
];

export default function TimeSlotGrid({ slots, selectedTime, onSelect }: TimeSlotGridProps) {
  const slotsByPeriod = PERIOD_CONFIG.map(({ period, label, icon }) => ({
    period,
    label,
    icon,
    slots: slots.filter((s) => s.period === period && s.available),
  }));

  const hasAnySlots = slots.some((s) => s.available);

  if (!hasAnySlots) {
    return (
      <div className={styles.emptyState} role="status" aria-live="polite">
        <span className={styles.emptyIcon}>⚠</span>
        <p className={styles.emptyText}>No slots available for this date.</p>
        <p className={styles.emptyHint}>Please try another date.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper} role="group" aria-label="Select appointment time">
      {slotsByPeriod.map(({ period, label, icon, slots: periodSlots }) => {
        if (periodSlots.length === 0) return null;
        return (
          <div key={period} className={styles.period}>
            <div className={styles.periodHeader}>
              <span className={styles.periodIcon}>{icon}</span>
              <span className={styles.periodLabel}>{label}</span>
              <span style={{ fontSize: "12px", color: "var(--color-text-muted, #94a3b8)", marginLeft: "auto", fontWeight: 500 }}>
                {periodSlots.length} {periodSlots.length === 1 ? "slot" : "slots"}
              </span>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className={styles.chipGrid}
            >
              <AnimatePresence mode="popLayout">
                {periodSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <motion.button
                      key={slot.time}
                      variants={item}
                      layout
                      type="button"
                      onClick={() => onSelect(slot.time)}
                      className={[
                        styles.chip,
                        isSelected ? styles.chipSelected : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-pressed={isSelected}
                      aria-label={slot.time}
                    >
                      {slot.time}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
