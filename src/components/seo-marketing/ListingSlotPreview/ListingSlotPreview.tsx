"use client";

import React from "react";
import { ChevronRight, Sun, Moon, CloudSun } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./ListingSlotPreview.module.css";
import { generateTimeSlots } from "@/features/booking/useBookingState";

interface ListingSlotPreviewProps {
  doctorId: string;
  doctorName: string;
}

export default function ListingSlotPreview({ doctorId, doctorName }: ListingSlotPreviewProps) {
  const router = useRouter();
  
  // In a real app, this would fetch slots based on doctorId and today's date.
  // Using the shared generator from the booking logic for consistency.
  const allSlots = generateTimeSlots();
  
  // Just take the first few available slots to show as a "quick preview"
  const availableSlots = allSlots.filter((s) => s.available).slice(0, 4);

  const getIcon = (period: string) => {
    switch (period) {
      case "morning": return <CloudSun size={12} />;
      case "afternoon": return <Sun size={12} />;
      case "evening": return <Moon size={12} />;
      default: return null;
    }
  };

  const handleSlotClick = (time: string) => {
    // Navigate directly to booking flow, passing the selected time via URL params
    // so the booking page can instantly pre-fill it.
    router.push(`/doctors/${doctorId}/book?time=${encodeURIComponent(time)}`);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>Available Today</span>
        <button 
          className={styles.viewAllBtn}
          onClick={() => router.push(`/doctors/${doctorId}/book`)}
        >
          View all <ChevronRight size={14} />
        </button>
      </div>
      
      <div className={styles.slotsRow}>
        {availableSlots.length > 0 ? (
          availableSlots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              className={styles.slotChip}
              onClick={() => handleSlotClick(slot.time)}
              title={`Book ${doctorName} at ${slot.time}`}
            >
              <span className={styles.periodIcon}>{getIcon(slot.period)}</span>
              {slot.time}
            </button>
          ))
        ) : (
          <span className={styles.noSlotsText}>No slots available today</span>
        )}
      </div>
    </div>
  );
}
