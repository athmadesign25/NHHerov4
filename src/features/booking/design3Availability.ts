import { searchDoctorsData } from "@/app/search/mockDoctors";
import { getDesign3CityDoctor } from "@/features/search/design3CityDoctors";
import { doctorHospitals, fromDirectoryDoctor, nextSlot, type ConsultationMode } from "@/features/search/doctorListing";
import { generateTimeSlots } from "./useBookingState";
import type { TimeSlot } from "./types";
import { indiaAppointmentTimestamp, indiaClock, indiaDate } from "./appointmentTime";

/**
 * Design 3 preview schedule only. Its demo grid includes the exact listing slot;
 * a real integration must replace both with hospital-specific availability IDs.
 */
export function getDesign3BookingSlots(
  doctorId: string,
  date: string,
  mode: ConsultationMode,
  hospital: string,
  now = new Date(),
  windowDays = 15,
): TimeSlot[] {
  const directoryDoctor = searchDoctorsData.find((doctor) => doctor.id === doctorId);
  const doctor = getDesign3CityDoctor(doctorId) ?? (directoryDoctor ? fromDirectoryDoctor(directoryDoctor) : null);
  if (!doctor || doctor.modes[mode] !== true) return [];
  if (mode === "hospital" && !doctorHospitals(doctor).includes(hospital)) return [];

  if (indiaAppointmentTimestamp(date, "12:00 AM") === null) return [];
  if (date < indiaDate(now) || date >= indiaDate(now, windowDays)) return [];

  const advertisedSlot = nextSlot(doctor, mode, now);
  const slots = generateTimeSlots();
  if (advertisedSlot && indiaDate(advertisedSlot) === date) {
    const time = indiaClock(advertisedSlot);
    const hour = Number(time.slice(0, 2)) % 12 + (time.endsWith("PM") ? 12 : 0);
    const existing = slots.find((slot) => slot.time === time);
    if (existing) existing.available = true;
    else slots.push({ time, available: true, period: hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening" });
  }
  const timestamp = (time: string) => indiaAppointmentTimestamp(date, time) ?? Number.NEGATIVE_INFINITY;
  return slots
    .map((slot) => ({
      ...slot,
      available: slot.available && timestamp(slot.time) > now.getTime() &&
        (!advertisedSlot || timestamp(slot.time) >= advertisedSlot.getTime()),
    }))
    .sort((a, b) => timestamp(a.time) - timestamp(b.time));
}

export function isDesign3BookingSlotAvailable(
  doctorId: string,
  date: string,
  time: string,
  mode: ConsultationMode,
  hospital: string,
  now = new Date(),
  windowDays = 15,
): boolean {
  return getDesign3BookingSlots(doctorId, date, mode, hospital, now, windowDays)
    .some((slot) => slot.available && slot.time === time);
}
