import { refineDesign16Doctors } from "./design16Refinements";
import { emptyDoctorFilters, nextSlot, type AvailabilityFilter, type ConsultationMode, type DoctorListingItem } from "./doctorListing";

/** Resolve each card mode against the same booking calendar and displayed practice. */
export function getDesign20Availability(
  doctor: DoctorListingItem,
  mode: ConsultationMode,
  chosenDate = "",
  availabilityFilter: AvailabilityFilter = "any",
  now = new Date(),
): Date | null {
  // An unknown consultation mode is not evidence that it can be booked.
  if (doctor.modes[mode] !== true) return null;
  const filters = {
    ...emptyDoctorFilters(),
    hospitals: mode === "hospital" ? [doctor.hospital] : [],
    availability: availabilityFilter,
  };
  // Keep the original schedule boundary: only known preview doctors receive a
  // generated schedule; other IDs retain their supplied, future availability.
  const [resolved] = refineDesign16Doctors([doctor], filters, mode, "relevance", chosenDate,
    false, new Set<string>(), now, {}, "d20");
  return resolved ? nextSlot(resolved, mode, now) : null;
}
