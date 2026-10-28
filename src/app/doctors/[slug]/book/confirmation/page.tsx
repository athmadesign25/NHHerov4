"use client";

import React, { Suspense, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, CircleAlert, Calendar, Clock, MapPin, Video, Download, Home, Stethoscope } from "lucide-react";
import { formatBookingDate } from "@/features/booking/format";
import { readBookingRaw, parseBooking } from "@/features/booking/bookingStore";
import Design17BookingFlow from "@/features/booking/design17/Design17BookingFlow";
import Design18BookingFlow from "@/features/booking/design18/Design18BookingFlow";
import Design19BookingFlow from "@/features/booking/design19/Design19BookingFlow";
import { getDesign3BookingDoctor } from "@/features/booking/doctors";
import { getDesign17ProfileDoctor } from "@/features/search/design17Profile";
import { design17ListingReturnTo } from "@/features/search/design17Navigation";
import styles from "./page.module.css";

// sessionStorage never changes from outside this tab's flow, so there is
// nothing to subscribe to — useSyncExternalStore is used for its SSR-safe
// "server snapshot → client snapshot" handoff (no hydration mismatch).
const subscribeNoop = () => () => {};

function ConfirmationRoute({ slug }: { slug: string }) {
  const params = useSearchParams();
  const design = params.get("design");
  if (design === "d17" || design === "d17-lite" || design === "d18" || design === "d19") {
    const source = getDesign3BookingDoctor(slug);
    const listing = getDesign17ProfileDoctor(slug, params);
    if (!source || !listing) return <div className={styles.page}><h1>We couldn’t find this doctor</h1><Link href={design17ListingReturnTo(params.get("returnTo"), design)}>Back to doctors</Link></div>;
    const doctor = { ...source, name: listing.name, hospital: listing.hospital, city: listing.city, fee: listing.fee };
    if (design === "d18") return <Design18BookingFlow key={`${slug}-${design}-${params.get("ref")}`} doctor={doctor} confirmationRef={params.get("ref") ?? ""} />;
    if (design === "d19") return <Design19BookingFlow key={`${slug}-${design}-${params.get("ref")}`} doctor={doctor} confirmationRef={params.get("ref") ?? ""} />;
    return <Design17BookingFlow key={`${slug}-${design}-${params.get("ref")}`} doctor={doctor} design={design} confirmationRef={params.get("ref") ?? ""} />;
  }
  return <ConfirmationInner slug={slug} />;
}

function ConfirmationInner({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") ?? "";
  const designQuery = ["d17", "d17-lite", "d18", "d19"].includes(searchParams.get("design") ?? "") ? `?design=${searchParams.get("design")}` : "";

  // undefined = still hydrating, null = no such booking, string = raw record
  const raw = useSyncExternalStore<string | null | undefined>(
    subscribeNoop,
    () => readBookingRaw(ref),
    () => undefined
  );

  // Hydrating: render the shell only, so "not found" never flashes.
  if (raw === undefined) {
    return <div className={styles.page} aria-busy="true" />;
  }

  const booking = parseBooking(raw);

  // Unknown / expired / tampered ref, or a ref that belongs to another doctor.
  if (!booking || booking.doctorSlug !== slug) {
    return (
      <div className={styles.page}>
        <div className={styles.iconWrapper}>
          <CircleAlert className={styles.checkIcon} aria-hidden />
        </div>
        <div className={styles.content}>
          <h1 className={styles.heading}>We couldn&apos;t find this booking</h1>
          <p className={styles.subheading}>
            The booking reference is missing or has expired. If you just booked, please check your
            SMS for the confirmation, or start a new booking.
          </p>
          <div className={styles.actions}>
            <Link href={`/doctors/${encodeURIComponent(slug)}/book${designQuery}`} className={styles.calendarBtn}>
              Book again
            </Link>
            <Link href="/bookings" className={styles.bookingsLink}>
              View My Bookings
            </Link>
          </div>
          <Link href="/" className={styles.homeLink}>
            <Home size={14} aria-hidden />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isVideo = booking.consultationType === "video";

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
          Your booking for <strong>{booking.patientName}</strong> with{" "}
          <strong>{booking.doctorName}</strong> has been confirmed. You&apos;ll receive an SMS
          confirmation shortly.
        </p>

        {/* Booking reference */}
        <div className={styles.refBox}>
          <span className={styles.refLabel}>Booking Reference</span>
          <span className={styles.refCode}>{booking.ref}</span>
        </div>

        {/* Details card */}
        <div className={styles.detailCard}>
          <div className={styles.detailRow}>
            <Stethoscope size={16} className={styles.detailIcon} aria-hidden />
            <div>
              <span className={styles.detailLabel}>Doctor</span>
              <span className={styles.detailValue}>
                {booking.doctorName} · {booking.speciality}
              </span>
            </div>
          </div>

          <div className={styles.detailRow}>
            {isVideo ? (
              <Video size={16} className={styles.detailIcon} aria-hidden />
            ) : (
              <MapPin size={16} className={styles.detailIcon} aria-hidden />
            )}
            <div>
              <span className={styles.detailLabel}>
                {isVideo ? "Video Consultation" : "Hospital Visit"}
              </span>
              {booking.hospital && <span className={styles.detailValue}>{booking.hospital}</span>}
            </div>
          </div>

          <div className={styles.detailRow}>
            <Calendar size={16} className={styles.detailIcon} aria-hidden />
            <div>
              <span className={styles.detailLabel}>Date</span>
              <span className={styles.detailValue}>{formatBookingDate(booking.date)}</span>
            </div>
          </div>

          <div className={styles.detailRow}>
            <Clock size={16} className={styles.detailIcon} aria-hidden />
            <div>
              <span className={styles.detailLabel}>Time</span>
              <span className={styles.detailValue}>{booking.time}</span>
            </div>
          </div>
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

export default function ConfirmationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);

  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", paddingTop: "var(--nav-height)" }} />}>
      <ConfirmationRoute slug={slug} />
    </Suspense>
  );
}
