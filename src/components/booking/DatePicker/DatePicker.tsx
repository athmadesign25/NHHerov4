"use client";

import React, { useRef, useCallback } from "react";
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import type { DateSlot } from "@/features/booking/types";
import styles from "./DatePicker.module.css";

interface DatePickerProps {
  dates: DateSlot[];
  selectedDate: string; // "DD"
  onSelect: (date: string) => void;
}

export default function DatePicker({ dates, selectedDate, onSelect }: DatePickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollDates = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -280 : 280,
      behavior: "smooth",
    });
  }, []);

  const resetToToday = useCallback(() => {
    onSelect(dates[0]?.date ?? "");
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [dates, onSelect]);

  const activeMonth =
    dates.find((d) => d.date === selectedDate)?.month ?? dates[0]?.month ?? "";

  return (
    <div className={styles.wrapper}>
      {/* Header row */}
      <div className={styles.header}>
        <span className={styles.fieldLabel}>
          <Calendar size={16} aria-hidden />
          Select date
        </span>

        <div className={styles.controls}>
          <button
            type="button"
            onClick={resetToToday}
            className={styles.todayBtn}
            aria-label="Jump to today"
          >
            <RotateCcw size={13} aria-hidden />
            Today
          </button>
          <div className={styles.divider} aria-hidden />
          <button
            type="button"
            onClick={() => scrollDates("left")}
            className={styles.arrowBtn}
            aria-label="Scroll dates left"
          >
            <ChevronLeft size={15} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollDates("right")}
            className={styles.arrowBtn}
            aria-label="Scroll dates right"
          >
            <ChevronRight size={15} aria-hidden />
          </button>
        </div>
      </div>

      {/* Date strip */}
      <div className={styles.strip}>
        {/* Month label — rotated on desktop, top-label on mobile */}
        <div className={styles.monthLabel} aria-label={`Month: ${activeMonth}`}>
          <span className={styles.monthText}>{activeMonth}</span>
        </div>

        <div
          ref={scrollRef}
          className={styles.scrollArea}
          role="group"
          aria-label="Available dates"
        >
          {dates.map((d, index) => {
            const isSelected = selectedDate === d.date;
            const isToday = index === 0;

            return (
              <button
                key={d.fullDate}
                type="button"
                onClick={(e) => {
                  onSelect(d.date);
                  e.currentTarget.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                  });
                }}
                className={[
                  styles.dateChip,
                  isSelected ? styles.dateChipSelected : "",
                  !d.hasSlots ? styles.dateChipUnavailable : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={isSelected}
                aria-label={`${d.day} ${d.date} ${d.month}${isToday ? " (Today)" : ""}${
                  !d.hasSlots ? " – no slots available" : ""
                }`}
                disabled={!d.hasSlots}
              >
                {isSelected && (
                  <motion.span
                    layoutId="activeDatePill"
                    className={styles.activeDatePill}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={[styles.dateNum, isSelected ? styles.dateNumActive : ""].join(" ")}>
                  {d.date}
                </span>
                <span className={[styles.dayLabel, isSelected ? styles.dayLabelActive : ""].join(" ")}>
                  {isToday ? "Today" : d.day}
                </span>
                {!d.hasSlots && <span className={styles.noSlotDot} aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
