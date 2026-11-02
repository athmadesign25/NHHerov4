import { searchDoctorsData } from "@/app/search/mockDoctors";
import { appointmentDates, DESIGN16_BOOKING_DAYS, indiaAppointmentTimestamp, indiaClock, indiaDate } from "@/features/booking/appointmentTime";
import { getDesign3BookingSlots } from "@/features/booking/design3Availability";
import { design3CityDoctors } from "./design3CityDoctors";
import { getCityId } from "@/lib/searchService";
import { getDesign16HospitalPreview } from "./design16HospitalPreview";
import { getDesign20VerifiedDoctor } from "./design20Directory";
import {
  doctorHospitals, filterDoctors, nextSlot, sortDoctors, withSelectedDoctorHospital,
  type ConsultationMode, type DoctorFilters, type DoctorListingItem, type DoctorSort,
} from "./doctorListing";

const previewDoctorIds = new Set([...searchDoctorsData, ...design3CityDoctors].map((doctor) => doctor.id));

/** City choices apply to practice units, including a doctor's secondary affiliation. */
export function design16DoctorsInLocation(doctors: readonly DoctorListingItem[], location: string): DoctorListingItem[] {
  if (location === "All") return [...doctors];
  return doctors.flatMap((doctor) => {
    const hospitals = doctorHospitals(doctor).filter((hospital) =>
      getCityId(getDesign16HospitalPreview(hospital)?.city ?? doctor.city) === getCityId(location));
    if (!hospitals.length) return [];
    const hospital = hospitals.includes(doctor.hospital) ? doctor.hospital : hospitals[0];
    return [{ ...doctor, hospital, hospitals, city: getDesign16HospitalPreview(hospital)?.city ?? doctor.city }];
  });
}

/** Custom dates share booking's 21-day India calendar, including today. */
export function readDesign16Date(value: string | null | undefined, now = new Date()): string {
  if (!value || indiaAppointmentTimestamp(value, "12:00 AM") === null) return "";
  return value >= indiaDate(now) && value < indiaDate(now, DESIGN16_BOOKING_DAYS) ? value : "";
}

function requestedDates(filters: DoctorFilters, customDate: string, now: Date): string[] {
  if (customDate) return readDesign16Date(customDate, now) ? [customDate] : [];
  const dates = appointmentDates(now.getTime(), DESIGN16_BOOKING_DAYS);
  if (filters.availability === "today") return dates.slice(0, 1);
  if (filters.availability === "tomorrow") return dates.slice(1, 2);
  return filters.availability === "week" ? dates.slice(0, 7) : dates;
}

function candidates(
  doctors: readonly DoctorListingItem[], filters: DoctorFilters, mode: ConsultationMode,
  previouslyBooked: boolean, bookedIds: ReadonlySet<string>, now: Date,
) {
  return filterDoctors(doctors, { ...filters, availability: "any" }, mode, now)
    .filter((doctor) => !previouslyBooked || bookedIds.has(doctor.id))
    .map((doctor) => withSelectedDoctorHospital(doctor, filters.hospitals));
}

/** Unknown IDs retain only their advertised slot; a preview grid never supplies live availability. */
function earliestSlot(doctor: DoctorListingItem, dates: readonly string[], mode: ConsultationMode, now: Date, scheduleContext?: "d20"): Date | null {
  if (doctor.modes[mode] === false) return null;
  if (!previewDoctorIds.has(doctor.id) && !getDesign20VerifiedDoctor(doctor.id)) {
    const advertised = nextSlot(doctor, mode, now);
    return advertised && dates.includes(indiaDate(advertised)) ? advertised : null;
  }
  for (const date of dates) {
    const first = getDesign3BookingSlots(doctor.id, date, mode, doctor.hospital, now, DESIGN16_BOOKING_DAYS, scheduleContext)
      .find((slot) => slot.available);
    if (first) {
      const timestamp = indiaAppointmentTimestamp(date, first.time);
      if (timestamp !== null && timestamp > now.getTime()) return new Date(timestamp);
    }
  }
  return null;
}

