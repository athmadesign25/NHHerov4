"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter, notFound } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  Star,
  MapPin,
  Clock3,
  Languages,
  Calendar,
  Check,
  User,
} from "lucide-react";

// Components
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ConsultationToggle from "@/components/booking/ConsultationToggle/ConsultationToggle";
import HospitalSelector from "@/components/booking/HospitalSelector/HospitalSelector";
import DatePicker from "@/components/booking/DatePicker/DatePicker";
import TimeSlotGrid from "@/components/booking/TimeSlotGrid/TimeSlotGrid";
import PatientDetailsForm from "@/components/booking/PatientDetailsForm/PatientDetailsForm";

// State & types
import {
  useBookingState,
  generateDates,
  generateTimeSlots,
} from "@/features/booking/useBookingState";
import { getBookingDoctor } from "@/features/booking/doctors";
import { formatBookingDate } from "@/features/booking/format";
import { saveBooking } from "@/features/booking/bookingStore";
import type { BookingDoctorSummary, ConsultationType } from "@/features/booking/types";

// Auth
import LoginModal from "@/features/auth/LoginModal";

import styles from "./page.module.css";

// ─── MODE-AWARE COPY ──────────────────────────────────────────────────────────
// Fee label and trust points depend on how the visit happens.
const MODE_COPY: Record<ConsultationType, { feeLabel: string; trust: string[] }> = {
  hospital: {
    feeLabel: "Hospital Visit Fee",
    trust: [
      "Verified credentials",
      "Free cancellation up to 2 hrs before",
      "Pay at the hospital",
    ],
  },
  video: {
    feeLabel: "Video Consultation Fee",
    trust: [
      "Verified credentials",
      "Secure video link sent by SMS & email",
      "Free cancellation up to 2 hrs before",
      "Pay online before the call",
    ],
  },
};

