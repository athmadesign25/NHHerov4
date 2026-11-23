import { getDesign20DirectoryDoctor } from "@/features/search/design20Directory";
import { withPublishedProfileLocations } from "@/features/search/doctorProfileLocations";
import { doctorHospitals } from "@/features/search/doctorListing";
import { indiaAppointmentTimestamp } from "./appointmentTime";
import type { AppointmentSelection } from "./design7/model";

interface ExecutiveSchedule {
  readonly fee: string;
  readonly times: readonly string[];
}

/**
 * Stakeholder-preview availability and prices, not published NH service data.
 * These existing Executive-tag doctors have a mix of standard and executive
 * appointments. A production availability API must supply the slot tier and
 * price using an immutable slot ID, rather than infer them from time of day.
 */
export const EXECUTIVE_SLOT_PREVIEW: Readonly<Record<string, ExecutiveSchedule>> = {
  "dr-1": { fee: "₹2,250", times: ["02:45 PM", "05:30 PM", "06:00 PM"] },
  "dr-ashley": { fee: "₹2,250", times: ["02:45 PM", "05:30 PM", "06:00 PM"] },
};

/** Stable after booking: availability/expiry is deliberately checked separately. */
export function getExecutiveSlot(selection: AppointmentSelection): { fee: string } | null {
  if (selection.mode !== "hospital" || indiaAppointmentTimestamp(selection.date, selection.time) === null) return null;
  const doctor = getDesign20DirectoryDoctor(selection.doctorId);
  if (!doctor?.isExecutive || !doctor.modes.hospital) return null;
  const schedule = EXECUTIVE_SLOT_PREVIEW[doctor.id];
  if (!schedule?.times.includes(selection.time)) return null;
  if (!doctorHospitals(withPublishedProfileLocations(doctor)).includes(selection.hospital)) return null;
  return { fee: schedule.fee };
}

/** An explicit slot price replaces the standard fee; it is never added twice. */
export function getAppointmentFee(baseFee: string, selection: AppointmentSelection): string {
  return getExecutiveSlot(selection)?.fee ?? baseFee;
}
