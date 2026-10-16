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
  Info,
} from "lucide-react";

// Components
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ConsultationToggle from "@/components/booking/ConsultationToggle/ConsultationToggle";
import MemberSelector, { type FamilyMember } from "@/components/booking/MemberSelector/MemberSelector";
import HospitalSelector from "@/components/booking/HospitalSelector/HospitalSelector";
import DatePicker from "@/components/booking/DatePicker/DatePicker";
import TimeSlotGrid from "@/components/booking/TimeSlotGrid/TimeSlotGrid";

// State & types
import {
  useBookingState,
  generateDates,
  generateTimeSlots,
} from "@/features/booking/useBookingState";
import { getBookingDoctor, getDesign3BookingDoctor } from "@/features/booking/doctors";
import { formatBookingDate } from "@/features/booking/format";
import { saveBooking } from "@/features/booking/bookingStore";
import type { BookingDoctorSummary, ConsultationType } from "@/features/booking/types";

// Auth
import LoginModal from "@/features/auth/LoginModal";
import { useAuthState } from "@/features/auth/hooks/useAuthState";

import styles from "./page.module.css";

// ─── MODE-AWARE COPY ──────────────────────────────────────────────────────────
// Fee label and trust points depend on how the visit happens.
const MODE_COPY: Record<ConsultationType, { feeLabel: string; trust: string[] }> = {
  hospital: {
    feeLabel: "Hospital Visit Fee",
    trust: [
      "Pay at the hospital",
    ],
  },
  video: {
    feeLabel: "Video Consultation Fee",
    trust: [
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
  } = useBookingState({ initialConsultationType, initialHospital });

  const { isUserLoggedIn } = useAuthState();

  const [selectedMember, setSelectedMember] = useState<FamilyMember>({
    id: 1,
    name: "Aditya",
    relation: "self",
    age: "32",
    gender: "male",
  });

  const handleSelectMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setPatientField("name", member.name);
    setPatientField("relation", member.relation);
    setPatientField("age", member.age || "");
    setPatientField("gender", member.gender || "");
  };

  // Populate defaults on mount
  useEffect(() => {
    // Set initial patient to default member
    setPatientField("name", selectedMember.name);
    setPatientField("relation", selectedMember.relation);
    setPatientField("age", selectedMember.age || "");
    setPatientField("gender", selectedMember.gender || "");

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

  // Booking is allowed once slot is selected (Toshib flow).
  const canBook = isStep1Valid;
  const blockReason = canBook
    ? ""
    : !state.selectedDate
      ? "Select a date to continue"
      : "Select a time slot to continue";

  const proceedToBooking = () => {
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
      patientName: selectedMember.name.trim() || state.patient?.name?.trim() || "Patient",
      relation: selectedMember.relation || state.patient?.relation || "self",
      fee: doctor.fee,
    });
    router.push(
      `/doctors/${encodeURIComponent(slug)}/book/confirmation?ref=${encodeURIComponent(record.ref)}`
    );
  };

  const handleBookClick = () => {
    if (!canBook) return;
    if (!isUserLoggedIn) {
      // User is not logged in: ask for login
      openAuthModal();
    } else {
      // User is already logged in: proceed directly to booking confirmation
      proceedToBooking();
    }
  };

  const handleLoginSuccess = () => {
    closeAuthModal();
    proceedToBooking();
  };

  return (
    <>
      <div className={styles.page}>
        <div className={styles.container}>

          {/* ─── BREADCRUMBS ─────────────────────────── */}
          <div className={styles.navRow}>
            <Breadcrumbs
              theme="light"
              items={[
                { label: "Home", href: "/" },
                { label: "Doctors", href: "/search/doctors" },
                { label: doctor.name, href: `/doctors/${slug}` },
                { label: "Book Appointment" },
              ]}
            />
          </div>

          {/* ─── MAIN 2-COLUMN GRID ───────────────────────── */}
          <div className={styles.grid}>

            {/* ── LEFT: Combined Doctor & Booking Summary Card ── */}
            <motion.aside
              className={styles.doctorPanel}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.unifiedCard}>
                {/* Doctor Header */}
                <div className={styles.docHeader}>
                  <div className={styles.doctorImgWrap}>
                    <Image
                      src={doctor.img}
                      alt={doctor.name}
                      width={80}
                      height={80}
                      className={styles.doctorImg}
                      priority
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
                        {state.consultationType === "hospital" && state.selectedHospital
                          ? state.selectedHospital
                          : `${doctor.hospital}, ${doctor.city}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.cardDivider} />

                {/* Mode-aware Fee Section */}
                <div className={styles.feeSection}>
                  <div className={styles.feeInfo}>
                    <div className={styles.feeLabel}>{modeCopy.feeLabel}</div>
                    <div className={styles.feeSubtext}>
                      <Check size={13} className={styles.trustCheck} aria-hidden />
                      <span>{modeCopy.trust[0] || "Pay at the hospital"}</span>
                    </div>
                  </div>
                  <div className={styles.feeAmount}>{doctor.fee}</div>
                </div>

                {/* Selected Slot Summary */}
                <div className={styles.slotSelectedSummary}>
                  <div className={styles.slotSummaryHeader}>
                    <div className={styles.slotDateText}>
                      <Calendar size={14} className={styles.slotCalendarIcon} aria-hidden />
                      <span>
                        {state.selectedDate ? formatBookingDate(state.selectedDate, "short") : "Select date"}
                      </span>
                    </div>
                    {state.selectedTime ? (
                      <span className={styles.slotTimeBadge}>{state.selectedTime}</span>
                    ) : (
                      <span className={styles.slotPendingBadge}>Select slot</span>
                    )}
                  </div>
                  <div className={styles.slotPatientText}>
                    Patient: <strong>{selectedMember.name}</strong> ({selectedMember.relation})
                  </div>
                </div>

                {/* Upfront Primary CTA on Left Card */}
                <div className={styles.leftCardCtaBlock}>
                  {blockReason && (
                    <div className={styles.ctaHint} role="status" aria-live="polite">
                      <Info size={13} className={styles.ctaHintIcon} aria-hidden />
                      <span>{blockReason}</span>
                    </div>
                  )}
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
              </div>
            </motion.aside>

            {/* ── RIGHT: Streamlined Booking Controls ── */}
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
              <div className={styles.bookingSection}>
                <ConsultationToggle
                  value={state.consultationType}
                  onChange={setConsultationType}
                />
              </div>

              {/* Member Selector */}
              <div className={styles.bookingSection}>
                <MemberSelector
                  selectedMemberId={selectedMember.id}
                  onSelectMember={handleSelectMember}
                />
              </div>

              {/* Hospital Selector */}
              {state.consultationType === "hospital" && (
                <div className={styles.bookingSection}>
                  <HospitalSelector
                    hospitals={hospitals}
                    value={state.selectedHospital}
                    onChange={setSelectedHospital}
                  />
                </div>
              )}

              {/* Single Date Picker (No duplicate outer header) */}
              <div className={`${styles.bookingSection} ${styles.sectionDivider}`}>
                <DatePicker
                  dates={dates}
                  selectedDate={state.selectedDate}
                  onSelect={setSelectedDate}
                />
              </div>

              {/* Time Slots (available only, no strikethrough) */}
              <div className={`${styles.bookingSection} ${styles.sectionDivider}`}>
                <TimeSlotGrid
                  slots={timeSlots}
                  selectedTime={state.selectedTime}
                  onSelect={setSelectedTime}
                />
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
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", paddingTop: "var(--nav-height)" }} />}>
      <BookingPreviewRoute slug={slug} />
    </Suspense>
  );
}

function BookingPreviewRoute({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const doctor = searchParams.get("design") === "d3" ? getDesign3BookingDoctor(slug) : getBookingDoctor(slug);
  if (!doctor) notFound();
  return <BookingPageInner slug={slug} doctor={doctor} />;
}
