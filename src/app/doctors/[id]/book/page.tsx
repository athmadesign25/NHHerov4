"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Phone, ChevronRight } from "lucide-react";

// Layout
import BookingShell from "@/components/booking/BookingShell/BookingShell";

// Components
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import StepIndicator from "@/components/booking/StepIndicator/StepIndicator";
import DoctorSummaryCard from "@/components/booking/DoctorSummaryCard/DoctorSummaryCard";
import ConsultationToggle from "@/components/booking/ConsultationToggle/ConsultationToggle";
import HospitalSelector from "@/components/booking/HospitalSelector/HospitalSelector";
import DatePicker from "@/components/booking/DatePicker/DatePicker";
import TimeSlotGrid from "@/components/booking/TimeSlotGrid/TimeSlotGrid";
import PatientDetailsForm from "@/components/booking/PatientDetailsForm/PatientDetailsForm";
import BookingSummary from "@/components/booking/BookingSummary/BookingSummary";

// State & types
import {
  useBookingState,
  generateDates,
  generateTimeSlots,
} from "@/features/booking/useBookingState";
import type { BookingDoctorSummary, ConsultationType, BookingStep } from "@/features/booking/types";

// Auth
import LoginModal from "@/features/auth/LoginModal";

import styles from "./page.module.css";

// ─── MOCK DOCTOR DATA ─────────────────────────────────────────────────────────
// In production this would be fetched from an API based on `id`
const DOCTORS: Record<string, BookingDoctorSummary> = {
  "dr-1": {
    id: "dr-1",
    name: "Dr. Rajiv Menon",
    speciality: "Cardiology",
    subSpeciality: "Interventional Cardiology",
    hospital: "NH Bangalore — Mazumdar Shaw",
    city: "Bengaluru",
    locations: [
      { name: "NH Bangalore — Mazumdar Shaw", city: "Bengaluru" },
      { name: "Narayana Health City", city: "Bengaluru" },
    ],
    experienceYears: "22 Years",
    rating: 4.9,
    reviews: 1240,
    img: "/assets/doctor_1.png",
    fee: "₹1,500",
    languages: ["English", "Hindi", "Kannada", "Tamil"],
  },
  "dr-2": {
    id: "dr-2",
    name: "Dr. Priya Sharma",
    speciality: "Neurology",
    subSpeciality: "Neurointerventional",
    hospital: "NH Kolkata",
    city: "Kolkata",
    locations: [{ name: "NH Kolkata", city: "Kolkata" }],
    experienceYears: "15 Years",
    rating: 4.8,
    reviews: 890,
    img: "/assets/doctor_2.png",
    fee: "₹1,200",
    languages: ["English", "Hindi", "Bengali"],
  },
  "dr-3": {
    id: "dr-3",
    name: "Dr. Arun Krishnan",
    speciality: "Oncology",
    subSpeciality: "Surgical Oncology",
    hospital: "NH Bangalore — Mazumdar Shaw",
    city: "Bengaluru",
    locations: [{ name: "NH Bangalore — Mazumdar Shaw", city: "Bengaluru" }],
    experienceYears: "28 Years",
    rating: 4.9,
    reviews: 2100,
    img: "/assets/doctor_3.png",
    fee: "₹2,000",
    languages: ["English", "Kannada", "Tamil", "Hindi"],
  },
};

// ─── STEP ANIMATION VARIANTS ──────────────────────────────────────────────────
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  }),
};