// ─── INNER PAGE (uses useSearchParams so must be inside Suspense) ─────────────
function BookingPageInner({ slug, doctor }: { slug: string; doctor: BookingDoctorSummary }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const modeParam = searchParams.get("mode");
  const cityParam = searchParams.get("city");
  const hospitalParam = searchParams.get("hospital");
  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");
  const aiParam = searchParams.get("ai");

  const initialConsultationType: ConsultationType =
    modeParam === "video" ? "video" : "hospital";

  // Build hospital list from doctor's locations
  const hospitals = (
    doctor.locations ?? [{ name: doctor.hospital, city: doctor.city }]
  ).map((loc) => ({ value: loc.name, label: loc.name, city: loc.city }));

  // Pre-select hospital: match hospitalParam first, then cityParam, then first hospital
  const initialHospital = hospitalParam
    ? hospitals.find(
        (h) =>
          h.value.toLowerCase().includes(hospitalParam.toLowerCase()) ||
          hospitalParam.toLowerCase().includes(h.value.toLowerCase())
      )?.value ?? hospitals[0]?.value ?? ""
    : cityParam
    ? hospitals.find((h) =>
        h.city.toLowerCase().includes(cityParam.toLowerCase())
      )?.value ?? hospitals[0]?.value ?? ""
    : hospitals[0]?.value ?? "";

  const {
    state,
    setConsultationType,
    setSelectedHospital,
    setSelectedDate,
    setSelectedTime,
    setPatientField,
    openAuthModal,
    closeAuthModal,
    isStep1Valid,
    isStep2Valid,
  } = useBookingState({ initialConsultationType, initialHospital });

  // Populate defaults on mount
  useEffect(() => {
    if (!state.selectedHospital && initialHospital) {
      setSelectedHospital(initialHospital);
    }
    const dates = generateDates();
    if (!state.selectedDate) {
      if (dateParam === "today" && dates[0]) {
        setSelectedDate(dates[0].fullDate);
      } else if (dateParam === "tomorrow" && dates[1]) {
        setSelectedDate(dates[1].fullDate);
      } else if (dateParam && dates.some((d) => d.fullDate === dateParam)) {
        setSelectedDate(dateParam);
      } else if (dates[0]) {
        setSelectedDate(dates[0].fullDate);
      }
    }
    if (!state.selectedTime && timeParam) {
      const decodedTime = decodeURIComponent(timeParam);
      setSelectedTime(decodedTime);
    }
  }, []); // mount-only — intentional

  const dates = generateDates();
  const timeSlots = generateTimeSlots();

  const modeCopy = MODE_COPY[state.consultationType];

  // Booking is allowed once slot + patient details are complete.
  const canBook = isStep1Valid && isStep2Valid;
  const blockReason = canBook
    ? ""
    : !state.selectedDate
      ? "Select a date to continue"
      : !state.selectedTime
        ? "Select a time slot to continue"
        : "Enter patient name, age and gender to continue";

  const handleBookClick = () => {
    if (canBook) openAuthModal();
  };

  const handleLoginSuccess = () => {
    closeAuthModal();
    // Persist once; the confirmation page reads it back by reference, so the URL
    // carries no patient data and a refresh shows the same booking.
    const record = saveBooking({
      doctorSlug: slug,
      doctorName: doctor.name,
      speciality: doctor.speciality,
      consultationType: state.consultationType,
      hospital: state.consultationType === "hospital" ? state.selectedHospital : "",
      date: state.selectedDate,
      time: state.selectedTime,
      patientName: state.patient.name.trim(),
      relation: state.patient.relation,
      fee: doctor.fee,
    });
    router.push(
      `/doctors/${encodeURIComponent(slug)}/book/confirmation?ref=${encodeURIComponent(record.ref)}`
    );
  };

  return (
    <>
      <div className={styles.page}>
        <div className={styles.container}>

          {/* ─── BREADCRUMB + BACK ─────────────────────────── */}
          <div className={styles.navRow}>
            <Breadcrumbs
              theme="light"
              items={[
                { label: "Home", href: "/" },
                { label: "Doctors", href: "/search?q=Dr.&location=All" },
                { label: doctor.name, href: `/doctors/${slug}` },
                { label: "Book Appointment" },
              ]}
            />
            <Link href={`/doctors/${slug}`} className={styles.backLink}>
              <ArrowLeft size={16} aria-hidden />
              Back to Profile
            </Link>
          </div>

          {/* ─── MAIN 2-COLUMN GRID ───────────────────────── */}
          <div className={styles.grid}>

            {/* ── LEFT: Doctor Summary ── */}
            <motion.aside
              className={styles.doctorPanel}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Doctor Card */}
              <div className={styles.doctorCard}>
                <div className={styles.doctorImgWrap}>
                  <Image
                    src={doctor.img}
                    alt={doctor.name}
                    width={96}
                    height={96}
                    className={styles.doctorImg}
                  />
                </div>
                <div className={styles.doctorInfo}>
                  <h1 className={styles.doctorName}>{doctor.name}</h1>
                  <p className={styles.doctorSpec}>
                    {doctor.speciality}
                    {doctor.subSpeciality ? ` · ${doctor.subSpeciality}` : ""}
                  </p>
                  <div className={styles.doctorMeta}>
                    <span className={styles.metaItem}>
                      <Star size={13} className={styles.starIcon} aria-hidden />
                      {doctor.rating}{" "}
                      <span className={styles.metaMuted}>
                        ({doctor.reviews?.toLocaleString()} reviews)
                      </span>
                    </span>
                    <span className={styles.metaItem}>
                      <Clock3 size={13} aria-hidden />
                      {doctor.experienceYears} Experience
                    </span>
                    <span className={styles.metaItem}>
                      <MapPin size={13} aria-hidden />
                      {doctor.hospital}, {doctor.city}
                    </span>
                    {doctor.languages && doctor.languages.length > 0 && (
                      <span className={styles.metaItem}>
                        <Languages size={13} aria-hidden />
                        {doctor.languages.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Fee + Trust (mode-aware) */}
              <div className={styles.feeCard}>
                <div className={styles.feeRow}>
                  <span className={styles.feeLabel}>{modeCopy.feeLabel}</span>
                  <span className={styles.feeAmount}>{doctor.fee}</span>
                </div>
                <ul key={state.consultationType} className={styles.trustList}>
                  {modeCopy.trust.map((point) => (
                    <li key={point} className={styles.trustItem}>
                      <Check size={14} className={styles.trustCheck} aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.aside>

            {/* ── RIGHT: Booking Panel ── */}
            <motion.div
              className={styles.bookingPanel}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Pulse AI Banner */}
              {aiParam === "true" && (
                <div className={styles.aiBanner}>
                  <div className={styles.aiBannerIcon} aria-hidden>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
                  </div>
                  <div>
                    <div className={styles.aiBannerTitle}>Pulse AI Recommended</div>
                    <div className={styles.aiBannerBody}>
                      Based on your symptoms, we've pre-selected {doctor.name}. Choose a convenient time below.
                    </div>
                  </div>
                </div>
              )}

              {/* Consultation Type Toggle */}
              <div className={styles.section}>
                <ConsultationToggle
                  value={state.consultationType}
                  onChange={setConsultationType}
                />
              </div>

              {/* Hospital Selector (only for hospital visits) */}
              {state.consultationType === "hospital" && (
                <div className={styles.section}>
                  <HospitalSelector
                    hospitals={hospitals}
                    value={state.selectedHospital}
                    onChange={setSelectedHospital}
                  />
                </div>
              )}

              {/* Date Picker */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Calendar size={17} className={styles.sectionIcon} aria-hidden />
                  <span className={styles.sectionTitle}>Select date</span>
                </div>
                <DatePicker
                  dates={dates}
                  selectedDate={state.selectedDate}
                  onSelect={setSelectedDate}
                />
              </div>

              {/* Time Slots */}
              <div className={styles.section}>
                <TimeSlotGrid
                  slots={timeSlots}
                  selectedTime={state.selectedTime}
                  onSelect={setSelectedTime}
                />
              </div>

              {/* Patient Details */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <User size={17} className={styles.sectionIcon} aria-hidden />
                  <span className={styles.sectionTitle}>Patient details</span>
                </div>
                <PatientDetailsForm value={state.patient} onChange={setPatientField} />
              </div>

              {/* CTAs */}
              <div className={styles.ctaBlock}>
                <button
                  id="book-appointment-btn"
                  type="button"
                  className={[
                    styles.ctaPrimary,
                    !canBook ? styles.ctaDisabled : "",
                  ].join(" ")}
                  disabled={!canBook}
                  onClick={handleBookClick}
                  aria-label="Book appointment"
                >
                  Book Appointment
                </button>
                {blockReason && (
                  <p className={styles.ctaHint} role="status" aria-live="polite">
                    {blockReason}
                  </p>
                )}
                <a
                  href="tel:18001030"
                  id="doctor-call-btn"
                  className={styles.ctaOutline}
                  aria-label="Call for enquiry"
                >
                  <Phone size={15} aria-hidden />
                  Call for Enquiry
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── MWeb Sticky Footer ───────────────────────────── */}
      <div className={styles.stickyFooter}>
        {/* Selection preview chip */}
        {(state.selectedDate || state.selectedTime) && (
          <div className={styles.selectionChip} aria-live="polite">
            {state.selectedDate && (
              <span>{formatBookingDate(state.selectedDate, "short")}</span>
            )}
            {state.selectedDate && state.selectedTime && <span aria-hidden>·</span>}
            {state.selectedTime && <span>{state.selectedTime}</span>}
          </div>
        )}
        {blockReason && (
          <p className={styles.ctaHint} role="status" aria-live="polite">
            {blockReason}
          </p>
        )}
        <button
          type="button"
          className={[
            styles.ctaPrimary,
            styles.ctaFullWidth,
            !canBook ? styles.ctaDisabled : "",
          ].join(" ")}
          disabled={!canBook}
          onClick={handleBookClick}
        >
          Book Appointment
        </button>
        <a href="tel:18001030" className={styles.callLinkMobile}>
          <Phone size={14} aria-hidden />
          Call for Enquiry
        </a>
      </div>

      {/* Auth Modal */}
      <LoginModal
        isOpen={state.isAuthModalOpen}
        onClose={closeAuthModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

// ─── PAGE EXPORT (wraps inner in Suspense for useSearchParams) ────────────────
export default function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);

  // Unknown doctor → 404. Never fall back to a different doctor.
  const doctor = getBookingDoctor(slug);
  if (!doctor) notFound();

  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", paddingTop: "var(--nav-height)" }} />}>
      <BookingPageInner slug={slug} doctor={doctor} />
    </Suspense>
  );
}
