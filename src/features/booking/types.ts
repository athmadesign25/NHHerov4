// ─── BOOKING FLOW — SHARED TYPES ────────────────────────────────────────────

export type ConsultationType = "hospital" | "video";

export type PatientRelation = "self" | "spouse" | "child" | "parent" | "other";

export type Gender = "male" | "female" | "other";

export type BookingStep = 1 | 2 | 3;

// ─── PATIENT ─────────────────────────────────────────────────────────────────

export interface PatientDetails {
  name: string;
  age: string;
  gender: Gender | "";
  relation: PatientRelation;
  reason: string;
}

// ─── SLOTS ───────────────────────────────────────────────────────────────────

export type SlotPeriod = "morning" | "afternoon" | "evening";

export interface TimeSlot {
  time: string;         // e.g. "09:15 AM"
  available: boolean;
  period: SlotPeriod;
}

export interface DateSlot {
  date: string;         // "DD"   e.g. "01"
  day: string;          // "Mon"
  month: string;        // "OCT"
  fullDate: string;     // "YYYY-MM-DD"
  hasSlots: boolean;
}

// ─── BOOKING STATE ───────────────────────────────────────────────────────────

export interface BookingState {
  step: BookingStep;
  consultationType: ConsultationType;
  selectedHospital: string;
  selectedDate: string;   // "DD"
  selectedTime: string;   // "09:15 AM"
  patient: PatientDetails;
  isAuthModalOpen: boolean;
}

// ─── PAYLOAD (sent to API / passed to confirmation) ──────────────────────────

export interface BookingPayload {
  doctorId: string;
  consultationType: ConsultationType;
  hospital: string;
  date: string;           // "YYYY-MM-DD"
  time: string;           // "09:15 AM"
  patient: PatientDetails;
  fee: string;
}

// ─── DOCTOR SUMMARY (minimal shape used inside booking components) ────────────

export interface BookingDoctorSummary {
  id: string;
  name: string;
  speciality: string;
  subSpeciality: string;
  hospital: string;
  city: string;
  locations?: { name: string; city: string }[];
  experienceYears: string;
  rating: number;
  reviews: number;
  img: string;
  fee: string;
  languages?: string[];
}