// ─── INNER PAGE (uses useSearchParams so must be inside Suspense) ─────────────
function BookingPageInner({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const modeParam = searchParams.get("mode");
  const cityParam = searchParams.get("city");
  const aiParam = searchParams.get("ai");

  const initialConsultationType: ConsultationType =
    modeParam === "video" ? "video" : "hospital";

  const doctor = DOCTORS[id] ?? DOCTORS["dr-1"];

  // Build hospital list from doctor's locations
  const hospitals = (doctor.locations ?? [{ name: doctor.hospital, city: doctor.city }]).map(
    (loc) => ({ value: loc.name, label: loc.name, city: loc.city })
  );

  // Pre-select hospital matching city param if present
  const initialHospital = cityParam
    ? hospitals.find((h) =>
        h.city.toLowerCase().includes(cityParam.toLowerCase())
      )?.value ?? hospitals[0]?.value ?? ""
    : hospitals[0]?.value ?? "";

  const {
    state,
    goToStep,
    nextStep,
    prevStep,
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

  // Direction tracking for slide animation
  const [stepDirection, setStepDirection] = useState(1);
  const prevStepRef = React.useRef<BookingStep>(1);

  const navigateStep = (targetStep: BookingStep) => {
    setStepDirection(targetStep > prevStepRef.current ? 1 : -1);
    prevStepRef.current = targetStep;
    goToStep(targetStep);
  };

  const handleNext = () => {
    setStepDirection(1);
    prevStepRef.current = (state.step + 1) as BookingStep;
    nextStep();
  };

  const handlePrev = () => {
    setStepDirection(-1);
    prevStepRef.current = (state.step - 1) as BookingStep;
    prevStep();
  };

  // Populate default hospital once
  useEffect(() => {
    if (!state.selectedHospital && initialHospital) {
      setSelectedHospital(initialHospital);
    }
    // Populate first date and first available time by default
    const dates = generateDates();
    if (!state.selectedDate && dates[0]) {
      setSelectedDate(dates[0].date);
    }
  }, []); // mount-only — intentional



  const dates = generateDates();
  const timeSlots = generateTimeSlots();
  const completedSteps: BookingStep[] = state.step > 1 ? [1] : [];
  if (state.step > 2) completedSteps.push(2);

  // ─── PANEL CONTENT PER STEP ───────────────────────────────────────────────

  const panelContent = (
    <AnimatePresence custom={stepDirection} mode="wait">
      {state.step === 1 && (
        <motion.div
          key="step1"
          custom={stepDirection}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className={styles.stepContent}
        >
          <h1 className={styles.stepTitle}>Select Appointment</h1>
          <p className={styles.stepSubtitle}>
            Choose your consultation type, date, and preferred time slot.
          </p>

          {aiParam === "true" && (
            <div style={{ background: "linear-gradient(to right, #EEF2FF, #E0E7FF)", borderLeft: "4px solid var(--color-primary)", padding: "12px 16px", borderRadius: "0 8px 8px 0", marginBottom: 24, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ background: "#C7D2FE", color: "var(--color-primary)", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-primary-dark)", marginBottom: 4 }}>Pulse AI Recommended</div>
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>Based on your symptoms and conversation, we have pre-filled this booking for {doctor.name}. Please select a convenient time below.</div>
              </div>
            </div>
          )}

          <div className={styles.card}>
            <ConsultationToggle
              value={state.consultationType}
              onChange={setConsultationType}
            />

            {state.consultationType === "hospital" && (
              <div className={styles.sectionGroup}>
                <HospitalSelector
                  hospitals={hospitals}
                  value={state.selectedHospital}
                  onChange={setSelectedHospital}
                />
              </div>
            )}

            <div className={styles.sectionGroup}>
              <DatePicker
                dates={dates}
                selectedDate={state.selectedDate}
                onSelect={setSelectedDate}
              />
            </div>

            <div className={styles.sectionGroup}>
              <div className={styles.slotLabel}>
                <span className={styles.slotLabelText}>Select time</span>
              </div>
              <TimeSlotGrid
                slots={timeSlots}
                selectedTime={state.selectedTime}
                onSelect={setSelectedTime}
              />
            </div>
          </div>

          {/* Desktop CTA */}
          <div className={styles.desktopCta}>
            <button
              id="step1-continue-btn"
              type="button"
              className={[
                styles.ctaPrimary,
                !isStep1Valid ? styles.ctaDisabled : "",
              ].join(" ")}
              disabled={!isStep1Valid}
              onClick={handleNext}
              aria-label="Continue to patient details"
            >
              Continue
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>
        </motion.div>
      )}

      {state.step === 2 && (
        <motion.div
          key="step2"
          custom={stepDirection}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className={styles.stepContent}
        >
          <h2 className={styles.stepTitle}>Patient Details</h2>
          <p className={styles.stepSubtitle}>
            Tell us a bit about the patient so the doctor is prepared.
          </p>

          <div className={styles.card}>
            <PatientDetailsForm
              value={state.patient}
              onChange={setPatientField}
            />
          </div>

          {/* Desktop CTA */}
          <div className={styles.desktopCta}>
            <button
              type="button"
              className={styles.ctaSecondary}
              onClick={handlePrev}
            >
              Back
            </button>
            <button
              id="step2-continue-btn"
              type="button"
              className={[
                styles.ctaPrimary,
                !isStep2Valid ? styles.ctaDisabled : "",
              ].join(" ")}
              disabled={!isStep2Valid}
              onClick={handleNext}
              aria-label="Continue to review booking"
            >
              Review Booking
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>
        </motion.div>
      )}

      {state.step === 3 && (
        <motion.div
          key="step3"
          custom={stepDirection}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className={styles.stepContent}
        >
          <h2 className={styles.stepTitle}>Review &amp; Confirm</h2>
          <p className={styles.stepSubtitle}>
            Please review your booking details before confirming.
          </p>

          <div className={styles.card}>
            <BookingSummary
              doctor={doctor}
              state={state}
              onEditStep1={() => navigateStep(1)}
              onEditStep2={() => navigateStep(2)}
            />
          </div>

          {/* Desktop CTA */}
          <div className={styles.desktopCta}>
            <button
              type="button"
              className={styles.ctaSecondary}
              onClick={handlePrev}
            >
              Back
            </button>
            <button
              id="book-appointment-btn"
              type="button"
              className={styles.ctaPrimary}
              onClick={openAuthModal}
              aria-label="Confirm your appointment booking"
            >
              Confirm Booking
            </button>
          </div>

          <a
            href="tel:18001030"
            id="doctor-call-btn"
            className={styles.callLink}
          >
            <Phone size={14} aria-hidden />
            Call for Enquiry — 1800 103 0
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ─── MWEB STICKY FOOTER CTA ───────────────────────────────────────────────
  const stickyFooter = (
    <div className={styles.stickyFooterInner}>
      {/* Selection preview chip */}
      {(state.selectedDate || state.selectedTime) && state.step === 1 && (
        <div className={styles.selectionChip} aria-live="polite">
          {state.selectedDate && <span>{state.selectedDate}</span>}
          {state.selectedDate && state.selectedTime && <span aria-hidden>·</span>}
          {state.selectedTime && <span>{state.selectedTime}</span>}
        </div>
      )}

      {state.step === 1 && (
        <button
          type="button"
          className={[
            styles.ctaPrimary,
            styles.ctaFullWidth,
            !isStep1Valid ? styles.ctaDisabled : "",
          ].join(" ")}
          disabled={!isStep1Valid}
          onClick={handleNext}
        >
          Continue
          <ChevronRight size={18} aria-hidden />
        </button>
      )}

      {state.step === 2 && (
        <div className={styles.stickyRow}>
          <button
            type="button"
            className={[styles.ctaSecondary, styles.ctaSecondaryMobile].join(" ")}
            onClick={handlePrev}
          >
            Back
          </button>
          <button
            type="button"
            className={[
              styles.ctaPrimary,
              styles.ctaGrow,
              !isStep2Valid ? styles.ctaDisabled : "",
            ].join(" ")}
            disabled={!isStep2Valid}
            onClick={handleNext}
          >
            Review Booking
          </button>
        </div>
      )}

      {state.step === 3 && (
        <div className={styles.stickyRow}>
          <button
            type="button"
            className={[styles.ctaSecondary, styles.ctaSecondaryMobile].join(" ")}
            onClick={handlePrev}
          >
            Back
          </button>
          <button
            type="button"
            className={[styles.ctaPrimary, styles.ctaGrow].join(" ")}
            onClick={openAuthModal}
          >
            Confirm Booking
          </button>
        </div>
      )}
    </div>
  );

  // ─── SIDEBAR CONTENT ──────────────────────────────────────────────────────
  const sidebar = (
    <>
      {/* Nav */}
      <div className={styles.navRow}>
        <Breadcrumbs
          theme="light"
          items={[
            { label: "Home", href: "/" },
            { label: "Doctors", href: "/search?q=Dr.&location=All" },
            { label: doctor.name, href: `/doctors/${id}` },
            { label: "Book Appointment" },
          ]}
        />
        <Link href={`/doctors/${id}`} className={styles.backLink}>
          <ArrowLeft size={16} aria-hidden />
          Back to Profile
        </Link>
      </div>

      {/* Step indicator */}
      <StepIndicator
        currentStep={state.step}
        completedSteps={completedSteps}
        onStepClick={(step) => navigateStep(step)}
      />

      {/* Doctor card */}
      <DoctorSummaryCard doctor={doctor} />

      {/* Consultation fee + trust */}
      <div className={styles.feeCard}>
        <div className={styles.feeRow}>
          <span className={styles.feeLabel}>Consultation Fee</span>
          <span className={styles.feeAmount}>{doctor.fee}</span>
        </div>
        <ul className={styles.trustList}>
          <li className={styles.trustItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
            Verified credentials
          </li>
          <li className={styles.trustItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
            Free cancellation up to 2 hrs before
          </li>
          <li className={styles.trustItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
            Pay at the clinic
          </li>
        </ul>
      </div>
    </>
  );

  return (
    <>
      <BookingShell sidebar={sidebar} panel={panelContent} stickyFooter={stickyFooter} />

      {/* Auth modal — shown when user clicks Confirm Booking and is not logged in */}
      <LoginModal
        isOpen={state.isAuthModalOpen}
        onClose={closeAuthModal}
        onLoginSuccess={() => {
          closeAuthModal();
          // Navigate to confirmation page
          router.push(`/doctors/${id}/book/confirmation?date=${encodeURIComponent(
            state.selectedDate
          )}&time=${encodeURIComponent(state.selectedTime)}&patient=${encodeURIComponent(
            state.patient.name
          )}&mode=${state.consultationType}&hospital=${encodeURIComponent(
            state.selectedHospital
          )}`);
        }}
      />
    </>
  );
}

// ─── PAGE EXPORT (wraps inner in Suspense for useSearchParams) ────────────────
export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", paddingTop: "var(--nav-height)" }} />}>
      <BookingPageInner id={id} />
    </Suspense>
  );
}
