"use client";

import React from "react";
import { CloudSun, Sun, Moon } from "lucide-react";
import type { TimeSlot, SlotPeriod } from "@/features/booking/types";
import styles from "./TimeSlotGrid.module.css";

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
    slots: slots.filter((s) => s.period === period),
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
            </div>

            <div className={styles.chipGrid}>
              {periodSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => slot.available && onSelect(slot.time)}
                    className={[
                      styles.chip,
                      isSelected ? styles.chipSelected : "",
                      !slot.available ? styles.chipUnavailable : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-pressed={isSelected}
                    aria-label={`${slot.time}${!slot.available ? " – unavailable" : ""}`}
                    disabled={!slot.available}
                  >
                    {slot.time}
                    {!slot.available && (
                      <span className={styles.slashLine} aria-hidden />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
