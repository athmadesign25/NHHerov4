"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, Clock, MapPin, Video, Download, Home } from "lucide-react";
import styles from "./page.module.css";

function ConfirmationInner({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? "";
  const time = searchParams.get("time") ?? "";
  const patient = searchParams.get("patient") ?? "Patient";
  const mode = searchParams.get("mode") ?? "hospital";
  const hospital = searchParams.get("hospital") ?? "";

  // Booking reference — initializer fn runs once, never on re-renders
  const [ref] = useState<string>(
    () => `NH-${Math.random().toString(36).toUpperCase().slice(-6)}`
  );

  return (
    <div className={styles.page}>
      {/* Animated checkmark */}
      <motion.div
        className={styles.iconWrapper}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.1 }}
      >
        <CheckCircle2 className={styles.checkIcon} aria-hidden />
      </motion.div>

      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      >
        <h1 className={styles.heading}>Appointment Confirmed!</h1>
        <p className={styles.subheading}>
          Your booking for <strong>{patient}</strong> has been confirmed. You&apos;ll receive an SMS
          confirmation shortly.
        </p>

        {/* Booking reference */}
        <div className={styles.refBox}>
          <span className={styles.refLabel}>Booking Reference</span>
          <span className={styles.refCode}>{ref}</span>
        </div>

        {/* Details card */}
        <div className={styles.detailCard}>
          <div className={styles.detailRow}>
            {mode === "video" ? (
              <Video size={16} className={styles.detailIcon} aria-hidden />
            ) : (
              <MapPin size={16} className={styles.detailIcon} aria-hidden />
            )}
            <div>
              <span className={styles.detailLabel}>
                {mode === "video" ? "Video Consultation" : "Hospital Visit"}
              </span>
              {hospital && <span className={styles.detailValue}>{hospital}</span>}
            </div>
          </div>

          {date && (
            <div className={styles.detailRow}>
              <Calendar size={16} className={styles.detailIcon} aria-hidden />
              <div>
                <span className={styles.detailLabel}>Date</span>
                <span className={styles.detailValue}>{date}</span>
              </div>
            </div>
          )}

          {time && (
            <div className={styles.detailRow}>
              <Clock size={16} className={styles.detailIcon} aria-hidden />
              <div>
                <span className={styles.detailLabel}>Time</span>
                <span className={styles.detailValue}>{time}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className={styles.actions}>
          <button
            type="button"
            id="add-to-calendar-btn"
            className={styles.calendarBtn}
            onClick={() => alert("iCal / Google Calendar integration coming soon.")}
          >
            <Download size={16} aria-hidden />
            Add to Calendar
          </button>

          <Link href="/bookings" id="my-bookings-btn" className={styles.bookingsLink}>
            View My Bookings
          </Link>
        </div>

        <Link href="/" id="go-home-btn" className={styles.homeLink}>
          <Home size={14} aria-hidden />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}

export default function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", paddingTop: "var(--nav-height)" }} />}>
      <ConfirmationInner id={id} />
    </Suspense>
  );
}