/** Whether this source has a usable appointment within the current booking window. */
export function hasDesign16Availability(doctors: readonly DoctorListingItem[], mode: ConsultationMode, now = new Date(), scheduleContext?: "d20"): boolean {
  const dates = appointmentDates(now.getTime(), DESIGN16_BOOKING_DAYS);
  return doctors.some((doctor) => earliestSlot(doctor, dates, mode, now, scheduleContext) !== null);
}

/** D16 alone uses the full preview schedule. This selects a day, without holding a slot. */
export function refineDesign16Doctors(
  doctors: readonly DoctorListingItem[], filters: DoctorFilters, mode: ConsultationMode, sort: DoctorSort,
  customDate = "", previouslyBooked = false, bookedIds: ReadonlySet<string> = new Set(), now = new Date(),
  selectedUnits: Readonly<Record<string, string>> = {},
  scheduleContext?: "d20",
): DoctorListingItem[] {
  const dates = requestedDates(filters, customDate, now);
  if (!dates.length) return [];
  const requiresSlot = Boolean(customDate) || filters.availability !== "any";
  const refined = candidates(doctors, filters, mode, previouslyBooked, bookedIds, now).flatMap((doctor) => {
    if (mode === "hospital") {
      const practiceLocations = doctorHospitals(doctor)
        .filter((hospital) => !filters.hospitals.length || filters.hospitals.includes(hospital))
        .flatMap((hospital) => {
          const slot = earliestSlot({ ...doctor, hospital }, dates, mode, now, scheduleContext);
          if (!slot && requiresSlot) return [];
          const sample = getDesign16HospitalPreview(hospital);
          return [{ hospital, city: previewDoctorIds.has(doctor.id) ? sample?.city ?? doctor.city : doctor.city, fee: doctor.fee,
            distanceKm: previewDoctorIds.has(doctor.id) ? sample?.distanceKm : undefined,
            availability: { ...doctor.availability, hospital: slot ? `${indiaDate(slot)}, ${indiaClock(slot)}` : undefined },
          }];
        });
      if (!practiceLocations.length) return requiresSlot ? [] : [doctor];
      if (sort === "nearest") practiceLocations.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
      const selected = sort === "nearest" ? practiceLocations.find((unit) => unit.hospital === selectedUnits[doctor.id]) ?? practiceLocations[0]
        : practiceLocations.find((unit) => unit.hospital === doctor.hospital) ?? practiceLocations[0];
      // The same eligible unit supplies the distance, card slot and booking handoff.
      return [{ ...doctor, ...selected, hospitals: practiceLocations.map((unit) => unit.hospital), practiceLocations }];
    }
    const slot = earliestSlot(doctor, dates, mode, now, scheduleContext);
    if (!slot && requiresSlot) return [];
    // Leave source records intact. Cards, earliest sort and booking URLs share this exact slot.
    return [{ ...doctor, availability: {
      ...doctor.availability,
      [mode]: slot ? `${indiaDate(slot)}, ${indiaClock(slot)}` : undefined,
    } }];
  });
  return sortDoctors(refined, sort, mode, now);
}

export interface Design16NextAvailability {
  date: string;
  count: number;
}

/** Suggest a later day explicitly, preserving every nondate refinement and the current mode. */
export function findDesign16NextAvailability(
  doctors: readonly DoctorListingItem[], filters: DoctorFilters, mode: ConsultationMode,
  customDate = "", previouslyBooked = false, bookedIds: ReadonlySet<string> = new Set(), now = new Date(),
  scheduleContext?: "d20",
): Design16NextAvailability | null {
  const selectedDates = requestedDates(filters, customDate, now);
  if (!selectedDates.length) return null;
  const lastSelected = customDate || filters.availability !== "any" ? selectedDates.at(-1)! : "";
  for (const date of appointmentDates(now.getTime(), DESIGN16_BOOKING_DAYS).filter((date) => date > lastSelected)) {
    const count = refineDesign16Doctors(doctors, filters, mode, "relevance", date, previouslyBooked, bookedIds, now, {}, scheduleContext).length;
    if (count) return { date, count };
  }
  return null;
}
