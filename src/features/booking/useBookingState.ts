"use client";

import { useState, useCallback } from "react";
import type {
  BookingState,
  BookingStep,
  ConsultationType,
  PatientDetails,
  DateSlot,
  TimeSlot,
  SlotPeriod,
} from "./types";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const DEFAULT_PATIENT: PatientDetails = {
  name: "",
  age: "",
  gender: "",
  relation: "self",
  reason: "",
};

const DEFAULT_STATE: BookingState = {
  step: 1,
  consultationType: "hospital",
  selectedHospital: "",
  selectedDate: "",
  selectedTime: "",
  patient: DEFAULT_PATIENT,
  isAuthModalOpen: false,
};

/**
 * Generates a 15-day rolling window of DateSlot objects starting from today.
 * In production this would be replaced with an API call.
 */
export function generateDates(daysCount = 15): DateSlot[] {
  const dates: DateSlot[] = [];
  const today = new Date();
  const fmtDay = new Intl.DateTimeFormat("en-US", { weekday: "short" });
  const fmtMonth = new Intl.DateTimeFormat("en-US", { month: "short" });
  const fmtFull = new Intl.DateTimeFormat("en-CA"); // yields YYYY-MM-DD

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      date: String(d.getDate()).padStart(2, "0"),
      day: fmtDay.format(d),
      month: fmtMonth.format(d).toUpperCase(),
      fullDate: fmtFull.format(d),
      hasSlots: true,
    });
  }
  return dates;
}

/**
 * Returns the mock slot grid. In production, this would be an API call
 * keyed by doctorId + fullDate + consultationType.
 */
export function generateTimeSlots(): TimeSlot[] {
  const morning: string[] = ["09:15 AM", "09:45 AM", "10:15 AM", "10:45 AM", "11:15 AM", "11:45 AM"];
  const afternoon: string[] = ["12:45 PM", "01:15 PM", "01:45 PM", "02:15 PM", "02:45 PM", "03:15 PM"];
  const evening: string[] = ["05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM"];

  const toSlots = (times: string[], period: SlotPeriod): TimeSlot[] =>
    times.map((time, i) => ({
      time,
      period,
      available: !(period === "morning" && i === 2), // slot 10:15 AM is unavailable as demo
    }));

  return [
    ...toSlots(morning, "morning"),
    ...toSlots(afternoon, "afternoon"),
    ...toSlots(evening, "evening"),
  ];
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

interface UseBookingStateOptions {
  initialConsultationType?: ConsultationType;
  initialHospital?: string;
}

export function useBookingState(options: UseBookingStateOptions = {}) {
  const [state, setState] = useState<BookingState>({
    ...DEFAULT_STATE,
    consultationType: options.initialConsultationType ?? "hospital",
    selectedHospital: options.initialHospital ?? "",
  });

  // ─── Navigation ───────────────────────────────────────────────────────────

  const goToStep = useCallback((step: BookingStep) => {
    setState((s) => ({ ...s, step }));
  }, []);

  const nextStep = useCallback(() => {
    setState((s) => ({ ...s, step: Math.min(3, s.step + 1) as BookingStep }));
  }, []);

  const prevStep = useCallback(() => {
    setState((s) => ({ ...s, step: Math.max(1, s.step - 1) as BookingStep }));
  }, []);

  // ─── Step 1 setters ───────────────────────────────────────────────────────

  const setConsultationType = useCallback((type: ConsultationType) => {
    setState((s) => ({ ...s, consultationType: type, selectedTime: "" }));
  }, []);

  const setSelectedHospital = useCallback((hospital: string) => {
    setState((s) => ({ ...s, selectedHospital: hospital }));
  }, []);

  const setSelectedDate = useCallback((date: string) => {
    setState((s) => ({ ...s, selectedDate: date, selectedTime: "" }));
  }, []);

  const setSelectedTime = useCallback((time: string) => {
    setState((s) => ({ ...s, selectedTime: time }));
  }, []);

  // ─── Step 2 setters ───────────────────────────────────────────────────────

  const setPatientField = useCallback(
    <K extends keyof PatientDetails>(field: K, value: PatientDetails[K]) => {
      setState((s) => ({ ...s, patient: { ...s.patient, [field]: value } }));
    },
    []
  );

  // ─── Auth modal ───────────────────────────────────────────────────────────

  const openAuthModal = useCallback(() => {
    setState((s) => ({ ...s, isAuthModalOpen: true }));
  }, []);

  const closeAuthModal = useCallback(() => {
    setState((s) => ({ ...s, isAuthModalOpen: false }));
  }, []);

  // ─── Validation helpers ───────────────────────────────────────────────────

  const isStep1Valid = state.selectedDate !== "" && state.selectedTime !== "";

  const isStep2Valid =
    state.patient.name.trim().length >= 2 &&
    state.patient.age !== "" &&
    Number(state.patient.age) >= 1 &&
    Number(state.patient.age) <= 120 &&
    state.patient.gender !== "";

  return {
    state,
    // Navigation
    goToStep,
    nextStep,
    prevStep,
    // Step 1
    setConsultationType,
    setSelectedHospital,
    setSelectedDate,
    setSelectedTime,
    // Step 2
    setPatientField,
    // Auth
    openAuthModal,
    closeAuthModal,
    // Validation
    isStep1Valid,
    isStep2Valid,
  };
}
